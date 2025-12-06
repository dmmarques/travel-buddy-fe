"use client";

import * as React from "react";
import OverviewCard from "./overviewComponents/OverviewCard";
import ItineraryCard from "./overviewComponents/ItineraryCard";
import DurationCard from "./overviewComponents/DurationCard";
import TravellersCard from "./overviewComponents/TravellersCard";
import BudgetCard, { BudgetCardProps } from "./overviewComponents/BudgetCard";
import MapCard from "./overviewComponents/MapCard";
import { Trip } from "../../types/trip";
import type { Activity } from "../../types/activity";

interface OverviewTabProps {
  trip: Trip;
  activities: Activity[];
  onTripUpdate?: (trip: Trip) => void;
  onGoToItineraryTab?: (day: Date) => void;
  onGoToBudgetTab?: () => void;
  setActiveTab?: (tab: string) => void;
}

export default function OverviewTab({
  trip,
  activities,
  onTripUpdate,
  onGoToItineraryTab,
  onGoToBudgetTab,
  setActiveTab,
}: OverviewTabProps) {
  // Fallback local tab state if setActiveTab is not provided
  const [localTab, setLocalTab] = React.useState<string>("");
  const handleSetTab = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      setLocalTab(tab);
    }
  };
  return (
    <div className="flex flex-1">
      {/* Left column */}
      <div className="flex-1 min-w-0 flex flex-col p-8">
        <OverviewCard trip={trip} onTripUpdate={onTripUpdate} />
        <ItineraryCard
          trip={trip}
          activities={activities}
          onGoToItineraryTab={onGoToItineraryTab}
        />
      </div>
      {/* Right column */}
      <div className="flex-1 min-w-0 flex flex-col p-8">
        <div className="flex flex-row gap-4 mb-4 h-1/8 items-stretch">
          <DurationCard trip={trip} />
          <TravellersCard trip={trip} />
          <BudgetCard trip={trip} onGoToBudgetTab={onGoToBudgetTab} />
        </div>
        <MapCard
          accommodations={trip.accommodations}
          activities={activities}
          routes={
            Array.isArray(trip.travelList)
              ? trip.travelList.map((travel) => ({
                  from: {
                    lat: parseFloat(travel.fromLat),
                    lng: parseFloat(travel.fromLng),
                  },
                  to: {
                    lat: parseFloat(travel.toLat),
                    lng: parseFloat(travel.toLng),
                  },
                }))
              : []
          }
        />
      </div>
    </div>
  );
}
