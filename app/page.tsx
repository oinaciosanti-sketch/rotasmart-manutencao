"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowDown, ArrowUp, BarChart3, Bell, Building2, CalendarDays,
  Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Download, FileSpreadsheet,
  Filter, GripVertical, Headphones, LayoutDashboard, Lightbulb, ListFilter, Map,
  MapPin, Menu, MoreHorizontal, Plus, Route, Search, Settings, SlidersHorizontal,
  Sparkles, TicketCheck, Trash2, UploadCloud, UserRound, Users, Wrench, X
} from "lucide-react";
import { Filial, cidadesFiliais, filiais as filiaisBase } from "./data/filiais";

type Status = "Novo" | "Programado" | "Aguardando compra" | "Aguardando entrega" | "Em atendimento" | "Concluído" | "Fechado";
type Page = "Dashboard" | "Chamados" | "Planner semanal" | "Montar rota" | "Mapa de rotas" | "Filiais / Postos" | "Técnicos" | "Importar chamados";
type Ticket = { id: number; number: string; branch: string; city: string; desc: string; status: Status; urgency: "Alta" | "Média" | "Baixa"; tech?: string; date?: string; duration: number; address: string };
type Technician = { id:number; name:string; initials:string; color:string; city:string; address:string; startTime:string; endTime:string; active:boolean; notes:string };

const tickets: Ticket[] = [
  { id:1, number:"#4821", branch:filiaisBase[0].nome, city:`${filiaisBase[0].cidade}, ${filiaisBase[0].uf}`, desc:"Bomba 03 apresentando falha intermitente", status:"Novo", urgency:"Alta", duration:90, address:filiaisBase[0].endereco },
  { id:2, number:"#4818", branch:filiaisBase[4].nome, city:`${filiaisBase[4].cidade}, ${filiaisBase[4].uf}`, desc:"Preventiva do quadro elétrico", status:"Novo", urgency:"Média", duration:60, address:filiaisBase[4].endereco },
  { id:3, number:"#4812", branch:filiaisBase[5].nome, city:`${filiaisBase[5].cidade}, ${filiaisBase[5].uf}`, desc:"Ruído excessivo no compressor", status:"Programado", urgency:"Alta", tech:"Wagner", date:"17 Jul", duration:120, address:filiaisBase[5].endereco },
  { id:4, number:"#4809", branch:filiaisBase[10].nome, city:`${filiaisBase[10].cidade}, ${filiaisBase[10].uf}`, desc:"Troca do filtro da linha 02", status:"Programado", urgency:"Baixa", tech:"Vinícius", date:"18 Jul", duration:45, address:filiaisBase[10].endereco },
  { id:5, number:"#4805", branch:filiaisBase[9].nome, city:`${filiaisBase[9].cidade}, ${filiaisBase[9].uf}`, desc:"Substituição de placa controladora", status:"Aguardando compra", urgency:"Média", tech:"Valdemir", duration:80, address:filiaisBase[9].endereco },
  { id:6, number:"#4798", branch:filiaisBase[20].nome, city:`${filiaisBase[20].cidade}, ${filiaisBase[20].uf}`, desc:"Aguardando chegada do sensor", status:"Aguardando entrega", urgency:"Alta", tech:"Wagner", duration:100, address:filiaisBase[20].endereco },
  { id:7, number:"#4792", branch:filiaisBase[23].nome, city:`${filiaisBase[23].cidade}, ${filiaisBase[23].uf}`, desc:"Calibração do sistema de medição", status:"Em atendimento", urgency:"Média", tech:"Vinícius", date:"Hoje", duration:120, address:filiaisBase[23].endereco },
  { id:8, number:"#4788", branch:filiaisBase[25].nome, city:`${filiaisBase[25].cidade}, ${filiaisBase[25].uf}`, desc:"Manutenção preventiva concluída", status:"Concluído", urgency:"Baixa", tech:"Valdemir", date:"15 Jul", duration:60, address:filiaisBase[25].endereco },
  { id:9, number:"#4781", branch:filiaisBase[18].nome, city:`${filiaisBase[18].cidade}, ${filiaisBase[18].uf}`, desc:"Reparo no painel de controle", status:"Fechado", urgency:"Média", tech:"Wagner", date:"14 Jul", duration:90, address:filiaisBase[18].endereco },
];

const techs: Technician[] = [
  {id:1,name:"Wagner",initials:"WA",color:"#2563eb",city:"Jaraguá do Sul, SC",address:"Rua Manoel Francisco da Costa, 2010 — Jaraguá do Sul — SC",startTime:"06:00",endTime:"20:00",active:true,notes:""},
  {id:2,name:"Vinícius",initials:"VI",color:"#16a34a",city:"Jaraguá do Sul, SC",address:"Rua Manoel Francisco da Costa, 2010 — Jaraguá do Sul — SC",startTime:"06:00",endTime:"20:00",active:true,notes:""},
  {id:3,name:"Valdemir",initials:"VA",color:"#7c3aed",city:"Jaraguá do Sul, SC",address:"Rua Manoel Francisco da Costa, 2010 — Jaraguá do Sul — SC",startTime:"06:00",endTime:"20:00",active:true,notes:""},
];

