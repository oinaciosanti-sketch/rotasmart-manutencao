"use client";

import {useEffect,useMemo,useState} from 'react';
import {MapContainer,TileLayer,Marker,Polyline,Tooltip,useMap} from 'react-leaflet';
import {divIcon,type LatLngBoundsExpression} from 'leaflet';
import StrategicRoutePlanner,{type RoutePreview} from './StrategicRoutePlanner';
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
 const [stops,setStops]=useState<Filial[]>([]);
 const [preview,setPreview]=useState<RoutePreview|null>(null);
 const [busy,setBusy]=useState(false);
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
 const available=useMemo(()=>branches.filter(b=>filialNumber(b.numeroFilial)&&!['56','58'].includes(filialNumber(b.numeroFilial))&&!String(b.fonteCoordenada||'').includes('conferir endereço atual')&&isValidCoordinate(b.latitude,b.longitude)),[branches]);
 const cities=useMemo(()=>Array.from(new Set(branches.map(b=>b.cidade).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'pt-BR')),[branches]);
 const pins=useMemo(()=>available.filter(b=>{
  const list=groups.get(b.id)||[];
  return (!query||[b.nome,b.numeroFilial,b.cidade,b.endereco].some(v=>normalize(v).includes(normalize(query))))&&(!city||b.cidade===city)&&(!onlyWithCalls||list.length>0)&&(!onlyCritical||list.some(t=>t.urgency==='Alta'));
 }),[available,groups,query,city,onlyWithCalls,onlyCritical]);
 const mapPoints=useMemo(()=>{const list=stops.length?stops:pins;return list.map(b=>({latitude:Number(b.latitude),longitude:Number(b.longitude)}))},[stops,pins]);
 const visiblePins=useMemo(()=>[...pins,...stops.filter(b=>!pins.some(p=>p.id===b.id))],[pins,stops]);
 const selectedBranch=branches.find(b=>b.id===selected);
 const selectedTickets=selectedBranch?(groups.get(selectedBranch.id)||[]):[];
 const missing=branches.filter(b=>filialNumber(b.numeroFilial)&&!isValidCoordinate(b.latitude,b.longitude)||['56','58'].includes(filialNumber(b.numeroFilial))||String(b.fonteCoordenada||'').includes('conferir endereço atual'));
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
  {missing.length>0&&<p className="import-alert">{missing.length} filial(is) sem posição aprovada. As filiais 56 e 58 permanecem pendentes. Os pontos sem coordenadas não são inventados. {pendingTickets.length>0?`${pendingTickets.length} chamado(s) sem vínculo com filial.`:''}</p>}
  <StrategicRoutePlanner available={available} branches={branches} stops={stops} onStops={setStops} preview={preview} onPreview={setPreview} busy={busy} onBusy={setBusy}/>
  <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(265px,340px)',gap:12,alignItems:'start'}} className="strategic-map-layout">
   <div className="op-map-card"><MapContainer center={[-27.4,-50.2]} zoom={7} scrollWheelZoom style={{height:610,width:'100%',borderRadius:12}}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><AutoZoom points={mapPoints}/>
    {!preview&&stops.length>=2&&<Polyline positions={stops.map(b=>[Number(b.latitude),Number(b.longitude)] as [number,number])} pathOptions={{color:'#94a3b8',weight:3,dashArray:'5 8'}}/>}
    {preview&&<Polyline positions={preview.original.geometry} pathOptions={{color:'#2563eb',weight:5,dashArray:preview.original.fallback?'7 8':undefined}}/>}
    {preview?.alternative&&<Polyline positions={preview.alternative.geometry} pathOptions={{color:'#16a34a',weight:5,dashArray:'8 7'}}/>}
    {visiblePins.map(b=>{const list=groups.get(b.id)||[];const red=list.some(t=>t.urgency==='Alta');const color=red?'#dc2626':list.length?'#2563eb':'#64748b';const number=filialNumber(b.numeroFilial);const order=stops.findIndex(s=>s.id===b.id);return <Marker key={b.id} position={[Number(b.latitude),Number(b.longitude)]} icon={divIcon({className:'strategic-pin',html:`<span style="background:${color};${selected===b.id?'outline:3px solid #0f172a;':''}">${number}</span>${order>=0?`<i>${order+1}</i>`:''}`,iconSize:[30,30],iconAnchor:[15,15]})} zIndexOffset={order>=0?500:0} eventHandlers={{click:()=>setSelected(b.id)}}><Tooltip direction="top" offset={[0,-15]}>{`Filial ${number} · ${b.cidade} · ${list.length} chamado(s)`}</Tooltip></Marker>})}

   </MapContainer></div>
   <div style={{...panel,maxHeight:610,overflowY:'auto'}}>
    {selectedBranch?<><button type="button" onClick={()=>setSelected(null)} style={{float:'right',background:'transparent',border:'none',cursor:'pointer',fontSize:12}}>Fechar ×</button><h3 style={{margin:'0 0 6px'}}>Filial {selectedBranch.numeroFilial}</h3><div style={{fontSize:13,color:'#475569'}}>{selectedBranch.nome}<br/>{selectedBranch.cidade}/{selectedBranch.uf}<br/>{selectedBranch.endereco}</div><p style={{marginTop:10,fontSize:13}}><strong>{selectedTickets.length} chamado(s) abertos</strong>{selectedTickets.length===0?' — filial sem pendências':''}</p>{selectedBranch.gerenteTelefone&&<p><a href={`https://wa.me/55${selectedBranch.gerenteTelefone.replace(/\D/g,'').replace(/^55/,'')}`} target="_blank" rel="noopener noreferrer">WhatsApp do gerente</a></p>}<p><button className="btn secondary" disabled={stops[0]?.id===selectedBranch.id||(!stops.some(s=>s.id===selectedBranch.id)&&(!available.some(b=>b.id===selectedBranch.id)||stops.length>=20))} onClick={()=>{setStops(stops.some(s=>s.id===selectedBranch.id)?stops.filter(s=>s.id!==selectedBranch.id):[...stops,selectedBranch]);setPreview(null)}}>{stops.some(s=>s.id===selectedBranch.id)?'Remover da rota':'+ Adicionar à rota'}</button></p><hr/>
    {selectedTickets.map(t=><div key={t.id} style={{padding:10,border:'1px solid #e2e8f0',borderRadius:9,margin:'8px 0',fontSize:12}}><strong>#{t.number} · {t.urgency}</strong><div style={{marginTop:4}}>{t.sourceFields?.subject||t.desc?.split(' — ')[0]||'Sem assunto'}</div><div style={{marginTop:4,color:'#475569'}}>Status: {t.sourceStatus||t.status}</div><div>Técnico: {t.tech||'Não atribuído'}</div><div>{daysOpen(t)===null?'Data de abertura indisponível':`${daysOpen(t)} dia(s) em aberto`}</div></div>)}
    </>:<><h3 style={{margin:'0 0 8px'}}>Filiais localizadas</h3><p style={{fontSize:13,color:'#64748b'}}>Selecione um marcador para abrir os chamados da filial, inclusive as unidades com zero chamados.</p><p style={{fontSize:13}}><b>{pins.length}</b> unidade(s) visíveis com os filtros atuais.</p><p style={{fontSize:12,color:'#64748b'}}>Cinza: sem chamados · Azul: com chamados · Vermelho: alta urgência</p></>}
   </div>
  </div>
  <p style={{fontSize:12,color:'#64748b',marginTop:12}}>Prévia enquanto calcula: cinza tracejado · rota atual: azul · sugestão: verde tracejado · estimativa em linha reta: tracejada. Mapa: OpenStreetMap + Leaflet. Coordenadas de fontes diferentes estão sujeitas a conferência. Filiais sem localização aprovada permanecem na aba Filiais para revisão.</p>
 </div>
}
