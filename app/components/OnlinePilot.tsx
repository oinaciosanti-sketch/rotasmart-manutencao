"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth, AuthLoading } from "./AuthProvider";
import { getSupabaseBrowserClient } from "../lib/supabase/client";
import { Route, ShieldCheck, RefreshCw, LogOut, Smartphone } from "lucide-react";

const TEST_KEY = "rotasmart_v9_beta_connection_test";
type Signal = { id: string; device: string; at: string };
const panel = { background: "white", border: "1px solid #dbe3ec", borderRadius: 14, padding: 20, marginBottom: 16 };
export function OnlinePilot() {
  const auth = useAuth();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const [signal,setSignal]=useState<Signal|null>(null); const [checked,setChecked]=useState("");
  const [connection,setConnection]=useState("Aguardando consulta");
  const [readError,setReadError]=useState("");
  const request=useRef(0);
  const authorized=!!auth.user && auth.profile?.user_id===auth.user.id && auth.profile?.role==="admin" && auth.profile?.ativo===true && auth.profile?.status==="ativo";
  useEffect(()=>{
    setSignal(null); setChecked(""); setReadError(""); setConnection("Aguardando consulta");
    if(!authorized)return;
    const client=getSupabaseBrowserClient(); if(!client)return;
    let active=true; let pending=false;
    const read=async()=>{
      if(pending||!active)return; pending=true; const seq=++request.current;
      try{
        const {data,error}=await client.from("app_settings").select("value,updated_at").eq("key",TEST_KEY).maybeSingle();
        if(error)throw error;
        if(!active||seq!==request.current)return;
        const v=data?.value as Signal|undefined;
        setSignal(v&&typeof v.id==="string"&&typeof v.device==="string"&&typeof v.at==="string"?v:null);
        setChecked(new Date().toLocaleTimeString("pt-BR"));setConnection("Consulta autenticada concluída");setReadError("");
      }catch(e){if(active&&seq===request.current){setConnection("Falha na consulta");setReadError(e instanceof Error?e.message:String((e as {message?:string})?.message||e));}}
      finally{pending=false;}
    };
    void read();const timer=setInterval(()=>void read(),3000);
    return()=>{active=false;clearInterval(timer);request.current++;};
  },[authorized,auth.user?.id]);
  async function login(e:FormEvent){e.preventDefault();setError("");setBusy(true);try{const client=getSupabaseBrowserClient();if(!client)throw new Error("Conexão não configurada");const result=await client.auth.signInWithPassword({email:email.trim(),password});if(result.error)throw result.error;setPassword("");}catch(e){setError(e instanceof Error?e.message:"Falha de autenticação");}finally{setBusy(false);}}
  async function send(){if(!authorized||busy)return;setBusy(true);setError("");try{const client=getSupabaseBrowserClient();if(!client)throw new Error("Conexão não configurada");const value={id:crypto.randomUUID(),device:window.matchMedia("(max-width: 700px)").matches?"Tela pequena":"Tela ampla",at:new Date().toISOString()};const {error}=await client.from("app_settings").upsert({key:TEST_KEY,value},{onConflict:"key"});if(error)throw error; }catch(e){setError((e as {message?:string})?.message||"Falha ao registrar teste");}finally{setBusy(false);}}
  return <main style={{minHeight:"100vh",background:"#f1f5f9",color:"#14263b",padding:20}}><div style={{maxWidth:760,margin:"24px auto"}}><header style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}><Route color="#4f46e5" size={36}/><div><h1 style={{margin:0,fontSize:24}}>RotaSmart Online</h1><small>VERSION 9.0 BETA 3 · Operação Conectada</small></div></header>
  {!auth.configured?<section style={panel}><h2>Configuração pendente</h2><p>Configure a URL e a Publishable Key do Supabase na Vercel Beta. Nenhum modo local é aberto neste ambiente.</p></section>:auth.loading?<AuthLoading/>:!auth.user?<form style={panel} onSubmit={login}><h2>Entrar no ambiente Beta</h2><p>Acesso restrito a contas autorizadas.</p><label style={{display:"block",marginBottom:12}}>E-mail<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label><label style={{display:"block",marginBottom:12}}>Senha<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label><button className="btn primary" disabled={busy}>Entrar</button>{error&&<p role="alert">{error}</p>}</form>:!authorized?<section style={panel}><h2>Acesso não autorizado para esta etapa</h2><p>Somente usuários autorizados podem acessar a Beta 3. Confira o perfil no Supabase.</p><button className="btn secondary" onClick={()=>void auth.signOut()}>Sair</button></section>:<><section style={panel}><h2><ShieldCheck size={20}/> Administrador autenticado</h2><p>{auth.profile?.nome} · {auth.profile?.email}</p><button className="btn secondary" onClick={()=>void auth.signOut()}><LogOut size={16}/> Sair</button></section><section style={panel}><h2><Smartphone size={20}/> Teste PC ↔ celular</h2><p>{connection}</p><p>Última consulta bem-sucedida: {checked||"—"}</p>{readError&&<p role="alert">{readError}</p>}<button className="btn primary" onClick={()=>void send()} disabled={busy}><RefreshCw size={16}/> {busy?"Enviando…":"Enviar sinal de teste"}</button>{error&&<p role="alert">{error}</p>}<hr/><h3>Último sinal recebido do banco</h3>{signal?<><p>{signal.device} · {new Date(signal.at).toLocaleString("pt-BR")}</p><small>ID: {signal.id}</small></>:<p>Nenhum sinal recebido ainda.</p>}<p><small>Consulta automática a cada 3 segundos enquanto a tela estiver aberta. Apenas um registro de teste, sem chamados reais.</small></p></section></>}
  <section style={panel}><strong>Ambiente isolado de homologação</strong><p>O painel operacional da V8.13 permanece no endereço original. Nesta Beta, utilize somente dados fictícios. Não transfira dados corporativos.</p></section></div></main>;
}
