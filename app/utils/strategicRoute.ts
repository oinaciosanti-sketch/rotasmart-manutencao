import {calculateRouteDistance,type CoordinatePoint} from './distance';

// Heurística geográfica: mantém a primeira parada (e a última, se solicitada).
// A distância rodoviária é verificada separadamente antes de recomendar.
export function suggestOrder<T extends CoordinatePoint>(points:T[],fixedEnd=false):T[]{
 if(points.length<3)return [...points];
 const score=(p:T[])=>calculateRouteDistance(p)??Infinity;
 const remaining=points.slice(1,fixedEnd?-1:undefined), greedy=[points[0]];
 while(remaining.length){let best=0;for(let i=1;i<remaining.length;i++)if(score([greedy[greedy.length-1],remaining[i]])<score([greedy[greedy.length-1],remaining[best]]))best=i;greedy.push(remaining.splice(best,1)[0]);}
 if(fixedEnd)greedy.push(points[points.length-1]);
 let result=score(greedy)<score(points)?greedy:[...points];
 for(let pass=0;pass<20;pass++){
  let improved=false;
  for(let i=1;i<result.length-1;i++)for(let j=i+1;j<result.length-(fixedEnd?1:0);j++){
   const candidate=[...result.slice(0,i),...result.slice(i,j+1).reverse(),...result.slice(j+1)];
   if(score(candidate)+0.00001<score(result)){result=candidate;improved=true;}
  }
  if(!improved)break;
 }
 return result;
}
