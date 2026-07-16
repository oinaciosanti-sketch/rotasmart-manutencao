"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowDown, ArrowUp, BarChart3, Bell, Building2, CalendarDays,
  Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Download, FileSpreadsheet,
  Filter, GripVertical, Headphones, LayoutDashboard, Lightbulb, ListFilter, Map,
  MapPin, Menu, MoreHorizontal, Plus, Route, Search, Settings, SlidersHorizontal,
  Sparkles, TicketCheck, Trash2, UploadCloud, UserRound, Users, Wrench, X
} from "lucide-react";

type Status = "Novo" | "Programado" | "Aguardando compra" | "Aguardando entrega" | "Em atendimento" | "Concluído" | "Fechado";
type Page = "Dashboard" | "Chamados" | "Planner semanal" | "Montar rota" | "Mapa de rotas" | "Filiais / Postos" | "Técnicos" | "Importar chamados";
type Ticket = { id: number; number: string; branch: string; city: string; desc: string; status: Status; urgency: "Alta" | "Média" | "Baixa"; tech?: string; date?: string; duration: number; address: string };

const tickets: Ticket[] = [
  { id:1, number:"#4821", branch:"Posto Avenida", city:"Campinas, SP", desc:"Bomba 03 apresentando falha intermitente", status:"Novo", urgency:"Alta", duration:90, address:"Av. Brasil, 1840" },
  { id:2, number:"#4818", branch:"Filial Centro", city:"Jundiaí, SP", desc:"Preventiva do quadro elétrico", status:"Novo", urgency:"Média", duration:60, address:"R. Anchieta, 220" },
  { id:3, number:"#4812", branch:"Posto Norte", city:"Americana, SP", desc:"Ruído excessivo no compressor", status:"Programado", urgency:"Alta", tech:"Wagner", date:"17 Jul", duration:120, address:"Av. São Jerônimo, 940" },
  { id:4, number:"#4809", branch:"Filial Sul", city:"Campinas, SP", desc:"Troca do filtro da linha 02", status:"Programado", urgency:"Baixa", tech:"Vinícius", date:"18 Jul", duration:45, address:"R. das Acácias, 71" },
  { id:5, number:"#4805", branch:"Posto Bandeiras", city:"Indaiatuba, SP", desc:"Substituição de placa controladora", status:"Aguardando compra", urgency:"Média", tech:"Valdemir", duration:80, address:"Rod. Santos Dumont, 28" },
  { id:6, number:"#4798", branch:"Posto Anhanguera", city:"Limeira, SP", desc:"Aguardando chegada do sensor", status:"Aguardando entrega", urgency:"Alta", tech:"Wagner", duration:100, address:"Rod. Anhanguera, km 144" },
  { id:7, number:"#4792", branch:"Filial Oeste", city:"Sumaré, SP", desc:"Calibração do sistema de medição", status:"Em atendimento", urgency:"Média", tech:"Vinícius", date:"Hoje", duration:120, address:"Av. Rebouças, 600" },
  { id:8, number:"#4788", branch:"Posto Primavera", city:"Paulínia, SP", desc:"Manutenção preventiva concluída", status:"Concluído", urgency:"Baixa", tech:"Valdemir", date:"15 Jul", duration:60, address:"Av. José Paulino, 120" },
  { id:9, number:"#4781", branch:"Filial Norte", city:"Campinas, SP", desc:"Reparo no painel de controle", status:"Fechado", urgency:"Média", tech:"Wagner", date:"14 Jul", duration:90, address:"R. Barão de Jaguara, 390" },
];

