"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";

export default function AlterarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    const client = getSupabaseBrowserClient();
    if (!client) {
      setError("Supabase não configurado.");
      setLoading(false);
      return;
    }
    void client.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setLogged(Boolean(data.user) && !error);
      setEmail(data.user?.email ?? "");
      setLoading(false);
    }).catch(() => {
      if (active) { setError("Não foi possível verificar sua sessão."); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 12) { setError("Use uma senha com pelo menos 12 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    const client = getSupabaseBrowserClient();
    if (!client || !logged) { setError("Sessão não encontrada. Não saia da sua conta atual."); return; }
    setSaving(true);
    try {
      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword(""); setConfirm(""); setSaved(true);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Tente novamente.";
      setError(`Não foi possível mudar a senha: ${detail}. O Supabase pode exigir uma verificação adicional de segurança.`);
    } finally { setSaving(false); }
  }

  const inputStyle = { width:"100%", boxSizing:"border-box" as const, padding:13, border:"1px solid #cbd5e1", borderRadius:9, fontSize:16, background:"white" };
  return <main style={{minHeight:"100vh",background:"#f1f5f9",display:"flex",justifyContent:"center",alignItems:"center",padding:20,fontFamily:"system-ui, sans-serif"}}>
    <section style={{background:"#fff",borderRadius:18,boxShadow:"0 10px 35px #0f172a15",padding:30,maxWidth:440,width:"100%",color:"#132743"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#4f46e5",letterSpacing:1,marginBottom:14}}>ROTASMART · MINHA CONTA</div>
      <h1 style={{fontSize:26,margin:"0 0 10px"}}>Alterar minha senha</h1>
      <p style={{color:"#64748b",lineHeight:1.5,fontSize:14}}>Defina uma nova senha usando sua sessão atual. Você não precisa informar a senha antiga.</p>
      {loading ? <p>Verificando sessão...</p> : !logged ? <div role="alert" style={{background:"#ffedd5",padding:14,borderRadius:9}}>Você não está conectado. Volte ao RotaSmart e entre na sua conta antes de usar esta página.</div> : saved ? <div role="status" style={{background:"#dcfce7",padding:16,borderRadius:10,color:"#166534"}}><strong>Senha atualizada com sucesso!</strong><p>Guarde a nova senha no gerenciador de senhas do navegador.</p></div> : <form onSubmit={onSubmit}>
        <p style={{background:"#f8fafc",padding:12,borderRadius:9,fontSize:13,overflowWrap:"anywhere"}}>Conta conectada: <strong>{email}</strong></p>
        <label htmlFor="newPassword" style={{fontWeight:700,fontSize:13,display:"block",marginBottom:7}}>Nova senha</label>
        <input id="newPassword" style={inputStyle} type={visible?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} minLength={12} autoComplete="new-password" placeholder="Pelo menos 12 caracteres" required />
        <label htmlFor="confirmPassword" style={{fontWeight:700,fontSize:13,display:"block",margin:"16px 0 7px"}}>Confirmar nova senha</label>
        <input id="confirmPassword" style={inputStyle} type={visible?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={12} autoComplete="new-password" placeholder="Digite novamente" required />
        <label style={{display:"flex",alignItems:"center",gap:8,margin:"15px 0",fontSize:13}}><input type="checkbox" checked={visible} onChange={e=>setVisible(e.target.checked)}/> Mostrar senhas</label>
        {error && <p role="alert" style={{background:"#fee2e2",color:"#991b1b",padding:12,borderRadius:9,fontSize:13}}>{error}</p>}
        <button disabled={saving} type="submit" style={{width:"100%",border:0,borderRadius:9,padding:14,background:"#4f46e5",color:"white",fontWeight:700,fontSize:15,cursor:"pointer"}}>{saving?"Salvando...":"Salvar nova senha"}</button>
      </form>}
      {!logged && error && <p role="alert" style={{color:"#b91c1c"}}>{error}</p>}
      <p style={{marginTop:24,textAlign:"center"}}><Link href="/" style={{color:"#4f46e5",textDecoration:"none"}}>← Voltar ao RotaSmart</Link></p>
    </section>
  </main>;
}
