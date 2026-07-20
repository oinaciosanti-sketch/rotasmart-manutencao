import type { ProfileRow } from "../types/database";
import { requireSupabaseBrowserClient } from "../lib/supabase/client";
export async function getCurrentProfile(){const client=requireSupabaseBrowserClient();const {data:{user}}=await client.auth.getUser();if(!user)return null;const {data,error}=await client.from("profiles").select("*").eq("id",user.id).single();if(error)throw error;return data as ProfileRow}
export async function updateProfile(id:string,input:Partial<Pick<ProfileRow,"nome"|"role"|"analyst_id"|"ativo">>){const {data,error}=await requireSupabaseBrowserClient().from("profiles").update(input).eq("id",id).select().single();if(error)throw error;return data as ProfileRow}
