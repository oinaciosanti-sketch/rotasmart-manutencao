"use client";

import {createContext,useContext,useEffect,useState} from "react";
import type {Filial} from "./filiais";

export type TicketStatus="Novo"|"Programado"|"Aguardando compra"|"Aguardando entrega"|"Em atendimento"|"Concluído"|"Fechado"|"Cancelado";
export type PlanningStatus="nao_planejado"|"em_rota_rascunho"|"rota_confirmada";
export type AppTicket={id:number;number:string;branch:string;branchId?:number;branchNumber?:string;city:string;uf?:string;address:string;latitude?:number|null;longitude?:number|null;desc:string;status:TicketStatus;urgency:"Alta"|"Média"|"Baixa";tech?:string;date?:string;duration:number;analyst?:string;openedAt?:string;dueAt?:string;notes?:string;routeOrder?:number;routeId?:string;planningStatus?:PlanningStatus;reviewBranch?:boolean};
export type AppTechnician={id:number;name:string;initials:string;color:string;city:string;address:string;startTime:string;endTime:string;active:boolean;notes:string;latitude?:number|null;longitude?:number|null};
export type RouteStartPoint={type:"tecnico"|"filial"|"manual"|"cidade_atual";description:string;address:string;city:string;uf:string;latitude:number|null;longitude:number|null;notes:string;branchId?:number};

type RouteUpdate={technician:string;date:string;ticketIds:number[];planningStatus:PlanningStatus};
type PlannerAssignment={ticketId:number;technician:string;date:string;planningStatus:Exclude<PlanningStatus,"nao_planejado">;duration?:number;routeOrder?:number;notes?:string};
type AppData={tickets:AppTicket[];technicians:AppTechnician[];branches:Filial[];routeStartPoints:Record<string,RouteStartPoint>;setTickets:React.Dispatch<React.SetStateAction<AppTicket[]>>;setTechnicians:React.Dispatch<React.SetStateAction<AppTechnician[]>>;setBranches:React.Dispatch<React.SetStateAction<Filial[]>>;createTicket:(ticket:Omit<AppTicket,"id">)=>AppTicket;updateTicket:(ticket:AppTicket)=>void;cancelTicket:(id:number)=>void;deleteTicket:(id:number)=>void;updateTicketStatus:(id:number,status:TicketStatus)=>void;assignTicketToPlanner:(assignment:PlannerAssignment)=>void;removeTicketFromRoute:(id:number)=>void;updateRoute:(route:RouteUpdate)=>void;confirmRoute:(technician:string,date:string,ticketIds:number[])=>void;updateRouteStartPoint:(routeId:string,start:RouteStartPoint)=>void;updateBranch:(branch:Filial,isNew?:boolean)=>void;updateTechnician:(technician:AppTechnician,isNew?:boolean)=>void;clearLocalData:()=>void};
const Context=createContext<AppData|null>(null);
const KEY="rotasmart-app-data-v1";
const routeKey=(technician:string,date:string)=>`${technician}-${date}`;
const finalStatus=(status:TicketStatus)=>["Concluído","Fechado","Cancelado"].includes(status);

function arrayOr<T>(value:unknown,fallback:T[],guard:(item:unknown)=>boolean):T[]{return Array.isArray(value)&&value.every(guard)?value as T[]:fallback}
const ticketGuard=(item:unknown)=>!!item&&typeof item==="object"&&typeof (item as AppTicket).id==="number"&&typeof (item as AppTicket).number==="string";
const technicianGuard=(item:unknown)=>!!item&&typeof item==="object"&&typeof (item as AppTechnician).id==="number"&&typeof (item as AppTechnician).name==="string";
const branchGuard=(item:unknown)=>!!item&&typeof item==="object"&&typeof (item as Filial).numeroFilial==="string"&&typeof (item as Filial).cidade==="string";

function mergeBranches(initial:Filial[],value:unknown):Filial[]{
 const saved=arrayOr<Filial>(value,[],branchGuard);const used=new Set<number>();
 const merged=initial.map(base=>{const index=saved.findIndex((local,i)=>{if(used.has(i))return false;if(base.cnpj&&local.cnpj)return base.cnpj===local.cnpj;return base.numeroFilial===local.numeroFilial});if(index<0)return base;used.add(index);return {...base,...saved[index]}});
 return [...merged,...saved.filter((_,index)=>!used.has(index))].map((branch,index)=>({...branch,id:index+1}));
}

