"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { getValidRoutePoints, isValidCoordinate } from "../utils/distance";

export type LeafletStop = {
  id: number | string;
  number?: string;
  branch?: string;
  city?: string;
  address?: string;
  technician?: string;
  status?: string;
  order?: number;
  urgency?: string;
  analyst?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type LeafletRoute = {
  technician: string;
  color: string;
  start?: {
    description?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  stops: LeafletStop[];
};

function FitMap({ routes }: { routes: LeafletRoute[] }) {
  const map = useMap();

  useEffect(() => {
    const points: LatLngExpression[] = [];

    routes.forEach((route) => {
      if (route.start && isValidCoordinate(route.start.latitude, route.start.longitude)) {
        points.push([route.start.latitude as number, route.start.longitude as number]);
      }

      getValidRoutePoints(Array.isArray(route.stops) ? route.stops : []).forEach((stop) => {
        points.push([stop.latitude as number, stop.longitude as number]);
      });
    });

    if (points.length) {
      map.fitBounds(points as LatLngBoundsExpression, { padding: [35, 35], maxZoom: 12 });
    }
  }, [map, routes]);

  return null;
}

export default function LeafletRouteMap({ routes }: { routes: LeafletRoute[] }) {
  const safeRoutes = Array.isArray(routes) ? routes : [];
  const defaultCenter: LatLngExpression = [-26.4996185, -49.08767128];
  const startMissing = safeRoutes.some(
    (route) => route.start && !isValidCoordinate(route.start.latitude, route.start.longitude),
  );
  const enoughForLine = safeRoutes.some((route) => {
    const candidates = [
      ...(route.start ? [route.start] : []),
      ...(Array.isArray(route.stops) ? route.stops : []),
    ];
    return getValidRoutePoints(candidates).length >= 2;
  });

  const notices = [
    "Linha aproximada entre pontos. Ainda não considera ruas/rodovias.",
    startMissing ? "Ponto de saída sem coordenada." : null,
    !enoughForLine ? "Não há coordenadas suficientes para desenhar a rota." : null,
  ].filter((notice): notice is string => Boolean(notice));

  return (
    <div className="leaflet-map-wrap">
      <MapContainer center={defaultCenter} zoom={8} scrollWheelZoom className="leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitMap routes={safeRoutes} />

        {safeRoutes.map((route, routeIndex) => {
          const validStart =
            route.start && isValidCoordinate(route.start.latitude, route.start.longitude)
              ? route.start
              : null;
          const validStops = getValidRoutePoints(
            Array.isArray(route.stops) ? route.stops : [],
          );
          const line: LatLngExpression[] = getValidRoutePoints([
            ...(validStart ? [validStart] : []),
            ...validStops,
          ]).map((point) => [point.latitude as number, point.longitude as number]);

          return (
            <div key={`${route.technician || "rota"}-${routeIndex}`}>
              {validStart && (
                <CircleMarker
                  center={[validStart.latitude as number, validStart.longitude as number]}
                  radius={10}
                  pathOptions={{
                    color: route.color || "#2563eb",
                    fillColor: "#fff",
                    fillOpacity: 1,
                    weight: 4,
                  }}
                >
                  <Popup>
                    <b>Ponto de saída · {route.technician || "Técnico não informado"}</b>
                    <br />
                    {validStart.description || "Endereço não informado"}
                  </Popup>
                </CircleMarker>
              )}

              {validStops.map((stop, index) => (
                <CircleMarker
                  key={`${stop.id || "parada"}-${index}`}
                  center={[stop.latitude as number, stop.longitude as number]}
                  radius={9}
                  pathOptions={{
                    color: "#fff",
                    fillColor: route.color || "#2563eb",
                    fillOpacity: 1,
                    weight: 3,
                  }}
                >
                  <Popup>
                    <div className="map-popup">
                      <b>
                        {stop.order ?? index + 1}. {stop.number || "Chamado sem número"}
                      </b>
                      <span>{stop.branch || "Filial não associada"}</span>
                      <span>{stop.city || "Cidade não informada"}</span>
                      <span>{stop.address || "Endereço não informado"}</span>
                      <hr />
                      <span>
                        Técnico: {stop.technician || route.technician || "Não informado"}
                      </span>
                      <span>Status: {stop.status || "Não informado"}</span>
                      <span>Urgência: {stop.urgency || "Não informada"}</span>
                      <span>Analista: {stop.analyst || "Não definido"}</span>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {line.length >= 2 && (
                <Polyline
                  positions={line}
                  pathOptions={{
                    color: route.color || "#2563eb",
                    weight: 5,
                    opacity: 0.82,
                    dashArray: "8 7",
                  }}
                />
              )}
            </div>
          );
        })}
      </MapContainer>

      <div className="leaflet-notices" role="status">
        {notices.map((notice) => (
          <div className="leaflet-approx-note" key={notice}>
            {notice}
          </div>
        ))}
      </div>
    </div>
  );
}
