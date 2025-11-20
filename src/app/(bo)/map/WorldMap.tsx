"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

import type { Accommodation } from "@/app/(bo)/trips/types/accommodation";

type WorldMapProps = {
  accommodations: Accommodation[];
};

export default function WorldMap({ accommodations }: WorldMapProps) {
  const defaultCenter = { lat: 54.526, lng: 15.2551 };
  const defaultZoom = 4;

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
      <div className="w-full h-full" style={{ minHeight: 0 }}>
        <Map
          defaultZoom={defaultZoom}
          defaultCenter={defaultCenter}
          style={{ width: "100%", height: "100%" }}
        >
          {accommodations.map((a) => (
            <Marker
              key={a.id || a.name}
              position={{
                lat: parseFloat(a.latitude),
                lng: parseFloat(a.longitude),
              }}
              title={a.name}
            />
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}
