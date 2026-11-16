"use client";

import {useMemo,useRef,useState} from "react";
import {AlertTriangle,Check,FileSpreadsheet,UploadCloud,ShieldAlert} from "lucide-react";
import {useAppData,type AppTicket} from "../data/AppDataContext";
import {readMovideskFile,fieldKey,type MovideskRecord} from "../utils/movideskFiles";
import {isValidCoordinate} from "../utils/distance";
import type {Filial} from "../data/filiais";
import {resolveBranch,enrichTicketAddress,auditAddressEnrichment} from "../utils/branchEnrichment";

const norm=fieldKey;
const closed=new Set(['concluido','concluida']);
const DEFAULT_SCOPE='__SELECT__';
const get=(r:MovideskRecord,name:string)=>String(r[norm(name)]||'').trim();
const code=(v:string)=>v.replace(/^#/, '').trim();
function iso(date:string){const m=date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);if(m)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}${m[4]?`T${m[4].padStart(2,'0')}:${m[5]}:00`:''}`;return date||undefined;}
function internalStatus(value:string):AppTicket['status']{const x=norm(value);if(x.includes('cancel'))return 'Cancelado';if(x.includes('fech'))return 'Fechado';if(x.includes('conclu'))return 'Concluído';if(x.includes('resolv'))return 'Em atendimento';if(x.includes('atendimento'))return 'Em atendimento';if(x.includes('planejad')||x.includes('programad'))return 'Programado';if(x.includes('compra'))return 'Aguardando compra';if(x.includes('entrega'))return 'Aguardando entrega';return 'Novo';}
const urgency=(s:string):AppTicket['urgency']=>norm(s).includes('alt')||norm(s).includes('crit')?'Alta':norm(s).includes('baix')?'Baixa':'Média';
function lookupBranch(r:MovideskRecord,branches:Filial[]){
 const explicit=get(r,'Filial - Posto/Ponto')||get(r,'Filial - Postos/Bases')||get(r,'Filial / Empresa');
 const city=get(r,'Cidade'),street=get(r,'Endereço');
 const found=resolveBranch({explicit,subject:get(r,'Assunto'),description:get(r,'Descrição do Ticket'),city,address:street,ticketNumber:code(get(r,'Número'))},branches);
 return {found,text:explicit,city,street,number:found?.numeroFilial||''};
}
function buildTicket(r:MovideskRecord,branches:Filial[],index:number):AppTicket{
 const loc=lookupBranch(r,branches);const name=loc.found?.nome||loc.text||'Filial não informada';const city=loc.found?`${loc.found.cidade}, ${loc.found.uf}`:loc.city||'Cidade não informada';
 const title=get(r,'Assunto'),description=get(r,'Descrição do Ticket');const status=get(r,'Status');const owner=get(r,'Responsável')||'Não definido';
 return {id:Date.now()+index,number:code(get(r,'Número')),branch:name,branchId:loc.found?.id,branchNumber:loc.found?.numeroFilial||loc.number||undefined,branchCnpj:loc.found?.cnpj,city,uf:loc.found?.uf,address:loc.found?.endereco||loc.street||'Endereço não informado',latitude:loc.found?.latitude??null,longitude:loc.found?.longitude??null,desc:[title,description].filter(Boolean).join(' — ').slice(0,5000)||'Sem descrição',status:internalStatus(status),sourceStatus:status,urgency:urgency(get(r,'Urgência')),tech:undefined,date:undefined,duration:60,openedAt:iso(get(r,'Aberto em')),analyst:owner,analistaResponsavel:owner,dataAtribuicaoAnalista:new Date().toISOString(),notes:undefined,planningStatus:'nao_planejado',reviewBranch:!loc.found,sourceFields:{branchRaw:loc.text,subject:title,description,service:get(r,'Serviço (Completo)'),team:get(r,'Responsável: Equipe'),lastAction:iso(get(r,'Data da última ação'))||'',plannedDate:iso(get(r,'Data programada da manutenção:'))||'',businessImpact:get(r,'Impacto no negócio'),sla:get(r,'Indicador do SLA de Solução'),ageHours:get(r,'Tempo de vida (Horas corridas)'),sourceObservations:get(r,'Observações'),neighborhood:get(r,'Bairro'),rawStatus:status},sourceImportedAt:new Date().toISOString(),firstImportedAt:new Date().toISOString()};
}
function merged(old:AppTicket,incoming:AppTicket):AppTicket{
 // Somente os campos de origem são sincronizados; planejamento, histórico e notas locais não podem ser apagados.
 const planned=old.planningStatus==='rota_confirmada'||old.planningStatus==='em_rota_rascunho';
 const status=old.status==='Concluído'||old.status==='Fechado'||old.status==='Cancelado'||planned?old.status:incoming.status;
 return {...old,branch:incoming.branch==='Filial não informada'?old.branch:incoming.branch,branchId:incoming.branchId||old.branchId,branchNumber:incoming.branchNumber||old.branchNumber,branchCnpj:incoming.branchCnpj||old.branchCnpj,city:incoming.city==='Cidade não informada'?old.city:incoming.city,address:incoming.address==='Endereço não informado'?old.address:incoming.address,latitude:isValidCoordinate(incoming.latitude,incoming.longitude)?incoming.latitude:old.latitude,longitude:isValidCoordinate(incoming.latitude,incoming.longitude)?incoming.longitude:old.longitude,desc:incoming.desc==='Sem descrição'?old.desc:incoming.desc,status,sourceStatus:incoming.sourceStatus,urgency:incoming.urgency,openedAt:incoming.openedAt||old.openedAt,analyst:incoming.analyst,analistaResponsavel:incoming.analistaResponsavel,sourceFields:{...old.sourceFields,...incoming.sourceFields,branchRaw:incoming.sourceFields?.branchRaw||old.sourceFields?.branchRaw||''},sourceImportedAt:incoming.sourceImportedAt,reviewBranch:incoming.branchId?false:old.reviewBranch||incoming.reviewBranch};
}
export default function ImportTickets({flash}:{flash:(m:string)=>void}){
 const {tickets,setTickets,branches,setBranches,ensureAnalyst,createBackup}=useAppData();const picker=useRef<HTMLInputElement>(null);
 const [rows,setRows]=useState<MovideskRecord[]>([]),[file,setFile]=useState(''),[error,setError]=useState(''),[working,setWorking]=useState(false);
 const [owner,setOwner]=useState(DEFAULT_SCOPE),[includeClosed,setIncludeClosed]=useState(false),[showAll,setShowAll]=useState(false);
 const [history,setHistory]=useState<{date:string,file:string,inserted:number,updated:number,ignored:number}[]>([]);
 const addressAudit=useMemo(()=>auditAddressEnrichment(tickets,branches),[tickets,branches]);
 const repairExisting=()=>{
  if(!addressAudit.corrected){flash('Nenhum endereço ou vínculo a corrigir');return}
  if(!window.confirm(`Corrigir ${addressAudit.corrected} chamado(s) usando o cadastro mestre?\nAs rotas e anotações serão preservadas.\nUm backup será criado antes.`))return;
  try{localStorage.setItem('rotasmart-pre-reconcile-backup',JSON.stringify(createBackup()))}catch{alert('Não foi possível salvar o backup. Exporte um backup nas Configurações antes de continuar.');return}
  setTickets(current=>current.map(t=>enrichTicketAddress(t,branches)));
  flash(`${addressAudit.corrected} chamado(s) reconciliados`);
 };
 const owners=useMemo(()=>Array.from(new Set(rows.map(r=>get(r,'Responsável')).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'pt-BR')),[rows]);
 const scope=useMemo(()=>rows.filter(r=>{const matchOwner=owner==='__ALL__'||(owner!==DEFAULT_SCOPE&&get(r,'Responsável')===owner);const inScope=includeClosed||!norm(get(r,'Status')).startsWith('concluido');return matchOwner&&inScope}),[rows,owner,includeClosed]);
 const known=useMemo(()=>new Set(tickets.map(t=>norm(t.number))),[tickets]);
 const preview=useMemo(()=>{let unique=new Map<string,MovideskRecord>(),duplicates=0,invalid=0;for(const r of scope){const n=code(get(r,'Número'));if(!/^\d{3,15}$/.test(n)){invalid++;continue}const k=norm(n);if(unique.has(k))duplicates++;unique.set(k,r)}const values=Array.from(unique.values());return {values,duplicates,invalid,fresh:values.filter(r=>!known.has(norm(get(r,'Número')))).length,updated:values.filter(r=>known.has(norm(get(r,'Número')))).length,unknown:values.filter(r=>!lookupBranch(r,branches).found).length}},[scope,known,branches]);
 const read=async(f:File|undefined)=>{if(!f)return;setFile(f.name);setError('');setRows([]);setOwner(DEFAULT_SCOPE);setWorking(true);try{const rec=await readMovideskFile(f);setRows(rec);if(!rec.length)throw Error('Exportação sem chamados.');}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setWorking(false)}};
 const importNow=()=>{
  if(owner===DEFAULT_SCOPE||!preview.values.length)return;
  if(!window.confirm(`Confirmar sincronização de ${preview.values.length} chamado(s)?\n${preview.fresh} novo(s) e ${preview.updated} atualizações. As rotas e as observações existentes serão preservadas.`))return;
  try{const backup=createBackup();localStorage.setItem('rotasmart-pre-import-backup',JSON.stringify(backup));}catch{if(!window.confirm('Não foi possível criar o backup automático antes da importação. Continuar mesmo assim?'))return;}
  const catalog=branches;
  const prepared=preview.values.map((r,i)=>enrichTicketAddress(buildTicket(r,catalog,i),catalog));
  prepared.forEach(t=>ensureAnalyst(t.analistaResponsavel||'Não definido'));
  setTickets(current=>{const map=new Map(current.map((t,i)=>[norm(t.number),i]));const next=[...current];let newId=Math.max(Date.now(),...current.map(t=>t.id),0)+1;for(const item of prepared){const ix=map.get(norm(item.number));if(ix===undefined){next.push({...item,id:newId++});map.set(norm(item.number),next.length-1)}else next[ix]=enrichTicketAddress(merged(next[ix],item),catalog)}return next});
  setHistory(h=>[{date:new Date().toLocaleString('pt-BR'),file,inserted:preview.fresh,updated:preview.updated,ignored:rows.length-preview.values.length},...h].slice(0,20));
  flash(`${preview.fresh} novos · ${preview.updated} atualizados · sem duplicação`);setRows([]);setFile('');if(picker.current)picker.current.value='';
 };
 const downloadPrevious=()=>{const text=localStorage.getItem('rotasmart-pre-import-backup');if(!text){flash('Nenhum backup anterior disponível');return}const a=document.createElement('a');const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.href=url;a.download='rotasmart-backup-antes-importacao.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 return <div className="import-shell">
  <div className="pagehead"><div><span className="eyebrow">Movidesk → RotaSmart</span><h1>Sincronização de chamados</h1><p>Importe o CSV ou Excel do Movidesk. A atualização preserva suas rotas, técnicos planejados, anotações e histórico local.</p></div></div>
  <div className="panel" style={{padding:24,marginBottom:18,borderLeft:'4px solid #2563eb'}}><h2>Corrigir filiais e endereços existentes</h2><p>Identifica a filial pelo código certo, sem confundir com o número do chamado. Preserva técnicos, rotas e anotações.</p><p><b>{addressAudit.total}</b> chamados · <b>{addressAudit.corrected}</b> corrigíveis · <b>{addressAudit.unmatched}</b> ainda precisam de conferência.</p><button className="btn primary" disabled={!addressAudit.corrected} onClick={repairExisting}><Check size={16}/> Corrigir vínculos e endereços</button></div>
  <div className="panel" style={{padding:24,marginBottom:18}}><h2>1. Selecione o arquivo</h2><p>Formato recomendado: <b>CSV</b> (Windows-1252, separado por ponto e vírgula). Também aceita <b>XLSX</b> e o JSON anterior do RotaSmart Bridge. Dados processados no navegador.</p><input ref={picker} type="file" accept=".csv,.xlsx,.json" onChange={e=>void read(e.target.files?.[0])} aria-label="Arquivo exportado do Movidesk"/>{working&&<p>Analisando arquivo...</p>}{file&&<p><FileSpreadsheet size={16} style={{display:'inline'}}/> {file}</p>}{error&&<div className="import-alert"><AlertTriangle size={18}/>{error}</div>}</div>
  {!!rows.length&&<div className="panel" style={{padding:24,marginBottom:18}}><h2>2. Defina o que entra no RotaSmart</h2><div className="import-filter-grid"><label>Responsável no Movidesk<select value={owner} onChange={e=>setOwner(e.target.value)}><option value="__SELECT__">Selecione o responsável (obrigatório)</option>{owners.map(n=><option key={n} value={n}>{n}</option>)}<option value="__ALL__">Todos os responsáveis (revisão manual)</option></select></label><label className="import-check"><input type="checkbox" checked={includeClosed} onChange={e=>setIncludeClosed(e.target.checked)}/> Incluir a coluna Concluído</label></div><div className="import-alert"><ShieldAlert size={18}/>Por padrão, a importação exclui somente os status iniciados por Concluído. Resolvido e os demais permanecem para sua conferência. Filtre seu responsável antes de confirmar; chamados de outras equipes não devem ser importados por engano.</div><div className="import-metrics"><div><strong>{rows.length}</strong><span>No arquivo</span></div><div><strong>{preview.fresh}</strong><span>Novos</span></div><div><strong>{preview.updated}</strong><span>Existentes</span></div><div><strong>{preview.unknown}</strong><span>Filial a conferir</span></div></div><p>Na seleção: <b>{preview.values.length}</b> chamados únicos; {preview.duplicates} IDs repetidos no arquivo; {preview.invalid} IDs inválidos.</p><div className="import-actions"><button className="btn primary" disabled={owner===DEFAULT_SCOPE||!preview.values.length} onClick={importNow}><Check size={16}/> Confirmar sincronização</button><button className="btn secondary" onClick={()=>setShowAll(v=>!v)}>{showAll?'Esconder prévia':'Visualizar prévia'}</button></div>{showAll&&<div className="import-preview-table"><table><thead><tr><th>Número</th><th>Status original</th><th>Responsável</th><th>Filial</th><th>Ação</th></tr></thead><tbody>{preview.values.slice(0,80).map(r=><tr key={get(r,'Número')}><td>{get(r,'Número')}</td><td>{get(r,'Status')}</td><td>{get(r,'Responsável')}</td><td>{get(r,'Filial - Posto/Ponto')||'Sem informação'}</td><td>{known.has(norm(get(r,'Número')))?'Atualizar':'Adicionar'}</td></tr>)}</tbody></table>{preview.values.length>80&&<p>Exibindo 80 dos {preview.values.length} selecionados.</p>}</div>}</div>}
  <div className="panel" style={{padding:24}}><h2>Segurança dos dados</h2><p>Os números dos chamados são a chave única. Nenhum atendimento é excluído automaticamente quando desaparece da exportação. Um backup da situação anterior é guardado no navegador antes da sincronização, quando houver espaço.</p><button className="btn secondary" onClick={downloadPrevious}>Baixar backup anterior à importação</button><p><b>Atenção:</b> o arquivo original não possui coordenadas e muitos registros não têm filial ou endereço. Para utilizar o mapa e as rotas, valide os endereços e coordenadas em “Filiais”. O cadastro mestre já está incluído nesta versão.</p>{history.length>0&&<><h3>Importações desta sessão</h3>{history.map((h,i)=><p key={i}>{h.date} · {h.file}: {h.inserted} novos, {h.updated} atualizados</p>)}</>}</div>
 </div>
}