const techs = [
  {name:"Wagner", initials:"WA", color:"#2563eb", city:"Campinas, SP", address:"Av. Norte-Sul, 540", hours:"08:00 — 17:30", active:true},
  {name:"Vinícius", initials:"VI", color:"#16a34a", city:"Jundiaí, SP", address:"R. do Retiro, 1150", hours:"08:00 — 17:30", active:true},
  {name:"Valdemir", initials:"VA", color:"#7c3aed", city:"Americana, SP", address:"Av. Cillos, 820", hours:"07:30 — 17:00", active:true},
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
  <div className="panel route-order"><div className="route-title"><div><h3>Ordem da rota</h3><p>Arraste ou use as setas para reordenar.</p></div><span>{route.length} paradas</span></div><div className="route-start"><div className="start-pin"><MapPin/></div><div><b>Ponto de saída</b><span>Av. Norte-Sul, 540 — Campinas</span></div><button>Alterar</button></div>
   <div className="route-line">{route.map((t,i)=><div className="route-stop" key={t.id}><GripVertical size={18}/><div className="stop-num">{i+1}</div><div className="stop-info"><div><b>{t.number} · {t.branch}</b><Urgency value={t.urgency}/></div><p>{t.address} — {t.city}</p><small><Clock3 size={13}/>{t.duration} min de atendimento</small></div><div className="stop-actions"><button onClick={()=>move(i,-1)}><ArrowUp size={15}/></button><button onClick={()=>move(i,1)}><ArrowDown size={15}/></button><button onClick={()=>setRoute(route.filter(x=>x.id!==t.id))}><Trash2 size={15}/></button></div></div>)}</div>
   <button className="suggest-btn" onClick={()=>setSuggest(true)}><Lightbulb size={19}/><span><b>Gerar rota sugerida</b><small>Veja uma ordem mais eficiente sem alterar sua rota.</small></span><ChevronRight/></button>
  </div>
  <div className="panel route-summary"><h3>Resumo da rota</h3><div className="summary-tech"><Avatar name="Wagner"/><div><b>Wagner</b><span>Sexta, 17 de julho</span></div></div><div className="summary-grid"><div><span>Chamados</span><b>{route.length}</b></div><div><span>Cidades</span><b>{new Set(route.map(x=>x.city)).size}</b></div><div><span>Atendimento</span><b>{Math.round(route.reduce((a,x)=>a+x.duration,0)/60)}h 30min</b></div><div><span>Distância</span><b>86 km</b></div><div><span>Deslocamento</span><b>2h 05min</b></div><div><span>Tempo total</span><b>6h 35min</b></div></div><div className="alert-box"><AlertTriangle size={19}/><div><b>Rota pode ser otimizada</b><p>Há um deslocamento de 38 km que pode ser evitado.</p></div></div><div className="city-list"><b>Cidades envolvidas</b>{Array.from(new Set(route.map(x=>x.city))).map(c=><span key={c}><MapPin size={13}/>{c}</span>)}</div></div>
 </div>{suggest&&<Suggestion close={()=>setSuggest(false)} apply={()=>{setRoute([route[1],route[0],...route.slice(2)]);setSuggest(false);flash("Sugestão aplicada à rota")}}/>}</>;
}
function Suggestion({close,apply}:{close:()=>void,apply:()=>void}){return <div className="modal-bg"><div className="modal"><button className="modal-x" onClick={close}><X/></button><div className="bulb"><Lightbulb/></div><span className="eyebrow">INSIGHT ROTASMART</span><h2>Encontramos uma rota melhor</h2><p>Esta sugestão é apenas uma ajuda. Você continua no controle e pode aplicar ou ignorar.</p><div className="saving"><div><span>Economia estimada</span><b>38 km</b><small>− 44% de deslocamento</small></div><div><span>Tempo economizado</span><b>52 min</b><small>Chegada mais cedo</small></div></div><div className="suggest-order"><b>Melhor ordem sugerida</b>{["#4821 · Posto Avenida","#4812 · Posto Norte","#4818 · Filial Centro"].map((x,i)=><div key={x}><span>{i+1}</span>{x}</div>)}</div><div className="api-note"><Sparkles size={16}/>Simulação do MVP. Futuramente, esta sugestão usará uma API de rotas.</div><div className="modal-actions"><button className="btn secondary" onClick={close}>Ignorar por agora</button><button className="btn primary" onClick={apply}><Check size={17}/>Aplicar sugestão</button></div></div></div>}

