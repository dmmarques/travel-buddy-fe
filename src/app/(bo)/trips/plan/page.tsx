"use client";
import * as React from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { getTripById } from "@/app/utilies/api/activities";
import { Trip } from "@/app/(bo)/trips/types/trip";
import Overview from "./components/OverviewTab";
import Tabs from "./components/Tabs";
import ItineraryTab from "./components/ItineraryTab";
import BudgetTab from "./components/BudgetTab";
import AccommodationTab from "./components/AccommodationTab";
import TravellersTab from "./components/TravellersTab";
import { Accommodation } from "../types/accommodation";
import TravelTab from "./components/TravelTab";
import { addTravelToTrip } from "@/app/utilies/api/activities";
import { AiTab } from "./components/AiTab";

export default function TripPlanPage() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const searchParams = useSearchParams();
  const tripId = searchParams?.get("tripId");
  const username = searchParams?.get("username");
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [activities, setActivities] = React.useState(
    [] as import("@/app/(bo)/trips/types/activity").Activity[]
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Callback to update accommodations in trip state
  const handleAccommodationAdded = async (accommodation: Accommodation) => {
    if (!tripId) {
      console.error("No tripId found in query params");
      return;
    }
    try {
      // Persist to backend
      const { addAccommodation, getTripById } = await import(
        "@/app/utilies/api/activities"
      );
      await addAccommodation(tripId, accommodation);
      // Fetch updated trip from backend
      if (username) {
        const updatedTrip = await getTripById(username, tripId);
        setTrip(updatedTrip);
      }
    } catch (error) {
      console.error("Failed to add accommodation", error);
    }
  };

  // Callback to update travelList in trip state and send to backend
  const handleTravelAdded = async (
    travel: import("@/app/(bo)/trips/types/travel").Travel
  ) => {
    if (!tripId) {
      console.error("No tripId found in query params");
      return;
    }
    try {
      await addTravelToTrip(tripId, travel);
      // Instead of mutating local state, fetch updated trip from backend
      if (username) {
        const updatedTrip = await getTripById(username, tripId);
        setTrip(updatedTrip);
      }
    } catch (error) {
      console.error("Failed to add travel", error);
    }
  };

  // Callback to refresh trip after deleting a travel
  const handleTravelDeleted = async () => {
    if (!tripId || !username) return;
    try {
      const updatedTrip = await getTripById(username, tripId);
      setTrip(updatedTrip);
    } catch (error) {
      console.error("Failed to refresh trip after delete", error);
    }
  };

  // Callback to update a travel entry (edit)
  const handleTravelEdited = async (
    travel: import("@/app/(bo)/trips/types/travel").Travel
  ) => {
    if (!tripId) {
      console.error("No tripId found in query params");
      return;
    }
    try {
      const { updateTravelFromTrip, getTripById } = await import(
        "@/app/utilies/api/activities"
      );
      await updateTravelFromTrip(tripId, travel);
      toast("Update Successful", {
        description: "Travel updated successfully!",
      });
      if (username) {
        const updatedTrip = await getTripById(username, tripId);
        setTrip(updatedTrip);
      }
    } catch (error) {
      console.error("Failed to edit travel", error);
    }
  };

  React.useEffect(() => {
    if (!tripId || !username) return;
    setLoading(true);
    setError(null);
    getTripById(username, tripId)
      .then((data) => {
        if (data) {
          setTrip(data);
          setActivities(data.activityList || []);
        }
      })
      .catch(() => {
        setError("Failed to load trip details.");
      })
      .finally(() => setLoading(false));
  }, [tripId, username]);

  if (!tripId || !username) {
    return (
      <div className="p-8 text-red-600">Missing tripId or username in URL.</div>
    );
  }
  if (loading) return <div className="p-8">Loading trip details…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!trip) return <div className="p-8">Trip not found.</div>;

  return (
    <div className="flex flex-col h-screen pb-8">
      {/* Tabs above the main layout */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "overview" && (
        <Overview
          trip={trip}
          activities={activities}
          onTripUpdate={setTrip}
          onGoToItineraryTab={(day) => {
            setSelectedDay(day);
            setActiveTab("itinerary");
          }}
          onGoToBudgetTab={() => setActiveTab("budget")}
        />
      )}
      {activeTab === "travel" && trip && (
        <TravelTab
          travelList={trip.travelList}
          onTravelAdded={handleTravelAdded}
          onTravelEdited={handleTravelEdited}
          onTravelDeleted={handleTravelDeleted}
        />
      )}
      {activeTab === "aiTab" && trip && (
        <AiTab
          accommodations={trip.accommodations || []}
          activities={activities}
          setActivities={setActivities}
        />
      )}
      {activeTab === "accommodation" && trip && (
        <AccommodationTab
          trip={trip}
          onAccommodationAdded={handleAccommodationAdded}
        />
      )}
      {activeTab === "itinerary" && trip && (
        <ItineraryTab
          trip={trip}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          activities={activities}
          setActivities={setActivities}
        />
      )}
      {activeTab === "travellers" && <TravellersTab />}
      {activeTab === "budget" && trip && (
        <BudgetTab trip={trip} activities={activities} />
      )}
    </div>
  );
}
