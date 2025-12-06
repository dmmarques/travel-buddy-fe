import React, { useState } from "react";
import { toast } from "sonner";
import { addActivityToTrip } from "@/app/utilies/api/activities";
import type { Accommodation } from "../AiTab";
import type { GenActivity } from "@/app/(bo)/trips/types/GenActivity";
import {} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { getAISuggestions } from "@/app/utilies/api/aiService";
import { Trip } from "../../../types/trip";

interface AiCardProps {
  accommodations: Accommodation[];
  travelList: import("@/app/(bo)/trips/types/travel").Travel[];
  activities: import("@/app/(bo)/trips/types/activity").Activity[];
  setActivities: React.Dispatch<
    React.SetStateAction<import("@/app/(bo)/trips/types/activity").Activity[]>
  >;
  trip?: Trip;
}

function getNumberOfDays(checkIn: string, checkOut: string) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = outDate.getTime() - inDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function AiCard({
  accommodations,
  travelList,
  activities,
  setActivities,
  trip,
}: AiCardProps) {
  // State for loading and results per city-country key
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [results, setResults] = useState<{
    [key: string]: { error?: string; data?: GenActivity[] };
  }>({});

  if (accommodations.length === 0 && travelList.length === 0) {
    return (
      <div className="text-gray-500">No travel or accommodations found.</div>
    );
  }

  // Only use travels for recommendations if available, otherwise use accommodations
  const cityCountryGroups: {
    [key: string]: {
      city: string;
      country: string;
      accs: Accommodation[];
      travels: import("@/app/(bo)/trips/types/travel").Travel[];
    };
  } = {};

  if (travelList.length > 0) {
    travelList.forEach((travel) => {
      let city = "Unknown City";
      let country = "Unknown Country";
      // If travel.name is in format 'Origin - Destination', use Destination
      if (travel.name) {
        const parts = travel.name.split("-");
        if (parts.length === 2) {
          // Destination part
          const dest = parts[1].trim();
          // Try to split city and country by last comma
          const destParts = dest.split(",");
          if (destParts.length >= 2) {
            city = destParts.slice(0, -1).join(",").trim();
            country = destParts[destParts.length - 1].trim();
          } else {
            city = dest;
          }
        } else {
          city = travel.name;
        }
      }
      const key = `${city},${country}`;
      if (!cityCountryGroups[key])
        cityCountryGroups[key] = { city, country, accs: [], travels: [] };
      cityCountryGroups[key].travels.push(travel);
    });
  } else {
    accommodations.forEach((acc) => {
      let city = "Unknown City";
      let country = "Unknown Country";
      if (acc.address) {
        const parts = acc.address.split(",").map((s) => s.trim());
        if (parts.length >= 2) {
          city = parts[parts.length - 2];
          country = parts[parts.length - 1];
        }
      }
      const key = `${city},${country}`;
      if (!cityCountryGroups[key])
        cityCountryGroups[key] = { city, country, accs: [], travels: [] };
      cityCountryGroups[key].accs.push(acc);
    });
  }

  const handleGetSuggestions = async (
    key: string,
    city: string,
    country: string,
    days: number
  ) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const location = `${city}, ${country}`;
      const res = await getAISuggestions(location, days);
      // Assume backend returns GenActivity[]
      setResults((prev) => ({
        ...prev,
        [key]: { data: res as GenActivity[] },
      }));
    } catch {
      setResults((prev) => ({
        ...prev,
        [key]: { error: "Failed to fetch suggestions" },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto relative h-full min-h-[400px] grid gap-6">
      {Object.entries(cityCountryGroups).map(
        ([key, { city, country, accs }]) => {
          // Calculate total days for this city
          let totalDays = accs.reduce((sum, acc) => {
            if (acc.checkInDate && acc.checkOutDate) {
              return sum + getNumberOfDays(acc.checkInDate, acc.checkOutDate);
            }
            return sum;
          }, 0);
          // If no accommodations, use trip duration
          if (totalDays === 0 && trip && trip.startDate && trip.endDate) {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            totalDays = Math.max(
              1,
              Math.ceil(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
              ) + 1
            );
          }
          return (
            <div
              key={key}
              className="border rounded-lg p-4 h-[500px] flex flex-col relative"
            >
              <Button
                className="absolute top-4 right-4 text-white px-3 py-1 rounded shadow"
                aria-label={`Action for ${city}`}
                onClick={() =>
                  handleGetSuggestions(key, city, country, totalDays)
                }
                disabled={loading[key]}
              >
                {loading[key] ? "Loading..." : "Get Suggestions"}
              </Button>
              <div className="font-bold text-lg mb-2">
                {city}, <span className="text-gray-500">{country}</span>
              </div>
              <div className="text-gray-800 mb-4">
                Total days: <span className="font-semibold">{totalDays}</span>
              </div>
              {results[key] && (
                <div
                  className="mt-2 text-sm text-black bg-gray-50 rounded p-2"
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                >
                  {results[key].error ? (
                    results[key].error
                  ) : Array.isArray(results[key].data) ? (
                    <div className="grid gap-3">
                      {results[key].data.map((activity, idx) => {
                        // Get tripId and username from URL
                        const searchParams =
                          typeof window !== "undefined"
                            ? new URLSearchParams(window.location.search)
                            : null;
                        const tripId = searchParams?.get("tripId") ?? undefined;
                        // Removed unused username variable
                        // Convert GenActivity to Activity type
                        const activityDate = activity.date
                          ? new Date(activity.date).toISOString()
                          : new Date().toISOString();
                        // Map AI category to allowed categories
                        const categoryMap: Record<string, string> = {
                          sightseeing: "sightseeing",
                          food: "food",
                          sport: "sport",
                          entertainment: "entertainment",
                          other: "other",
                          // Add more mappings if needed
                        };
                        // Normalize and map category
                        let mappedCategory = "other";
                        if (activity.category) {
                          const lower = activity.category.trim().toLowerCase();
                          mappedCategory = categoryMap[lower] || "other";
                        }
                        const newActivity = {
                          id: Math.random().toString(36).slice(2),
                          name: activity.name,
                          address: activity.address,
                          category: mappedCategory,
                          creatorUsername: "AI Buddy",
                          creationDate: new Date().toISOString(),
                          activityDate,
                          cost: activity.cost,
                          description: "", // GenActivity has no description
                          latitude: "", // Not available from GenActivity
                          longitude: "", // Not available from GenActivity
                        };
                        const handleAddActivity = async () => {
                          if (!tripId) {
                            toast.error("No tripId found in URL");
                            return;
                          }
                          try {
                            await addActivityToTrip(tripId, newActivity);
                            setActivities([...activities, newActivity]);
                            toast.success("Activity added to trip!");
                          } catch {
                            toast.error("Failed to add activity");
                          }
                        };
                        return (
                          <div
                            key={idx}
                            className="border rounded shadow-sm p-3 bg-white flex flex-col gap-1"
                          >
                            <div className="font-semibold text-base">
                              {activity.name}
                            </div>
                            <div className="text-sm text-gray-700">
                              {activity.address}
                            </div>
                            {activity.date && (
                              <div className="text-xs text-gray-600">
                                {(() => {
                                  const d = new Date(activity.date);
                                  if (isNaN(d.getTime())) return null;
                                  return (
                                    <>
                                      {d.toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}{" "}
                                      {d.toLocaleTimeString(undefined, {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {activity.category}
                            </div>
                            {typeof activity.cost === "number" && (
                              <div className="text-xs text-gray-600">
                                Cost: {activity.cost}
                              </div>
                            )}
                            <Button
                              className="mt-2 w-fit self-end"
                              size="sm"
                              variant="outline"
                              onClick={handleAddActivity}
                            >
                              Add to Trip
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        }
      )}
    </div>
  );
}
