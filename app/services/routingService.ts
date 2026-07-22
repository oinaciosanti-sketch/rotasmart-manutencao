import {calculateRouteDistance,isValidCoordinate,type CoordinatePoint} from "../utils/distance";

export type RouteGeometryPoint=[number,number];
export type RoadRoutingProvider="tomtom"|"openrouteservice"|"graphhopper"|"osrm"|"google";
export type RouteSource=RoadRoutingProvider|"haversine";
export type RoutingErrorCode="missing_key"|"authentication"|"rate_limit"|"route_not_found"|"provider_error"|"timeout"|"network_error";
export type RoutingDiagnostics={keyConfigured?:boolean;coordinateCount?:number;providerHttpStatus?:number|null;fallbackUsed?:boolean};
export type RouteCalculation={source:RouteSource;distanceKm:number|null;durationMinutes:number|null;geometry:RouteGeometryPoint[];fallback:boolean;calculatedAt:string;warning?:string;error?:string;errorCode?:RoutingErrorCode;diagnostics?:RoutingDiagnostics};

const validGeometry=(value:unknown):value is RouteGeometryPoint[]=>Array.isArray(value)&&value.length>=2&&value.every(point=>Array.isArray(point)&&point.length===2&&isValidCoordinate(point[0],point[1]));
export function calculateFallbackRoute(points:CoordinatePoint[],warning?:string):RouteCalculation{const valid=Array.isArray(points)?points.filter(point=>isValidCoordinate(point.latitude,point.longitude)):[];const distanceKm=valid.length>=2?calculateRouteDistance(valid):null;return{source:"haversine",distanceKm,durationMinutes:distanceKm===null?null:Math.ceil(distanceKm),geometry:valid.map(point=>[point.latitude!,point.longitude!]),fallback:true,calculatedAt:new Date().toISOString(),warning}}
export function normalizeRouteResponse(value:unknown):RouteCalculation|null{const data=value&&typeof value==="object"?value as Record<string,any>:null;if(!data||!(["tomtom","openrouteservice","graphhopper","osrm","google"] as unknown[]).includes(data.source)||!Number.isFinite(data.distanceKm)||!Number.isFinite(data.durationMinutes)||!validGeometry(data.geometry))return null;return{source:data.source as RoadRoutingProvider,distanceKm:Number(data.distanceKm),durationMinutes:Number(data.durationMinutes),geometry:data.geometry as RouteGeometryPoint[],fallback:false,calculatedAt:typeof data.calculatedAt==="string"?data.calculatedAt:new Date().toISOString(),warning:typeof data.warning==="string"?data.warning:undefined,error:typeof data.error==="string"?data.error:undefined,errorCode:data.errorCode,diagnostics:data.diagnostics}}
export async function calculateRoadRoute(points:CoordinatePoint[],provider:RoadRoutingProvider="tomtom"):Promise<RouteCalculation>{
 const valid=Array.isArray(points)?points.filter(point=>isValidCoordinate(point.latitude,point.longitude)):[];
 const fallback=calculateFallbackRoute(valid);
 if(valid.length<2)return{...fallback,errorCode:"route_not_found",error:"Não há coordenadas suficientes para calcular a rota por ruas.",warning:"Não há coordenadas suficientes para calcular a rota por ruas."};
 try{
  const response=await fetch("/api/routing",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({coordinates:valid.map(point=>[point.longitude,point.latitude]),provider})});
  const payload=await response.json().catch(()=>null) as any;
  const normalized=normalizeRouteResponse(payload);
  if(response.ok&&normalized)return normalized;
  const error=typeof payload?.error==="string"?payload.error:"Erro ao calcular rota por ruas.";
  if(payload?.source==="haversine"&&validGeometry(payload.geometry))return{source:"haversine",distanceKm:Number.isFinite(payload.distanceKm)?Number(payload.distanceKm):fallback.distanceKm,durationMinutes:Number.isFinite(payload.durationMinutes)?Number(payload.durationMinutes):fallback.durationMinutes,geometry:payload.geometry,calculatedAt:typeof payload.calculatedAt==="string"?payload.calculatedAt:new Date().toISOString(),fallback:true,error,errorCode:payload.errorCode||"provider_error",warning:typeof payload.warning==="string"?payload.warning:`${error} Mantida estimativa em linha reta — Haversine.`,diagnostics:payload.diagnostics};
  return{...fallback,error,errorCode:payload?.errorCode||"provider_error",warning:error,diagnostics:payload?.diagnostics};
 }catch(reason){const error="Erro ao calcular rota por ruas.";return{...fallback,error,errorCode:"network_error",warning:`${error} Verifique a conexão e tente novamente.`,diagnostics:{coordinateCount:valid.length,fallbackUsed:true}}}
}
