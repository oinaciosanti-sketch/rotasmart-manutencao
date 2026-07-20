import type { TechnicianRow } from "../types/database";
import { requireSupabaseBrowserClient } from "../lib/supabase/client";
export type TechnicianInput=Partial<Omit<TechnicianRow,"id"|"created_at"|"updated_at">>&{name:string};
export async function listTechnicians(){const {data,error}=await requireSupabaseBrowserClient().from("technicians").select("*").order("name");if(error)throw error;return data as TechnicianRow[]}
export async function getTechnicianById(id:string){const {data,error}=await requireSupabaseBrowserClient().from("technicians").select("*").eq("id",id).single();if(error)throw error;return data as TechnicianRow}
export async function createTechnician(input:TechnicianInput){const {data,error}=await requireSupabaseBrowserClient().from("technicians").insert(input).select().single();if(error)throw error;return data as TechnicianRow}
export async function updateTechnicianRecord(id:string,input:Partial<TechnicianInput>){const {data,error}=await requireSupabaseBrowserClient().from("technicians").update(input).eq("id",id).select().single();if(error)throw error;return data as TechnicianRow}
export async function deactivateTechnician(id:string){return updateTechnicianRecord(id,{active:false})}
export async function removeTechnician(id:string){const {error}=await requireSupabaseBrowserClient().from("technicians").delete().eq("id",id);if(error)throw error}
