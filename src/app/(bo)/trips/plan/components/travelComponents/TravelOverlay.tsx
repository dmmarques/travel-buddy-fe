import React from "react";
import TravelFormV2 from "./TravelFormV2";

import type { Travel } from "@/app/(bo)/trips/types/travel";
interface TravelOverlayProps {
  onClose: (e: React.MouseEvent) => void;
  onFromPick?: (coords: { lat: number; lng: number }) => void;
  onToPick?: (coords: { lat: number; lng: number }) => void;
  estimatedDistance?: string;
  estimatedDuration?: string;
  fromCoords?: { lat: number; lng: number };
  toCoords?: { lat: number; lng: number };
  tripId?: string | number;
  onTravelAdded?: (travel: Travel) => void;
  travel?: Travel;
  onTravelEdited?: (travel: Travel) => void;
}

const TravelOverlay: React.FC<TravelOverlayProps> = ({
  onClose,
  onFromPick,
  onToPick,
  estimatedDistance,
  estimatedDuration,
  fromCoords,
  toCoords,
  tripId,
  onTravelAdded,
  travel,
  onTravelEdited,
}) => (
  <div
    className="absolute inset-0 z-50 flex items-center justify-center bg-transparent"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-lg shadow-lg p-8 relative min-w-[300px] min-h-[150px] flex flex-col items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        onClick={onClose}
        aria-label="Close overlay"
      >
        &times;
      </button>
      <TravelFormV2
        onFromPick={onFromPick}
        onToPick={onToPick}
        estimatedDistance={estimatedDistance}
        estimatedDuration={estimatedDuration}
        fromCoords={fromCoords}
        toCoords={toCoords}
        tripId={tripId}
        onTravelAdded={onTravelAdded}
        travel={travel}
        onTravelEdited={onTravelEdited}
      />
    </div>
  </div>
);

export default TravelOverlay;
