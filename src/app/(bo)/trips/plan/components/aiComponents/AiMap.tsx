"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";

export default function AiMap() {
  const defaultCenter = { lat: 54.526, lng: 15.2551 };
  const defaultZoom = 4;

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
      <div className="p-2 w-full h-full">
        <Map
          defaultZoom={defaultZoom}
          defaultCenter={defaultCenter}
          style={{ width: "100%", height: "100%" }}
        ></Map>
      </div>
    </APIProvider>
  );
}