export function AppDataProvider({initialTickets,initialTechnicians,initialBranches,children}:{initialTickets:AppTicket[];initialTechnicians:AppTechnician[];initialBranches:Filial[];children:React.ReactNode}){
 const [tickets,setTickets]=useState(initialTickets);const [technicians,setTechnicians]=useState(initialTechnicians);const [branches,setBranches]=useState(initialBranches);const [routeStartPoints,setRouteStartPoints]=useState<Record<string,RouteStartPoint>>({});const [loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const saved=JSON.parse(raw);if(!saved||typeof saved!=="object")throw new Error("Dados locais inválidos");setTickets(arrayOr(saved.tickets,initialTickets,ticketGuard));setTechnicians(arrayOr(saved.technicians,initialTechnicians,technicianGuard));setBranches(mergeBranches(initialBranches,saved.branches));if(saved.routeStartPoints&&typeof saved.routeStartPoints==="object")setRouteStartPoints(saved.routeStartPoints)}else{const oldTickets=localStorage.getItem("rotasmart-tickets");if(oldTickets)setTickets(arrayOr(JSON.parse(oldTickets),initialTickets,ticketGuard))}}catch{localStorage.removeItem(KEY)}finally{setLoaded(true)}},[]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem(KEY,JSON.stringify({version:2,tickets,technicians,branches,routeStartPoints}))}catch{}},[loaded,tickets,technicians,branches,routeStartPoints]);

 const createTicket=(input:Omit<AppTicket,"id">)=>{let created:AppTicket={...input,id:Date.now()};setTickets(current=>{while(current.some(ticket=>ticket.id===created.id))created={...created,id:created.id+1};return [...current,created]});return created};
 const updateTicket=(ticket:AppTicket)=>setTickets(current=>current.map(item=>{if(item.id!==ticket.id)return item;if(ticket.status==="Cancelado")return {...ticket,tech:undefined,date:undefined,routeId:undefined,routeOrder:undefined,planningStatus:"nao_planejado"};if(ticket.tech&&ticket.date&&ticket.planningStatus&&ticket.planningStatus!=="nao_planejado")return {...ticket,routeId:routeKey(ticket.tech,ticket.date)};if(!ticket.tech||!ticket.date)return {...ticket,routeId:undefined,routeOrder:undefined,planningStatus:"nao_planejado"};return ticket}));
 const cancelTicket=(id:number)=>setTickets(current=>current.map(ticket=>ticket.id===id?{...ticket,status:"Cancelado",tech:undefined,date:undefined,routeId:undefined,routeOrder:undefined,planningStatus:"nao_planejado"}:ticket));
 const deleteTicket=(id:number)=>setTickets(current=>current.filter(ticket=>ticket.id!==id));
 const updateTicketStatus=(id:number,status:TicketStatus)=>setTickets(current=>current.map(ticket=>ticket.id===id?(status==="Cancelado"?{...ticket,status,tech:undefined,date:undefined,routeId:undefined,routeOrder:undefined,planningStatus:"nao_planejado"}:{...ticket,status}):ticket));
 const assignTicketToPlanner=({ticketId,technician,date,planningStatus,duration,routeOrder,notes}:PlannerAssignment)=>setTickets(current=>current.map(ticket=>ticket.id===ticketId?{...ticket,tech:technician,date,planningStatus,routeId:routeKey(technician,date),routeOrder:routeOrder||ticket.routeOrder||1,duration:duration||ticket.duration,notes:notes??ticket.notes,status:planningStatus==="rota_confirmada"?"Programado":ticket.status}:ticket));
 const removeTicketFromRoute=(id:number)=>setTickets(current=>current.map(ticket=>ticket.id===id?{...ticket,tech:undefined,date:undefined,routeId:undefined,routeOrder:undefined,planningStatus:"nao_planejado"}:ticket));
 const updateRoute=({technician,date,ticketIds,planningStatus}:RouteUpdate)=>{const id=routeKey(technician,date);setTickets(current=>current.map(ticket=>{const index=ticketIds.indexOf(ticket.id);if(index>=0)return {...ticket,tech:technician,date,routeId:id,routeOrder:index+1,planningStatus,status:planningStatus==="rota_confirmada"?"Programado":ticket.status};if(ticket.routeId===id&&!finalStatus(ticket.status))return {...ticket,tech:undefined,date:undefined,routeId:undefined,routeOrder:undefined,planningStatus:"nao_planejado"};return ticket}))};
 const confirmRoute=(technician:string,date:string,ticketIds:number[])=>updateRoute({technician,date,ticketIds,planningStatus:"rota_confirmada"});
 const updateRouteStartPoint=(id:string,start:RouteStartPoint)=>setRouteStartPoints(current=>({...current,[id]:start}));
 const updateBranch=(branch:Filial,isNew=false)=>{setBranches(current=>isNew?[...current,{...branch,id:Math.max(0,...current.map(item=>item.id))+1}]:current.map(item=>item.id===branch.id?branch:item));setTickets(current=>current.map(ticket=>ticket.branchNumber===branch.numeroFilial?{...ticket,branch:branch.nome,branchId:branch.id,city:`${branch.cidade}, ${branch.uf}`,uf:branch.uf,address:branch.endereco,latitude:branch.latitude,longitude:branch.longitude}:ticket))};
 const updateTechnician=(technician:AppTechnician,isNew=false)=>{setTechnicians(current=>{if(isNew)return[...current,{...technician,id:Math.max(0,...current.map(item=>item.id))+1}];const previous=current.find(item=>item.id===technician.id)?.name;if(previous&&previous!==technician.name)setTickets(all=>all.map(ticket=>ticket.tech===previous?{...ticket,tech:technician.name,routeId:ticket.date?routeKey(technician.name,ticket.date):ticket.routeId}:ticket));return current.map(item=>item.id===technician.id?technician:item)})};
 const clearLocalData=()=>{if(!window.confirm("Limpar todos os dados locais do RotaSmart?"))return;Object.keys(localStorage).filter(key=>key.startsWith("rotasmart-")).forEach(key=>localStorage.removeItem(key));window.location.reload()};
 return <Context.Provider value={{tickets,technicians,branches,routeStartPoints,setTickets,setTechnicians,setBranches,createTicket,updateTicket,cancelTicket,deleteTicket,updateTicketStatus,assignTicketToPlanner,removeTicketFromRoute,updateRoute,confirmRoute,updateRouteStartPoint,updateBranch,updateTechnician,clearLocalData}}>{children}</Context.Provider>;
}
export function useAppData(){const value=useContext(Context);if(!value)throw new Error("useAppData deve ser usado dentro de AppDataProvider");return value}
