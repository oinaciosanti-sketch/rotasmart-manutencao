"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

export type LeafletStop = {
  id:number; number:string; branch:string; city:string; address:string;
  technician:string; status:string; order:number; urgency:string;
  latitude:number; longitude:number;
};
export type LeafletRoute = {
  technician:string; color:string;
  start?:{description:string;latitude:number;longitude:number};
  stops:LeafletStop[];
};

function FitMap({routes}:{routes:LeafletRoute[]}){
 const map=useMap();
 useEffect(()=>{
  const points:LatLngExpression[]=[];
  routes.forEach(r=>{if(r.start)points.push([r.start.latitude,r.start.longitude]);r.stops.forEach(s=>points.push([s.latitude,s.longitude]))});
  if(points.length)map.fitBounds(points as LatLngBoundsExpression,{padding:[35,35],maxZoom:12});
 },[map,routes]);
 return null;
}

export default function LeafletRouteMap({routes}:{routes:LeafletRoute[]}){
 const defaultCenter:LatLngExpression=[-26.4996185,-49.08767128];
 return <div className="leaflet-map-wrap">
  <MapContainer center={defaultCenter} zoom={8} scrollWheelZoom className="leaflet-map">
   <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
   <FitMap routes={routes}/>
   {routes.map(route=>{
    const line:LatLngExpression[]=[];
    if(route.start)line.push([route.start.latitude,route.start.longitude]);
    route.stops.forEach(s=>line.push([s.latitude,s.longitude]));
    return <div key={route.technician}>
     {route.start&&<CircleMarker center={[route.start.latitude,route.start.longitude]} radius={10} pathOptions={{color:route.color,fillColor:"#fff",fillOpacity:1,weight:4}}><Popup><b>Ponto de saída · {route.technician}</b><br/>{route.start.description}</Popup></CircleMarker>}
     {route.stops.map(stop=><CircleMarker key={stop.id} center={[stop.latitude,stop.longitude]} radius={9} pathOptions={{color:"#fff",fillColor:route.color,fillOpacity:1,weight:3}}><Popup><div className="map-popup"><b>{stop.order}. {stop.number}</b><span>{stop.branch}</span><span>{stop.city}</span><span>{stop.address}</span><hr/><span>Técnico: {stop.technician}</span><span>Status: {stop.status}</span><span>Urgência: {stop.urgency}</span></div></Popup></CircleMarker>)}
     {line.length>1&&<Polyline positions={line} pathOptions={{color:route.color,weight:5,opacity:.82,dashArray:"8 7"}}/>}
    </div>;
   })}
  </MapContainer>
  <div className="leaflet-approx-note">Linha aproximada entre pontos. Ainda não considera ruas/rodovias.</div>
 </div>;
}
