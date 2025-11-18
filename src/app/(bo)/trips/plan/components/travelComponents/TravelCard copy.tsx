import React, { useState } from "react";
import { useForm } from "react-hook-form";
import TravelForm, { PredictionType } from "./TravelForm";

import { Travel } from "@/app/(bo)/trips/types/travel";

type TravelCardProps = {
  onSelectPoints?: (
    origin: { lat: number; lng: number } | null,
    destination: { lat: number; lng: number } | null
  ) => void;
  onSelectOrigin?: (coords: { lat: number; lng: number } | null) => void;
  onSelectDestination?: (coords: { lat: number; lng: number } | null) => void;
  onAddTravel?: (travel: Travel) => void;
  estimatedDuration?: string;
  estimatedDistance?: string;
};

export default function TravelCard({
  onSelectPoints,
  onSelectOrigin,
  onSelectDestination,
  onAddTravel,
  estimatedDuration,
  estimatedDistance,
}: TravelCardProps) {
  const [showRoundTrip, setShowRoundTrip] = useState(false);

  // Main travel form state
  const form = useForm({
    defaultValues: {
      origin: "",
      destination: "",
    },
  });
  const [originCoords, setOriginCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destinationCoords, setDestinationCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Round trip travel form state
  const roundTripForm = useForm({
    defaultValues: {
      origin: "",
      destination: "",
    },
  });
  const [rtOriginCoords, setRtOriginCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [rtDestinationCoords, setRtDestinationCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Handlers for main travel
  const handleOriginPick = (prediction: PredictionType) => {
    const address =
      prediction.formatted_address || prediction.description || "";
    form.setValue("origin", address);
    const coords =
      prediction.geometry && prediction.geometry.location
        ? prediction.geometry.location
        : null;
    setOriginCoords(coords);
    if (onSelectOrigin) onSelectOrigin(coords);
  };
  const handleDestinationPick = (prediction: PredictionType) => {
    const address =
      prediction.formatted_address || prediction.description || "";
    form.setValue("destination", address);
    const coords =
      prediction.geometry && prediction.geometry.location
        ? prediction.geometry.location
        : null;
    setDestinationCoords(coords);
    if (onSelectDestination) onSelectDestination(coords);
  };
  const onSubmit = (data: { origin: string; destination: string }) => {
    if (onSelectPoints) {
      onSelectPoints(originCoords, destinationCoords);
    }
    if (onAddTravel && originCoords && destinationCoords) {
      const travel: Travel = {
        fromLat: String(originCoords.lat),
        fromLng: String(originCoords.lng),
        toLat: String(destinationCoords.lat),
        toLng: String(destinationCoords.lng),
        estimatedDuration: estimatedDuration ?? "",
        distance: estimatedDistance ?? "",
        name: `${data.origin} to ${data.destination}`,
        transport: "", // Provide a default or select value as needed
        departureDate: new Date(), // Default to now, or set as needed
        arrivalDate: new Date(), // Default to now, or set as needed
        genTravelCost: { fuel: 0, tollCost: 0, totalCost: 0 }, // Default empty cost
      };
      onAddTravel(travel);
    }
    console.log({ ...data, originCoords, destinationCoords });
  };

  // Handlers for round trip travel
  const handleRtOriginPick = (prediction: PredictionType) => {
    const address =
      prediction.formatted_address || prediction.description || "";
    roundTripForm.setValue("origin", address);
    const coords =
      prediction.geometry && prediction.geometry.location
        ? prediction.geometry.location
        : null;
    setRtOriginCoords(coords);
  };
  const handleRtDestinationPick = (prediction: PredictionType) => {
    const address =
      prediction.formatted_address || prediction.description || "";
    roundTripForm.setValue("destination", address);
    const coords =
      prediction.geometry && prediction.geometry.location
        ? prediction.geometry.location
        : null;
    setRtDestinationCoords(coords);
  };
  const onRoundTripSubmit = (data: { origin: string; destination: string }) => {
    if (onAddTravel && rtOriginCoords && rtDestinationCoords) {
      const travel: Travel = {
        fromLat: String(rtOriginCoords.lat),
        fromLng: String(rtOriginCoords.lng),
        toLat: String(rtDestinationCoords.lat),
        toLng: String(rtDestinationCoords.lng),
        estimatedDuration: estimatedDuration ?? "",
        distance: estimatedDistance ?? "",
        name: `${data.origin} to ${data.destination} (Return)`,
        transport: "", // Provide a default or select value as needed
        departureDate: new Date(), // Default to now, or set as needed
        arrivalDate: new Date(), // Default to now, or set as needed
        genTravelCost: { fuel: 0, tollCost: 0, totalCost: 0 }, // Default empty cost
      };
      onAddTravel(travel);
    }
    console.log({ ...data, rtOriginCoords, rtDestinationCoords });
  };

  return (
    <div className="flex flex-col gap-8 bg-black">
      {/* Main travel form */}
      <TravelForm
        form={form}
        onOriginPick={handleOriginPick}
        onDestinationPick={handleDestinationPick}
        onSubmit={onSubmit}
        buttonLabel="Add Travel"
      />
      {/* Round trip form below */}
      <div className="relative">
        <TravelForm
          form={roundTripForm}
          onOriginPick={handleRtOriginPick}
          onDestinationPick={handleRtDestinationPick}
          onSubmit={onRoundTripSubmit}
          buttonLabel="Add Round Trip"
          disabled={!showRoundTrip}
        />
        {!showRoundTrip && (
          <div className="absolute inset-0 bg-gray-300 bg-opacity-60 flex items-center justify-center rounded-lg z-10">
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded font-bold"
              onClick={() => setShowRoundTrip(true)}
            >
              Add round trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
