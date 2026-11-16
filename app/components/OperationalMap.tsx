"use client";

import {useEffect,useMemo} from 'react';
import {MapContainer,TileLayer,CircleMarker,Popup,useMap} from 'react-leaflet';
import type {LatLngBoundsExpression} from 'leaflet';
import {useAppData} from '../data/AppDataContext';
import {isValidCoordinate} from '../utils/distance';
const final=new Set(['Concluído','Fechado','Cancelado']);
function AutoZoom({points}:{points:Array<{lat:number,lon:number}>}){const map=useMap();useEffect(()=>{if(points.length)map.fitBounds(points.map(p=>[p.lat,p.lon]) as LatLngBoundsExpression,{padding:[40,40],maxZoom:12})},[map,points]);return null}
export default function OperationalMap(){
 const {tickets,branches}=useAppData();
 const active=tickets.filter(t=>!final.has(t.status));
 const pins=useMemo(()=>{const map=new Map<string,{key:string,name:string,lat:number,lon:number,city:string,items:typeof tickets}>();
  active.forEach(t=>{const b=branches.find(x=>x.id===t.branchId)||branches.find(x=>x.numeroFilial===t.branchNumber)||(t.branch ? branches.find(x=>x.nome===t.branch) : undefined);const lat=isValidCoordinate(t.latitude,t.longitude)?t.latitude:b?.latitude,lon=isValidCoordinate(t.latitude,t.longitude)?t.longitude:b?.longitude;
   if(!isValidCoordinate(lat,lon))return;const key=b?.numeroFilial||`${lat},${lon}`;let item=map.get(key);if(!item){item={key,name:b?.nome||t.branch,city:t.city,lat:lat!,lon:lon!,items:[]};map.set(key,item)}item.items.push(t) });return Array.from(map.values())},[active,branches]);
 const missing=active.length-pins.reduce((n,p)=>n+p.items.length,0);
 return <div className="operational-map-screen"><div className="pagehead"><div><span className="eyebrow">Visão operacional · leitura de chamados importados</span><h1>Mapa dos chamados abertos</h1><p>Visualize concentração de atendimentos e oportunidades de encaixe nas rotas. Novos chamados aparecem após importar o arquivo atualizado.</p></div></div>
 <div className="op-map-kpis"><div><b>{active.length}</b><span>Chamados em aberto</span></div><div><b>{pins.length}</b><span>Filiais localizadas</span></div><div><b>{missing}</b><span>Sem coordenadas</span></div></div>
 {missing>0&&<p className="import-alert">{missing} chamado(s) não possuem coordenadas válidas vinculadas à filial. Cadastre/valide os endereços na aba Filiais / Postos; o mapa não inventa localizações.</p>}
 <div className="op-map-card"><MapContainer center={[-27.5,-48.6]} zoom={8} scrollWheelZoom style={{height:540,width:'100%',borderRadius:12}}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><AutoZoom points={pins}/>{pins.map(p=>{const red=p.items.some(t=>t.urgency==='Alta');return <CircleMarker key={p.key} center={[p.lat,p.lon]} radius={Math.min(20,9+p.items.length*2)} pathOptions={{color:red?'#dc2626':'#2563eb',fillColor:red?'#dc2626':'#2563eb',fillOpacity:.75,weight:2}}><Popup><b>{p.name}</b><p>{p.city} · {p.items.length} chamado(s)</p>{p.items.slice(0,12).map(t=><p key={t.id} style={{margin:'6px 0'}}>#{t.number} · {t.urgency} · {t.status}<br/>{t.desc.slice(0,100)}</p>)}</Popup></CircleMarker>})}</MapContainer></div><p style={{fontSize:12,color:'#64748b',marginTop:12}}>Azul: chamados comuns. Vermelho: pelo menos um chamado de alta urgência. Este mapa não substitui a análise de tempo, peças e prioridade antes de incluir uma visita na rota.</p></div>
}
