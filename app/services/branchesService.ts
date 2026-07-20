import type { BranchRow } from "../types/database";
import { requireSupabaseBrowserClient } from "../lib/supabase/client";
export type BranchInput=Partial<Omit<BranchRow,"id"|"created_at"|"updated_at">>&{name:string};
export async function listBranches(){const {data,error}=await requireSupabaseBrowserClient().from("branches").select("*").order("branch_number");if(error)throw error;return data as BranchRow[]}
export async function getBranchById(id:string){const {data,error}=await requireSupabaseBrowserClient().from("branches").select("*").eq("id",id).single();if(error)throw error;return data as BranchRow}
export async function createBranch(input:BranchInput){const {data,error}=await requireSupabaseBrowserClient().from("branches").insert(input).select().single();if(error)throw error;return data as BranchRow}
export async function updateBranchRecord(id:string,input:Partial<BranchInput>){const {data,error}=await requireSupabaseBrowserClient().from("branches").update(input).eq("id",id).select().single();if(error)throw error;return data as BranchRow}
export async function deactivateBranch(id:string){return updateBranchRecord(id,{active:false})}
export async function removeBranch(id:string){const {error}=await requireSupabaseBrowserClient().from("branches").delete().eq("id",id);if(error)throw error}
