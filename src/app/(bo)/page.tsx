"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listTripsByUsername } from "@/app/utilies/api/activities";
import { Trip } from "@/app/(bo)/trips/types/trip";
import {
  getTotalPlannedCosts,
  getTotalKMs,
  getTripStatusTotals,
  getNextIncomingTrip,
} from "@/app/utilies/lib/tripStats";
import { getTotalPlannedActivities } from "@/app/utilies/lib/getTotalPlannedActivities";
import { getPlannedCostsBreakdown } from "@/app/utilies/lib/getPlannedCostsBreakdown";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { OverallCostPieChart } from "@/app/(bo)/landingPage/OverallCostPieChart";
import { OverallActivityNumbers } from "@/app/(bo)/landingPage/OverallActivityNumbers";

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTrips() {
      try {
        const data = await listTripsByUsername("dmmarques");
        setTrips(data as Trip[]);
      } catch {
        setError("Failed to fetch trips");
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  return (
    <main>
      {/* Next Trip Card as Button */}
      {(() => {
        const nextTrip = getNextIncomingTrip(trips);
        const username = "dmmarques"; // TODO: Replace with session/local storage/auth context if needed
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
                      {nextTrip.startDate} to {nextTrip.endDate}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })()}
      {/* Totals summary as Cards */}
      {!loading && !error && trips.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Card 1: Trips, Activities, KMs */}
          <Card className="min-w-[260px] flex-1 m-2">
            <CardHeader>
              <h3 className="text-lg font-semibold">Trips & Activities</h3>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <strong>Total Trips:</strong> {trips.length}
              </div>
              <div className="mb-2">
                <strong>Planned Activities:</strong>{" "}
                {getTotalPlannedActivities(trips)}
              </div>
              <div className="mb-2">
                <strong>Total KMs:</strong>{" "}
                {getTotalKMs(trips).toLocaleString()} km
              </div>
              <div className="mt-4">
                <div className="font-medium">Trip Status:</div>
                {(() => {
                  const totals = getTripStatusTotals(trips);
                  return (
                    <ul className="pl-2 mt-1 text-sm">
                      <li>
                        <strong>Planned:</strong> {totals.planned}
                      </li>
                      <li>
                        <strong>Past:</strong> {totals.past}
                      </li>
                      <li>
                        <strong>Live:</strong> {totals.live}
                      </li>
                      <li>
                        <strong>Incoming:</strong> {totals.incoming}
                      </li>
                    </ul>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
          {/* Card 2: Cost Breakdown */}
          <Card className="min-w-[260px] flex-1 m-2">
            <CardHeader>
              <h3 className="text-lg font-semibold">Cost Breakdown</h3>
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
