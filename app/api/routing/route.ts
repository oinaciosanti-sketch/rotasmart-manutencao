import {NextResponse} from "next/server";

type Coordinate=[number,number];
type RoutingProvider="tomtom";
const validCoordinate=(point:unknown):point is Coordinate=>Array.isArray(point)&&point.length===2&&typeof point[0]==="number"&&Number.isFinite(point[0])&&point[0]>=-180&&point[0]<=180&&typeof point[1]==="number"&&Number.isFinite(point[1])&&point[1]>=-90&&point[1]<=90;
const radians=(value:number)=>value*Math.PI/180;
const distanceKm=(a:Coordinate,b:Coordinate)=>{const radius=6371,dLat=radians(b[1]-a[1]),dLng=radians(b[0]-a[0]);const value=Math.sin(dLat/2)**2+Math.cos(radians(a[1]))*Math.cos(radians(b[1]))*Math.sin(dLng/2)**2;return 2*radius*Math.atan2(Math.sqrt(value),Math.sqrt(1-value))};
const fallback=(coordinates:Coordinate[],warning:string,status=200)=>{const distance=coordinates.slice(1).reduce((sum,point,index)=>sum+distanceKm(coordinates[index],point),0);return NextResponse.json({source:"haversine",distanceKm:distance,durationMinutes:Math.ceil(distance),geometry:coordinates.map(point=>[point[1],point[0]]),fallback:true,warning},{status})};

async function calculateTomTom(coordinates:Coordinate[],apiKey:string){
 const locations=coordinates.map(([longitude,latitude])=>`${latitude},${longitude}`).join(":");
 const url=new URL(`https://api.tomtom.com/routing/1/calculateRoute/${locations}/json`);
 url.searchParams.set("key",apiKey);url.searchParams.set("routeRepresentation","polyline");url.searchParams.set("travelMode","car");url.searchParams.set("traffic","false");url.searchParams.set("computeTravelTimeFor","all");
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{return await fetch(url,{headers:{Accept:"application/json"},signal:controller.signal,cache:"no-store"})}finally{clearTimeout(timeout)}
}

export async function POST(request:Request){
 let safeCoordinates:Coordinate[]=[];
 try{
  const body=await request.json().catch(()=>null) as {coordinates?:unknown;provider?:unknown}|null;
  const raw=body?.coordinates;
  if(!Array.isArray(raw)||raw.length<2)return NextResponse.json({source:"haversine",fallback:true,error:"Informe pelo menos dois pontos válidos para calcular a rota."},{status:400});
  if(raw.length>152)return NextResponse.json({source:"haversine",fallback:true,error:"A rota excede o limite de pontos desta versão."},{status:400});
  if(!raw.every(validCoordinate))return NextResponse.json({source:"haversine",fallback:true,error:"Uma ou mais coordenadas são inválidas."},{status:400});
  const coordinates=raw as Coordinate[],provider:RoutingProvider=body?.provider==="tomtom"?"tomtom":"tomtom";safeCoordinates=coordinates;
  const apiKey=process.env.TOMTOM_API_KEY?.trim();
  if(!apiKey)return fallback(coordinates,"TOMTOM_API_KEY não está configurada no servidor. Usando Haversine.");

  const response=await calculateTomTom(coordinates,apiKey);
  const payload=await response.json().catch(()=>null) as any;
  if(!response.ok){const reason=response.status===429?"Limite de requisições da TomTom atingido.":payload?.detailedError?.message||payload?.errorText||`TomTom indisponível (${response.status}).`;return fallback(coordinates,`${reason} Usando Haversine.`)}
  const route=payload?.routes?.[0],summary=route?.summary;
  const points=(route?.legs||[]).flatMap((leg:any,index:number)=>(leg?.points||[]).filter((point:any)=>typeof point?.latitude==="number"&&typeof point?.longitude==="number").filter((_:any,pointIndex:number)=>index===0||pointIndex>0).map((point:any)=>[point.latitude,point.longitude] as Coordinate));
  if(!Number.isFinite(summary?.lengthInMeters)||!Number.isFinite(summary?.travelTimeInSeconds)||points.length<2)return fallback(coordinates,"A TomTom retornou uma rota incompleta. Usando Haversine.");
  return NextResponse.json({source:provider,distanceKm:summary.lengthInMeters/1000,durationMinutes:Math.ceil(summary.travelTimeInSeconds/60),geometry:points,fallback:false});
 }catch(reason){const message=reason instanceof Error&&reason.name==="AbortError"?"A TomTom demorou demais para responder.":"Não foi possível consultar a TomTom.";return safeCoordinates.length>=2?fallback(safeCoordinates,`${message} Usando Haversine.`):NextResponse.json({source:"haversine",fallback:true,error:message},{status:502})}
}
