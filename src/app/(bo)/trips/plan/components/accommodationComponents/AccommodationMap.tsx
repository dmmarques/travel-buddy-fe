"use client";

import { Card } from "@/components/ui/card";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export default function AccommodationMap({
  markerPositions,
  pickedCoordinates,
}: {
  markerPositions: { lat: number; lng: number }[];
  pickedCoordinates?: { lat: number; lng: number };
}) {
  // Center of Europe (approximate)
  const defaultCenter = { lat: 54.526, lng: 15.2551 };
  const defaultZoom = 4;
  const singleMarkerZoom = 8;
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
  return (
    <Card className="flex-1 flex flex-col justify-center items-center">
      <div className="p-2 w-full h-full">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
          <Map
            defaultZoom={zoom}
            defaultCenter={center}
            style={{ width: "100%", height: "100%" }}
          >
            {markerPositions.map((pos, idx) => (
              <Marker key={idx} position={pos} />
            ))}
            {pickedCoordinates && <Marker position={pickedCoordinates} />}
          </Map>
        </APIProvider>
      </div>
    </Card>
  );
}
