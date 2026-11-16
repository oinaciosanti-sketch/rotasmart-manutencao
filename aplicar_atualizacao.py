from pathlib import Path
import shutil,sys

base=Path(__file__).resolve().parent
repo=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else base
path=repo/'app'/'components'/'TechnicalReport.tsx'
if not path.exists():
    print('ERRO: TechnicalReport.tsx nao encontrado. Extraia este pacote na raiz do projeto RotaSmart, ao lado da pasta app, e execute novamente.');sys.exit(1)
s=path.read_text(encoding='utf-8')
if 'rs-technical-report' in s:
    print('Esta atualizacao ja foi aplicada; nenhum arquivo foi alterado.');sys.exit(0)
replacements=[
('background:"#fff",color:"#183453"', 'background:"#eff6ff",color:"#183453",boxShadow:"0 3px 16px rgba(30,64,175,.08)"'),
('border:"1px solid #d9e3f0",borderRadius:12', 'border:"1px solid #bbd2f2",borderRadius:12'),
('return <section style={{margin:"14px 0",width:"100%"}}>', 'return <section className="rs-technical-report" style={{margin:"14px 0",width:"100%"}}>'),
('<div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>\n   <button type="button" onClick={()=>setOpen', '<div className="rs-technical-toolbar" style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>\n   <button type="button" onClick={()=>setOpen'),
]
for old,new in replacements:
    n=s.count(old)
    if n!=1:
        print(f'ERRO: estrutura inesperada no componente; esperado 1 trecho, encontrado {n}. Nao alterei o projeto.');sys.exit(2)
    s=s.replace(old,new,1)
# CSS restrito ao modal do chamado. Em telas estreitas o botao retorna ao fluxo normal.
marker='  <div className="rs-technical-toolbar"'
css='''  <style>{`\n    .ticket-modal { position: relative; }\n    .ticket-modal .tech-modal-head { padding-right: 228px; }\n    .ticket-modal .rs-technical-toolbar > button:first-child { position: absolute; top: 17px; right: 60px; z-index: 5; background: #245ea8 !important; box-shadow: 0 2px 9px rgba(15,57,120,.18); }\n    .ticket-modal .rs-technical-report { margin: 8px 0 16px !important; }\n    .ticket-modal .rs-technical-report > div:nth-of-type(2) { background: #eff6ff; }\n    @media (max-width: 760px) {\n      .ticket-modal .tech-modal-head { padding-right: 35px; }\n      .ticket-modal .rs-technical-toolbar > button:first-child { position: static; }\n    }\n  `}</style>\n'''
if s.count(marker)!=1:
    print('ERRO: a barra de ferramentas nao foi localizada.');sys.exit(3)
s=s.replace(marker,css+marker,1)
backup=path.with_suffix('.tsx.bak-before-v83')
shutil.copy2(path,backup)
path.write_text(s,encoding='utf-8')
print('SUCESSO: atualizacao aplicada em',path)
print('Backup anterior:',backup)
print('No GitHub, envie SOMENTE app/components/TechnicalReport.tsx no caminho correto.')
