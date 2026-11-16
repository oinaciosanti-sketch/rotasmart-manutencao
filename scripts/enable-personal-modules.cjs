/* Atualização segura das abas do RotaSmart Control.
   Mantém o app/page.tsx ATUAL do repositório, sem substituí-lo por cópia antiga.
   Idempotente: pode rodar em todo build sem criar importações/abas duplicadas. */
'use strict';
const fs=require('node:fs');const path=require('node:path');
const file=path.join(__dirname,'..','app','page.tsx');
let page=fs.readFileSync(file,'utf8');
const apply=(find,replacement,label)=>{if(page.includes(replacement))return;if(!page.includes(find))throw Error(`Atualização não aplicada: ${label}. O arquivo principal mudou. Preserve a versão atual e revise a integração.`);page=page.replace(find,replacement)};
apply('const LeafletRouteMap=dynamic(',
`const VehicleInventory=dynamic(()=>import("./components/VehicleInventory"),{ssr:false,loading:()=><div>Carregando estoque...</div>});
const OperationalMap=dynamic(()=>import("./components/OperationalMap"),{ssr:false,loading:()=><div className="map-loading">Carregando mapa operacional…</div>});
const LeafletRouteMap=dynamic(`,'módulos dinâmicos');
apply('"Mapa de rotas" | "Filiais / Postos"','"Mapa de rotas" | "Mapa de chamados" | "Estoque móvel" | "Filiais / Postos"','tipos de abas');
apply('{label:"Montar rota",icon:Route},{label:"Mapa de rotas",icon:Map},{label:"Filiais / Postos",icon:Building2}',
'{label:"Montar rota",icon:Route},{label:"Mapa de rotas",icon:Map},{label:"Mapa de chamados",icon:MapPin},{label:"Estoque móvel",icon:Wrench},{label:"Filiais / Postos",icon:Building2}', 'menu lateral');
apply('{page==="Filiais / Postos"&&<Branches flash={flash}/>}','{page==="Mapa de chamados"&&<RouteErrorBoundary><OperationalMap/></RouteErrorBoundary>}\n        {page==="Estoque móvel"&&<VehicleInventory/>}\n        {page==="Filiais / Postos"&&<Branches flash={flash}/>}','conteúdo das abas');
if(!page.includes('RotaSmart</b><span>CONTROL'))page=page.replace('RotaSmart</b><span>MANUTENÇÃO','RotaSmart</b><span>CONTROL');
fs.writeFileSync(file,page);
console.log('RotaSmart Control — módulos verificados; página principal preservada.');
