'use client';
import {useEffect,useRef,useState} from 'react';
import type {Filial} from '../data/filiais';
import {calculateFallbackRoute,type RouteCalculation} from '../services/routingService';
import {compareRoadOrders} from '../utils/roadOptimization';
export type RoutePreview={original:RouteCalculation;alternative?:RouteCalculation};
type Props={available:Filial[];branches:Filial[];stops:Filial[];onStops:(stops:Filial[])=>void;preview:RoutePreview|null;onPreview:(p:RoutePreview|null)=>void;busy:boolean;onBusy:(v:boolean)=>void};
const norm=(v:unknown)=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const km=(v:number|null)=>v===null?'—':`${v.toLocaleString('pt-BR',{maximumFractionDigits:1})} km`;
const duration=(v:number|null)=>v===null?'—':`${Math.floor(Math.round(v)/60)}h ${Math.round(v)%60}min`;
const key=(s:Filial[])=>JSON.stringify(s.map(b=>[b.id,b.latitude,b.longitude]));
const same=(a:Filial[],b:Filial[])=>key(a)===key(b);
export default function StrategicRoutePlanner({available,branches,stops,onStops,onPreview,busy,onBusy}:Props){
 const [search,setSearch]=useState(''),[originSearch,setOriginSearch]=useState(''),[originMode,setOriginMode]=useState(false),[fixedEnd,setFixedEnd]=useState(false),[manual,setManual]=useState(0),[drag,setDrag]=useState<number|null>(null),[dismissed,setDismissed]=useState('');
 const [result,setResult]=useState<{signature:string;original:RouteCalculation;best:RouteCalculation;order:Filial[]}|null>(null);
 const fixedStart=true;
 const lastManual=useRef(0);
 const bestRef=useRef<{group:string;order:Filial[]}|null>(null);
 const signature=JSON.stringify([key(stops),fixedStart,fixedEnd]);
 const group=JSON.stringify([stops.map(b=>[b.id,b.latitude,b.longitude]).sort((a,b)=>Number(a[0])-Number(b[0])),fixedStart?stops[0]?.id:null,fixedEnd?stops[stops.length-1]?.id:null]);
 const q=norm(originMode?originSearch:search).replace(/^filial\s*/,'').trim();
 const matches=q?branches.filter(b=>/^\d+$/.test(String(b.numeroFilial).trim())&&(/^\d+$/.test(q)?Number(b.numeroFilial)===Number(q):[b.numeroFilial,b.nome,b.cidade].some(v=>norm(v).includes(q)))).sort((a,b)=>Number(a.numeroFilial)-Number(b.numeroFilial)).slice(0,12):[];
 const current=result?.signature===signature?result:null;
 useEffect(()=>{
  let cancelled=false;
  onPreview(null);setResult(null);
  if(stops.length<2){onBusy(false);return;}
  onBusy(true);
  const timer=setTimeout(async()=>{
   try{
    const previous=bestRef.current;
    const refresh=lastManual.current!==manual;lastManual.current=manual;
    const comparison=await compareRoadOrders(stops,fixedEnd,previous?.group===group?previous.order:undefined,refresh);
    if(cancelled)return;
    const {original,best,order}=comparison;
    bestRef.current={group,order};
    setResult({signature,original,best,order});
    onPreview({original,alternative:!same(order,stops)&&dismissed!==signature?best:undefined});
   }catch{if(!cancelled){const r=calculateFallbackRoute(stops);setResult({signature,original:r,best:r,order:stops});onPreview({original:r});}}finally{if(!cancelled)onBusy(false);}
  },450);
  return()=>{cancelled=true;clearTimeout(timer);};
 },[signature,manual]);
 function change(next:Filial[]){onPreview(null);setResult(null);setDismissed('');onStops(next);}
 function reorder(from:number,to:number){if(from===to||from<=0||to<=0||to>=stops.length)return;const next=[...stops];next.splice(to,0,next.splice(from,1)[0]);change(next);}
 function add(b:Filial){if(originMode){if(!available.some(s=>s.id===b.id)||(stops.length>=20&&!stops.some(s=>s.id===b.id)))return;change([b,...stops.filter(s=>s.id!==b.id)]);setOriginSearch('');setOriginMode(false);return;}if(stops.length>=20||stops.some(s=>s.id===b.id)||!available.some(s=>s.id===b.id))return;change([...stops,b]);setSearch('');}
 const improvement=current&&!same(current.order,stops);
 const extraTime=current&&!current.original.fallback&&current.original.durationMinutes!==null&&current.best.durationMinutes!==null?Math.max(0,current.original.durationMinutes-current.best.durationMinutes):null;
 const extraKm=current&&!current.original.fallback&&current.original.distanceKm!==null&&current.best.distanceKm!==null?current.original.distanceKm-current.best.distanceKm:null;
 return <section className="strategic-planner">
 <div className="strategic-planner-head"><div><h3>Planejador inteligente de rotas</h3><p>Pesquise uma filial, adicione e arraste os cartões para reorganizar. A rota é atualizada automaticamente.</p></div><button className="btn secondary" disabled={!stops.length&&!search&&!originMode} onClick={()=>{change([]);setSearch('');setOriginSearch('');setOriginMode(false)}}>Limpar rota</button></div>
 <div className="strategic-planner-grid"><div><label>Primeira filial obrigatória</label><button className="btn secondary" onClick={()=>{setOriginMode(!originMode);setOriginSearch('')}}>{stops[0]?`Filial ${stops[0].numeroFilial} · Alterar` : "Escolher primeira filial"}</button>{originMode&&<input aria-label="Pesquisar primeira filial" placeholder="Ex.: FILIAL 09" value={originSearch} onChange={e=>setOriginSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&matches.length===1)add(matches[0])}}/>}<label>Adicionar outras filiais</label><input disabled={!stops.length||originMode} aria-label="Pesquisar parada" placeholder="Ex.: FILIAL 25 ou 09" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&matches.length===1){e.preventDefault();add(matches[0]);}}}/>
 {q&&<div className="strategic-results">{matches.map(b=>{const added=stops.some(s=>s.id===b.id),located=available.some(s=>s.id===b.id);return <button key={b.id} disabled={(!originMode&&added)||!located||(!originMode&&stops.length>=20)||(originMode&&!added&&stops.length>=20)} onClick={()=>add(b)}>{added?'✓':located?'+':'!'} Filial {b.numeroFilial} · {b.cidade}{added?' — já adicionada':!located?' — coordenadas pendentes':''}</button>})}{!matches.length&&<p>Nenhuma filial encontrada.</p>}</div>}
 <p>Busque pelo número e adicione uma unidade de cada vez. Também é possível adicionar pelo mapa.</p></div>
 <div><strong>Sequência de visitas ({stops.length}/20)</strong><div className="strategic-stops dynamic-stops">{stops.map((b,i)=><div key={b.id} draggable={i!==0} onDragStart={e=>{setDrag(i);e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(i));}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';}} onDrop={e=>{e.preventDefault();if(drag!==null)reorder(drag,i);setDrag(null);}} onDragEnd={()=>setDrag(null)} className={drag===i?'dragging':''}><span className="stop-grip" aria-hidden="true">{i===0?"🔒":"⠿"}</span><span className="stop-number">{i+1}</span><span className="stop-info"><b>Filial {b.numeroFilial}</b><small>{b.cidade} · {i===0?'Primeiro atendimento obrigatório':i===stops.length-1?'Destino':'Parada'}</small></span><span className="stop-actions"><button aria-label={`Subir filial ${b.numeroFilial}`} disabled={i<=1} onClick={()=>reorder(i,i-1)}>↑</button><button aria-label={`Descer filial ${b.numeroFilial}`} disabled={i===0||i===stops.length-1} onClick={()=>reorder(i,i+1)}>↓</button><button aria-label={`Remover filial ${b.numeroFilial}`} disabled={i===0} onClick={()=>change(stops.filter(s=>s.id!==b.id))}>×</button></span></div>)}{!stops.length&&<p>Adicione pelo menos duas filiais.</p>}</div>
 <label><input type="checkbox" checked={fixedEnd} onChange={e=>{setFixedEnd(e.target.checked);setDismissed('')}}/> Manter última parada fixa na otimização</label><button className="btn primary" disabled={busy||stops.length<2} onClick={()=>{setDismissed('');setManual(n=>n+1)}}>{busy?'Atualizando rota…':'Calcular e buscar melhorias'}</button></div></div>
 {busy&&<p role="status">Calculando trajeto e comparando sequências…</p>}
 {current&&<><div className="strategic-comparison"><div><small>Rota atual · {current.original.fallback?'linha reta':'por ruas (TomTom)'}</small><h3>{km(current.original.distanceKm)}</h3><p>{current.original.fallback?'Tempo indisponível':duration(current.original.durationMinutes)}</p></div><div><small>{current.original.fallback?"Comparação indisponível":"Melhor rota encontrada"}</small><h3>{current.original.fallback?'—':km(current.best.distanceKm)}</h3><p>{current.best.fallback?'Tempo indisponível':duration(current.best.durationMinutes)}</p></div><div><small>Tempo adicional de deslocamento</small><h3 style={{color:extraTime&&extraTime>0?'#b91c1c':'#166534'}}>{extraTime===null?'—':`+${duration(extraTime)}`}</h3><p>{current.best.durationMinutes!==null&&current.original.durationMinutes&&!current.original.fallback?`Eficiência: ${(100*current.best.durationMinutes/current.original.durationMinutes).toFixed(1)}% · `:""}{extraKm===null?'Distância indisponível':`${extraKm>=0?'+':'−'}${km(Math.abs(extraKm))} em relação à melhor encontrada${current.best.distanceKm&&current.best.distanceKm>0?` (${(100*extraKm/current.best.distanceKm).toFixed(1)}% sobre a melhor)`:``}`}</p></div></div>
 {current.original.fallback&&<p role="status">Roteamento por ruas indisponível. Sem comparação rodoviária ou estimativa confiável de duração.</p>}
 {improvement&&dismissed!==signature?<div className="strategic-suggestion"><b>Deseja aplicar a rota melhorada?</b><p>{current.order.map(b=>b.numeroFilial).join(' → ')}</p><button className="btn primary" onClick={()=>change(current.order)}>Sim, aplicar</button> <button className="btn secondary" onClick={()=>{setDismissed(signature);onPreview({original:current.original})}}>Não</button></div>:<p>{current.original.fallback?'Não foi possível avaliar alternativas por ruas.':improvement?'Sequência escolhida mantida.':'Nenhuma sequência melhor encontrada entre as avaliadas.'}</p>}</>}
 <small>Até 20 filiais. Otimização prioriza duração por ruas; sem comparação de alternativas quando indisponível. Heurística sem garantia de ótimo global. Não inclui atendimento, trânsito em tempo real ou retorno automático à base. Rascunho desta sessão.</small>
 </section>
}