function RouteMap({flash}:{flash:(s:string)=>void}){return <><PageHead title="Mapa de rotas" sub="Visualize a distribuição dos atendimentos planejados."><button className="btn secondary"><CalendarDays size={17}/>17 de julho<ChevronDown size={15}/></button><button className="btn primary" onClick={()=>flash("Visualização atualizada")}><Route size={17}/>Ver todas as rotas</button></PageHead><div className="map-layout"><div className="map-side panel"><h3>Rotas do dia</h3><p>3 técnicos · 7 chamados</p>{techs.map((t,i)=><div className={`map-tech ${i===0?"selected":""}`} key={t.name}><div className="map-tech-top"><Avatar name={t.name}/><div><b>{t.name}</b><span>{i+2} chamados</span></div><i style={{background:t.color}}/></div><div><span>Distância <b>{58+i*21} km</b></span><span>Tempo total <b>{5+i}h 20min</b></span></div>{i===0&&<div className="route-warning"><AlertTriangle size={14}/>Rota com oportunidade de melhoria</div>}</div>)}</div><div className="map-canvas"><div className="map-grid"/><div className="map-label campinas">CAMPINAS</div><div className="map-label americana">AMERICANA</div><div className="map-label jundiai">JUNDIAÍ</div><svg viewBox="0 0 900 590" preserveAspectRatio="none"><path d="M170 380 C260 260, 350 400, 430 270 S600 160, 690 250" stroke="#2563eb"/><path d="M380 470 C430 380, 530 430, 650 350 S780 330, 820 430" stroke="#16a34a"/><path d="M100 180 C240 130, 300 250, 450 160" stroke="#7c3aed"/></svg>{[[170,380,"1","#2563eb"],[430,270,"2","#2563eb"],[690,250,"3","#2563eb"],[380,470,"1","#16a34a"],[650,350,"2","#16a34a"],[100,180,"1","#7c3aed"],[450,160,"2","#7c3aed"]].map(([x,y,n,c]:any,i)=><div className="map-pin" key={i} style={{left:x,top:y,background:c}}>{n}</div>)}<div className="map-legend">{techs.map(t=><span key={t.name}><i style={{background:t.color}}/>{t.name}</span>)}</div><div className="zoom"><button>+</button><button>−</button></div></div></div></>}

