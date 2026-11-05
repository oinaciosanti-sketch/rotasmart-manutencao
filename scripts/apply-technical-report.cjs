/* RotaSmart Technical Report MVP: applies source integration before Next.js build. */
const fs = require('node:fs');
const path = require('node:path');
function patch(relative, transform){
 const file=path.resolve(__dirname,'..',relative);if(!fs.existsSync(file))throw new Error('Arquivo não encontrado: '+relative);
 const source=fs.readFileSync(file,'utf8');const updated=transform(source);
 if(!updated.includes('TechnicalReport'))throw new Error('A integração não foi aplicada em '+relative);
 if(source!==updated){fs.writeFileSync(file,updated);console.log('Atualizado '+relative)}else console.log('Já integrado: '+relative);
}
function replaceOnce(source,oldText,newText,label){if(source.includes(newText))return source;if(!source.includes(oldText))throw new Error('Não foi possível localizar '+label+' para integração. Projeto diferente do esperado.');return source.replace(oldText,newText)}
patch('app/page.tsx',source=>{
 let s=source;
 s=replaceOnce(s,'import TechnicianPortal from "./components/TechnicianPortal";','import TechnicianPortal from "./components/TechnicianPortal";\nimport TechnicalReport from "./components/TechnicalReport";','importação do módulo');
 s=replaceOnce(s,'<label className="field"><span>Número *</span><input value={ticket.number} onChange={e=>set("number",e.target.value)}/></label>','<label className="field"><span>Número *</span><input value={ticket.number} readOnly={!!ticket.id} title={ticket.id?"Número permanente do chamado":"Informe um número único"} onChange={e=>set("number",e.target.value)}/></label>','proteção do número do chamado');
 const marker='function TicketModal(';const at=s.indexOf(marker);if(at<0)throw new Error('TicketModal não encontrado');
 const pre=s.slice(0,at);let modal=s.slice(at);
 modal=replaceOnce(modal,'</p></div><button onClick={onCancel}><X/></button></div><div className="tech-form">','</p></div><button onClick={onCancel}><X/></button></div><TechnicalReport ticket={ticket} mode="viewer"/><div className="tech-form">','botão no topo do chamado');
 s=pre+modal;
 return s;
});
patch('app/components/TechnicianPortal.tsx',source=>{
 let s=source;
 s=replaceOnce(s,'import {useAuth} from "./AuthProvider";','import {useAuth} from "./AuthProvider";\nimport TechnicalReport from "./TechnicalReport";','importação no portal');
 s=replaceOnce(s,'</div><p>{editing.desc}</p><div className="tech-timeline">','</div><p>{editing.desc}</p><TechnicalReport ticket={editing} mode="technician"/><div className="tech-timeline">','formulário dentro do atendimento do técnico');
 return s;
});
