"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

import type { Accommodation } from "@/app/(bo)/trips/types/accommodation";

type WorldMapProps = {
  accommodations: Accommodation[];
};

import { useState } from "react";

export default function WorldMap({ accommodations }: WorldMapProps) {
  const defaultCenter = { lat: 54.526, lng: 15.2551 };
  const defaultZoom = 4;

  const [showInfo, setShowInfo] = useState(false);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
      <div className="w-full h-full relative" style={{ minHeight: 0 }}>
        {/* Info Button */}
        <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center">
          <button
            type="button"
            className="bg-white bg-opacity-90 border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100 focus:outline-none"
            aria-label="Show map info"
            onClick={() => setShowInfo((v) => !v)}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#555"
                strokeWidth="2"
                fill="#fff"
              />
              <text
                x="12"
                y="16"
                textAnchor="middle"
                fontSize="12"
                fill="#555"
                fontFamily="Arial"
                fontWeight="bold"
              >
                i
              </text>
            </svg>
          </button>
          {showInfo && (
            <div className="mt-2 bg-white bg-opacity-95 border border-gray-300 rounded shadow-lg p-4 text-sm max-w-xs text-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-center w-full">
                  Map Information
                </span>
                <button
                  type="button"
                  className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Close info"
                  onClick={() => setShowInfo(false)}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="#555"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <p>
                The points shown on the map represent all the cities you visited
                or are planning to visit. Each marker corresponds to a specific
                location you have added to the planning of your trips.
              </p>
            </div>
          )}
        </div>
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
