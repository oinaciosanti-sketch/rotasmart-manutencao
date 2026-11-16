"use client";
import {useEffect,useMemo,useState} from "react";
import {Bell,Building2,MapPin,Search,CheckCircle2,AlertCircle,Phone,ChevronRight,Plus,Settings2} from "lucide-react";
import {useAppData,type AppTicket} from "../data/AppDataContext";
import type {Filial} from "../data/filiais";

const SELECTION_KEY="rotasmart-minhas-filiais-v1";
const ACK_KEY="rotasmart-postos-vistos-v1";
const finished=new Set(["Concluído","Fechado","Cancelado"]);
const clean=(s:unknown)=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const normCode=(s:unknown)=>/^\d{1,3}$/.test(String(s??"").trim())?String(Number(s)):"";
const getCode=(ticket:AppTicket,branches:Filial[])=>{
 const linked=branches.find(f=>/^\d{1,3}$/.test(f.numeroFilial)&&f.id===ticket.branchId)||branches.find(f=>/^\d{1,3}$/.test(f.numeroFilial)&&ticket.branchCnpj&&f.cnpj===ticket.branchCnpj);
 if(linked)return normCode(linked.numeroFilial);
 if(ticket.branchNumber&&/^\d{1,3}$/.test(ticket.branchNumber))return normCode(ticket.branchNumber);
 const candidates=[ticket.branch,ticket.desc].filter(Boolean).join(" ").matchAll(/\b(?:filial|fl)\s*[-:#º°]*\s*0*(\d{1,3})\b/gi);
 const nums=Array.from(new Set(Array.from(candidates).map(m=>normCode(m[1]))));
 return nums.length===1?nums[0]:"";
};
const alertKey=(branch:string,number:string)=>`${branch}:${number}`;
function whatsapp(value?:string){const digits=String(value||"").replace(/\D/g,"");if(digits.length<10)return "";return `https://wa.me/${digits.startsWith("55")?digits:`55${digits}`}`}
export default function PostosBoard(){
 const {tickets,branches}=useAppData();
 const [selected,setSelected]=useState<string[]>([]),[ready,setReady]=useState(false),[editing,setEditing]=useState(false);
 const [seen,setSeen]=useState<string[]>([]),[query,setQuery]=useState(""),[expanded,setExpanded]=useState<string|null>(null);
 useEffect(()=>{try{const saved=localStorage.getItem(SELECTION_KEY);if(saved){const parsed=JSON.parse(saved);if(Array.isArray(parsed))setSelected(parsed.map(String))}const ack=JSON.parse(localStorage.getItem(ACK_KEY)||"[]");if(Array.isArray(ack))setSeen(ack.map(String))}catch{}setReady(true)},[]);
 const byBranch=useMemo(()=>{
  const map=new Map<string,AppTicket[]>();
  tickets.filter(t=>t.sourceStatus?!clean(t.sourceStatus).startsWith('concluido'):!finished.has(t.status)).forEach(t=>{const code=getCode(t,branches);if(!code)return;map.set(code,[...(map.get(code)||[]),t])});return map;
 },[tickets,branches]);
 const pendingCodes=Array.from(byBranch.keys());
 const saveSelection=(next:string[])=>{setSelected(next);localStorage.setItem(SELECTION_KEY,JSON.stringify(next))};
 const acknowledge=(code:string)=>{const ids=(byBranch.get(code)||[]).filter(t=>t.firstImportedAt).map(t=>alertKey(code,t.number));const next=Array.from(new Set([...seen,...ids]));setSeen(next);localStorage.setItem(ACK_KEY,JSON.stringify(next));};
 const assigned=branches.filter(b=>normCode(b.numeroFilial)&&selected.includes(normCode(b.numeroFilial))&&b.status==="ativo");
 const shown=assigned.filter(b=>[b.numeroFilial,b.nome,b.cidade,b.endereco].some(v=>clean(v).includes(clean(query))));
 const unseen=(code:string)=> (byBranch.get(code)||[]).filter(t=>t.firstImportedAt&&!seen.includes(alertKey(code,t.number))).length;
 const total=assigned.reduce((n,b)=>n+(byBranch.get(normCode(b.numeroFilial))||[]).length,0);
 const newCount=assigned.reduce((n,b)=>n+unseen(normCode(b.numeroFilial)),0);
 if(!ready)return <div className="panel" style={{padding:24}}>Carregando suas filiais...</div>;
 return <div className="post-board">
  <div className="pagehead"><div><span className="eyebrow">VISÃO POR UNIDADE</span><h1>Postos</h1><p>Os cartões mostram somente as filiais que você selecionou. Alertas +1, +2... indicam chamados novos desde a última visualização, identificados em importações do Movidesk.</p></div><div className="page-actions"><button className="btn secondary" onClick={()=>setEditing(v=>!v)}><Settings2 size={16}/> Minhas filiais</button></div></div>
  <div className="post-kpis"><div><strong>{assigned.length}</strong><span>Postos selecionados</span></div><div><strong>{total}</strong><span>Chamados em aberto</span></div><div><strong>{newCount}</strong><span>Novos a conferir</span></div><div><strong>{assigned.filter(b=>(byBranch.get(normCode(b.numeroFilial))||[]).some(t=>t.urgency==="Alta")).length}</strong><span>Postos com alta urgência</span></div></div>
  {editing&&<div className="panel post-selector"><div className="post-selector-title"><b>Escolha suas filiais</b><span>Seleção salva neste navegador</span></div><div className="post-selector-actions"><button className="btn secondary" onClick={()=>saveSelection(Array.from(new Set([...selected,...pendingCodes])))}>Adicionar filiais com chamados</button><button className="btn secondary" onClick={()=>saveSelection([])}>Limpar seleção</button><button className="btn primary" onClick={()=>setEditing(false)}>Concluir</button></div><div className="post-selector-grid">{branches.filter(f=>f.status==="ativo"&&normCode(f.numeroFilial)).sort((a,b)=>Number(a.numeroFilial)-Number(b.numeroFilial)).map(b=>{const code=normCode(b.numeroFilial);return <label key={b.id}><input type="checkbox" checked={selected.includes(code)} onChange={e=>saveSelection(e.target.checked?[...selected,code]:selected.filter(n=>n!==code))}/><span>Filial {b.numeroFilial} · {b.cidade||"Local a conferir"}</span></label>})}</div></div>}
  <div className="toolbar"><div className="searchbox"><Search size={17}/><input placeholder="Buscar por filial, nome, cidade ou endereço..." value={query} onChange={e=>setQuery(e.target.value)}/></div><span className="result-count">{shown.length} postos</span></div>
  {!selected.length&&<div className="panel post-empty"><Building2 size={30}/><h3>Selecione as filiais que você vai acompanhar</h3><p>Abra “Minhas filiais” e marque suas unidades. Não precisamos adivinhar quais são as suas 18.</p><button className="btn primary" onClick={()=>setEditing(true)}><Plus size={16}/> Selecionar postos</button></div>}
  <div className="post-grid">{shown.map(b=>{const code=normCode(b.numeroFilial),items=byBranch.get(code)||[],added=unseen(code),urgent=items.filter(t=>t.urgency==="Alta").length,opened=expanded===code;return <article className={`post-card${added?" has-new":""}`} key={b.id}><button className="post-card-main" onClick={()=>{setExpanded(opened?null:code);acknowledge(code)}} aria-expanded={opened}><span className="post-card-label"><Building2 size={17}/> FILIAL {b.numeroFilial}</span>{added>0&&<span className="post-new" title="Chamados novos ainda não visualizados">+{added}</span>}<strong>{b.cidade||"Cidade não cadastrada"}</strong><span className="post-addr"><MapPin size={14}/>{b.endereco||"Endereço pendente de conferência"}</span><span className="post-count"><b>{items.length}</b> chamados abertos {urgent>0&&<em>{urgent} alta urgência</em>}</span><span className="post-expand">{opened?"Recolher chamados":"Ver chamados"} <ChevronRight size={15}/></span></button>{opened&&<div className="post-details"><div className="post-detail-top"><span>Chamados desta filial</span><button onClick={()=>acknowledge(code)}><CheckCircle2 size={14}/> Marcar vistos</button></div>{items.length?items.map(t=><div className="post-ticket" key={t.id}><div><b>#{t.number}</b><span className={t.urgency==="Alta"?"post-urgent":""}>{t.urgency} · {t.sourceStatus||t.status}</span></div><p>{t.desc.slice(0,180)}</p><small>{t.tech?`Técnico: ${t.tech}`:"Sem técnico definido"}{t.openedAt?` · Aberto: ${t.openedAt.slice(0,10)}`:""}</small></div>):<p className="post-no-tickets">Nenhum chamado aberto nesta filial.</p>}{whatsapp(b.gerenteTelefone)?<a className="post-whats" target="_blank" rel="noopener noreferrer" href={whatsapp(b.gerenteTelefone)}>Abrir WhatsApp do gerente</a>:<p className="post-no-phone"><Phone size={13}/> Telefone do gerente não cadastrado — adicione na aba Filiais.</p>}</div>}</article>})}</div>
  <p className="post-footnote"><AlertCircle size={14}/> O aviso depende da próxima importação CSV/Excel. Não é uma notificação em tempo real do Movidesk. Chamados sem identificação segura da filial não entram nos cartões.</p>
 </div>
}
