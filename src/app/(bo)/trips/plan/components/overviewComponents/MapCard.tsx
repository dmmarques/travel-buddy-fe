import { Card } from "@/components/ui/card";
import {
  APIProvider,
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import React, { useEffect, useState } from "react";
import { Accommodation } from "@/app/(bo)/trips/types/accommodation";

type ActivityWithCoords = {
  id: string;
  name: string;
  latitude?: string;
  longitude?: string;
};

type Route = {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
};

type MapCardProps = {
  accommodations?: Accommodation[];
  activities?: ActivityWithCoords[];
  pickedCoordinates?: { lat: number; lng: number } | null;
  routes?: Route[];
};

// Accept accommodations and activities as props
export default function MapCard(props: MapCardProps) {
  const accommodations = props.accommodations || [];
  const activities = props.activities || [];
  const pickedCoordinates = props.pickedCoordinates || null;
  const routes = props.routes || [];
  // Center of Europe (approximate)
  const defaultCenter = { lat: 54.526, lng: 15.2551 };
  const defaultZoom = 8;
  // City-level zoom for a single marker
  const singleMarkerZoom = 12;

  // Collect all marker positions from accommodations and activities
  const accommodationMarkers = accommodations
    .filter((a) => a.latitude && a.longitude)
    .map((a) => ({
      lat: parseFloat(a.latitude),
      lng: parseFloat(a.longitude),
    }));
  const activityMarkers = activities
    .filter((act) => act.latitude && act.longitude)
    .map((act) => ({
      lat: act.latitude ? parseFloat(act.latitude) : 0,
      lng: act.longitude ? parseFloat(act.longitude) : 0,
    }));
  const markerPositions = [...accommodationMarkers, ...activityMarkers];

  // If there is a picked coordinate, center on it; otherwise, use first marker or default
  const center =
    pickedCoordinates ||
    (markerPositions.length > 0 ? markerPositions[0] : defaultCenter);

  // If previewing a picked accommodation, zoom in; else use marker logic
  const zoom = pickedCoordinates
    ? singleMarkerZoom
    : markerPositions.length === 1
    ? singleMarkerZoom
    : defaultZoom;

  console.log(
    "MapCard rendering with markers:",
    markerPositions,
    "and pickedCoordinates:",
    pickedCoordinates
  );

  return (
    <Card className="p-4 mt-4 mb-4 min-h-[450px] lg:h-2/3 flex flex-col overflow-hidden">
      <div className="w-full h-full flex-1">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
          <Map
            defaultZoom={zoom}
            defaultCenter={center}
            style={{ width: "100%", height: "100%", borderRadius: "8px" }}
          >
            {markerPositions.map((pos, idx) => (
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
                />
              ))}
          </Map>
        </APIProvider>
      </div>
    </Card>
  );
}

// Directions component copied from TravelMap
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

  if (!leg) return null;
  return null;
  // Remove extra closing brace
}