const menu: {label:Page; icon:any}[] = [
  {label:"Dashboard",icon:LayoutDashboard},{label:"Chamados",icon:TicketCheck},{label:"Planner semanal",icon:CalendarDays},
  {label:"Montar rota",icon:Route},{label:"Mapa de rotas",icon:Map},{label:"Filiais / Postos",icon:Building2},
  {label:"Técnicos",icon:Users},{label:"Importar chamados",icon:UploadCloud},
];

export default function App() {
  const [page,setPage]=useState<Page>("Dashboard");
  const [search,setSearch]=useState("");
  const [toast,setToast]=useState("");
  const flash=(s:string)=>{setToast(s);setTimeout(()=>setToast(""),2600)};
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandmark"><Route size={22}/></div><div><b>RotaSmart</b><span>MANUTENÇÃO</span></div></div>
      <nav>{menu.map(({label,icon:Icon})=><button key={label} className={page===label?"active":""} onClick={()=>setPage(label)}><Icon size={18}/><span>{label}</span>{label==="Chamados"&&<em>9</em>}</button>)}</nav>
      <div className="side-bottom"><button><CircleHelp size={18}/>Central de ajuda</button><button><Settings size={18}/>Configurações</button>
        <div className="profile"><div className="avatar">IC</div><div><b>Inácio Carvalho</b><span>Analista de operações</span></div><MoreHorizontal size={18}/></div>
      </div>
    </aside>
    <main>
      <header><div className="mobile-menu"><Menu/></div><div className="global-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar chamado, filial ou técnico..."/><kbd>⌘ K</kbd></div><div className="header-actions"><button><CircleHelp size={19}/></button><button className="notif"><Bell size={19}/><i/></button><div className="avatar small">IC</div></div></header>
      <section className="content">
        {page==="Dashboard"&&<Dashboard go={setPage}/>}
        {page==="Chamados"&&<Kanban />}
        {page==="Planner semanal"&&<Planner />}
        {page==="Montar rota"&&<RouteBuilder flash={flash}/>}
        {page==="Mapa de rotas"&&<RouteMap flash={flash}/>}
        {page==="Filiais / Postos"&&<Branches flash={flash}/>}
        {page==="Técnicos"&&<Technicians flash={flash}/>}
        {page==="Importar chamados"&&<Import flash={flash}/>}
      </section>
    </main>
    {toast&&<div className="toast"><Check size={17}/>{toast}</div>}
  </div>
}

