"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Cloud, Database, Loader2, RefreshCw } from "lucide-react";
import { useAppData } from "../data/AppDataContext";
import { useAuth } from "./AuthProvider";
import { checkDatabaseStatus, type DatabaseStatus } from "../services/database";
import { migrateBackupToCloud, summarizeBackup, type MigrationReport } from "../services/migration";

export default function CloudMigrationPanel() {
  const { configured, user, profile } = useAuth();
  const { createBackup, cloudStatus } = useAppData();
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [preview, setPreview] = useState<ReturnType<typeof summarizeBackup> | null>(null);
  const [report, setReport] = useState<MigrationReport | null>(null);
  const [progress, setProgress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const refresh = () => checkDatabaseStatus().then(setStatus).catch(reason => setError(reason instanceof Error ? reason.message : String(reason)));
  useEffect(() => { void refresh(); }, [configured, user?.id]);
  const start = () => { if(profile?.role!=="admin"){setError("A migração inicial de cadastros exige um perfil administrador.");return}setPreview(summarizeBackup(createBackup()));setReport(null);setError("") };
  const migrate = async () => {
    if (!window.confirm("Migrar os dados locais para o Supabase? O backup deste navegador será mantido.")) return;
    setBusy(true);setError("");setProgress("Preparando migração…");
    try { const result=await migrateBackupToCloud(createBackup(),setProgress);setReport(result);setPreview(null);window.dispatchEvent(new Event("rotasmart-cloud-migrated"));await refresh() }
    catch(reason){setError(reason instanceof Error?reason.message:"Não foi possível migrar os dados.")}
    finally{setBusy(false);setProgress("")}
  };
  const totals=report?Object.values(report).filter((item):item is MigrationReport["tickets"]=>typeof item==="object"&&item!==null&&"created" in item).reduce((sum,item)=>({created:sum.created+item.created,updated:sum.updated+item.updated,ignored:sum.ignored+item.ignored,errors:sum.errors+item.errors.length}),{created:0,updated:0,ignored:0,errors:0}):null;
  return <div className="panel settings-card cloud-card"><div className="cloud-title"><div><Database/></div><span><h3>Banco de dados Supabase</h3><p>{cloudStatus}</p></span><button className="icon-button" onClick={refresh} aria-label="Atualizar status"><RefreshCw/></button></div>{!configured?<div className="cloud-local"><Cloud/><div><b>Modo local ativo</b><span>Adicione as variáveis do Supabase para habilitar login e sincronização.</span></div></div>:<div className={`cloud-health ${status?.reachable?"ok":"warning"}`}>{status?.reachable?<Check/>:<AlertTriangle/>}<span>{status?.message||"Verificando conexão…"}</span></div>}{configured&&user&&<><div className="cloud-account"><span>Usuário</span><b>{profile?.nome||user.email}</b><small>{profile?.role||"visualizador"}</small></div><button className="btn primary" onClick={start} disabled={busy||profile?.role!=="admin"}><Cloud/>Migrar dados locais para o banco</button>{profile?.role!=="admin"&&<p className="warning-text">Apenas administradores podem executar migrações globais.</p>}</>}{preview&&<div className="migration-preview"><b>Resumo da migração</b><div><span>Chamados<strong>{preview.tickets}</strong></span><span>Analistas<strong>{preview.analysts}</strong></span><span>Técnicos<strong>{preview.technicians}</strong></span><span>Filiais<strong>{preview.branches}</strong></span><span>Rotas<strong>{preview.routes}</strong></span></div><p>Duplicidades serão atualizadas pelas chaves naturais. Nenhum dado local será apagado.</p><div className="settings-actions"><button className="btn secondary" onClick={()=>setPreview(null)}>Cancelar</button><button className="btn primary" onClick={migrate}>Confirmar migração</button></div></div>}{busy&&<div className="migration-progress"><Loader2 className="spin"/><span>{progress}</span></div>}{report&&totals&&<div className="migration-report"><b>Dados migrados. O backup local foi mantido.</b><span>{totals.created} criados · {totals.updated} atualizados · {totals.ignored} ignorados · {totals.errors} erros</span></div>}{error&&<p className="warning-text"><AlertTriangle/>{error}</p>}</div>;
}
