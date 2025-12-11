"use client";

import { useEffect, useState } from "react";
import { getSession } from "../../../lib/get-session";
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

  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    async function fetchTrips() {
      try {
        const session = await getSession();
        let name = "";
        if (session && "data" in session && session.data?.user) {
          name = session.data.user.name || session.data.user.email || "";
        }
        setUsername(name);
        if (!name) throw new Error("No username found in session");
        const data = await listTripsByUsername(name);
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
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s an overview of your trips.</p>
        </div>

        {/* Next Trip Card as Button */}
        {(() => {
          const nextTrip = getNextIncomingTrip(trips);
          if (!nextTrip)
            return (
              <Card className="mb-6">
                <CardContent className="py-8">
                  <p className="text-gray-500 text-center">No upcoming trips found.</p>
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
              className="w-full mb-6 cursor-pointer transition-all"
              aria-label="Go to next trip planning"
            >
              <Card className="hover:shadow-lg focus:ring-2 focus:ring-blue-500 transition-shadow">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-blue-600">Your Next Trip</h2>
                </CardHeader>
                <CardContent>
                  <div className="text-lg">
                    <strong className="text-gray-900">{nextTrip.name}</strong>
                    {nextTrip.destination && <span className="text-gray-600"> - {nextTrip.destination}</span>}
                    {nextTrip.startDate && nextTrip.endDate && (
                      <div className="text-sm text-gray-500 mt-2">
                        {nextTrip.startDate} to {nextTrip.endDate}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })()}

        {/* Totals summary as Cards */}
        {!loading && !error && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Card 1: Trips, Activities, KMs */}
            <Card className="flex flex-col">
              <CardHeader>
                <h3 className="text-lg font-semibold">Trips & Activities</h3>
              </CardHeader>
              <CardContent className="flex-1">
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
          <Card className="flex flex-col">
            <CardHeader>
              <h3 className="text-lg font-semibold">Cost Breakdown</h3>
            </CardHeader>
            <CardContent className="flex-1">
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
          <Card className="flex flex-col">
            <CardHeader>
              <h3 className="text-lg font-semibold">Activities by Category</h3>
            </CardHeader>
            <CardContent className="flex-1">
              <OverallActivityNumbers trips={trips} />
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </main>
  );
}
