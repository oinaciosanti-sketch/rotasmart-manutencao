"use client";

import {useMemo,useState} from "react";
import {AlertTriangle,CalendarDays,CheckCircle2,ClipboardList,MapPin,Route,Search,Wrench} from "lucide-react";
import {useAppData,type AppTicket} from "../data/AppDataContext";

type Destination="Chamados"|"Montar rota"|"Mapa de chamados"|"Planner semanal"|"Dashboard";
type Props={userName:string;dataMode:string;onDesktopPage:(page:Destination)=>void};
const compact=(value?:string)=>value?.trim()||"Não informado";
const isOpen=(ticket:AppTicket)=>!["Concluído","Fechado","Cancelado"].includes(ticket.status);
const fmtDate=(value?:string)=>value?value.slice(0,10).split("-").reverse().join("/"):"Não programado";

export default function MobileAnalystPanel({userName,dataMode,onDesktopPage}:Props){
 const {tickets,technicians}=useAppData();
 const [query,setQuery]=useState("");
 const [filter,setFilter]=useState<"todos"|"valdemir"|"sem-tecnico">("todos");
 const visible=useMemo(()=>tickets.filter(ticket=>ticket.active!==false&&!ticket.deletedAt),[tickets]);
 const open=visible.filter(isOpen);
 const assigned=open.filter(ticket=>ticket.tech?.trim().toLowerCase()==="valdemir");
 const unassigned=open.filter(ticket=>!ticket.tech?.trim());
 const today=new Date();
 const localDay=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
 const todayPlanned=assigned.filter(ticket=>ticket.date===localDay&&ticket.routeId&&ticket.planningStatus!=="nao_planejado");
 const valdemir=technicians.find(item=>item.name.trim().toLowerCase()==="valdemir");
 const results=open.filter(ticket=>(filter==="todos"||filter==="valdemir"&&ticket.tech?.trim().toLowerCase()==="valdemir"||filter==="sem-tecnico"&&!ticket.tech?.trim())&&`${ticket.number} ${ticket.branch} ${ticket.city} ${ticket.desc} ${ticket.sourceFields?.subject||""}`.toLowerCase().includes(query.toLowerCase())).slice(0,100);
 const chip:React.CSSProperties={display:"inline-flex",alignItems:"center",gap:5,padding:"6px 9px",border:"1px solid #d7e1ee",borderRadius:999,fontSize:12,color:"#415a79",background:"#fff",cursor:"pointer"};
 const action:React.CSSProperties={display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:"#265fad",color:"white",border:0,borderRadius:10,padding:"12px 9px",fontWeight:700,cursor:"pointer",fontSize:13};
 return <div style={{padding:"18px 14px 95px",maxWidth:760,margin:"auto"}}>
  <div style={{fontSize:12,color:"#657b96",fontWeight:800,letterSpacing:1}}>ROTASMART · MEU MOBILE · V8.5</div>
  <h1 style={{fontSize:25,margin:"6px 0 4px",color:"#163658"}}>Olá, {userName.split(" ")[0]}</h1>
  <p style={{margin:"0 0 16px",color:"#657b96",fontSize:13}}>Central de acompanhamento operacional. Os dados exibidos são os disponíveis neste dispositivo.</p>
  {dataMode!=="cloud"&&<div style={{display:"flex",gap:8,alignItems:"start",border:"1px solid #edcf96",borderRadius:12,padding:12,background:"#fff8e9",color:"#815c16",fontSize:12,marginBottom:16}}><AlertTriangle size={18} style={{flexShrink:0}}/>Modo local: o que está salvo neste navegador não é sincronizado automaticamente com outro celular ou computador. Faça backups pelo menu Configurações no desktop.</div>}
  <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10,marginBottom:16}}>
   {[{label:"Chamados abertos",value:open.length,icon:ClipboardList},{label:"Com Valdemir",value:assigned.length,icon:Wrench},{label:"Sem técnico",value:unassigned.length,icon:AlertTriangle},{label:"Rota Valdemir hoje",value:todayPlanned.length,icon:Route}].map(({label,value,icon:Icon})=><div key={label} style={{background:"white",padding:14,borderRadius:12,border:"1px solid #dce6f1",minWidth:0}}><div style={{color:"#597391",display:"flex",alignItems:"center",gap:7,fontSize:12}}><Icon size={16}/>{label}</div><b style={{display:"block",fontSize:28,color:"#183c64",marginTop:7}}>{value}</b></div>)}
  </div>
  <div style={{background:"white",padding:14,border:"1px solid #dce6f1",borderRadius:12,marginBottom:16}}>
   <div style={{fontWeight:800,marginBottom:9,color:"#183c64"}}>Ações rápidas</div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>
    <button style={action} onClick={()=>onDesktopPage("Chamados")}><ClipboardList size={16}/>Gerenciar chamados</button>
    <button style={action} onClick={()=>onDesktopPage("Montar rota")}><Route size={16}/>Montar rota</button>
    <button style={{...action,background:"#e9f1fd",color:"#285c9d"}} onClick={()=>onDesktopPage("Mapa de chamados")}><MapPin size={16}/>Mapa de chamados</button>
    <button style={{...action,background:"#e9f1fd",color:"#285c9d"}} onClick={()=>onDesktopPage("Planner semanal")}><CalendarDays size={16}/>Planner semanal</button>
   </div>
   <p style={{fontSize:11,color:"#71849a",margin:"9px 0 0"}}>Essas ações abrem a tela completa do RotaSmart no mesmo dispositivo.</p>
  </div>
  <div style={{background:"white",padding:14,border:"1px solid #dce6f1",borderRadius:12}}>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,gap:8}}><b style={{color:"#183c64"}}>Chamados em aberto</b><span style={{fontSize:11,color:"#647b93"}}>{visible.length} registros no dispositivo</span></div>
   {valdemir&&!valdemir.active&&<p style={{fontSize:12,color:"#9b5c15"}}>Valdemir está inativo no cadastro; confira o perfil no desktop.</p>}
   <div style={{display:"flex",alignItems:"center",gap:7,padding:"9px 11px",background:"#f4f7fb",borderRadius:9,border:"1px solid #dce6f1",marginBottom:9}}><Search size={16} color="#6a8098"/><input aria-label="Buscar chamado" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Número, filial, assunto..." style={{border:0,outline:"none",background:"transparent",width:"100%",fontSize:13,color:"#183c64"}}/></div>
   <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>{[{key:"todos",label:"Todos"},{key:"valdemir",label:"Valdemir"},{key:"sem-tecnico",label:"Sem técnico"}].map(({key,label})=><button key={key} style={{...chip,...(filter===key?{background:"#e9f1fd",borderColor:"#a9c7f5",color:"#265fad",fontWeight:800}:{})}} onClick={()=>setFilter(key as typeof filter)}>{label}</button>)}</div>
   {results.length===0?<p style={{fontSize:13,color:"#667e99",margin:"12px 0"}}>Nenhum chamado encontrado para este filtro.</p>:<div style={{display:"grid",gap:8}}>{results.map(ticket=><div key={ticket.id||ticket.number} style={{border:"1px solid #e1e8f1",borderRadius:10,padding:11}}><div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><b style={{fontSize:13,color:"#1d436c"}}>#{ticket.number}</b><span style={{fontSize:11,color:"#5b7088"}}>{ticket.status}</span></div><div style={{fontSize:13,fontWeight:650,marginTop:4,color:"#2b4563"}}>{compact(ticket.sourceFields?.subject||ticket.desc.split(" — ")[0])}</div><div style={{fontSize:12,color:"#647b93",marginTop:5}}><MapPin size={12} style={{verticalAlign:"middle"}}/> {compact(ticket.branch)} · {compact(ticket.city)}</div><div style={{display:"flex",gap:9,flexWrap:"wrap",fontSize:11,color:"#647b93",marginTop:8}}><span><Wrench size={12} style={{verticalAlign:"middle"}}/> {compact(ticket.tech)}</span><span><CalendarDays size={12} style={{verticalAlign:"middle"}}/> {fmtDate(ticket.date)}</span></div></div>)}</div>}
   {results.length===100&&<p style={{fontSize:11,color:"#6b7e95"}}>Exibindo os primeiros 100 registros encontrados.</p>}
  </div>
  <p style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#677f99",marginTop:14}}><CheckCircle2 size={14}/> Painel de consulta. Alterações e atribuições continuam no RotaSmart completo.</p>
 </div>;
}
