import React from "react";
import AiMap from "./aiComponents/AiMap";
import AiCard from "./aiComponents/AiCard";

export type Accommodation = {
  id?: string;
  name: string;
  googlePlaceId: string;
  googleRating?: number;
  googleReviewsNumber?: number;
  address: string;
  internationalPhoneNumber?: string;
  latitude: string;
  longitude: string;
  isAccessible?: boolean;
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  priceForAdult?: number;
  priceForChild?: number;
  allowsPets?: boolean;
  priceForPet?: number;
};

interface AiTabProps {
  accommodations: Accommodation[];
  activities: import("@/app/(bo)/trips/types/activity").Activity[];
  setActivities: React.Dispatch<
    React.SetStateAction<import("@/app/(bo)/trips/types/activity").Activity[]>
  >;
}

export function AiTab({
  accommodations,
  activities,
  setActivities,
}: AiTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex gap-6">
      <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col h-7/8 p-4">
        <AiCard
          accommodations={accommodations}
          activities={activities}
          setActivities={setActivities}
        />
      </div>
      <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-between h-7/8">
        <AiMap />
      </div>
    </div>
  );
}
