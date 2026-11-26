'use client';
import {useState} from 'react';
import type {Filial} from '../data/filiais';
import {calculateRoadRoute,calculateFallbackRoute,type RouteCalculation} from '../services/routingService';
import {suggestOrder} from '../utils/strategicRoute';
export type RoutePreview={original:RouteCalculation;alternative?:RouteCalculation};
type Props={available:Filial[];stops:Filial[];onStops:(stops:Filial[])=>void;preview:RoutePreview|null;onPreview:(p:RoutePreview|null)=>void;busy:boolean;onBusy:(v:boolean)=>void};
const km=(v:number|null)=>v===null?'—':`${v.toLocaleString('pt-BR',{maximumFractionDigits:1})} km`;
const duration=(v:number|null)=>v===null?'—':`${Math.floor(v/60)}h ${v%60}min`;
export default function StrategicRoutePlanner({available,stops,onStops,preview,onPreview,busy,onBusy}:Props){
 const [search,setSearch]=useState(''),[fixedEnd,setFixedEnd]=useState(false),[candidate,setCandidate]=useState<Filial[]|null>(null),[message,setMessage]=useState('');
 const norm=(v:unknown)=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const q=norm(search).replace(/^filial\s*/,'');
 const matches=available.filter(b=>!stops.some(s=>s.id===b.id)&&(!q||[b.numeroFilial,b.nome,b.cidade].some(v=>norm(v).includes(q))||(/^\d+$/.test(q)&&Number(b.numeroFilial)===Number(q)))).sort((a,b)=>Number(q!==""&&Number(b.numeroFilial)===Number(q))-Number(q!==""&&Number(a.numeroFilial)===Number(q))||Number(a.numeroFilial)-Number(b.numeroFilial)).slice(0,12);
 function change(next:Filial[]){onStops(next);onPreview(null);setCandidate(null);setMessage('');}
 function move(i:number,delta:number){const next=[...stops];[next[i],next[i+delta]]=[next[i+delta],next[i]];change(next);}
 async function calculate(){
  if(busy||stops.length<2)return;
  onBusy(true);onPreview(null);setCandidate(null);setMessage('');
  try{
   const proposed=suggestOrder(stops,fixedEnd);const different=proposed.some((p,i)=>p.id!==stops[i].id);
   let original=await calculateRoadRoute(stops);let alternative=different?await calculateRoadRoute(proposed):undefined;
   if(original.fallback||alternative?.fallback){original=calculateFallbackRoute(stops);alternative=different?calculateFallbackRoute(proposed):undefined;setMessage('Roteamento por ruas indisponível. Comparação somente em linha reta; tempo não exibido.');}
   const better=alternative&&original.distanceKm!==null&&alternative.distanceKm!==null&&original.distanceKm-alternative.distanceKm>=0.01;
   onPreview({original,alternative:better?alternative:undefined});
   if(better)setCandidate(proposed);else setMessage(m=>`${m}${m?' ':''}Nenhuma melhoria encontrada pela heurística nesta sequência.`);
  }catch{setMessage('Não foi possível calcular a rota. Tente novamente.');}finally{onBusy(false);}
 }
 const alternative=preview?.alternative;const savings=preview&&alternative&&preview.original.distanceKm!==null&&alternative.distanceKm!==null?preview.original.distanceKm-alternative.distanceKm:0;
 const validCandidate=candidate&&alternative&&candidate.length===stops.length&&candidate.every(p=>stops.some(s=>s.id===p.id));
 return <section className="strategic-planner">
 <div className="strategic-planner-head"><div><h3>Planejador inteligente de rotas</h3><p>Pesquise uma filial ou adicione pelo mapa. A primeira parada permanece fixa.</p></div><button className="btn secondary" disabled={busy||!stops.length} onClick={()=>change([])}>Limpar rota</button></div>
 <div className="strategic-planner-grid"><div><input aria-label="Pesquisar parada" placeholder="Ex.: FILIAL 23" value={search} disabled={busy} onChange={e=>setSearch(e.target.value)}/><div className="strategic-results">{matches.map(b=><button key={b.id} disabled={busy||stops.length>=20} onClick={()=>{change([...stops,b]);setSearch('')}}>+ Filial {b.numeroFilial} · {b.cidade}</button>)}{!matches.length&&<p>Nenhuma filial disponível com coordenadas aprovadas.</p>}</div></div>
 <div><strong>Sequência de visitas ({stops.length}/20)</strong><div className="strategic-stops">{stops.map((b,i)=><div key={b.id}><span><b>{i+1}.</b> Filial {b.numeroFilial} · {b.cidade}</span><span><button aria-label={`Subir filial ${b.numeroFilial}`} disabled={busy||i===0} onClick={()=>move(i,-1)}>↑</button><button aria-label={`Descer filial ${b.numeroFilial}`} disabled={busy||i===stops.length-1} onClick={()=>move(i,1)}>↓</button><button aria-label={`Remover filial ${b.numeroFilial}`} disabled={busy} onClick={()=>change(stops.filter(s=>s.id!==b.id))}>×</button></span></div>)}{!stops.length&&<p>Adicione pelo menos duas filiais.</p>}</div><label><input type="checkbox" checked={fixedEnd} disabled={busy} onChange={e=>{setFixedEnd(e.target.checked);onPreview(null);setCandidate(null);setMessage('')}}/> Manter última parada fixa</label><button className="btn primary" disabled={busy||stops.length<2} onClick={calculate}>{busy?'Calculando…':'Calcular e buscar melhoria'}</button></div></div>
 {message&&<p role="status">{message}</p>}
 {preview&&<div className="strategic-comparison"><div><small>Rota atual · {preview.original.fallback?'linha reta':'por ruas (TomTom)'}</small><h3>{km(preview.original.distanceKm)}</h3>{!preview.original.fallback&&<p>{duration(preview.original.durationMinutes)} de deslocamento estimado</p>}</div>{validCandidate&&candidate&&alternative&&<><div><small>Rota sugerida</small><h3>{km(alternative.distanceKm)}</h3>{!alternative.fallback&&<p>{duration(alternative.durationMinutes)} de deslocamento estimado</p>}<p>{candidate.map(b=>b.numeroFilial).join(' → ')}</p></div><div><small>Economia de distância</small><h3>{km(savings)} ({(100*savings/(preview.original.distanceKm||1)).toFixed(1)}%)</h3><p>Deseja aplicar a rota melhorada{alternative.fallback?' (estimativa em linha reta)':''}?</p><button className="btn primary" onClick={()=>{onStops(candidate);onPreview({original:alternative});setCandidate(null);setMessage('Sequência sugerida aplicada.')}}>Sim, aplicar</button> <button className="btn secondary" onClick={()=>{onPreview({original:preview.original});setCandidate(null);setMessage('Sequência original mantida.')}}>Não</button></div></>}</div>}
 <small>Até 20 filiais. Sugestão heurística, não garante ótimo global. Não inclui tempo de atendimento, trânsito em tempo real nem retorno à base automático. Rascunho desta sessão.</small>
 </section>
}
