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
  travelList: import("@/app/(bo)/trips/types/travel").Travel[];
  activities: import("@/app/(bo)/trips/types/activity").Activity[];
  setActivities: React.Dispatch<
    React.SetStateAction<import("@/app/(bo)/trips/types/activity").Activity[]>
  >;
  trip?: import("@/app/(bo)/trips/types/trip").Trip;
}

export function AiTab({
  accommodations,
  travelList,
  activities,
  setActivities,
  trip,
}: AiTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-md flex flex-col min-h-[500px] lg:h-7/8 p-4 overflow-hidden">
        <AiCard
          accommodations={accommodations}
          travelList={travelList}
          activities={activities}
          setActivities={setActivities}
          trip={trip}
        />
      </div>
      <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-between min-h-[500px] lg:h-7/8">
        <AiMap />
      </div>
    </div>
  );
}
