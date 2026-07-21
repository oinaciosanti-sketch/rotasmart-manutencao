"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AlertTriangle, Check, KeyRound, Loader2, LogIn, Route, UserPlus } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase/client";

export type UserProfile = {
  id: string;
  user_id?: string | null;
  nome: string;
  email: string;
  role: "admin" | "analista" | "tecnico" | "visualizador";
  analyst_id?: string | null;
  analystName?: string | null;
  technician_id?: string | null;
  technicianName?: string | null;
  ativo: boolean;
  status?: "ativo" | "pendente" | "inativo" | "bloqueado";
};

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  profile: UserProfile | null;
  dataMode: "local" | "cloud";
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(configured);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loadProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    // Avoid nested PostgREST relationships here: a stale schema cache must never turn
    // a real admin into the visual "pending" fallback.
    const claimed: any = await client.rpc("claim_my_pending_profile");
    let result: any = await client.from("profiles").select("*").eq("user_id", currentUser.id).maybeSingle();
    if(result.error?.code==="42703")result=await client.from("profiles").select("*").eq("id",currentUser.id).maybeSingle();
    if(!result.data&&claimed.data)result={data:claimed.data,error:null};
    if(!result.data)result=await client.from("profiles").select("*").eq("id",currentUser.id).maybeSingle();
    const data=result.data as any;
    let analystName:string|null=null,technicianName:string|null=null;
    if(data?.analyst_id){const analyst=await client.from("analysts").select("name").eq("id",data.analyst_id).maybeSingle();analystName=analyst.data?.name||null}
    if(data?.technician_id){const technician=await client.from("technicians").select("name").eq("id",data.technician_id).maybeSingle();technicianName=technician.data?.name||null}
    setProfile(
      data ? {...data,analystName,technicianName} : {
        id: currentUser.id,
        nome: String(currentUser.user_metadata?.nome || currentUser.email?.split("@")[0] || "Usuário"),
        email: currentUser.email || "",
        role: "visualizador",
        analyst_id: null,
        ativo: false,status:"pendente",
      } as UserProfile,
    );
  };

  useEffect(() => {
    setHydrated(true);
    if (!configured) {
      setLoading(false);
      return;
    }
    const client = getSupabaseBrowserClient()!;
    client.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      await loadProfile(data.user);
      setLoading(false);
    });
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      void loadProfile(session?.user || null);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, [configured]);

  const signOut = async () => {
    const client = getSupabaseBrowserClient();
    if (client) await client.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        configured,
        loading,
        user,
        profile,
        dataMode: configured && user ? "cloud" : "local",
        signOut,
        refreshProfile: () => loadProfile(user),
      }}
    >
      {hydrated ? children : <AuthLoading/>}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return value;
}

export function AuthLoading() {
  return <div className="auth-loading"><Loader2 className="spin"/><span>Verificando sessão segura…</span></div>;
}

export function AccessStatusScreen(){const {profile,signOut}=useAuth();const status=profile?.status||"pendente";const message=status==="pendente"?"Seu acesso está aguardando aprovação de um administrador.":status==="bloqueado"?"Acesso bloqueado. Fale com um administrador.":"Seu usuário está inativo. Fale com um administrador.";return <main className="auth-page"><section className="auth-brand"><div className="auth-logo"><Route/></div><span>ROTASMART 2.2</span><h1>Acesso temporariamente indisponível.</h1><p>{message}</p></section><section className="auth-panel"><div className="auth-card"><div className="auth-message error"><AlertTriangle/>{message}</div><button className="btn primary auth-submit" onClick={()=>void signOut()}>Voltar ao login</button></div></section></main>}

export function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const client = getSupabaseBrowserClient();
    if (!client) return;
    try {
      if (mode === "login") {
        const { error: authError } = await client.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else if (mode === "signup") {
        const { error: authError } = await client.auth.signUp({ email, password, options: { data: { nome: name } } });
        if (authError) throw authError;
        setMessage("Cadastro recebido. Verifique seu e-mail caso a confirmação esteja habilitada.");
      } else {
        const { error: authError } = await client.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (authError) throw authError;
        setMessage("Enviamos as instruções de recuperação para o seu e-mail.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível concluir a autenticação.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="auth-page"><section className="auth-brand"><div className="auth-logo"><Route/></div><span>ROTASMART 2.0</span><h1>Manutenção organizada.<br/>Rotas mais inteligentes.</h1><p>Acesse o ambiente seguro para planejar chamados, equipes e rotas.</p></section><section className="auth-panel"><form className="auth-card" onSubmit={submit}><div className="auth-card-icon">{mode==="signup"?<UserPlus/>:mode==="reset"?<KeyRound/>:<LogIn/>}</div><h2>{mode==="login"?"Entrar no RotaSmart":mode==="signup"?"Criar conta":"Recuperar senha"}</h2><p>{mode==="reset"?"Informe o e-mail cadastrado.":"Use seu e-mail corporativo para continuar."}</p>{mode==="signup"&&<label><span>Nome</span><input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>}<label><span>E-mail</span><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>{mode!=="reset"&&<label><span>Senha</span><input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==="login"?"current-password":"new-password"}/></label>}{error&&<div className="auth-message error"><AlertTriangle/>{error}</div>}{message&&<div className="auth-message success"><Check/>{message}</div>}<button className="btn primary auth-submit" disabled={busy}>{busy?<Loader2 className="spin"/>:null}{mode==="login"?"Entrar":mode==="signup"?"Cadastrar":"Enviar recuperação"}</button><div className="auth-links">{mode!=="login"&&<button type="button" onClick={()=>setMode("login")}>Voltar ao login</button>}{mode==="login"&&<><button type="button" onClick={()=>setMode("reset")}>Esqueci minha senha</button><button type="button" onClick={()=>setMode("signup")}>Criar conta</button></>}</div></form></section></main>;
}
