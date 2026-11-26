import {calculateRoadRoute,type RouteCalculation} from '../services/routingService';
import {suggestOrder} from './strategicRoute';
import {calculateRouteDistance,type CoordinatePoint} from './distance';
export const routeKey=(p:CoordinatePoint[])=>JSON.stringify(p.map(x=>[x.latitude,x.longitude]));
const cache=new Map<string,Promise<RouteCalculation>>();
export function cachedRoad(points:CoordinatePoint[],refresh=false){const key=routeKey(points);if(refresh)cache.delete(key);const hit=cache.get(key);if(hit)return hit;if(cache.size>=150)cache.clear();const promise=calculateRoadRoute(points).then(r=>{if(r.fallback&&cache.get(key)===promise)cache.delete(key);return r;},e=>{cache.delete(key);throw e});cache.set(key,promise);return promise;}
// Evaluate a bounded set of full road routes, not just the geographic winner.
export async function compareRoadOrders<T extends CoordinatePoint>(points:T[],fixedEnd=false,previous?:T[],refresh=false){
 const original=await cachedRoad(points,refresh);let best=original,order=points;
 if(original.fallback)return {original,best,order,evaluated:1};
 const candidates:T[][]=[];const seen=new Set([routeKey(points)]);const add=(p:T[])=>{const k=routeKey(p);if(!seen.has(k)){seen.add(k);candidates.push(p)}};
 if(previous)add(previous);add(suggestOrder(points,fixedEnd,true));
 const end=points.length-(fixedEnd?1:0);const reverse=[points[0],...points.slice(1,end).reverse(),...points.slice(end)];add(reverse);
 const variants:T[][]=[];for(let i=1;i<end;i++)for(let j=i+1;j<end;j++){const p=[...points];[p[i],p[j]]=[p[j],p[i]];variants.push(p);}
 variants.sort((a,b)=>(calculateRouteDistance(a)??Infinity)-(calculateRouteDistance(b)??Infinity));for(const p of variants)add(p);
 const selected=candidates.slice(0,5);const results=await Promise.all(selected.map(p=>cachedRoad(p,refresh)));let evaluated=1;
 results.forEach((r,i)=>{if(r.fallback)return;evaluated++;if((r.durationMinutes??Infinity)<(best.durationMinutes??Infinity)||(r.durationMinutes===best.durationMinutes&&(r.distanceKm??Infinity)<(best.distanceKm??Infinity))){best=r;order=selected[i]}});
 return {original,best,order,evaluated};
}
