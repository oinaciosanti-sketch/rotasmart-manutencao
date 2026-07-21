import type {AppRole,ProfileRow,ProfileStatus} from "../types/database";
import {requireSupabaseBrowserClient} from "../lib/supabase/client";

export type ProfileInput={nome:string;email:string;role:AppRole;analyst_id:string|null;technician_id:string|null;status:ProfileStatus;notes:string};
const selection="*,analysts(name),technicians(name)";

export async function listProfiles(){const {data,error}=await requireSupabaseBrowserClient().from("profiles").select(selection).order("nome");if(error)throw error;return data as unknown as ProfileRow[]}
export async function createPendingProfile(input:ProfileInput){const client=requireSupabaseBrowserClient();const email=input.email.trim().toLowerCase();const existing=await client.from("profiles").select("id").ilike("email",email).maybeSingle();if(existing.error)throw existing.error;if(existing.data)throw new Error("Já existe um perfil com este e-mail.");const {data:{user}}=await client.auth.getUser();const {data,error}=await client.from("profiles").insert({...input,email,user_id:null,ativo:input.status==="ativo",created_by:user?.id||null,updated_by:user?.id||null}).select(selection).single();if(error)throw error;return data as unknown as ProfileRow}
export async function updateProfile(id:string,input:Partial<ProfileInput>){const client=requireSupabaseBrowserClient();const {data:{user}}=await client.auth.getUser();const payload={...input,...(input.status?{ativo:input.status==="ativo"}:{}),updated_by:user?.id||null};const {data,error}=await client.from("profiles").update(payload).eq("id",id).select(selection).single();if(error)throw error;return data as unknown as ProfileRow}
export async function deleteProfile(id:string){const client=requireSupabaseBrowserClient();const {error}=await client.from("profiles").delete().eq("id",id);if(error)throw error}
