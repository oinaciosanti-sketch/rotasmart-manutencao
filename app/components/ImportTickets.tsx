"use client";

import {useRef,useState} from "react";
import {AlertTriangle,Check,Download,FileJson,FileSpreadsheet,Sparkles,UploadCloud} from "lucide-react";
import {useAppData,type AppTicket} from "../data/AppDataContext";
import {isValidCoordinate} from "../utils/distance";

const MAX_FILE_SIZE=10*1024*1024;
const statuses:AppTicket["status"][]=["Novo","Programado","Aguardando compra","Aguardando entrega","Em atendimento","Concluído","Fechado","Cancelado"];
const urgencies:AppTicket["urgency"][]=["Alta","Média","Baixa"];
const normalize=(value:unknown)=>String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const aliases:Record<string,string>={chamado:"number",nchamado:"number",numero:"number",numerochamado:"number",movideskid:"movideskId",filial:"branch",numerofilial:"branchNumber",nfilial:"branchNumber",cnpj:"branchCnpj",cidade:"city",descricao:"desc",titulo:"title",status:"status",statusrotasmart:"status",statusorigem:"sourceStatus",urgencia:"urgency",tecnico:"tech",tecnicoplanejado:"tech",dataplanejada:"date",tempoestimado:"duration",dataabertura:"openedAt",datalimite:"dueAt",analista:"analistaResponsavel",analistaresponsavel:"analistaResponsavel",responsavel:"analistaResponsavel",responsavelinterno:"analistaResponsavel",observacoes:"notes",linkorigem:"sourceLink",rawtext:"rawText",needsreview:"needsReview"};
type RawTicket=Record<string,unknown>;
type BridgePayload={source:string;version:string;exportedAt:string;url?:string;statuses?:string[];tickets:RawTicket[]};

function parseCsv(text:string){
 const first=text.split(/\r?\n/,1)[0];const delimiter=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?";":",";
 const rows:string[][]=[];let row:string[]=[],cell="",quoted=false;
 for(let i=0;i<text.length;i++){const char=text[i];if(char==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(char===delimiter&&!quoted){row.push(cell.trim());cell=""}else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell=""}else cell+=char}
 row.push(cell.trim());if(row.some(Boolean))rows.push(row);if(rows.length<2)return[];
 const headers=rows[0].map(header=>aliases[normalize(header)]||normalize(header));
 return rows.slice(1).map(values=>Object.fromEntries(headers.map((header,index)=>[header,values[index]||""])));
}

function parseBridgeJson(text:string):BridgePayload{
 const parsed:unknown=JSON.parse(text);
 if(!parsed||typeof parsed!=="object")throw new Error("O JSON não contém um objeto válido.");
 const payload=parsed as Partial<BridgePayload>;
 if(payload.source!=="movidesk-kanban-extension"||!Array.isArray(payload.tickets))throw new Error("Este JSON não foi gerado pelo RotaSmart Bridge.");
 return{source:payload.source,version:String(payload.version||"1.0"),exportedAt:String(payload.exportedAt||new Date().toISOString()),url:payload.url,statuses:Array.isArray(payload.statuses)?payload.statuses:[],tickets:payload.tickets.filter(ticket=>!!ticket&&typeof ticket==="object")};
}

function ticketStatus(value:unknown):AppTicket["status"]{
 const key=normalize(value);return statuses.find(status=>normalize(status)===key)||"Novo";
}

function boolValue(value:unknown){return value===true||normalize(value)==="true"||normalize(value)==="sim"}

