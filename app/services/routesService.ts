import type { RouteRow,RouteStopRow } from "../types/database";
import { requireSupabaseBrowserClient } from "../lib/supabase/client";
export type RouteInput=Partial<Omit<RouteRow,"id"|"created_at"|"updated_at">>&{technician_id:string;route_date:string;status:string};
export async function listRoutes(dateFrom?:string,dateTo?:string){let query=requireSupabaseBrowserClient().from("routes").select("*").order("route_date");if(dateFrom)query=query.gte("route_date",dateFrom);if(dateTo)query=query.lte("route_date",dateTo);const {data,error}=await query;if(error)throw error;return data as RouteRow[]}
export async function getRouteById(id:string){const {data,error}=await requireSupabaseBrowserClient().from("routes").select("*").eq("id",id).single();if(error)throw error;return data as RouteRow}
export async function createRoute(input:RouteInput){const {data,error}=await requireSupabaseBrowserClient().from("routes").insert(input).select().single();if(error)throw error;return data as RouteRow}
export async function updateRouteRecord(id:string,input:Partial<RouteInput>){const {data,error}=await requireSupabaseBrowserClient().from("routes").update(input).eq("id",id).select().single();if(error)throw error;return data as RouteRow}
export async function removeRoute(id:string){const {error}=await requireSupabaseBrowserClient().from("routes").delete().eq("id",id);if(error)throw error}
export async function listRouteStops(routeId:string){const {data,error}=await requireSupabaseBrowserClient().from("route_stops").select("*").eq("route_id",routeId).order("stop_order");if(error)throw error;return data as RouteStopRow[]}
export async function replaceRouteStops(routeId:string,stops:Array<Pick<RouteStopRow,"ticket_id"|"stop_order"|"latitude"|"longitude">>){const client=requireSupabaseBrowserClient();const removed=await client.from("route_stops").delete().eq("route_id",routeId);if(removed.error)throw removed.error;if(!stops.length)return[];const {data,error}=await client.from("route_stops").insert(stops.map(stop=>({...stop,route_id:routeId}))).select();if(error)throw error;return data as RouteStopRow[]}

export type CloudRoutePlanTicket={id:string;order:number;latitude?:number|null;longitude?:number|null};
export type CloudRoadRoute={distanceKm:number|null;durationMinutes:number|null;geometry:Array<[number,number]>;source:"tomtom"|"openrouteservice"|"graphhopper"|"osrm"|"google"|"haversine";calculatedAt:string};
export async function reconcileRoutePlan(input:{technicianId:string;date:string;planningStatus:"nao_planejado"|"em_rota_rascunho"|"rota_confirmada";tickets:CloudRoutePlanTicket[];roadRoute?:CloudRoadRoute}){
 const client=requireSupabaseBrowserClient();
 const {data,error}=await client.rpc("save_route_plan",{
  p_technician_id:input.technicianId,
  p_route_date:input.date,
  p_planning_status:input.planningStatus,
  p_tickets:input.tickets.map(ticket=>({id:ticket.id,order:ticket.order,latitude:ticket.latitude??null,longitude:ticket.longitude??null})),
  p_road_distance_km:input.roadRoute?.distanceKm??null,
  p_road_duration_minutes:input.roadRoute?.durationMinutes??null,
  p_route_geometry:input.roadRoute?.geometry??null,
  p_route_source:input.roadRoute?.source??null,
  p_route_calculated_at:input.roadRoute?.calculatedAt??null,
 });
 if(error){if(error.code==="PGRST202"||error.code==="42883")throw new Error("Execute supabase/migration_v2_3_tomtom_distance_fix.sql antes de salvar rotas.");throw error}
 return data as RouteRow;
}
