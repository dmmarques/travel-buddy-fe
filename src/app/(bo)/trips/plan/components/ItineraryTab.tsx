// ...existing code...

import ItineraryMap from "./itineraryComponents/ItineraryMap";
import ItineraryActivitiesCard from "./itineraryComponents/ItineraryActivitiesCard";
import type { Trip } from "@/app/(bo)/trips/types/trip";
import type { Activity } from "@/app/(bo)/trips/types/activity";
import React, { useState, useEffect } from "react";

interface ItineraryTabProps {
  trip: Trip;
  selectedDay: Date | null;
  setSelectedDay: (day: Date) => void;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

export default function ItineraryTab({
  trip,
  selectedDay,
  setSelectedDay,
  activities,
  setActivities,
}: ItineraryTabProps) {
  // State for selected map location
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Set default selected day to first day of trip if none is selected
  useEffect(() => {
    if (!selectedDay && trip.startDate) {
      const firstDay = new Date(trip.startDate);
      setSelectedDay(firstDay);
    }
  }, [selectedDay, trip.startDate, setSelectedDay]);

  return (
    <div className="flex-1 overflow-y-auto p-6 flex gap-6">
      <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-between h-7/8">
        <ItineraryActivitiesCard
          trip={trip}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          onLocationPick={setSelectedLocation}
          activities={activities}
          setActivities={setActivities}
        />
      </div>
      <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-between h-7/8">
        <ItineraryMap
          location={
            selectedLocation
              ? {
                  latitude: String(selectedLocation.lat),
                  longitude: String(selectedLocation.lng),
                }
              : null
          }
          activities={activities}
          selectedDay={selectedDay}
        />
      </div>
    </div>
  );
}