const branches=[["001","Posto Avenida","Campinas","SP","Av. Brasil, 1840","Ativo"],["014","Filial Centro","Jundiaí","SP","R. Anchieta, 220","Ativo"],["023","Posto Norte","Americana","SP","Av. São Jerônimo, 940","Ativo"],["031","Filial Sul","Campinas","SP","R. das Acácias, 71","Ativo"],["042","Posto Bandeiras","Indaiatuba","SP","Rod. Santos Dumont, 28","Ativo"],["055","Posto Anhanguera","Limeira","SP","Rod. Anhanguera, km 144","Desativado"]];
function Branches({flash}:{flash:(s:string)=>void}){return <><PageHead title="Filiais e postos" sub="Gerencie a base de locais atendidos pela equipe."><button className="btn secondary"><Download size={17}/>Exportar</button><button className="btn primary" onClick={()=>flash("Formulário de nova filial aberto")}><Plus size={17}/>Nova filial</button></PageHead><DataToolbar count="6 filiais"/><div className="panel table-panel"><table><thead><tr><th>Nº FILIAL</th><th>NOME</th><th>LOCALIZAÇÃO</th><th>ENDEREÇO</th><th>STATUS</th><th></th></tr></thead><tbody>{branches.map(b=><tr key={b[0]}><td><b>{b[0]}</b></td><td><b>{b[1]}</b></td><td>{b[2]}<small>{b[3]}</small></td><td>{b[4]}</td><td><span className={`active-pill ${b[5]==="Ativo"?"":"off"}`}><i/>{b[5]}</span></td><td><button className="icon-button" onClick={()=>flash(`${b[1]} selecionado para edição`)}><MoreHorizontal/></button></td></tr>)}</tbody></table></div></>}
function DataToolbar({count}:{count:string}){return <div className="toolbar"><div className="searchbox"><Search size={17}/><input placeholder="Buscar por nome, cidade ou número..."/></div><button className="select"><Filter size={16}/>Todos os status<ChevronDown size={16}/></button><span className="result-count">{count}</span></div>}
function Technicians({flash}:{flash:(s:string)=>void}){return <><PageHead title="Técnicos" sub="Configure a equipe, jornadas e pontos de saída."><button className="btn primary" onClick={()=>flash("Formulário de novo técnico aberto")}><Plus size={17}/>Novo técnico</button></PageHead><div className="tech-cards">{techs.map(t=><div className="panel tech-detail" key={t.name}><div className="tech-card-head"><div className="big-avatar" style={{background:t.color}}>{t.initials}</div><div><h3>{t.name}</h3><span className="active-pill"><i/>Ativo</span></div><button onClick={()=>flash(`${t.name} selecionado para edição`)}><MoreHorizontal/></button></div><div className="tech-data"><p><MapPin/><span>Cidade base<b>{t.city}</b></span></p><p><Route/><span>Ponto de saída padrão<b>{t.address}</b></span></p><p><Clock3/><span>Jornada padrão<b>{t.hours}</b></span></p></div><div className="map-color"><span>Cor no mapa</span><i style={{background:t.color}}/><code>{t.color}</code></div><button className="edit-tech" onClick={()=>flash(`${t.name} selecionado para edição`)}>Editar técnico</button></div>)}</div></>}
function Import({flash}:{flash:(s:string)=>void}){const [file,setFile]=useState(false);return <><PageHead title="Importar chamados" sub="Atualize a operação com os dados exportados do Movidesk."><button className="btn secondary"><Download size={17}/>Baixar modelo CSV</button></PageHead><div className="import-grid"><div className="panel import-main"><div className="step"><span>1</span><div><h3>Envie seu arquivo</h3><p>Formatos aceitos: CSV ou Excel, com até 10 MB.</p></div></div><div className={`dropzone ${file?"has-file":""}`} onClick={()=>setFile(true)}>{file?<><div className="file-icon"><FileSpreadsheet/></div><div><b>chamados_movidesk_16-07.csv</b><span>24 KB · 9 registros encontrados</span></div><Check className="file-check"/></>:<><div className="upload-icon"><UploadCloud/></div><b>Arraste o arquivo aqui ou clique para selecionar</b><span>CSV, XLS ou XLSX · máximo de 10 MB</span></>}</div>{file&&<><div className="step second"><span>2</span><div><h3>Prévia da importação</h3><p>Confira o que será criado e atualizado.</p></div></div><div className="import-summary"><div><Sparkles/><b>2</b><span>Novos chamados</span></div><div><Download/><b>7</b><span>Serão atualizados</span></div><div><AlertTriangle/><b>0</b><span>Com inconsistência</span></div></div><button className="btn primary import-button" onClick={()=>flash("9 chamados importados com sucesso")}><UploadCloud size={17}/>Importar 9 chamados</button></>}</div><div className="panel rules"><h3>Como funciona</h3><div className="rule"><span>1</span><div><b>Identificamos repetidos</b><p>O número do chamado é usado como identificador único.</p></div></div><div className="rule"><span>2</span><div><b>Atualizamos dados do Movidesk</b><p>Status, descrição, urgência e demais dados de origem.</p></div></div><div className="rule"><span>3</span><div><b>Preservamos seu planejamento</b><p>Técnico, data, ordem da rota, tempo estimado e notas internas não são apagados.</p></div></div><div className="safe-note"><Check/><p><b>Seus dados estão protegidos</b>Dados próprios do RotaSmart são sempre preservados.</p></div></div></div></>}
