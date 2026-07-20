import type { AnalystRow } from "../types/database";
import { requireSupabaseBrowserClient } from "../lib/supabase/client";

export type AnalystInput = Partial<Omit<AnalystRow,"id"|"created_at"|"updated_at">> & {name:string};
export async function listAnalysts(){const {data,error}=await requireSupabaseBrowserClient().from("analysts").select("*").order("name");if(error)throw error;return data as AnalystRow[]}
export async function getAnalystById(id:string){const {data,error}=await requireSupabaseBrowserClient().from("analysts").select("*").eq("id",id).single();if(error)throw error;return data as AnalystRow}
export async function createAnalyst(input:AnalystInput){const {data,error}=await requireSupabaseBrowserClient().from("analysts").insert(input).select().single();if(error)throw error;return data as AnalystRow}
export async function updateAnalyst(id:string,input:Partial<AnalystInput>){const {data,error}=await requireSupabaseBrowserClient().from("analysts").update(input).eq("id",id).select().single();if(error)throw error;return data as AnalystRow}
export async function deactivateAnalyst(id:string){return updateAnalyst(id,{active:false})}
export async function removeAnalyst(id:string){const {error}=await requireSupabaseBrowserClient().from("analysts").delete().eq("id",id);if(error)throw error}
