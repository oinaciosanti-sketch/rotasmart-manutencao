import type {AppTicket,TicketStatus} from "../data/AppDataContext";
import {fieldKey} from "./movideskFiles";
export function officialStatus(value:string):TicketStatus|undefined {
 const x=fieldKey(value);
 if(x.includes('reabert'))return 'Novo';
 if(x.includes('cancel'))return 'Cancelado';
 if(['resolvido','resolvida','fechado','fechada','concluido','concluida','finalizado','finalizada'].includes(x))return 'Concluído';
 if(x.includes('compra'))return 'Aguardando compra';
 if(x.includes('entrega'))return 'Aguardando entrega';
 if(x.includes('atendimento'))return 'Em atendimento';
 if(x.includes('programad')||x.includes('planejad'))return 'Programado';
 if(x==='novo'||x==='nova'||x==='aberto'||x==='aberta')return 'Novo';
 return undefined;
}
function timestamp(v?:string){if(!v)return NaN;const m=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);return Date.parse(m?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}T${(m[4]||'0').padStart(2,'0')}:${m[5]||'00'}:${m[6]||'00'}`:v)}
export function sourceIsOlder(old?:Record<string,string>,incoming?:Record<string,string>){const a=timestamp(old?.datadaultimaacao||old?.lastAction),b=timestamp(incoming?.datadaultimaacao||incoming?.lastAction);return Number.isFinite(a)&&Number.isFinite(b)&&b<a;}
export function statusChange(old:AppTicket,incoming:AppTicket){return old.status!==incoming.status||fieldKey(old.sourceStatus||old.status)!==fieldKey(incoming.sourceStatus||incoming.status);}
export function plannerState(status:TicketStatus,date:string|undefined,today:string){return status==='Concluído'||status==='Fechado'?'complete':status==='Cancelado'?'cancelled':date&&date<today?'overdue':'planned';}
