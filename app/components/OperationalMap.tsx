"use client";

import {useEffect,useMemo,useState} from 'react';
import {MapContainer,TileLayer,CircleMarker,Tooltip,useMap} from 'react-leaflet';
import type {LatLngBoundsExpression} from 'leaflet';
import {useAppData} from '../data/AppDataContext';
import {isValidCoordinate} from '../utils/distance';
import type {AppTicket} from '../data/AppDataContext';
import type {Filial} from '../data/filiais';

const closed=new Set(['Concluído','Fechado','Cancelado']);
const filialNumber=(value:unknown)=>/^\d+$/.test(String(value??'').trim())?String(Number(value)):'';
const normalize=(s:unknown)=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const activeTicket=(t:AppTicket)=>!closed.has(t.status)&&!closed.has(String(t.sourceStatus||''))&&t.active!==false&&!t.deletedAt;
const daysOpen=(ticket:AppTicket)=>{const start=ticket.openedAt||ticket.date||ticket.firstImportedAt||ticket.sourceImportedAt;if(!start)return null;const date=new Date(start);return Number.isFinite(date.getTime())?Math.max(0,Math.floor((Date.now()-date.getTime())/86400000)):null};
function AutoZoom({points}:{points:Array<{latitude:number,longitude:number}>}){const map=useMap();useEffect(()=>{if(points.length){map.fitBounds(points.map(p=>[p.latitude,p.longitude]) as LatLngBoundsExpression,{padding:[40,40],maxZoom:12});}else{map.setView([-27.4,-50.2],7)}},[map,points]);return null}
export default function OperationalMap(){
 const {tickets,branches}=useAppData();
 const [selected,setSelected]=useState<number|null>(null);
 const [query,setQuery]=useState('');
 const [city,setCity]=useState('');
 const [onlyWithCalls,setOnlyWithCalls]=useState(false);
 const [onlyCritical,setOnlyCritical]=useState(false);
 const active=useMemo(()=>tickets.filter(activeTicket),[tickets]);
 const findBranch=(t:AppTicket)=>branches.find(b=>t.branchId===b.id)||branches.find(b=>t.branchCnpj&&normalize(b.cnpj)===normalize(t.branchCnpj))||branches.find(b=>filialNumber(b.numeroFilial)&&filialNumber(b.numeroFilial)===filialNumber(t.branchNumber))||branches.find(b=>normalize(b.nome)===normalize(t.branch));
 const groups=useMemo(()=>{
  const byId=new Map<number,AppTicket[]>();
  for(const t of active){const b=findBranch(t);if(!b)continue;const list=byId.get(b.id)||[];list.push(t);byId.set(b.id,list)}
  return byId;
 },[active,branches]);
 const available=useMemo(()=>branches.filter(b=>filialNumber(b.numeroFilial)&&filialNumber(b.numeroFilial)!=='58'&&isValidCoordinate(b.latitude,b.longitude)),[branches]);
 const cities=useMemo(()=>Array.from(new Set(branches.map(b=>b.cidade).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'pt-BR')),[branches]);
 const pins=useMemo(()=>available.filter(b=>{
  const list=groups.get(b.id)||[];
  return (!query||[b.nome,b.numeroFilial,b.cidade,b.endereco].some(v=>normalize(v).includes(normalize(query))))&&(!city||b.cidade===city)&&(!onlyWithCalls||list.length>0)&&(!onlyCritical||list.some(t=>t.urgency==='Alta'));
 }),[available,groups,query,city,onlyWithCalls,onlyCritical]);
 const selectedBranch=branches.find(b=>b.id===selected);
 const selectedTickets=selectedBranch?(groups.get(selectedBranch.id)||[]):[];
 const missing=branches.filter(b=>filialNumber(b.numeroFilial)&&!isValidCoordinate(b.latitude,b.longitude)||filialNumber(b.numeroFilial)==='58');
 const pendingTickets=active.filter(t=>!findBranch(t));
 const critical=active.filter(t=>t.urgency==='Alta');
 const panel:React.CSSProperties={background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:14};
 return <div className="operational-map-screen">
  <div className="pagehead"><div><span className="eyebrow">Geolocalização · filiais e chamados</span><h1>Mapa Estratégico das Filiais</h1><p>Todas as filiais com coordenadas cadastradas aparecem aqui, mesmo sem chamados abertos. Clique num marcador para consultar a carteira da unidade.</p></div></div>
  <div className="op-map-kpis"><div><b>{branches.filter(b=>filialNumber(b.numeroFilial)).length}</b><span>Filiais cadastradas</span></div><div><b>{available.length}</b><span>Filiais no mapa</span></div><div><b>{active.length}</b><span>Chamados em aberto</span></div><div><b>{critical.length}</b><span>Alta urgência</span></div><div><b>{missing.length}</b><span>Localização pendente</span></div></div>
  <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',margin:'10px 0 14px'}}>
   <input aria-label="Buscar filial" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar número, filial ou endereço..." style={{padding:'10px 12px',border:'1px solid #cbd5e1',borderRadius:8,minWidth:240,flex:'1 1 220px'}}/>
   <select aria-label="Cidade" value={city} onChange={e=>setCity(e.target.value)} style={{padding:10,border:'1px solid #cbd5e1',borderRadius:8}}><option value="">Todas as cidades</option>{cities.map(c=><option key={c} value={c}>{c}</option>)}</select>
   <label style={{display:'flex',alignItems:'center',gap:5,fontSize:13}}><input type="checkbox" checked={onlyWithCalls} onChange={e=>setOnlyWithCalls(e.target.checked)}/> Somente com chamados</label>
   <label style={{display:'flex',alignItems:'center',gap:5,fontSize:13}}><input type="checkbox" checked={onlyCritical} onChange={e=>setOnlyCritical(e.target.checked)}/> Alta urgência</label>
  </div>
  {missing.length>0&&<p className="import-alert">{missing.length} filial(is) sem posição aprovada. A filial 58 permanece pendente. Os pontos sem coordenadas não são inventados. {pendingTickets.length>0?`${pendingTickets.length} chamado(s) sem vínculo com filial.`:''}</p>}
  <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(265px,340px)',gap:12,alignItems:'start'}} className="strategic-map-layout">
   <div className="op-map-card"><MapContainer center={[-27.4,-50.2]} zoom={7} scrollWheelZoom style={{height:610,width:'100%',borderRadius:12}}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><AutoZoom points={pins.map(b=>({latitude:Number(b.latitude),longitude:Number(b.longitude)}))}/>
    {pins.map(b=>{const list=groups.get(b.id)||[];const red=list.some(t=>t.urgency==='Alta');const color=red?'#dc2626':list.length?'#2563eb':'#64748b';return <CircleMarker key={b.id} center={[Number(b.latitude),Number(b.longitude)]} radius={selected===b.id?12:8+Math.min(list.length,6)} pathOptions={{color:'#fff',weight:selected===b.id?3:1.5,fillColor:color,fillOpacity:.9}} eventHandlers={{click:()=>setSelected(b.id)}}><Tooltip direction="top" offset={[0,-8]}>{`Filial ${filialNumber(b.numeroFilial)} · ${b.cidade} · ${list.length} chamado(s)`}</Tooltip></CircleMarker>})}
   </MapContainer></div>
   <div style={{...panel,maxHeight:610,overflowY:'auto'}}>
    {selectedBranch?<><button type="button" onClick={()=>setSelected(null)} style={{float:'right',background:'transparent',border:'none',cursor:'pointer',fontSize:12}}>Fechar ×</button><h3 style={{margin:'0 0 6px'}}>Filial {selectedBranch.numeroFilial}</h3><div style={{fontSize:13,color:'#475569'}}>{selectedBranch.nome}<br/>{selectedBranch.cidade}/{selectedBranch.uf}<br/>{selectedBranch.endereco}</div><p style={{marginTop:10,fontSize:13}}><strong>{selectedTickets.length} chamado(s) abertos</strong>{selectedTickets.length===0?' — filial sem pendências':''}</p>{selectedBranch.gerenteTelefone&&<p><a href={`https://wa.me/55${selectedBranch.gerenteTelefone.replace(/\D/g,'').replace(/^55/,'')}`} target="_blank" rel="noopener noreferrer">WhatsApp do gerente</a></p>}<hr/>
    {selectedTickets.map(t=><div key={t.id} style={{padding:10,border:'1px solid #e2e8f0',borderRadius:9,margin:'8px 0',fontSize:12}}><strong>#{t.number} · {t.urgency}</strong><div style={{marginTop:4}}>{t.sourceFields?.subject||t.desc?.split(' — ')[0]||'Sem assunto'}</div><div style={{marginTop:4,color:'#475569'}}>Status: {t.sourceStatus||t.status}</div><div>Técnico: {t.tech||'Não atribuído'}</div><div>{daysOpen(t)===null?'Data de abertura indisponível':`${daysOpen(t)} dia(s) em aberto`}</div></div>)}
    </>:<><h3 style={{margin:'0 0 8px'}}>Filiais localizadas</h3><p style={{fontSize:13,color:'#64748b'}}>Selecione um marcador para abrir os chamados da filial, inclusive as unidades com zero chamados.</p><p style={{fontSize:13}}><b>{pins.length}</b> unidade(s) visíveis com os filtros atuais.</p><p style={{fontSize:12,color:'#64748b'}}>Cinza: sem chamados · Azul: com chamados · Vermelho: alta urgência</p></>}
   </div>
  </div>
  <p style={{fontSize:12,color:'#64748b',marginTop:12}}>Mapa: OpenStreetMap + Leaflet. Coordenadas de fontes diferentes estão sujeitas a conferência. Filiais sem localização aprovada permanecem na aba Filiais para revisão.</p>
 </div>
}
