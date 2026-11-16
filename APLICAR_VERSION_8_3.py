from pathlib import Path
import sys,re,shutil
root=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path.cwd()
page=root/'app/page.tsx'
tech=root/'app/components/TechnicalReport.tsx'
if not page.is_file() or not tech.is_file():
    sys.exit('ERRO: Execute este script a partir da pasta raiz do RotaSmart (que contem app/page.tsx), ou passe o caminho da pasta. NADA foi alterado.')
p=page.read_text(encoding='utf8');t=tech.read_text(encoding='utf8')
# Replace version in brand: the only place user requested.
version_pat=r'(<div className="brand"><div className="brandmark"><Route size=\{22\}/></div><div><b>RotaSmart</b><span>)([^<]*)(</span></div></div>)'
if len(re.findall(version_pat,p))!=1: sys.exit('ERRO: marcador da marca nao corresponde a versao esperada. Nada foi alterado.')
p2=re.sub(version_pat,lambda m:m.group(1)+'VERSION 8.3'+m.group(3),p,count=1)
# Allow previously applied V8.3 (this is idempotent), otherwise patch the exact original section.
if 'rs-technical-report-v83' in t:
    t2=t
else:
    search=['background:"#fff",color:"#183453"','border:"1px solid #d9e3f0",borderRadius:12','return <section style={{margin:"14px 0",width:"100%"}}>','<div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>\n   <button type="button" onClick={()=>setOpen']
    for snippet in search:
        if t.count(snippet)!=1: sys.exit('ERRO: arquivo TechnicalReport.tsx diferente do esperado: '+snippet[:48]+'; nenhum arquivo alterado.')
    t2=t.replace(search[0],'background:"#eaf3ff",color:"#183453",boxShadow:"0 4px 18px rgba(33,93,169,.10)"',1)
    t2=t2.replace(search[1],'border:"1px solid #b7d1f4",borderRadius:12',1)
    t2=t2.replace(search[2],'return <section className="rs-technical-report-v83" style={{margin:"14px 0",width:"100%"}}>',1)
    t2=t2.replace(search[3],'<div className="rs-technical-toolbar-v83" style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>\n   <button type="button" onClick={()=>setOpen',1)
    marker='  <div className="rs-technical-toolbar-v83"'
    css='''  <style>{`\n    .ticket-modal { position: relative; }\n    .ticket-modal .tech-modal-head { padding-right: 220px; }\n    .ticket-modal .rs-technical-toolbar-v83 > button:first-child { position: absolute; top: 16px; right: 62px; z-index: 5; background: #265fad !important; box-shadow: 0 2px 9px rgba(26,63,120,.18); }\n    .ticket-modal .rs-technical-report-v83 > div:nth-of-type(2) { background: #eaf3ff; border-color: #b7d1f4; }\n    @media (max-width: 760px) {\n      .ticket-modal .tech-modal-head { padding-right: 40px; }\n      .ticket-modal .rs-technical-toolbar-v83 > button:first-child { position: static; }\n    }\n  `}</style>\n'''
    if t2.count(marker)!=1: sys.exit('ERRO: barra de acoes nao encontrada. Nada alterado.')
    t2=t2.replace(marker,css+marker,1)
# Backups outside TS compilation scope
for f,content in [(page,p),(tech,t)]:
    shutil.copy2(f,f.with_name(f.name+'.backup-before-version-8.3.txt'))
page.write_text(p2,encoding='utf8');tech.write_text(t2,encoding='utf8')
print('SUCESSO! VERSION 8.3 adicionada sob RotaSmart; atendimento tecnico movido ao topo; painel aberto azul-claro.')
print('ATUALIZE OS DOIS ARQUIVOS NO GITHUB, NOS CAMINHOS EXATOS:')
print('  app/page.tsx')
print('  app/components/TechnicalReport.tsx')
print('NAO ENVIE backups nem o script ao GitHub. Verifique VERSION 8.3 em app/page.tsx ANTES do commit.')
