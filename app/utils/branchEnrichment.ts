import type {Filial} from '../data/filiais';
import type {AppTicket} from '../data/AppDataContext';

const clean=(value:unknown)=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const digits=(value:unknown)=>String(value??'').replace(/\D/g,'');
const isMissing=(value:unknown)=>/^mv[- ]?\d+$/i.test(String(value??'').trim())||!clean(value)||/^(?:nao informado|nao informada|cidade nao informada|endereco nao informado|filial nao informada|a conferir|sem informacao|sem endereco)$/.test(clean(value));
const sameCode=(a:unknown,b:unknown)=>/^\d{1,3}$/.test(String(a??'').trim())&&Number(a)===Number(b);
function unique(candidates:Filial[]):Filial|undefined {
 const filtered=candidates.filter(b=>/^\d{1,3}$/.test(b.numeroFilial)&&!String(b.numeroFilial).startsWith('MV-'));
 if(!filtered.length)return undefined;
 const numbers=new Set(filtered.map(b=>Number(b.numeroFilial)));
 const cnpjs=new Set(filtered.map(b=>digits(b.cnpj)).filter(Boolean));
 if(numbers.size>1||cnpjs.size>1)return undefined;
 return filtered.find(b=>!isMissing(b.endereco)&&!isMissing(b.cidade))||filtered[0];
}
function byCode(branches:Filial[],num:number){return unique(branches.filter(b=>sameCode(b.numeroFilial,num)))}
function labelled(text:string):number[] {
 const matches=[...text.matchAll(/\b(?:filial|fl|posto|unidade)\s*(?:n(?:umero|ro|[º°.]*)\s*)?[:#\-º°]*\s*0*(\d{1,3})\b/gi)];
 return [...new Set(matches.map(m=>Number(m[1])))];
}
function explicitCode(raw:string,ticketNumber:string):number|null {
 const labelledValues=labelled(raw);
 if(labelledValues.length>1)return null;
 if(labelledValues.length===1)return labelledValues[0];
 const s=raw.trim();
 if(/^0*\d{1,3}$/.test(s))return Number(s);
 // Formato real do Movidesk: "031 - AEROPORTO", "019 - TERMINAL NORTE".
 const named=s.match(/^0*(\d{1,3})\s*[-–—|/]\s*\S.+$/);
 if(named)return Number(named[1]);
 // Formato alternativo: "115583 - 34". O primeiro número é o ticket; o segundo é a filial.
 const prefixed=s.match(/^#?(\d{4,15})\s*[-–—|/]\s*(?:fl\.?\s*)?0*(\d{1,3})\s*$/i);
 if(prefixed&&prefixed[1]===digits(ticketNumber))return Number(prefixed[2]);
 return null;
}
export type BranchRecord={number?:string;cnpj?:string;explicit?:string;subject?:string;description?:string;city?:string;address?:string;branchId?:number;ticketNumber?:string};
export function resolveBranch(source:BranchRecord,branches:Filial[]):Filial|undefined {
 const raw=String(source.explicit??'').trim(), ticketNumber=String(source.ticketNumber??'').trim();
 const cn=digits(source.cnpj);
 if(cn.length===14){const hit=unique(branches.filter(b=>digits(b.cnpj)===cn));if(hit)return hit}
 // Prioriza o campo de filial informado pelo Movidesk; NUNCA usa o número do ticket como código de filial.
 if(raw&&!/^mv[- ]?\d+$/i.test(raw)){
  const number=explicitCode(raw,ticketNumber);
  if(number!==null){const found=byCode(branches,number);if(found)return found}
  const pure=clean(raw);
  const byName=unique(branches.filter(b=>clean(b.nome)===pure));
  if(byName)return byName;
  const removedTicket=raw.replace(new RegExp(`^#?${digits(ticketNumber)||'a^'}\\s*[-–—|/]\\s*`),'').trim();
  const bySuffixName=unique(branches.filter(b=>clean(b.nome)===clean(removedTicket)));
  if(bySuffixName)return bySuffixName;
 }
 // Códigos antes salvos são usados apenas quando não conflitam com um código explícito inequívoco.
 const explicitLabels=labelled(raw);
 if(explicitLabels.length>0)return undefined;
 if(source.branchId){const b=branches.find(b=>b.id===source.branchId);if(b&&(/^\d{1,3}$/.test(b.numeroFilial))&&(isMissing(raw)||clean(raw)===clean(b.nome)))return b}
 if(source.number&&/^\d{1,3}$/.test(source.number.trim())&&(isMissing(raw)||clean(raw)===clean(source.number))){const b=byCode(branches,Number(source.number));if(b)return b}
 // Fallback: código nomeado explicitamente no assunto/descrição. Não inferir por um número avulso.
 const titleCodes=labelled(String(source.subject??''));
 const descCodes=labelled(String(source.description??''));
 const combined=[...new Set([...titleCodes,...descCodes])];
 if(combined.length===1)return byCode(branches,combined[0]);
 if(combined.length>1)return undefined;
 if(source.address&&!isMissing(source.address))return unique(branches.filter(b=>clean(b.endereco)===clean(source.address)&&(!source.city||isMissing(source.city)||clean(b.cidade)===clean(source.city))));
 return undefined;
}
export function enrichTicketAddress(ticket:AppTicket,branches:Filial[]):AppTicket {
 // Seleção manual confirmada no editor tem prioridade sobre o valor bruto da importação.
 const manuallyNamed=branches.find(b=>b.id===ticket.branchId&&/^\d{1,3}$/.test(String(b.numeroFilial))&&clean(b.nome)===clean(ticket.branch));
 const found=manuallyNamed||resolveBranch({branchId:ticket.branchId,number:ticket.branchNumber,cnpj:ticket.branchCnpj,explicit:ticket.sourceFields?.branchRaw||ticket.branch,subject:ticket.sourceFields?.subject||ticket.desc,description:ticket.sourceFields?.description||ticket.desc,city:ticket.city,address:ticket.address,ticketNumber:ticket.number},branches);
 if(!found)return {...ticket,reviewBranch:true};
 // A filial é a fonte de verdade para endereço/cidade; planejamento e notas permanecem intactos.
 return {...ticket,branch:found.nome,branchId:found.id,branchNumber:found.numeroFilial,branchCnpj:found.cnpj||ticket.branchCnpj,city:!isMissing(found.cidade)?`${found.cidade}${found.uf?`, ${found.uf}`:''}`:ticket.city,uf:found.uf||ticket.uf,address:!isMissing(found.endereco)?found.endereco:ticket.address,latitude:found.latitude??ticket.latitude,longitude:found.longitude??ticket.longitude,reviewBranch:isMissing(found.cidade)||isMissing(found.endereco)};
}
export function auditAddressEnrichment(tickets:AppTicket[],branches:Filial[]){let corrected=0,unmatched=0,complete=0;for(const t of tickets){const next=enrichTicketAddress(t,branches);if(next.branchId!==t.branchId||next.branch!==t.branch||next.city!==t.city||next.address!==t.address||next.branchNumber!==t.branchNumber)corrected++;if(next.reviewBranch)unmatched++;if(!isMissing(next.city)&&!isMissing(next.address))complete++;}return{corrected,unmatched,complete,total:tickets.length}}
