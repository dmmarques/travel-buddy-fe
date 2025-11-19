"use client";

import * as React from "react";
import { getCurrentUser } from "../../../../server/users";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Trip = {
  id?: string | number;
  name: string;
  startDate: string;
  endDate: string;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_TRAVEL_API_BASE_URL ||
  "https://travel-management-fs-production.up.railway.app/travel-management-ms";

export default function AppMap() {
  const router = useRouter();
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [selectedRange, setSelectedRange] = React.useState<
    DateRange | undefined
  >();
  const [hoveredTripId, setHoveredTripId] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState("");

  // Fetch username and then trips
  React.useEffect(() => {
    async function fetchUserAndTrips() {
      try {
        const user = await getCurrentUser();
        const uname = user?.currentUser?.name || "";
        setUsername(uname);
        if (!uname) return;
        const res = await fetch(`${BASE_URL}/trips/${uname}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) setTrips(data);
      } catch (err) {
        console.error("Error fetching trips:", err);
      }
    }
    fetchUserAndTrips();
  }, []);

  // Prepare ranges
  const ranges = React.useMemo(() => {
    const colors = ["range1", "range2", "range3", "range4", "range5"];
    return trips.map((trip, index) => ({
      from: new Date(trip.startDate),
      to: new Date(trip.endDate),
      color: colors[index % colors.length],
      name: trip.name,
      id: trip.id ? String(trip.id) : String(index),
    }));
  }, [trips]);

  // Calendar modifiers
  const modifiers = React.useMemo(() => {
    const mods: Record<string, (date: Date) => boolean> = {};
    ranges.forEach((range) => {
      mods[range.color] = (date: Date) =>
        date >= range.from && date <= range.to;
    });
    return mods;
  }, [ranges]);

  // Base colors
  const modifiersClassNames: Record<string, string> = {
    range1: "bg-blue-200 text-blue-900 rounded-full",
    range2: "bg-green-200 text-green-900 rounded-full",
    range3: "bg-purple-200 text-purple-900 rounded-full",
    range4: "bg-pink-200 text-pink-900 rounded-full",
    range5: "bg-yellow-200 text-yellow-900 rounded-full",
  };

  if (hoveredTripId) {
    const hoveredRange = ranges.find((r) => r.id === hoveredTripId);
    if (hoveredRange) {
      modifiersClassNames[hoveredRange.color] +=
        " ring-2 ring-offset-1 ring-primary";
    }
  }

  // Detect which trip a date belongs to (for calendar hover)
  const getTripIdByDate = (date: Date): string | null => {
    const found = ranges.find((r) => date >= r.from && date <= r.to);
    return found ? found.id : null;
  };

  return (
    <Card className="mx-auto h-full w-full">
      <CardHeader className="border-b flex justify-center">
        <CardTitle className="text-xl font-semibold">My Calendar</CardTitle>
      </CardHeader>
      <CardContent className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col gap-8 w-full max-w-[900px]">
          {/* Calendar */}
          <div className="mx-auto" style={{ width: "fit-content" }}>
            <div className="flex justify-center">
              <div className="transform origin-top">
                <Calendar
                  mode="range"
                  defaultMonth={ranges[0]?.from || new Date()}
                  numberOfMonths={3}
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  className="rounded-lg border shadow-sm"
                  showOutsideDays
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  onDayMouseEnter={(date) => {
                    const tripId = getTripIdByDate(date);
                    setHoveredTripId(tripId);
                  }}
                  onDayMouseLeave={() => setHoveredTripId(null)}
                  onDayClick={(date) => {
                    const tripId = getTripIdByDate(date);
                    if (tripId) {
                      router.push(
                        `/trips/plan?tripId=${encodeURIComponent(
                          tripId
                        )}&mode=view&username=${username}`
                      );
                    }
                  }}
                />
              </div>
            </div>

            {/* Next Trips */}
            <div className="mt-8 text-left">
              <h3 className="text-lg font-medium mb-4">Next Trips</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
                {ranges.length > 0 ? (
                  ranges.map((r) => (
                    <li
                      key={r.id}
                      className={`p-2 rounded cursor-pointer transition ${
                        hoveredTripId === r.id
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                      onMouseEnter={() => setHoveredTripId(r.id)}
                      onMouseLeave={() => setHoveredTripId(null)}
                      onClick={() =>
                        router.push(
                          `/trips/plan?tripId=${encodeURIComponent(
                            r.id
                          )}&mode=view&username=${username}`
                        )
                      }
                    >
                      <span className="font-semibold">{r.name}</span>
                      <div className="text-sm">
                        {r.from.toLocaleDateString()} –{" "}
                        {r.to.toLocaleDateString()}
                      </div>
                    </li>
                  ))
                ) : (
                  <li>No trips found</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