export default function ImportTickets({flash}:{flash:(message:string)=>void}){
 const {tickets,setTickets,branches,ensureAnalyst}=useAppData();
 const input=useRef<HTMLInputElement>(null);
 const [fileName,setFileName]=useState("");const [fileKind,setFileKind]=useState<"CSV"|"RotaSmart Bridge">("CSV");
 const [preview,setPreview]=useState<AppTicket[]>([]);const [errors,setErrors]=useState<string[]>([]);const [warnings,setWarnings]=useState<string[]>([]);

 const findBranch=(raw:RawTicket)=>{
  const branchText=String(raw.branch||raw.filial||"").trim();const branchNumber=String(raw.branchNumber||"").trim();const cnpj=String(raw.branchCnpj||"").trim();
  const inferredNumber=branchNumber||(branchText.match(/(?:filial|posto|\bfl|\bf)\s*(?:agricopel\s*)?(?:n[º°o.]?\s*)?#?\s*([a-z0-9-]+)/i)?.[1]||"");
  return branches.find(item=>item.numeroFilial===inferredNumber)||branches.find(item=>cnpj&&normalize(item.cnpj)===normalize(cnpj))||branches.find(item=>normalize(item.nome)===normalize(branchText))||branches.find(item=>branchText&&normalize(item.nome).includes(normalize(branchText)));
 };

 const convertRows=(rows:RawTicket[],kind:"CSV"|"RotaSmart Bridge")=>{
  const issues:string[]=[];const notices:string[]=[];const seen=new Set<string>();
  const parsed=rows.map((source,index)=>{
   const raw=kind==="RotaSmart Bridge"?{number:source.numeroChamado||source.movideskId,branch:source.filial,city:source.cidade,desc:source.descricao||source.titulo,status:source.statusRotaSmart||source.statusOrigem,urgency:source.urgencia,analistaResponsavel:source.analistaResponsavel,sourceLink:source.linkOrigem,rawText:source.rawText,movideskId:source.movideskId,needsReview:source.needsReview}:source;
   const line=index+(kind==="CSV"?2:1);const number=String(raw.number||raw.movideskId||"").replace(/^#/,"").trim();const normalizedNumber=normalize(number);
   if(!number)notices.push(`Registro ${line}: número e movideskId ausentes; será criado como REVISAR-MOVIDESK-${line}.`);else if(seen.has(normalizedNumber))issues.push(`Registro ${line}: chamado ${number} repetido no próprio arquivo.`);else seen.add(normalizedNumber);
   const branch=findBranch(raw);const branchText=String(raw.branch||"Filial não localizada");const cityText=String(raw.city||"Cidade não informada");const status=ticketStatus(raw.status);const urgency=urgencies.find(item=>normalize(item)===normalize(raw.urgency))||"Média";const analyst=String(raw.analistaResponsavel||"")||"Não definido";const tech=String(raw.tech||"")||undefined;const date=String(raw.date||"")||undefined;
   const sourceNotes=[raw.sourceLink?`Origem Movidesk: ${raw.sourceLink}`:"",raw.rawText?`Texto extraído: ${String(raw.rawText)}`:""].filter(Boolean).join("\n");
   const review=!branch||boolValue(raw.needsReview)||!number;
   if(review)notices.push(`Chamado ${number||`REVISAR-MOVIDESK-${line}`}: revise filial, cidade ou dados extraídos.`);
   return{id:Date.now()+index,number:number||`REVISAR-MOVIDESK-${line}`,branch:branch?.nome||branchText,branchId:branch?.id,branchNumber:branch?.numeroFilial||String(raw.branchNumber||"")||undefined,branchCnpj:branch?.cnpj||String(raw.branchCnpj||"")||undefined,city:branch?`${branch.cidade}, ${branch.uf}`:cityText,uf:branch?.uf,address:branch?.endereco||"Endereço não informado",latitude:branch?.latitude??null,longitude:branch?.longitude??null,desc:String(raw.desc||raw.title||"Sem descrição"),status,urgency,tech,date,duration:Number(raw.duration)||60,openedAt:String(raw.openedAt||"")||undefined,dueAt:String(raw.dueAt||"")||undefined,analyst,analistaResponsavel:analyst,dataAtribuicaoAnalista:new Date().toISOString(),notes:String(raw.notes||sourceNotes||"")||undefined,planningStatus:tech&&date?"em_rota_rascunho":"nao_planejado",reviewBranch:review} satisfies AppTicket;
  });
  setPreview(parsed);setErrors(Array.from(new Set(issues)));setWarnings(Array.from(new Set(notices)));
 };

 const readFile=async(file?:File)=>{
  if(!file)return;setFileName(file.name);setPreview([]);setErrors([]);setWarnings([]);
  if(file.size>MAX_FILE_SIZE){setErrors(["O arquivo excede o limite de 10 MB."]);return}
  try{const text=await file.text();if(file.name.toLowerCase().endsWith(".json")){const payload=parseBridgeJson(text);setFileKind("RotaSmart Bridge");if(!payload.tickets.length)throw new Error("O JSON do Bridge não possui chamados.");convertRows(payload.tickets,"RotaSmart Bridge")}else if(file.name.toLowerCase().endsWith(".csv")){setFileKind("CSV");const rows=parseCsv(text);if(!rows.length)throw new Error("O CSV está vazio ou não possui cabeçalho e registros.");convertRows(rows,"CSV")}else throw new Error("Selecione um CSV ou JSON gerado pelo RotaSmart Bridge.")}catch(reason){setErrors([reason instanceof Error?reason.message:"Não foi possível analisar o arquivo."])}
 };

 const existing=preview.filter(incoming=>tickets.some(ticket=>normalize(ticket.number)===normalize(incoming.number))).length;const fresh=preview.length-existing;
 const importNow=()=>{if(errors.length){flash("Corrija os erros antes de importar");return}const linkedPreview=preview.map(incoming=>{const analyst=ensureAnalyst(incoming.analistaResponsavel||incoming.analyst||"Não definido");return{...incoming,analistaId:analyst.id,analistaResponsavel:analyst.name,analyst:analyst.name}});setTickets(current=>{let next=[...current];linkedPreview.forEach(incoming=>{const index=next.findIndex(ticket=>normalize(ticket.number)===normalize(incoming.number));if(index<0){let id=incoming.id;while(next.some(ticket=>ticket.id===id))id++;next.push({...incoming,id})}else{const old=next[index];next[index]={...old,...incoming,id:old.id,tech:old.tech,date:old.date,routeOrder:old.routeOrder,routeId:old.routeId,planningStatus:old.planningStatus,duration:old.duration,notes:old.notes||incoming.notes,latitude:isValidCoordinate(incoming.latitude,incoming.longitude)?incoming.latitude:old.latitude,longitude:isValidCoordinate(incoming.latitude,incoming.longitude)?incoming.longitude:old.longitude,branchId:incoming.branchId||old.branchId,branchNumber:incoming.branchNumber||old.branchNumber,branchCnpj:incoming.branchCnpj||old.branchCnpj}}});return next});flash(`${preview.length} chamados importados com sucesso`);setPreview([]);setFileName("");setErrors([]);setWarnings([]);if(input.current)input.current.value=""};
 const downloadModel=()=>{const content="numeroChamado;filial;cidade;descricao;status;urgencia;tecnicoPlanejado;dataPlanejada;tempoEstimado;dataAbertura;dataLimite;analista;observacoes\n#5001;01;Jaraguá do Sul;Descrição do chamado;Novo;Alta;;;60;;;;";const url=URL.createObjectURL(new Blob(["\uFEFF"+content],{type:"text/csv;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download="modelo-importacao-rotasmart.csv";link.click();URL.revokeObjectURL(url)};

 return <><div className="pagehead"><div><h1>Importar chamados</h1><p>Valide CSV ou exportações do RotaSmart Bridge antes de atualizar a operação.</p></div><div className="page-actions"><button className="btn secondary" onClick={downloadModel}><Download size={17}/>Baixar modelo CSV</button></div></div><div className="import-grid"><div className="panel import-main"><div className="step"><span>1</span><div><h3>Envie seu arquivo</h3><p>CSV ou JSON do RotaSmart Bridge com até 10 MB. Nada é alterado antes da confirmação.</p></div></div><input ref={input} hidden type="file" accept=".csv,.json,text/csv,application/json" onChange={event=>readFile(event.target.files?.[0])}/><div className={`dropzone ${fileName?"has-file":""}`} onClick={()=>input.current?.click()}>{fileName?<><div className="file-icon">{fileKind==="RotaSmart Bridge"?<FileJson/>:<FileSpreadsheet/>}</div><div><b>{fileName}</b><span>{fileKind} · {preview.length} registros encontrados</span></div>{!errors.length&&<Check className="file-check"/>}</>:<><div className="upload-icon"><UploadCloud/></div><b>Clique para selecionar CSV ou JSON</b><span>Exportações do RotaSmart Bridge são reconhecidas automaticamente.</span></>}</div>{errors.map(error=><p className="warning-text" key={error}><AlertTriangle size={15}/>{error}</p>)}{warnings.slice(0,8).map(warning=><p className="import-notice" key={warning}><AlertTriangle size={14}/>{warning}</p>)}{warnings.length>8&&<p className="import-notice">Mais {warnings.length-8} aviso(s) serão sinalizados para revisão.</p>}{fileName&&preview.length>0&&<><div className="step second"><span>2</span><div><h3>Prévia da importação</h3><p>{errors.length?"Existem erros bloqueando a importação.":"Confira os registros antes de confirmar."}</p></div></div><div className="import-summary"><div><Sparkles/><b>{fresh}</b><span>Novos chamados</span></div><div><Download/><b>{existing}</b><span>Serão atualizados</span></div><div><AlertTriangle/><b>{preview.filter(item=>item.reviewBranch).length}</b><span>Para revisar</span></div></div><div className="import-preview-table"><table><thead><tr><th>Chamado</th><th>Status</th><th>Filial / cidade</th><th>Resultado</th></tr></thead><tbody>{preview.slice(0,100).map(ticket=><tr key={`${ticket.number}-${ticket.id}`}><td><b>#{ticket.number}</b><small>{ticket.desc}</small></td><td>{ticket.status}</td><td>{ticket.branch}<small>{ticket.city}</small></td><td>{ticket.reviewBranch?<span className="review-pill">Revisar</span>:<span className="ok-pill">Pronto</span>}</td></tr>)}</tbody></table></div><button className="btn primary import-button" disabled={!preview.length||errors.length>0} onClick={importNow}><UploadCloud size={17}/>Importar {preview.length} chamados</button></>}</div><div className="panel rules"><h3>Regras de segurança</h3><div className="rule"><span>1</span><div><b>Duplicados normalizados</b><p>Número do chamado ou ID Movidesk atualiza o registro existente.</p></div></div><div className="rule"><span>2</span><div><b>Coordenadas protegidas</b><p>Uma filial não reconhecida não apaga coordenadas já válidas.</p></div></div><div className="rule"><span>3</span><div><b>Planejamento preservado</b><p>Técnico, data, rota, ordem, duração e notas existentes são mantidos.</p></div></div><div className="rule"><span>4</span><div><b>Bridge com revisão</b><p>Status desconhecido ou local incompleto entra sinalizado para conferência.</p></div></div></div></div></>;
}
