"use client";

import { useState } from "react";
import { Accommodation } from "../../types/accommodation";
import AccommodationMap from "./accommodationComponents/AccommodationMap";
import AccommodationCard from "./accommodationComponents/AccomodationCard";
import { Trip } from "@/app/(bo)/trips/types/trip";

interface AccommodationTabProps {
  trip: Trip;
  onAccommodationAdded?: (accommodation: Accommodation) => void;
  destinationCoords?: { lat: number; lng: number };
}

export default function AccommodationTab({
  trip,
  onAccommodationAdded,
  destinationCoords,
}: AccommodationTabProps) {
  // Track the currently picked accommodation (for preview on map)
  const [pickedAccommodation, setPickedAccommodation] =
    useState<Accommodation | null>(null);

  const handleAccommodationAdded = (accommodation: Accommodation) => {
    setPickedAccommodation(null); // Clear preview after adding
    if (onAccommodationAdded) {
      onAccommodationAdded(accommodation);
    }
  };

  // Convert all accommodations to marker positions
  const markerPositions = (trip.accommodations || [])
    .map((acc) => {
      if (acc.latitude && acc.longitude) {
        const lat = parseFloat(acc.latitude);
        const lng = parseFloat(acc.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      return undefined;
    })
    .filter(Boolean) as { lat: number; lng: number }[];

  // Get coordinates for picked accommodation (if any)
  let pickedCoordinates: { lat: number; lng: number } | undefined = undefined;
  if (
    pickedAccommodation &&
    pickedAccommodation.latitude &&
    pickedAccommodation.longitude
  ) {
    const lat = parseFloat(pickedAccommodation.latitude);
    const lng = parseFloat(pickedAccommodation.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      pickedCoordinates = { lat, lng };
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6">
      <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-between min-h-[400px] lg:h-7/8">
        <AccommodationCard
          trip={trip}
          onAccommodationAdded={handleAccommodationAdded}
          onAccommodationPicking={setPickedAccommodation}
          destinationCoords={destinationCoords}
        />
      </div>
      <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-between min-h-[400px] lg:h-7/8">
        <AccommodationMap
          markerPositions={markerPositions}
          pickedCoordinates={pickedCoordinates}
        />
      </div>
    </div>
  );
}
