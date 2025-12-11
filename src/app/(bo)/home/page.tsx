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
import { Button } from "@/components/ui/button";
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
        <Earth className="size-12 mb-4 animate-spin-slow text-primary/60" />
        <span className="text-primary font-medium">Loading information...</span>
      </main>
    );
  }

  // Overlay for no trips
  const showOverlay = !loading && !error && trips.length === 0;
  const handleStartAdventure = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/trips");
  };

  return (
    <main className="relative overflow-auto h-full pb-8">
      {/* Top summary cards: Next Trip, Longest Trip, Shortest Trip, Trip Cost Extremes */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 overflow-x-auto">
        {/* Next Trip Card as Button */}
        {(() => {
          const nextTrip = getNextIncomingTrip(trips);
          if (!nextTrip)
            return (
              <Card className="w-full md:w-100 m-2">
                <CardContent>
                  <p>No upcoming trips found.</p>
                </CardContent>
              </Card>
            );
          const tripId = nextTrip.id || nextTrip.tripId;
          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            if (!tripId) return;
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
              <Card className="w-full md:w-100 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary">
                <CardHeader>
                  <h2 className="text-sm font-medium text-muted-foreground">Next Trip</h2>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-semibold">{nextTrip.name}</div>
                  {nextTrip.startDate && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatDateDMY(nextTrip.startDate)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </button>
          );
        })()}
        {/* Longest Trip Card (always show, but empty if no trips) */}
        {(() => {
          if (!trips || trips.length === 0)
            return (
              <Card className="w-full md:w-80 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary opacity-50">
                <CardHeader>
                  <h2>Longest Trip</h2>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">No data</div>
                </CardContent>
              </Card>
            );
          // ...existing code...
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
            <Card className="w-full md:w-80 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary">
              <CardHeader>
                <h2 className="text-sm font-medium text-muted-foreground">Longest Trip</h2>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">{longestTrip.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {maxDays} days
                </div>
              </CardContent>
            </Card>
          );
        })()}
        {/* Shortest Trip Card (always show, but empty if no trips) */}
        {(() => {
          if (!trips || trips.length === 0)
            return (
              <Card className="w-full md:w-80 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary opacity-50">
                <CardHeader>
                  <h2>Shortest Trip</h2>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">No data</div>
                </CardContent>
              </Card>
            );
          // ...existing code...
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
            <Card className="w-full md:w-80 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary">
              <CardHeader>
                <h2 className="text-sm font-medium text-muted-foreground">Shortest Trip</h2>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">{shortestTrip.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {minDays} days
                </div>
              </CardContent>
            </Card>
          );
        })()}
        {/* Trip Cost Extremes Card (always show, but empty if no trips) */}
        {(() => {
          if (!trips || trips.length === 0)
            return (
              <Card className="w-full md:w-80 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary opacity-50">
                <CardHeader>
                  <h2>Most and Least expensive trips</h2>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">No data</div>
                </CardContent>
              </Card>
            );
          // ...existing code...
          function getTripCost(trip: Trip) {
            let accommodation = 0;
            let travel = 0;
            let activities = 0;
            if (trip.travelList) {
              for (const t of trip.travelList) {
                const est =
                  typeof t.estimatedCost === "string"
                    ? parseFloat(t.estimatedCost)
                    : 0;
                if (!isNaN(est)) travel += est;
              }
            }
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
            <Card className="w-full md:w-80 m-2 hover:shadow-lg focus:ring-2 focus:ring-primary">
              <CardHeader>
                <h2 className="text-sm font-medium text-muted-foreground">Trip Costs</h2>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Most</div>
                    <div className="text-lg font-semibold">
                      {mostExpensive ? (
                        <>
                          €{getTripCost(mostExpensive).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </div>
                    {mostExpensive && <div className="text-xs text-muted-foreground truncate">{mostExpensive.name}</div>}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Least</div>
                    <div className="text-lg font-semibold">
                      {leastExpensive ? (
                        <>
                          €{getTripCost(leastExpensive).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </div>
                    {leastExpensive && <div className="text-xs text-muted-foreground truncate">{leastExpensive.name}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>
      {/* Totals summary as Cards (always show, but empty if no trips) */}
      {!loading && !error && (
        <div className="flex flex-col lg:flex-row flex-wrap gap-4 mb-6">
          {/* Card 1: Trips, Activities, KMs */}
          <div className="flex flex-col lg:flex-row flex-1 gap-4">
            {/* Left column: Trips & Activities + More Info (stacked) */}
            <div className="flex flex-col flex-1 m-2">
              <Card className="w-full min-w-0 lg:min-w-[260px] flex-1">
                <CardHeader>
                  <h3 className="text-sm font-medium text-muted-foreground">Overview</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="text-2xl font-bold">{trips.length}</div>
                      <div className="text-xs text-muted-foreground">Trips</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold">{getTotalPlannedActivities(trips)}</div>
                      <div className="text-xs text-muted-foreground">Activities</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold">{getTotalKMs(trips).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">KMs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* More Info Card below */}
              <Card className="w-full min-w-0 lg:min-w-[260px] flex-1 mt-4">
                <CardHeader>
                  <h3 className="text-sm font-medium text-muted-foreground">Averages</h3>
                </CardHeader>
                <CardContent>
                  {(() => {
                    if (!trips || trips.length === 0) {
                      return (
                        <div className="text-muted-foreground text-sm">
                          No data
                        </div>
                      );
                    }
                    const breakdown = getPlannedCostsBreakdown(trips);
                    const numTrips = trips.length || 1;
                    const avgAccommodation = breakdown.accommodation / numTrips;
                    const avgActivities = breakdown.activities / numTrips;
                    const avgTravel = breakdown.travel / numTrips;
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
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-lg font-semibold">
                            €{avgAccommodation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-xs text-muted-foreground">Accommodation</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            €{avgActivities.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-xs text-muted-foreground">Activities</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            €{avgTravel.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-xs text-muted-foreground">Travel</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            {avgDuration.toLocaleString(undefined, { maximumFractionDigits: 0 })} days
                          </div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
            {/* Card 2: Cost Breakdown */}
            <Card className="w-full min-w-0 lg:min-w-[260px] flex-1 m-2">
              <CardHeader>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Cost Breakdown
                </h3>
              </CardHeader>
              <CardContent>
                {(() => {
                  if (!trips || trips.length === 0) {
                    return (
                      <div className="text-muted-foreground text-sm">No data</div>
                    );
                  }
                  const breakdown = getPlannedCostsBreakdown(trips);
                  const total = getTotalPlannedCosts(trips);
                  return (
                    <>
                      <OverallCostPieChart
                        total={total}
                        accommodation={breakdown.accommodation}
                        travel={breakdown.travel}
                        activities={breakdown.activities}
                      />
                      <div className="flex gap-4 mt-4 text-xs justify-center">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-sm bg-chart-1"></div>
                          <span className="text-muted-foreground">Accommodation</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-sm bg-chart-2"></div>
                          <span className="text-muted-foreground">Travel</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-sm bg-chart-3"></div>
                          <span className="text-muted-foreground">Activities</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
            {/* Card 3: Activities by Category */}
            <Card className="w-full min-w-0 lg:min-w-[260px] flex-1 m-2">
              <CardHeader>
                <h3 className="text-sm font-medium text-muted-foreground">Activities</h3>
              </CardHeader>
              <CardContent>
                {trips && trips.length > 0 ? (
                  <OverallActivityNumbers trips={trips} />
                ) : (
                  <div className="text-muted-foreground text-sm">No data</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* Overlay for no trips */}
      {showOverlay && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
          style={{ pointerEvents: "auto" }}
        >
          <div className="text-center p-8 rounded-lg shadow-lg bg-white/90 border border-gray-200">
            <p className="text-lg font-semibold mb-4">
              No trips planned yet
            </p>
            <Button
              className="underline"
              onClick={handleStartAdventure}
              style={{ display: "inline-block" }}
              variant="default"
              type="button"
            >
              Start planning
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