function PageHead({eyebrow,title,sub,children}:{eyebrow?:string,title:string,sub:string,children?:React.ReactNode}){
 return <div className="pagehead"><div>{eyebrow&&<span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{sub}</p></div><div className="page-actions">{children}</div></div>
}

function Dashboard({go}:{go:(p:Page)=>void}){
 const stats=[["Total de chamados","9","Todos os status",TicketCheck,"blue"],["Novos","2","+2 desde ontem",Sparkles,"cyan"],["Programados","2","Para esta semana",CalendarDays,"indigo"],["Aguardando compra","1","Requer atenção",Download,"amber"],["Aguardando entrega","1","Peça em trânsito",Clock3,"orange"],["Em atendimento","1","Agora",Wrench,"purple"],["Concluídos","1","Esta semana",TicketCheck,"green"],["Rotas planejadas","5","Semana atual",Route,"teal"]];
 return <><PageHead eyebrow="QUINTA-FEIRA, 16 DE JULHO" title="Visão geral" sub="Acompanhe a operação e tome decisões rápidas."><button className="btn secondary"><Download size={17}/>Exportar</button><button className="btn primary" onClick={()=>go("Montar rota")}><Plus size={17}/>Planejar rota</button></PageHead>
  <div className="stats">{stats.map(([a,b,c,I,color]:any)=><div className="stat" key={a}><div className={`stat-icon ${color}`}><I size={20}/></div><div className="stat-label">{a}</div><strong>{b}</strong><span>{c}</span></div>)}</div>
  <div className="dash-grid">
   <div className="panel wide"><PanelTitle title="Chamados por status" sub="Distribuição atual da operação" action="Ver chamados" onClick={()=>go("Chamados")}/><div className="bars">{[["Novo",2,"#0ea5e9"],["Programado",2,"#4f46e5"],["Aguard. compra",1,"#f59e0b"],["Aguard. entrega",1,"#f97316"],["Em atendimento",1,"#8b5cf6"],["Concluído",1,"#16a34a"],["Fechado",1,"#64748b"]].map(([n,v,c]:any)=><div className="bar-item" key={n}><div className="bar-shell"><div style={{height:`${v*36}%`,background:c}}><b>{v}</b></div></div><span>{n}</span></div>)}</div></div>
   <div className="panel"><PanelTitle title="Rotas da semana" sub="Progresso planejado"/><div className="route-progress"><div className="donut"><div><b>5</b><span>rotas</span></div></div><div className="legend"><p><i className="dot green"/>Concluídas <b>2</b></p><p><i className="dot blue"/>Planejadas <b>2</b></p><p><i className="dot purple"/>Em andamento <b>1</b></p></div></div><button className="link-btn" onClick={()=>go("Planner semanal")}>Abrir planner semanal <ChevronRight size={16}/></button></div>
  </div>
  <div className="dash-grid bottom"><div className="panel wide"><PanelTitle title="Próximos atendimentos" sub="Chamados planejados para os próximos dias" action="Ver planner" onClick={()=>go("Planner semanal")}/><table><thead><tr><th>CHAMADO</th><th>FILIAL</th><th>TÉCNICO</th><th>DATA</th><th>URGÊNCIA</th></tr></thead><tbody>{tickets.filter(t=>t.tech).slice(0,4).map(t=><tr key={t.id}><td><b>{t.number}</b></td><td>{t.branch}<small>{t.city}</small></td><td><Avatar name={t.tech!}/>{t.tech}</td><td>{t.date||"A definir"}</td><td><Urgency value={t.urgency}/></td></tr>)}</tbody></table></div>
  <div className="panel"><PanelTitle title="Atenção necessária" sub="Itens que podem impactar a operação"/><div className="attention"><div className="warn-icon"><AlertTriangle/></div><div><b>Rota de Wagner pode melhorar</b><p>A rota de sexta tem 38 km de deslocamento extra.</p><button onClick={()=>go("Montar rota")}>Ver sugestão <ChevronRight size={15}/></button></div></div><div className="attention"><div className="wait-icon"><Clock3/></div><div><b>1 chamado próximo do prazo</b><p>O chamado #4798 vence amanhã às 14h.</p><button onClick={()=>go("Chamados")}>Ver chamado <ChevronRight size={15}/></button></div></div></div></div>
 </>;
}

function PanelTitle({title,sub,action,onClick}:{title:string,sub:string,action?:string,onClick?:()=>void}){return <div className="panel-title"><div><h3>{title}</h3><p>{sub}</p></div>{action&&<button onClick={onClick}>{action}<ChevronRight size={15}/></button>}</div>}
function Urgency({value}:{value:string}){return <span className={`pill urgency ${value.toLowerCase().replace("é","e")}`}><i/>{value}</span>}
function Avatar({name}:{name:string}){const t=techs.find(x=>x.name===name);return <span className="tiny-avatar" style={{background:t?.color}}>{t?.initials}</span>}

function Kanban(){
 const cols:Status[]=["Novo","Programado","Aguardando compra","Aguardando entrega","Em atendimento","Concluído","Fechado"];
 return <><PageHead title="Chamados" sub="Acompanhe e organize o fluxo de atendimentos."><button className="btn secondary"><ListFilter size={17}/>Filtros</button><button className="btn primary"><Plus size={17}/>Novo chamado</button></PageHead>
 <div className="toolbar"><div className="searchbox"><Search size={17}/><input placeholder="Buscar chamados..."/></div><button className="select">Todos os técnicos <ChevronDown size={16}/></button><button className="select">Todas as urgências <ChevronDown size={16}/></button><span className="result-count">9 chamados</span></div>
 <div className="kanban">{cols.map((s,i)=><div className="kanban-col" key={s}><div className="kanban-head"><span className={`status-dot s${i}`}/><b>{s}</b><em>{tickets.filter(t=>t.status===s).length}</em><MoreHorizontal size={17}/></div>{tickets.filter(t=>t.status===s).map(t=><TicketCard t={t} key={t.id}/>)}
 {i<2&&<button className="add-card"><Plus size={15}/>Adicionar chamado</button>}</div>)}</div></>;
}
function TicketCard({t}:{t:Ticket}){return <div className="ticket-card"><div><b>{t.number}</b><Urgency value={t.urgency}/></div><h4>{t.desc}</h4><p><Building2 size={14}/>{t.branch}</p><p><MapPin size={14}/>{t.city}</p>{t.tech&&<div className="ticket-foot"><span><Avatar name={t.tech}/>{t.tech}</span><span><CalendarDays size={14}/>{t.date||"A definir"}</span></div>}</div>}

function Planner(){
 const days=["SEG 13","TER 14","QUA 15","QUI 16","SEX 17","SÁB 18"];
 return <><PageHead title="Planner semanal" sub="Visualize a agenda da equipe e distribua os chamados."><button className="btn secondary"><ChevronDown size={17}/>Esta semana</button><button className="btn primary"><Plus size={17}/>Planejar rota</button></PageHead>
 <div className="week-nav"><button>‹</button><b>13 — 18 de julho de 2026</b><button>›</button><button className="today">Hoje</button></div>
 <div className="planner panel"><div className="planner-row planner-head"><div>TÉCNICO</div>{days.map((d,i)=><div className={i===3?"today-col":""} key={d}><b>{d.split(" ")[0]}</b><span>{d.split(" ")[1]}</span></div>)}</div>
 {techs.map((tech,ri)=><div className="planner-row" key={tech.name}><div className="tech-cell"><Avatar name={tech.name}/><span><b>{tech.name}</b><small>{ri+1} rota planejada</small></span></div>{days.map((d,di)=><div className={di===3?"today-col day-cell":"day-cell"} key={d}>{((ri+di)%4===0||di===4&&ri===0)&&<div className="plan-card" style={{borderLeftColor:tech.color}}><b>{tickets[(ri+di)%tickets.length].number}</b><span>{tickets[(ri+di)%tickets.length].city.split(",")[0]}</span><small><Clock3 size={12}/>{ri+1}h {di%2?"30":""}</small></div>}<button className="slot-plus"><Plus size={15}/></button></div>)}</div>)}</div></>;
}

function RouteBuilder({flash}:{flash:(s:string)=>void}){
 const [route,setRoute]=useState<Ticket[]>([tickets[2],tickets[0],tickets[1]]);
 const [suggest,setSuggest]=useState(false);
 const available=tickets.filter(t=>!route.some(r=>r.id===t.id)&&!["Concluído","Fechado"].includes(t.status));
 const move=(i:number,d:number)=>{const n=[...route]; const j=i+d;if(j<0||j>=n.length)return;[n[i],n[j]]=[n[j],n[i]];setRoute(n)};
 return <><PageHead title="Montar rota" sub="Organize os atendimentos e mantenha o controle da operação."><button className="btn secondary">Salvar rascunho</button><button className="btn primary" onClick={()=>flash("Rota planejada com sucesso")}><Check size={17}/>Confirmar rota</button></PageHead>
 <div className="route-config panel"><label>Técnico <button className="select"><Avatar name="Wagner"/>Wagner<ChevronDown size={16}/></button></label><label>Dia da rota <button className="select"><CalendarDays size={16}/>Sexta, 17 de julho<ChevronDown size={16}/></button></label><div className="tech-hours"><Clock3 size={17}/><span>Jornada padrão<b>08:00 — 17:30</b></span></div></div>
 <div className="route-layout">
  <div className="panel available"><PanelTitle title="Chamados disponíveis" sub={`${available.length} chamados para planejar`}/><div className="mini-search"><Search size={16}/><input placeholder="Buscar por número, filial ou cidade..."/></div><div className="filter-chips"><button>Todos <b>{available.length}</b></button><button>Alta urgência</button><button>Na região</button></div>{available.map(t=><div className="available-ticket" key={t.id}><div><b>{t.number}</b><Urgency value={t.urgency}/></div><h4>{t.branch}</h4><p><MapPin size={13}/>{t.city}</p><small><Clock3 size={13}/>{t.duration} min</small><button onClick={()=>setRoute([...route,t])}><Plus size={16}/></button></div>)}</div>
  <div className="panel route-order"><div className="route-title"><div><h3>Ordem da rota</h3><p>Arraste ou use as setas para reordenar.</p></div><span>{route.length} paradas</span></div><div className="route-start"><div className="start-pin"><MapPin/></div><div><b>Ponto de saída</b><span>Rua Manoel Francisco da Costa, 2010 — Jaraguá do Sul</span></div><button>Alterar</button></div>
   <div className="route-line">{route.map((t,i)=><div className="route-stop" key={t.id}><GripVertical size={18}/><div className="stop-num">{i+1}</div><div className="stop-info"><div><b>{t.number} · {t.branch}</b><Urgency value={t.urgency}/></div><p>{t.address} — {t.city}</p><small><Clock3 size={13}/>{t.duration} min de atendimento</small><small className="coord-warning"><AlertTriangle size={12}/>Filial sem coordenadas. Distância real ainda não calculada.</small></div><div className="stop-actions"><button onClick={()=>move(i,-1)}><ArrowUp size={15}/></button><button onClick={()=>move(i,1)}><ArrowDown size={15}/></button><button onClick={()=>setRoute(route.filter(x=>x.id!==t.id))}><Trash2 size={15}/></button></div></div>)}</div>
   <button className="suggest-btn" onClick={()=>setSuggest(true)}><Lightbulb size={19}/><span><b>Gerar rota sugerida</b><small>Veja uma ordem mais eficiente sem alterar sua rota.</small></span><ChevronRight/></button>
  </div>
  <div className="panel route-summary"><h3>Resumo da rota</h3><div className="summary-tech"><Avatar name="Wagner"/><div><b>Wagner</b><span>Sexta, 17 de julho</span></div></div><div className="summary-grid"><div><span>Chamados</span><b>{route.length}</b></div><div><span>Cidades</span><b>{new Set(route.map(x=>x.city)).size}</b></div><div><span>Atendimento</span><b>{Math.floor(route.reduce((a,x)=>a+x.duration,0)/60)}h {route.reduce((a,x)=>a+x.duration,0)%60}min</b></div><div><span>Distância</span><b>Não calculada</b></div><div><span>Deslocamento</span><b>Não calculado</b></div><div><span>Sem coordenadas</span><b>{route.length}</b></div></div><div className="alert-box"><AlertTriangle size={19}/><div><b>Rota espalhada</b><p>Há atendimentos em {new Set(route.map(x=>x.city)).size} cidades e faltam coordenadas para estimar o deslocamento.</p></div></div><div className="city-list"><b>Cidades envolvidas</b>{Array.from(new Set(route.map(x=>x.city))).map(c=><span key={c}><MapPin size={13}/>{c}</span>)}</div></div>
 </div>{suggest&&<Suggestion close={()=>setSuggest(false)} apply={()=>{setRoute([route[1],route[0],...route.slice(2)]);setSuggest(false);flash("Sugestão aplicada à rota")}}/>}</>;
}
function Suggestion({close,apply}:{close:()=>void,apply:()=>void}){return <div className="modal-bg"><div className="modal suggestion-modal"><button className="modal-x" onClick={close}><X/></button><div className="bulb"><Lightbulb/></div><span className="eyebrow">INSIGHT ROTASMART</span><h2>Sugestão por cidade e prioridade</h2><p>Como as filiais ainda não possuem coordenadas, a ordem considera cidade/região e urgência. Nenhum cálculo real de mapa foi simulado.</p><div className="saving"><div><span>Economia estimada</span><b>Não calculada</b><small>Coordenadas pendentes</small></div><div><span>Critério aplicado</span><b>Região</b><small>Cidade + prioridade</small></div></div><div className="order-compare"><div className="suggest-order"><b>Ordem atual</b>{["#4812 · Joinville","#4821 · Jaraguá do Sul","#4818 · Brusque"].map((x,i)=><div key={x}><span>{i+1}</span>{x}</div>)}</div><div className="suggest-order"><b>Ordem sugerida</b>{["#4821 · Jaraguá do Sul","#4812 · Joinville","#4818 · Brusque"].map((x,i)=><div key={x}><span>{i+1}</span>{x}</div>)}</div></div><div className="api-note"><Sparkles size={16}/>Futura integração preparada para Leaflet/OpenStreetMap ou Google Routes API.</div><div className="modal-actions"><button className="btn secondary" onClick={close}>Cancelar</button><button className="btn primary" onClick={apply}><Check size={17}/>Aplicar sugestão</button></div></div></div>}

function RouteMap({flash}:{flash:(s:string)=>void}){
 const [selected,setSelected]=useState(0); const tech=techs[selected];
 const assigned=tickets.filter(t=>t.tech===tech.name);
 return <><PageHead title="Mapa de rotas" sub="Visualize a distribuição dos atendimentos planejados."><button className="btn secondary"><CalendarDays size={17}/>17 de julho<ChevronDown size={15}/></button><button className="btn primary" onClick={()=>flash("Visualização atualizada")}><Route size={17}/>Ver todas as rotas</button></PageHead><div className="simulation-note"><Sparkles size={15}/>Mapa em modo visual/simulado. Integração real será adicionada depois.</div><div className="map-layout"><div className="map-side panel"><h3>Rotas do dia</h3><p>3 técnicos · {tickets.filter(t=>t.tech).length} chamados</p>{techs.map((t,i)=><button className={`map-tech ${selected===i?"selected":""}`} key={t.name} onClick={()=>setSelected(i)}><div className="map-tech-top"><Avatar name={t.name}/><div><b>{t.name}</b><span>{tickets.filter(x=>x.tech===t.name).length} chamados</span></div><i style={{background:t.color}}/></div></button>)}<div className="map-detail"><b>{tech.name} · 17 de julho</b><span><MapPin size={13}/>{tech.address}</span><span><TicketCheck size={13}/>{assigned.length} chamados do dia</span><span><Building2 size={13}/>{Array.from(new Set(assigned.map(t=>t.city))).join(", ")||"Sem cidades planejadas"}</span><span><Clock3 size={13}/>{Math.round(assigned.reduce((a,t)=>a+t.duration,0)/60)}h de atendimento</span><span className="warning-text"><AlertTriangle size={13}/>{assigned.length} filiais sem coordenadas</span></div></div><div className="map-canvas"><div className="map-grid"/><div className="map-label campinas">JARAGUÁ DO SUL</div><div className="map-label americana">JOINVILLE</div><div className="map-label jundiai">BLUMENAU</div><svg viewBox="0 0 900 590" preserveAspectRatio="none"><path d="M170 380 C260 260, 350 400, 430 270 S600 160, 690 250" stroke={tech.color}/></svg>{[[170,380,"1"],[430,270,"2"],[690,250,"3"]].map(([x,y,n]:any,i)=><div className="map-pin" key={i} style={{left:x,top:y,background:tech.color}}>{n}</div>)}<div className="map-legend">{techs.map(t=><span key={t.name}><i style={{background:t.color}}/>{t.name}</span>)}</div><div className="zoom"><button>+</button><button>−</button></div></div></div></>;
}

const emptyFilial:Filial={id:0,numeroFilial:"",nome:"",cidade:"",uf:"SC",endereco:"",cep:"",cnpj:"",inscricaoEstadual:"",telefone:"",status:"ativo",latitude:null,longitude:null,geocodeStatus:"pendente",statusDados:"incompleto",observacoes:""};
function Branches({flash}:{flash:(s:string)=>void}){
 const [items,setItems]=useState<Filial[]>(filiaisBase);
 const [editing,setEditing]=useState<Filial|null>(null);
 const [isNew,setIsNew]=useState(false);
 const [query,setQuery]=useState(""); const [city,setCity]=useState(""); const [status,setStatus]=useState(""); const [issue,setIssue]=useState("");
 const cities=useMemo(()=>Array.from(new Set(items.map(f=>f.cidade).filter(Boolean))).sort(),[items]);
 const shown=items.filter(f=>(!query||`${f.numeroFilial} ${f.nome} ${f.cidade}`.toLowerCase().includes(query.toLowerCase()))&&(!city||f.cidade===city)&&(!status||f.status===status)&&(!issue||(issue==="coords"?f.latitude===null||f.longitude===null:f.statusDados==="incompleto")));
 const save=()=>{if(!editing||!editing.nome.trim())return;const clean:Filial={...editing,statusDados:(!editing.cidade||!editing.endereco||!editing.cep)?"incompleto":"ok",geocodeStatus:(editing.latitude!==null&&editing.longitude!==null)?"ok":"pendente"};setItems(isNew?[...items,{...clean,id:Math.max(0,...items.map(x=>x.id))+1}]:items.map(x=>x.id===clean.id?clean:x));setEditing(null);flash(isNew?"Nova filial cadastrada com sucesso":"Filial atualizada com sucesso")};
 return <><PageHead title="Filiais e postos" sub="Base real extraída do documento Agrícola."><button className="btn secondary"><Download size={17}/>Exportar</button><button className="btn primary" onClick={()=>{setEditing({...emptyFilial});setIsNew(true)}}><Plus size={17}/>Nova filial</button></PageHead>
 <div className="toolbar branch-filters"><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar filial..."/></div><select className="select" value={city} onChange={e=>setCity(e.target.value)}><option value="">Todas as cidades</option>{cities.map(c=><option key={c}>{c}</option>)}</select><select className="select" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos os status</option><option value="ativo">Ativos</option><option value="desativado">Desativados</option></select><select className="select" value={issue} onChange={e=>setIssue(e.target.value)}><option value="">Todos os dados</option><option value="incomplete">Dados incompletos</option><option value="coords">Sem coordenadas</option></select><span className="result-count">{shown.length} filiais</span></div>
 <div className="panel table-panel"><table><thead><tr><th>Nº FILIAL</th><th>NOME</th><th>LOCALIZAÇÃO</th><th>ENDEREÇO</th><th>STATUS / DADOS</th><th></th></tr></thead><tbody>{shown.map(f=><tr key={f.id}><td><b>{f.numeroFilial}</b></td><td><b>{f.nome}</b><small>{f.cnpj}</small></td><td>{f.cidade||"Não informada"}<small>{f.uf}</small></td><td>{f.endereco||"Não informado"}<small>{f.cep}</small></td><td><span className={`active-pill ${f.status==="ativo"?"":"off"}`}><i/>{f.status==="ativo"?"Ativo":"Desativado"}</span>{f.geocodeStatus==="pendente"&&<span className="data-warning">Sem coordenadas</span>}{f.statusDados==="incompleto"&&<span className="data-warning danger">Dados incompletos</span>}</td><td><button className="icon-button" onClick={()=>{setEditing({...f});setIsNew(false)}}><MoreHorizontal/></button></td></tr>)}</tbody></table></div>
 {editing&&<FilialModal filial={editing} isNew={isNew} onChange={setEditing} onCancel={()=>setEditing(null)} onSave={save}/>}</>;
}

function FilialModal({filial,isNew,onChange,onCancel,onSave}:{filial:Filial;isNew:boolean;onChange:(f:Filial)=>void;onCancel:()=>void;onSave:()=>void}){
 const set=(key:keyof Filial,value:any)=>onChange({...filial,[key]:value});
 return <div className="modal-bg tech-modal-bg"><div className="tech-modal branch-modal"><div className="tech-modal-head"><div><span className="eyebrow">{isNew?"NOVO CADASTRO":"EDITAR FILIAL"}</span><h2>{isNew?"Nova filial":filial.nome}</h2><p>Dados operacionais da base de filiais e postos.</p></div><button onClick={onCancel}><X/></button></div><div className="tech-form">
 <label className="field"><span>Número da filial</span><input value={filial.numeroFilial} onChange={e=>set("numeroFilial",e.target.value)}/></label><label className="field"><span>Status</span><select value={filial.status} onChange={e=>set("status",e.target.value)}><option value="ativo">Ativo</option><option value="desativado">Desativado</option></select></label>
 <label className="field span-2"><span>Nome *</span><input value={filial.nome} onChange={e=>set("nome",e.target.value)}/></label><label className="field"><span>Cidade</span><input list="real-cities" value={filial.cidade} onChange={e=>set("cidade",e.target.value)}/><datalist id="real-cities">{cidadesFiliais.map(c=><option key={c}>{c}</option>)}</datalist></label><label className="field"><span>UF</span><input maxLength={2} value={filial.uf} onChange={e=>set("uf",e.target.value.toUpperCase())}/></label>
 <label className="field span-2"><span>Endereço</span><input value={filial.endereco} onChange={e=>set("endereco",e.target.value)}/></label><label className="field"><span>CEP</span><input value={filial.cep} onChange={e=>set("cep",e.target.value)}/></label><label className="field"><span>Telefone</span><input value={filial.telefone} onChange={e=>set("telefone",e.target.value)}/></label><label className="field span-2"><span>CNPJ</span><input value={filial.cnpj} onChange={e=>set("cnpj",e.target.value)}/></label>
 <label className="field"><span>Latitude</span><input type="number" step="any" value={filial.latitude??""} onChange={e=>set("latitude",e.target.value===""?null:Number(e.target.value))}/></label><label className="field"><span>Longitude</span><input type="number" step="any" value={filial.longitude??""} onChange={e=>set("longitude",e.target.value===""?null:Number(e.target.value))}/></label><label className="field span-2"><span>Observações</span><textarea value={filial.observacoes} onChange={e=>set("observacoes",e.target.value)}/></label></div><div className="tech-modal-actions"><button className="btn secondary" onClick={onCancel}>Cancelar</button><button className="btn primary" disabled={!filial.nome.trim()} onClick={onSave}><Check size={17}/>Salvar alterações</button></div></div></div>;
}
function DataToolbar({count}:{count:string}){return <div className="toolbar"><div className="searchbox"><Search size={17}/><input placeholder="Buscar por nome, cidade ou número..."/></div><button className="select"><Filter size={16}/>Todos os status<ChevronDown size={16}/></button><span className="result-count">{count}</span></div>}
const emptyTechnician: Technician = {id:0,name:"",initials:"",color:"#2563eb",city:"",address:"",startTime:"08:00",endTime:"17:30",active:true,notes:""};

function Technicians({flash}:{flash:(s:string)=>void}){
 const [items,setItems]=useState<Technician[]>(techs);
 const [editing,setEditing]=useState<Technician|null>(null);
 const [isNew,setIsNew]=useState(false);
 const openNew=()=>{setEditing({...emptyTechnician});setIsNew(true)};
 const openEdit=(tech:Technician)=>{setEditing({...tech});setIsNew(false)};
 const save=()=>{
  if(!editing||!editing.name.trim())return;
  if(isNew){
   const created={...editing,id:Math.max(0,...items.map(t=>t.id))+1,initials:editing.initials.trim().toUpperCase()||editing.name.slice(0,2).toUpperCase()};
   setItems([...items,created]); flash("Novo técnico cadastrado com sucesso");
  }else{
   setItems(items.map(t=>t.id===editing.id?{...editing,initials:editing.initials.trim().toUpperCase()}:t)); flash("Alterações salvas com sucesso");
  }
  setEditing(null);
 };
 return <><PageHead title="Técnicos" sub="Configure a equipe, jornadas e pontos de saída."><button className="btn primary" onClick={openNew}><Plus size={17}/>Novo técnico</button></PageHead>
 <div className="tech-cards">{items.map(t=><div className="panel tech-detail" key={t.id}><div className="tech-card-head"><div className="big-avatar" style={{background:t.color}}>{t.initials}</div><div><h3>{t.name}</h3><span className={`active-pill ${t.active?"":"off"}`}><i/>{t.active?"Ativo":"Inativo"}</span></div><button aria-label={`Editar ${t.name}`} onClick={()=>openEdit(t)}><MoreHorizontal/></button></div><div className="tech-data"><p><MapPin/><span>Cidade base<b>{t.city||"Não informada"}</b></span></p><p><Route/><span>Ponto de saída padrão<b>{t.address||"Não informado"}</b></span></p><p><Clock3/><span>Jornada padrão<b>{t.startTime} — {t.endTime}</b></span></p></div><div className="map-color"><span>Cor no mapa</span><i style={{background:t.color}}/><code>{t.color}</code></div><button className="edit-tech" onClick={()=>openEdit(t)}>Editar técnico</button></div>)}</div>
 {editing&&<TechnicianModal technician={editing} isNew={isNew} onChange={setEditing} onCancel={()=>setEditing(null)} onSave={save}/>}</>;
}

function TechnicianModal({technician,isNew,onChange,onCancel,onSave}:{technician:Technician;isNew:boolean;onChange:(t:Technician)=>void;onCancel:()=>void;onSave:()=>void}){
 const update=<K extends keyof Technician>(key:K,value:Technician[K])=>onChange({...technician,[key]:value});
 return <div className="modal-bg tech-modal-bg" role="dialog" aria-modal="true" aria-labelledby="tech-modal-title"><div className="tech-modal">
  <div className="tech-modal-head"><div><span className="eyebrow">{isNew?"NOVO CADASTRO":"EDITAR CADASTRO"}</span><h2 id="tech-modal-title">{isNew?"Novo técnico":`Editar ${technician.name}`}</h2><p>Configure os dados operacionais e a identificação no mapa.</p></div><button onClick={onCancel} aria-label="Fechar"><X/></button></div>
  <div className="tech-form">
   <label className="field span-2"><span>Nome *</span><input autoFocus value={technician.name} onChange={e=>update("name",e.target.value)} placeholder="Nome completo"/></label>
   <label className="field"><span>Sigla / iniciais</span><input maxLength={3} value={technician.initials} onChange={e=>update("initials",e.target.value.toUpperCase())} placeholder="Ex.: WA"/></label>
   <label className="field"><span>Status</span><select value={technician.active?"active":"inactive"} onChange={e=>update("active",e.target.value==="active")}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
   <label className="field span-2"><span>Cidade base</span><input value={technician.city} onChange={e=>update("city",e.target.value)} placeholder="Cidade, UF"/></label>
   <label className="field span-2"><span>Ponto de saída padrão</span><input value={technician.address} onChange={e=>update("address",e.target.value)} placeholder="Endereço completo"/></label>
   <label className="field"><span>Horário inicial padrão</span><input type="time" value={technician.startTime} onChange={e=>update("startTime",e.target.value)}/></label>
   <label className="field"><span>Horário final padrão</span><input type="time" value={technician.endTime} onChange={e=>update("endTime",e.target.value)}/></label>
   <label className="field span-2"><span>Cor no mapa</span><div className="color-field"><input type="color" value={technician.color} onChange={e=>update("color",e.target.value)}/><input value={technician.color} onChange={e=>update("color",e.target.value)} maxLength={7}/><i style={{background:technician.color}}/></div></label>
   <label className="field span-2"><span>Observações</span><textarea rows={3} value={technician.notes} onChange={e=>update("notes",e.target.value)} placeholder="Informações internas sobre disponibilidade, região ou especialidade."/></label>
  </div>
  <div className="tech-modal-actions"><button className="btn secondary" onClick={onCancel}>Cancelar</button><button className="btn primary" disabled={!technician.name.trim()} onClick={onSave}><Check size={17}/>Salvar alterações</button></div>
 </div></div>;
}
function Import({flash}:{flash:(s:string)=>void}){const [file,setFile]=useState(false);return <><PageHead title="Importar chamados" sub="Atualize a operação com os dados exportados do Movidesk."><button className="btn secondary"><Download size={17}/>Baixar modelo CSV</button></PageHead><div className="import-grid"><div className="panel import-main"><div className="step"><span>1</span><div><h3>Envie seu arquivo</h3><p>Formatos aceitos: CSV ou Excel, com até 10 MB.</p></div></div><div className={`dropzone ${file?"has-file":""}`} onClick={()=>setFile(true)}>{file?<><div className="file-icon"><FileSpreadsheet/></div><div><b>chamados_movidesk_16-07.csv</b><span>24 KB · 9 registros encontrados</span></div><Check className="file-check"/></>:<><div className="upload-icon"><UploadCloud/></div><b>Arraste o arquivo aqui ou clique para selecionar</b><span>CSV, XLS ou XLSX · máximo de 10 MB</span></>}</div>{file&&<><div className="step second"><span>2</span><div><h3>Prévia da importação</h3><p>Confira o que será criado e atualizado.</p></div></div><div className="import-summary"><div><Sparkles/><b>2</b><span>Novos chamados</span></div><div><Download/><b>7</b><span>Serão atualizados</span></div><div><AlertTriangle/><b>0</b><span>Com inconsistência</span></div></div><button className="btn primary import-button" onClick={()=>flash("9 chamados importados com sucesso")}><UploadCloud size={17}/>Importar 9 chamados</button></>}</div><div className="panel rules"><h3>Como funciona</h3><div className="rule"><span>1</span><div><b>Identificamos repetidos</b><p>O número do chamado é usado como identificador único.</p></div></div><div className="rule"><span>2</span><div><b>Atualizamos dados do Movidesk</b><p>Status, descrição, urgência e demais dados de origem.</p></div></div><div className="rule"><span>3</span><div><b>Preservamos seu planejamento</b><p>Técnico, data, ordem da rota, tempo estimado e notas internas não são apagados.</p></div></div><div className="safe-note"><Check/><p><b>Seus dados estão protegidos</b>Dados próprios do RotaSmart são sempre preservados.</p></div></div></div></>}
