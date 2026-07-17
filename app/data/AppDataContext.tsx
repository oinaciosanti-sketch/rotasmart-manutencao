"use client";

import {createContext,useContext,useEffect,useState} from "react";
import type {Filial} from "./filiais";

export type AppTicket={id:number;number:string;branch:string;branchId?:number;branchNumber?:string;city:string;address:string;latitude?:number|null;longitude?:number|null;desc:string;status:"Novo"|"Programado"|"Aguardando compra"|"Aguardando entrega"|"Em atendimento"|"Concluído"|"Fechado";urgency:"Alta"|"Média"|"Baixa";tech?:string;date?:string;duration:number;analyst?:string;openedAt?:string;dueAt?:string;notes?:string;routeOrder?:number;routeId?:string;planningStatus?:"nao_planejado"|"em_rota_rascunho"|"rota_confirmada";reviewBranch?:boolean};
export type AppTechnician={id:number;name:string;initials:string;color:string;city:string;address:string;startTime:string;endTime:string;active:boolean;notes:string;latitude?:number|null;longitude?:number|null};
type AppData={tickets:AppTicket[];technicians:AppTechnician[];branches:Filial[];setTickets:React.Dispatch<React.SetStateAction<AppTicket[]>>;setTechnicians:React.Dispatch<React.SetStateAction<AppTechnician[]>>;setBranches:React.Dispatch<React.SetStateAction<Filial[]>>;createTicket:(ticket:Omit<AppTicket,"id">)=>AppTicket;clearLocalData:()=>void};
const Context=createContext<AppData|null>(null);
const KEY="rotasmart-app-data-v1";

function arrayOr<T>(value:unknown,fallback:T[],guard:(item:unknown)=>boolean):T[]{return Array.isArray(value)&&value.every(guard)?value as T[]:fallback;}
const ticketGuard=(item:unknown)=>!!item&&typeof item==="object"&&typeof (item as AppTicket).id==="number"&&typeof (item as AppTicket).number==="string";
const technicianGuard=(item:unknown)=>!!item&&typeof item==="object"&&typeof (item as AppTechnician).id==="number"&&typeof (item as AppTechnician).name==="string";
const branchGuard=(item:unknown)=>!!item&&typeof item==="object"&&typeof (item as Filial).numeroFilial==="string"&&typeof (item as Filial).cidade==="string";

export function AppDataProvider({initialTickets,initialTechnicians,initialBranches,children}:{initialTickets:AppTicket[];initialTechnicians:AppTechnician[];initialBranches:Filial[];children:React.ReactNode}){
 const [tickets,setTickets]=useState(initialTickets);const [technicians,setTechnicians]=useState(initialTechnicians);const [branches,setBranches]=useState(initialBranches);const [loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const saved=JSON.parse(raw);if(!saved||typeof saved!=="object")throw new Error("Dados locais inválidos");setTickets(arrayOr(saved.tickets,initialTickets,ticketGuard));setTechnicians(arrayOr(saved.technicians,initialTechnicians,technicianGuard));setBranches(arrayOr(saved.branches,initialBranches,branchGuard));}else{const oldTickets=localStorage.getItem("rotasmart-tickets");if(oldTickets)setTickets(arrayOr(JSON.parse(oldTickets),initialTickets,ticketGuard));}}catch{localStorage.removeItem(KEY);}finally{setLoaded(true)}},[]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem(KEY,JSON.stringify({version:1,tickets,technicians,branches}))}catch{}},[loaded,tickets,technicians,branches]);
 const createTicket=(input:Omit<AppTicket,"id">)=>{const created:AppTicket={...input,id:Math.max(Date.now(),...tickets.map(ticket=>ticket.id+1))};setTickets(current=>current.some(ticket=>ticket.id===created.id)?[...current,{...created,id:created.id+1}]:[...current,created]);return created;};
 const clearLocalData=()=>{if(!window.confirm("Limpar todos os dados locais do RotaSmart?"))return;Object.keys(localStorage).filter(key=>key.startsWith("rotasmart-")).forEach(key=>localStorage.removeItem(key));window.location.reload();};
 return <Context.Provider value={{tickets,technicians,branches,setTickets,setTechnicians,setBranches,createTicket,clearLocalData}}>{children}</Context.Provider>;
}
export function useAppData(){const value=useContext(Context);if(!value)throw new Error("useAppData deve ser usado dentro de AppDataProvider");return value;}
