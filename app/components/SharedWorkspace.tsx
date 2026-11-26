"use client";
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {useAuth} from "./AuthProvider";
import {getSupabaseBrowserClient} from "../lib/supabase/client";
import {useAppData,validateBackup,type BackupPayload} from "../data/AppDataContext";
const KEY="rotasmart_v9_beta2_workspace";
type Snapshot={revision:string;backup:BackupPayload};
const msg=(e:unknown)=>String((e as {message?:string})?.message||e);
const digest=(b:BackupPayload)=>JSON.stringify([b.tickets,b.technicians,b.branches,b.routeStartPoints,b.analysts]);
function parse(v:unknown):Snapshot{const x=v as Snapshot;if(!x||typeof x.revision!=="string"||!validateBackup(x.backup))throw Error("Carteira online incompatível. Não será sobrescrita.");return x;}
type Workspace={snapshot:Snapshot|null;remoteRevision:string|null;error:string;busy:boolean;save:(b:BackupPayload)=>Promise<void>;reload:()=>Promise<void>;};
const C=createContext<Workspace|null>(null);
export function SharedWorkspace({render}:{render:(backup:BackupPayload|undefined,revision:string)=>ReactNode}){
 const auth=useAuth(); const [snapshot,setSnapshot]=useState<Snapshot|null>(null);const [remoteRevision,setRemote]=useState<string|null>(null);const [loaded,setLoaded]=useState(false);const [error,setError]=useState("");const [busy,setBusy]=useState(false);const lock=useRef(false);const [mount,setMount]=useState(0);
 const client=getSupabaseBrowserClient()!;
 async function read(){const {data,error}=await client.from("app_settings").select("value").eq("key",KEY).maybeSingle();if(error)throw error;return data?parse(data.value):null;}
 async function reload(){if(lock.current)return;lock.current=true;setBusy(true);try{const next=await read();setSnapshot(next);setRemote(next?.revision??null);setMount(n=>n+1);setLoaded(true);setError("");}catch(e){setError(msg(e));}finally{lock.current=false;setBusy(false);}}
 useEffect(()=>{void reload();let alive=true;const timer=setInterval(async()=>{if(lock.current)return;lock.current=true;try{const next=await read();if(alive){setRemote(next?.revision??null);setError("");}}catch(e){if(alive)setError(msg(e));}finally{lock.current=false;}},5000);return()=>{alive=false;clearInterval(timer);};},[]);
 async function save(backup:BackupPayload){if(lock.current)throw Error("Consulta em andamento. Tente novamente.");if(!validateBackup(backup))throw Error("Backup inválido.");lock.current=true;setBusy(true);try{const next={revision:crypto.randomUUID(),backup};let result;if(snapshot){result=await client.from("app_settings").update({value:next}).eq("key",KEY).eq("value->>revision",snapshot.revision).select("value").maybeSingle();}else{result=await client.from("app_settings").insert({key:KEY,value:next}).select("value").single();}if(result.error)throw result.error;if(!result.data)throw Error("Conflito: outra sessão publicou primeiro. Exporte seu rascunho antes de receber a versão online.");const saved=parse(result.data.value);setSnapshot(saved);setRemote(saved.revision);setError("");}catch(e){setError(msg(e));throw e;}finally{lock.current=false;setBusy(false);}}
 if(!loaded)return <main style={{padding:24}}><h2>RotaSmart V9.0 Beta 2</h2><p>{error||"Carregando carteira compartilhada…"}</p><button className="btn secondary" disabled={busy} onClick={()=>void reload()}>Tentar novamente</button> <button className="btn secondary" onClick={()=>void auth.signOut()}>Sair</button></main>;
 return <C.Provider value={{snapshot,remoteRevision,error,busy,save,reload}}>{render(snapshot?.backup,`workspace-${mount}`)}</C.Provider>;
}
export function SharedWorkspaceBar(){
 const c=useContext(C)!;const {createBackup}=useAppData();const backup=createBackup();const current=digest(backup);const baseline=useRef(current);const dirty=current!==baseline.current;const changed=c.remoteRevision!==(c.snapshot?.revision??null);const [note,setNote]=useState("");const [working,setWorking]=useState(false);
 useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue="";}};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn)},[dirty]);
 async function publish(){if(changed||working)return;if(!window.confirm("Publicar esta carteira de teste para os outros dispositivos? Não envie dados corporativos sem autorização."))return;setWorking(true);setNote("");try{await c.save(backup);baseline.current=current;setNote("Carteira publicada.");}catch(e){setNote(msg(e));}finally{setWorking(false);}}
 function exportDraft(){const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="rotasmart-beta2-rascunho.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <div style={{position:"sticky",top:0,zIndex:1500,background:"#eef2ff",borderBottom:"1px solid #c7d2fe",padding:"8px 14px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",color:"#172554",fontSize:12}}><strong>V9.0 Beta 2 · {changed?"Nova revisão online disponível":dirty?"Alterações não publicadas":c.snapshot?"Carteira publicada":"Carteira de teste vazia"}</strong><button className="btn primary" disabled={c.busy||working||changed} onClick={()=>void publish()}>Publicar alterações</button><button className="btn secondary" disabled={c.busy||working} onClick={()=>{if(!dirty||window.confirm("Descartar alterações locais não publicadas? Exporte o rascunho antes se precisar."))void c.reload();}}>Receber versão online</button><button className="btn secondary" onClick={exportDraft}>Exportar rascunho</button><span>{note||c.error||"Somente administrador · estoque local · use dados fictícios"}</span></div>;
}
