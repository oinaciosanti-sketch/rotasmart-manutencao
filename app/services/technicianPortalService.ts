import {requireSupabaseBrowserClient} from "../lib/supabase/client";

export type TechnicianTicketAction="start"|"finish"|"complete"|"pending"|"notes";
export async function saveRouteExecution(routeId:string,action:"start"|"finish",odometer:number){const {data,error}=await requireSupabaseBrowserClient().rpc("technician_update_route",{p_route_id:routeId,p_action:action,p_odometer:odometer});if(error)throw error;return data}
export async function saveTicketExecution(ticketId:string,action:TechnicianTicketAction,notes?:string,reason?:string){const {data,error}=await requireSupabaseBrowserClient().rpc("technician_update_ticket",{p_ticket_id:ticketId,p_action:action,p_notes:notes||null,p_reason:reason||null});if(error)throw error;return data}
