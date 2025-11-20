"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listTripsByUsername } from "@/app/utilies/api/activities";
import { Trip } from "@/app/(bo)/trips/types/trip";
import {
  getTotalPlannedCosts,
  getTotalKMs,
  getNextIncomingTrip,
} from "@/app/utilies/lib/tripStats";
import { getTotalPlannedActivities } from "@/app/utilies/lib/getTotalPlannedActivities";
import { getPlannedCostsBreakdown } from "@/app/utilies/lib/getPlannedCostsBreakdown";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Earth } from "lucide-react";

import { OverallCostPieChart } from "@/app/(bo)/landingPage/OverallCostPieChart";
import { OverallActivityNumbers } from "@/app/(bo)/landingPage/OverallActivityNumbers";
import { getCurrentUser } from "../../../../server/users";

export default function Home() {
  // Helper to format date as dd/mm/yy
  function formatDateDMY(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const router = useRouter();

  // Always get username from getCurrentUser
  const fetchUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setUsername(user?.currentUser?.name || "");
    } catch {
      setUsername("");
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    async function fetchTrips() {
      try {
        if (!username) return;
        const data = await listTripsByUsername(username);
        setTrips(data as Trip[]);
      } catch {
        setError("Failed to fetch trips");
      } finally {
        setLoading(false);
      }
    }
    if (username) {
      fetchTrips();
    }
  }, [username]);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <Earth className="size-12 mb-4 animate-spin-slow text-gray-400" />
        <span className="text-gray-400 text-lg font-medium">
          Loading information...
        </span>
      </main>
    );
  }

  return (
    <main>
      {/* Top summary cards: Next Trip, Longest Trip, Shortest Trip, Trip Cost Extremes */}
      <div className="flex flex-row gap-4 mb-4">
        {/* Next Trip Card as Button */}
        {(() => {
          const nextTrip = getNextIncomingTrip(trips);
          if (!nextTrip)
            return (
              <Card className="w-100 m-2">
                <CardContent>
                  <p>No upcoming trips found.</p>
                </CardContent>
              </Card>
            );
          const tripId = nextTrip.id || nextTrip.tripId;
          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (!tripId) return;
            // Always get username from state (set by getCurrentUser)
            router.push(
              `/trips/plan?mode=view&tripId=${encodeURIComponent(
                String(tripId)
              )}&username=${encodeURIComponent(username)}`
            );
          };
          return (
            <button
              type="button"
              onClick={handleClick}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "block",
              }}
              aria-label="Go to next trip planning"
            >
              <Card className="w-100 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary">
                <CardHeader>
                  <h2>Your Next Trip</h2>
                </CardHeader>
                <CardContent>
                  <div>
                    <strong>{nextTrip.name}</strong>
                    {nextTrip.destination && <> - {nextTrip.destination}</>}
                    {nextTrip.startDate && nextTrip.endDate && (
                      <>
                        {" "}
                        {formatDateDMY(nextTrip.startDate)} to{" "}
                        {formatDateDMY(nextTrip.endDate)}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })()}
        {/* Longest Trip Card */}
        {(() => {
          if (!trips || trips.length === 0) return null;
          // Find the trip with the longest duration in days
          let maxDays = 0;
          let longestTrip = null;
          for (const trip of trips) {
            if (trip.startDate && trip.endDate) {
              const start = new Date(trip.startDate);
              const end = new Date(trip.endDate);
              const days =
                Math.round(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                ) + 1;
              if (days > maxDays) {
                maxDays = days;
                longestTrip = trip;
              }
            }
          }
          if (!longestTrip) return null;
          return (
            <Card className="w-80 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary">
              <CardHeader>
                <h2>Longest Trip</h2>
              </CardHeader>
              <CardContent>
                <div>
                  <strong>{longestTrip.name}</strong>
                  {longestTrip.destination && <> - {longestTrip.destination}</>}
                  {longestTrip.startDate && longestTrip.endDate && (
                    <>
                      {" "}
                      {formatDateDMY(longestTrip.startDate)} to{" "}
                      {formatDateDMY(longestTrip.endDate)}
                    </>
                  )}
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Duration:</strong> {maxDays} days
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}
        {/* Shortest Trip Card */}
        {(() => {
          if (!trips || trips.length === 0) return null;
          // Find the trip with the shortest duration in days (at least 1 day)
          let minDays = Infinity;
          let shortestTrip = null;
          for (const trip of trips) {
            if (trip.startDate && trip.endDate) {
              const start = new Date(trip.startDate);
              const end = new Date(trip.endDate);
              const days =
                Math.round(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                ) + 1;
              if (days < minDays) {
                minDays = days;
                shortestTrip = trip;
              }
            }
          }
          if (!shortestTrip || !isFinite(minDays)) return null;
          return (
            <Card className="w-80 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary">
              <CardHeader>
                <h2>Shortest Trip</h2>
              </CardHeader>
              <CardContent>
                <div>
                  <strong>{shortestTrip.name}</strong>
                  {shortestTrip.destination && (
                    <> - {shortestTrip.destination}</>
                  )}
                  {shortestTrip.startDate && shortestTrip.endDate && (
                    <>
                      {" "}
                      {formatDateDMY(shortestTrip.startDate)} to{" "}
                      {formatDateDMY(shortestTrip.endDate)}
                    </>
                  )}
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Duration:</strong> {minDays} days
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}
        {/* Trip Cost Extremes Card */}
        {(() => {
          if (!trips || trips.length === 0) return null;
          function getTripCost(trip: Trip) {
            let accommodation = 0;
            let travel = 0;
            let activities = 0;
            // Travel costs
            if (trip.travelList) {
              for (const t of trip.travelList) {
                const est =
                  typeof t.estimatedCost === "string"
                    ? parseFloat(t.estimatedCost)
                    : 0;
                if (!isNaN(est)) travel += est;
              }
            }
            // Accommodation costs
            if (trip.accommodations) {
              for (const acc of trip.accommodations) {
                if (acc.checkInDate && acc.checkOutDate) {
                  const nights = (() => {
                    const inDate = new Date(acc.checkInDate);
                    const outDate = new Date(acc.checkOutDate);
                    const diff = outDate.getTime() - inDate.getTime();
                    return Math.max(
                      1,
                      Math.round(diff / (1000 * 60 * 60 * 24))
                    );
                  })();
                  if (typeof acc.priceForAdult === "number")
                    accommodation += acc.priceForAdult * nights;
                  if (typeof acc.priceForChild === "number")
                    accommodation += acc.priceForChild * nights;
                  if (typeof acc.priceForPet === "number")
                    accommodation += acc.priceForPet * nights;
                }
              }
            }
            // Activity costs
            if (trip.activityList) {
              for (const act of trip.activityList) {
                if (typeof act.cost === "number") activities += act.cost;
              }
            }
            return accommodation + travel + activities;
          }
          let mostExpensive = null;
          let leastExpensive = null;
          let maxCost = -Infinity;
          let minCost = Infinity;
          for (const trip of trips) {
            const cost = getTripCost(trip);
            if (cost > maxCost) {
              maxCost = cost;
              mostExpensive = trip;
            }
            if (cost < minCost) {
              minCost = cost;
              leastExpensive = trip;
            }
          }
          return (
            <Card className="w-80 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary">
              <CardHeader>
                <h2>Most and Least expensive trips</h2>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-sm space-y-2">
                  <div>
                    <strong>Most Expensive:</strong>{" "}
                    {mostExpensive ? (
                      <>
                        {mostExpensive.name}
                        {typeof getTripCost(mostExpensive) === "number" && (
                          <>
                            {" "}
                            (€
                            {getTripCost(mostExpensive).toLocaleString(
                              undefined,
                              { maximumFractionDigits: 2 }
                            )}
                            )
                          </>
                        )}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </div>
                  <div>
                    <strong>Least Expensive:</strong>{" "}
                    {leastExpensive ? (
                      <>
                        {leastExpensive.name}
                        {typeof getTripCost(leastExpensive) === "number" && (
                          <>
                            {" "}
                            (€
                            {getTripCost(leastExpensive).toLocaleString(
                              undefined,
                              { maximumFractionDigits: 2 }
                            )}
                            )
                          </>
                        )}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>
      {/* Totals summary as Cards */}
      {!loading && !error && trips.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Card 1: Trips, Activities, KMs */}
          <div className="flex flex-row flex-1">
            {/* Left column: Trips & Activities + More Info (stacked) */}
            <div className="flex flex-col flex-1">
              <Card className="min-w-[260px] m-2">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Trips & Activities</h3>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <strong>Total Trips:</strong> {trips.length}
                  </div>
                  <div className="mb-2">
                    <strong>Total Activities:</strong>{" "}
                    {getTotalPlannedActivities(trips)}
                  </div>
                  <div className="mb-2">
                    <strong>Traveled Kms:</strong>{" "}
                    {getTotalKMs(trips).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              {/* More Info Card below */}
              <Card className="min-w-[260px] m-2 mt-0">
                <CardHeader>
                  <h3 className="text-lg font-semibold">More Info</h3>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const breakdown = getPlannedCostsBreakdown(trips);
                    const numTrips = trips.length || 1;
                    // Defensive: avoid division by zero
                    const avgAccommodation = breakdown.accommodation / numTrips;
                    const avgActivities = breakdown.activities / numTrips;
                    const avgTravel = breakdown.travel / numTrips;
                    // Calculate average trip duration in days
                    let totalDays = 0;
                    let countedTrips = 0;
                    for (const trip of trips) {
                      if (trip.startDate && trip.endDate) {
                        const start = new Date(trip.startDate);
                        const end = new Date(trip.endDate);
                        const days =
                          Math.round(
                            (end.getTime() - start.getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1;
                        if (days > 0) {
                          totalDays += days;
                          countedTrips++;
                        }
                      }
                    }
                    const avgDuration =
                      countedTrips > 0 ? totalDays / countedTrips : 0;
                    return (
                      <div className="text-muted-foreground text-sm space-y-2">
                        <div>
                          <strong>Avg. Accommodation Cost:</strong> €
                          {avgAccommodation.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div>
                          <strong>Avg. Activities Cost:</strong> €
                          {avgActivities.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div>
                          <strong>Avg. Travel Cost:</strong> €
                          {avgTravel.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div>
                          <strong>Avg. Trip Duration:</strong>{" "}
                          {avgDuration.toLocaleString(undefined, {
                            maximumFractionDigits: 1,
                          })}{" "}
                          days
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Card 2: Cost Breakdown */}
          <Card className="min-w-[260px] flex-1 m-2">
            <CardHeader>
              <h3 className="text-lg font-semibold">
                Cost Breakdown accross all trips
              </h3>
            </CardHeader>
            <CardContent>
              {(() => {
                const breakdown = getPlannedCostsBreakdown(trips);
                const total = getTotalPlannedCosts(trips);
                return (
                  <OverallCostPieChart
                    total={total}
                    accommodation={breakdown.accommodation}
                    travel={breakdown.travel}
                    activities={breakdown.activities}
                  />
                );
              })()}
            </CardContent>
          </Card>
          {/* Card 3: Activities by Category */}
          <Card className="min-w-[260px] flex-1 m-2">
            <CardHeader>
              <h3 className="text-lg font-semibold">Activities by Category</h3>
            </CardHeader>
            <CardContent>
              <OverallActivityNumbers trips={trips} />
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
