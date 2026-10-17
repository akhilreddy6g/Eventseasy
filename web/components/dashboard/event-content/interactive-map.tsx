"use client";

import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import type { EventLocation } from "./content-api";

function Recenter({ location }: { location: EventLocation }) {
  const map = useMap();
  useEffect(() => {
    map.setView(
      [location.latitude, location.longitude],
      Math.max(map.getZoom(), 14),
      { animate: true },
    );
  }, [location, map]);
  return null;
}

export default function InteractiveMap({
  location,
}: {
  location: EventLocation;
}) {
  const key = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  const center: [number, number] = [location.latitude, location.longitude];
  const tileUrl = key
    ? `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${key}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution = key
    ? '&copy; <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; OpenStreetMap contributors'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom
      className="h-full w-full"
      aria-label="Event location map"
    >
      <TileLayer url={tileUrl} />
      <CircleMarker
        center={center}
        radius={10}
        pathOptions={{ color: "#0f172a", fillColor: "#f97316", fillOpacity: 1 }}
      >
        <Tooltip direction="top" offset={[0, -8]} opacity={1}>
          {location.formattedAddress}
        </Tooltip>
      </CircleMarker>
      <Recenter location={location} />
    </MapContainer>
  );
}
