import type {Journey,Job} from './FieldPilot';
import type {Filial} from '../data/filiais';
export type Point=[number,number];
export const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
export function branchFor(job:Job,branches:Filial[]){
 const name=norm(job.branch||'');if(!name)return undefined;
 const match=name.match(/\b(?:filial|fl)\s*[-.]?\s*(\d+)\b/);
 const matches=branches.filter(b=>norm(b.nome||'')===name||(match&&/^\d+$/.test(b.numeroFilial||'')&&Number(b.numeroFilial)===Number(match[1])));
 return matches.length===1?matches[0]:undefined;
}
export function coordinate(b?:Filial):Point|null{const a=b?.latitude,o=b?.longitude;return typeof a==='number'&&typeof o==='number'&&Number.isFinite(a)&&Number.isFinite(o)&&Math.abs(a)<=90&&Math.abs(o)<=180&&(a!==0||o!==0)?[a,o]:null;}
export function modelJourney(j:Journey,branches:Filial[]){
 const stops=[...j.field_jobs].sort((a,b)=>a.position-b.position).map(job=>{const branch=branchFor(job,branches);return {job,branch,point:coordinate(branch),key:branch?`id:${branch.id}`:norm(job.branch)?`name:${norm(job.branch)}`:`job:${job.id}`}});
 const active=stops.find(s=>s.job.state==='running');
 const waiting=stops.filter(s=>s.job.state==='waiting');
 const last=stops.filter(s=>s.job.finished_at&&(s.job.state==='done'||s.job.state==='pending')).sort((a,b)=>Date.parse(b.job.finished_at!)-Date.parse(a.job.finished_at!))[0];
 // Prefer remaining work at the last serviced site; never infer departure if work remains there.
 const same=last&&waiting.find(s=>s.key===last.key);const next=same||waiting[0];
 const state=j.finished_at?'Encerrada':active?'Em atendimento':!j.started_at?'Aguardando saída':!next?'Aguardando KM final':same?'Atendimentos restantes na filial':last?'Deslocamento previsto':'Saída confirmada · primeira parada prevista';
 const segment=j.started_at&&!j.finished_at&&!active&&!same&&last?.point&&next?.point&&last.key!==next.key&&(last.point[0]!==next.point[0]||last.point[1]!==next.point[1])?[last.point,next.point] as [Point,Point]:null;
 const groups=Array.from(new Set(stops.map(s=>s.key))).map(key=>{const entries=stops.filter(s=>s.key===key);return {key,entries,point:entries[0].point,label:entries[0].job.branch,state:entries.some(s=>s.job.state==='running')?'running':entries.some(s=>s.job.state==='waiting')?'waiting':entries.some(s=>s.job.state==='pending')?'pending':'done'};});
 return {journey:j,stops,active,next,last,state,segment,groups};
}
