"use client";

import { Card } from "@/components/ui/card";
import {
  APIProvider,
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import React, { useEffect, useState } from "react";

export default function TravelMap({
  markerPositions = [],
  pickedCoordinates,
  routes = [],
  setEstimatedDuration,
  setEstimatedDistance,
}: {
  markerPositions?: { lat: number; lng: number }[];
  pickedCoordinates?: { lat: number; lng: number };
  routes?: {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
  }[];
  setEstimatedDuration?: (duration: string) => void;
  setEstimatedDistance?: (distance: string) => void;
}) {
  // Center of Europe (approximate)
  const defaultCenter = { lat: 54.526, lng: 15.2551 };
  const defaultZoom = 4;
  const singleMarkerZoom = 8;
  // If there is a picked coordinate, center on it; otherwise, use first marker or default
  const center =
    pickedCoordinates ||
    (markerPositions && markerPositions.length > 0
      ? markerPositions[0]
      : routes && routes.length > 0
      ? routes[0].from
      : defaultCenter);

  // If previewing a picked accommodation, zoom in; else use marker logic
  const zoom = pickedCoordinates
    ? singleMarkerZoom
    : markerPositions && markerPositions.length === 1
    ? singleMarkerZoom
    : defaultZoom;
  return (
    <Card className="flex-1 flex flex-col justify-center items-center">
      <div className="p-2 w-full h-full">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
          <Map
            defaultZoom={zoom}
            defaultCenter={center}
            style={{ width: "100%", height: "100%" }}
          >
            {markerPositions &&
              markerPositions.map((pos, idx) => (
                <Marker key={"marker-" + idx} position={pos} />
              ))}
            {pickedCoordinates && <Marker position={pickedCoordinates} />}
            {routes &&
              routes.length > 0 &&
              routes.map((route, idx) => (
                <Directions
                  key={"route-" + idx}
                  from={route.from}
                  to={route.to}
                  // Only set duration/distance for the first route (optional)
                  setEstimatedDuration={
                    idx === 0 ? setEstimatedDuration : undefined
                  }
                  setEstimatedDistance={
                    idx === 0 ? setEstimatedDistance : undefined
                  }
                />
              ))}
          </Map>
        </APIProvider>
      </div>
    </Card>
  );
}

function Directions({
  from,
  to,
  setEstimatedDuration,
  setEstimatedDistance,
}: {
  from?: { lat: number; lng: number };
  to?: { lat: number; lng: number };
  setEstimatedDuration?: (duration: string) => void;
  setEstimatedDistance?: (distance: string) => void;
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];
  // Set estimatedDuration and distance in parent when directions are fetched
  React.useEffect(() => {
    if (leg) {
      if (setEstimatedDuration) setEstimatedDuration(leg.duration?.text ?? "");
      if (setEstimatedDistance) setEstimatedDistance(leg.distance?.text ?? "");
    }
  }, [leg, setEstimatedDuration, setEstimatedDistance]);

  useEffect(() => {
    if (!map || !routesLibrary) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;
    if (!from || !to) return;
    directionsService
      .route({
        origin: from,
        destination: to,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
      });
  }, [directionsService, directionsRenderer, from, to]);

  console.log(routes);

  if (!leg) return null;

  console.log("Rendering leg:", leg);

  return null;
}
