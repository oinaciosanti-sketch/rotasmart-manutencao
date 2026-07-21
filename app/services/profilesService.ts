import type {AppRole,ProfileRow,ProfileStatus} from "../types/database";
import {requireSupabaseBrowserClient} from "../lib/supabase/client";

export type ProfileInput={nome:string;email:string;role:AppRole;analyst_id:string|null;technician_id:string|null;status:ProfileStatus;notes:string};

async function hydrateProfiles(rows:Record<string,any>[]):Promise<ProfileRow[]>{
 const client=requireSupabaseBrowserClient();const [analysts,technicians]=await Promise.all([client.from("analysts").select("id,name"),client.from("technicians").select("id,name")]);
 const analystNames=new Map((analysts.data||[]).map(item=>[item.id,item.name])),technicianNames=new Map((technicians.data||[]).map(item=>[item.id,item.name]));
 return rows.map(item=>({...item,analysts:item.analyst_id?{name:analystNames.get(item.analyst_id)||"Analista não localizado"}:null,technicians:item.technician_id?{name:technicianNames.get(item.technician_id)||"Técnico não localizado"}:null})) as ProfileRow[];
}

export async function listProfiles(){const {data,error}=await requireSupabaseBrowserClient().from("profiles").select("*").order("nome");if(error)throw error;return hydrateProfiles(data||[])}
export async function createPendingProfile(input:ProfileInput){const client=requireSupabaseBrowserClient();const email=input.email.trim().toLowerCase();const existing=await client.from("profiles").select("id").ilike("email",email).maybeSingle();if(existing.error)throw existing.error;if(existing.data)throw new Error("Já existe um perfil com este e-mail.");const {data:{user}}=await client.auth.getUser();const {data,error}=await client.from("profiles").insert({...input,email,user_id:null,ativo:input.status==="ativo",created_by:user?.id||null,updated_by:user?.id||null}).select("*").single();if(error)throw error;return (await hydrateProfiles([data]))[0]}
export async function updateProfile(id:string,input:Partial<ProfileInput>){const client=requireSupabaseBrowserClient();const {data:{user}}=await client.auth.getUser();const payload={...input,...(input.status?{ativo:input.status==="ativo"}:{}),updated_by:user?.id||null};const {data,error}=await client.from("profiles").update(payload).eq("id",id).select("*").single();if(error)throw error;return (await hydrateProfiles([data]))[0]}
export async function deleteProfile(id:string){const client=requireSupabaseBrowserClient();const {error}=await client.from("profiles").delete().eq("id",id);if(error)throw error}
