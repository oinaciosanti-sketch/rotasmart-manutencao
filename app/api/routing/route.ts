import {NextResponse} from "next/server";

type Coordinate=[number,number];
type RoutingErrorCode="missing_key"|"authentication"|"rate_limit"|"route_not_found"|"provider_error"|"timeout";

const validCoordinate=(point:unknown):point is Coordinate=>Array.isArray(point)&&point.length===2&&typeof point[0]==="number"&&Number.isFinite(point[0])&&point[0]>=-180&&point[0]<=180&&typeof point[1]==="number"&&Number.isFinite(point[1])&&point[1]>=-90&&point[1]<=90;
const radians=(value:number)=>value*Math.PI/180;
const distanceKm=(a:Coordinate,b:Coordinate)=>{const radius=6371,dLat=radians(b[1]-a[1]),dLng=radians(b[0]-a[0]);const value=Math.sin(dLat/2)**2+Math.cos(radians(a[1]))*Math.cos(radians(b[1]))*Math.sin(dLng/2)**2;return 2*radius*Math.atan2(Math.sqrt(value),Math.sqrt(1-value))};
const safeMessage=(payload:any)=>String(payload?.detailedError?.message||payload?.error?.description||payload?.errorText||payload?.message||"").slice(0,500);
const logAttempt=(details:{keyConfigured:boolean;coordinateCount:number;providerHttpStatus?:number;providerMessage?:string;fallbackUsed:boolean})=>console.info("[routing:tomtom]",details);
const fallback=(coordinates:Coordinate[],errorCode:RoutingErrorCode,error:string,providerHttpStatus?:number)=>{const distance=coordinates.slice(1).reduce((sum,point,index)=>sum+distanceKm(coordinates[index],point),0),calculatedAt=new Date().toISOString();return NextResponse.json({source:"haversine",distanceKm:distance,durationMinutes:Math.ceil(distance),geometry:coordinates.map(point=>[point[1],point[0]]),fallback:true,calculatedAt,errorCode,error,warning:`${error} Mantida estimativa em linha reta — Haversine.`,diagnostics:{keyConfigured:Boolean(process.env.TOMTOM_API_KEY?.trim()),coordinateCount:coordinates.length,providerHttpStatus:providerHttpStatus??null,fallbackUsed:true}})};

async function calculateTomTom(coordinates:Coordinate[],apiKey:string){
 const locations=coordinates.map(([longitude,latitude])=>`${latitude},${longitude}`).join(":");
 const url=new URL(`https://api.tomtom.com/routing/1/calculateRoute/${locations}/json`);
 url.searchParams.set("key",apiKey);
 url.searchParams.set("routeRepresentation","polyline");
 url.searchParams.set("travelMode","car");
 url.searchParams.set("traffic","false");
 url.searchParams.set("computeTravelTimeFor","all");
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{return await fetch(url,{headers:{Accept:"application/json"},signal:controller.signal,cache:"no-store"})}finally{clearTimeout(timeout)}
}

export async function POST(request:Request){
 let safeCoordinates:Coordinate[]=[];
 try{
  const body=await request.json().catch(()=>null) as {coordinates?:unknown;provider?:unknown}|null;
  const raw=body?.coordinates;
  if(!Array.isArray(raw)||raw.length<2)return NextResponse.json({source:"haversine",fallback:true,errorCode:"route_not_found",error:"Informe pelo menos dois pontos válidos para calcular a rota."},{status:400});
  if(raw.length>152)return NextResponse.json({source:"haversine",fallback:true,errorCode:"provider_error",error:"A rota excede o limite de pontos desta versão."},{status:400});
  if(!raw.every(validCoordinate))return NextResponse.json({source:"haversine",fallback:true,errorCode:"route_not_found",error:"Uma ou mais coordenadas são inválidas."},{status:400});
  const coordinates=raw as Coordinate[];safeCoordinates=coordinates;
  const apiKey=process.env.TOMTOM_API_KEY?.trim();
  if(!apiKey){logAttempt({keyConfigured:false,coordinateCount:coordinates.length,fallbackUsed:true});return fallback(coordinates,"missing_key","Chave TomTom ausente.")}

  const response=await calculateTomTom(coordinates,apiKey);
  const payload=await response.json().catch(()=>null) as any;
  const providerMessage=safeMessage(payload);
  if(!response.ok){
   const errorCode:RoutingErrorCode=response.status===401||response.status===403?"authentication":response.status===429?"rate_limit":response.status===404||response.status===400?"route_not_found":"provider_error";
   const error=errorCode==="authentication"?"Erro de autenticação TomTom.":errorCode==="rate_limit"?"Limite da API TomTom atingido.":errorCode==="route_not_found"?"Rota não encontrada pela TomTom.":"Erro ao calcular rota por ruas.";
   logAttempt({keyConfigured:true,coordinateCount:coordinates.length,providerHttpStatus:response.status,providerMessage:providerMessage||error,fallbackUsed:true});
   return fallback(coordinates,errorCode,providerMessage?`${error} ${providerMessage}`:error,response.status);
  }
  const route=payload?.routes?.[0],summary=route?.summary;
  const points=(route?.legs||[]).flatMap((leg:any,index:number)=>(leg?.points||[]).filter((point:any)=>typeof point?.latitude==="number"&&Number.isFinite(point.latitude)&&typeof point?.longitude==="number"&&Number.isFinite(point.longitude)).filter((_:any,pointIndex:number)=>index===0||pointIndex>0).map((point:any)=>[point.latitude,point.longitude] as Coordinate));
  if(!Number.isFinite(summary?.lengthInMeters)||!Number.isFinite(summary?.travelTimeInSeconds)||points.length<2){logAttempt({keyConfigured:true,coordinateCount:coordinates.length,providerHttpStatus:response.status,providerMessage:"Resposta sem distância, duração ou geometria válida.",fallbackUsed:true});return fallback(coordinates,"route_not_found","Rota não encontrada pela TomTom.",response.status)}
  const calculatedAt=new Date().toISOString();
  logAttempt({keyConfigured:true,coordinateCount:coordinates.length,providerHttpStatus:response.status,fallbackUsed:false});
  return NextResponse.json({source:"tomtom",distanceKm:summary.lengthInMeters/1000,durationMinutes:Math.ceil(summary.travelTimeInSeconds/60),geometry:points,fallback:false,calculatedAt,diagnostics:{keyConfigured:true,coordinateCount:coordinates.length,providerHttpStatus:response.status,fallbackUsed:false}});
 }catch(reason){const timedOut=reason instanceof Error&&reason.name==="AbortError",error=timedOut?"A TomTom demorou demais para responder.":"Erro ao calcular rota por ruas.";logAttempt({keyConfigured:Boolean(process.env.TOMTOM_API_KEY?.trim()),coordinateCount:safeCoordinates.length,providerMessage:reason instanceof Error?reason.message:String(reason),fallbackUsed:true});return safeCoordinates.length>=2?fallback(safeCoordinates,timedOut?"timeout":"provider_error",error):NextResponse.json({source:"haversine",fallback:true,errorCode:timedOut?"timeout":"provider_error",error},{status:502})}
}
