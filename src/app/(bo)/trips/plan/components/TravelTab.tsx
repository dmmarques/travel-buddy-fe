import React from "react";
import TravelCard from "./travelComponents/TravelCard";
import TravelMap from "./travelComponents/TravelMap";
import { Travel } from "@/app/(bo)/trips/types/travel";

type TravelTabProps = {
  travelList?: Travel[];
  onTravelAdded?: (travel: Travel) => void;
  onTravelEdited?: (travel: Travel) => void;
  onTravelDeleted?: () => void;
};

export default function TravelTab({
  travelList,
  onTravelAdded,
  onTravelEdited,
  onTravelDeleted,
}: TravelTabProps) {
  const latestTravel =
    travelList && travelList.length > 0
      ? travelList[travelList.length - 1]
      : undefined;
  const [from, setFrom] = React.useState<{ lat: number; lng: number } | null>(
    latestTravel
      ? { lat: Number(latestTravel.fromLat), lng: Number(latestTravel.fromLng) }
      : null
  );
  const [to, setTo] = React.useState<{ lat: number; lng: number } | null>(
    latestTravel
      ? { lat: Number(latestTravel.toLat), lng: Number(latestTravel.toLng) }
      : null
  );
  const [estimatedDuration, setEstimatedDuration] = React.useState<string>(
    latestTravel?.estimatedDuration || ""
  );
  const [estimatedDistance, setEstimatedDistance] = React.useState<string>("");

  const handleAddTravel = (newTravel: Travel) => {
    if (onTravelAdded) {
      onTravelAdded(newTravel);
    }
  };

  // Get tripId from URL if possible
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const tripId = searchParams?.get("tripId") ?? undefined;
  // Build routes array: always show all saved routes, and add live route if both from and to are set
  const liveRoute = from && to ? [{ from, to }] : [];
  const savedRoutes =
    travelList && travelList.length > 0
      ? travelList.map((t) => ({
          from: { lat: Number(t.fromLat), lng: Number(t.fromLng) },
          to: { lat: Number(t.toLat), lng: Number(t.toLng) },
        }))
      : [];
  const allRoutes = [...liveRoute, ...savedRoutes];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6">
      <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-between min-h-[400px] lg:h-7/8">
        <TravelCard
          onAddTravel={handleAddTravel}
          estimatedDuration={estimatedDuration}
          estimatedDistance={estimatedDistance}
          onFromPick={setFrom}
          onToPick={setTo}
          formEstimatedDistance={estimatedDistance}
          formEstimatedDuration={estimatedDuration}
          fromCoords={from ?? undefined}
          toCoords={to ?? undefined}
          tripId={tripId}
          onTravelAdded={onTravelAdded}
          onTravelEdited={onTravelEdited}
          onTravelDeleted={onTravelDeleted}
          travels={travelList}
        />
      </div>
      <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-between min-h-[400px] lg:h-7/8">
        <TravelMap
          markerPositions={[...(from ? [from] : []), ...(to ? [to] : [])]}
          routes={allRoutes}
          setEstimatedDuration={setEstimatedDuration}
          setEstimatedDistance={setEstimatedDistance}
        />
      </div>
    </div>
  );
}
