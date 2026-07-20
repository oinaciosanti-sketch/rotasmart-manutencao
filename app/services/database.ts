import { getSupabaseBrowserClient, isSupabaseConfigured, requireSupabaseBrowserClient } from "../lib/supabase/client";

export type DatabaseStatus = { configured:boolean;authenticated:boolean;reachable:boolean;message:string };

export function getDataMode(authenticated: boolean): "local" | "cloud" {
  return isSupabaseConfigured() && authenticated ? "cloud" : "local";
}

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  if (!isSupabaseConfigured()) return { configured:false,authenticated:false,reachable:false,message:"Modo local ativo. Os dados estão salvos apenas neste navegador." };
  const client = getSupabaseBrowserClient()!;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { configured:true,authenticated:false,reachable:true,message:"Supabase configurado. Entre para acessar o banco." };
  const { error } = await client.from("profiles").select("id").limit(1);
  return error
    ? { configured:true,authenticated:true,reachable:false,message:`Conexão autenticada, mas o schema não respondeu: ${error.message}` }
    : { configured:true,authenticated:true,reachable:true,message:"Banco conectado e sessão autenticada." };
}

export async function findOne(table: string, column: string, value: string) {
  const { data, error } = await requireSupabaseBrowserClient().from(table).select("*").eq(column, value).limit(1).maybeSingle();
  if (error) throw error;
  return data as Record<string, any> | null;
}

export async function saveByNaturalKey(table: string, column: string, value: string, payload: Record<string, unknown>) {
  const client = requireSupabaseBrowserClient();
  const existing = await findOne(table, column, value);
  const query = existing ? client.from(table).update(payload).eq("id", existing.id) : client.from(table).insert(payload);
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return { row:data as Record<string, any>,created:!existing };
}
