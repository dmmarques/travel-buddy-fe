"use client";

import * as React from "react";
import { getCurrentUser } from "../../../../server/users";
import type { DateRange } from "react-day-picker";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import RangeDatePicker from "@/components/common/RangeDatePicker";
import { Sun, Moon } from "lucide-react";
import { LoadingComponent } from "../components/LoadingComponent";
import type { Trip } from "./types/trip";

const BASE_URL =
  process.env.NEXT_PUBLIC_TRAVEL_API_BASE_URL ||
  "https://travel-management-fs-production.up.railway.app/travel-management-ms";

export default function TripsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = React.useState("");

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterDateRange, setFilterDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Create form state
  const [name, setName] = React.useState("");
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchUserAndTrips() {
      try {
        const user = await getCurrentUser();
        const uname = user?.currentUser?.name || "";
        setUsername(uname);
        if (!uname) return;
        const res = await fetch(
          `${BASE_URL}/trips/${encodeURIComponent(uname)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!isMounted) return;
        setTrips(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading trips:", err);
        setError("Failed to load trips. Please try again.");
      } finally {
        if (!isMounted) return;
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 1000);
      }
    }
    fetchUserAndTrips();
    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", onSelect);
  }, [api]);

  const toYMD = (d?: Date) => {
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const from = toYMD(dateRange.from);
    const to = toYMD(dateRange.to);

    if (!name || !from || !to) {
      alert("Please provide a name and a valid date range.");
      return;
    }

    // Save trip in DB via API
    import("../../utilies/api/activities").then(({ createTrip }) => {
      createTrip({
        name,
        startDate: from,
        endDate: to,
        destination: "", // Add destination if needed
        budget: 0, // Add budget if needed
        creatorUsername: username,
        activityList: [],
        accommodations: [],
        travelList: [],
      })
        .then((createdTrip) => {
          console.log("createTrip response:", createdTrip);
          const tripId = createdTrip;
          if (!tripId) {
            alert(
              "Failed to create trip: missing tripId. See console for response."
            );
            return;
          }
          // Open the trip for planning, same as selecting a trip card
          router.push(
            `/trips/plan?mode=view&tripId=${encodeURIComponent(
              String(tripId)
            )}&username=${encodeURIComponent(username)}`
          );
        })
        .catch((err) => {
          console.error("Error creating trip:", err);
          alert("Failed to create trip. Please try again.");
        });
    });
  };

  const handleReset = () => {
    setName("");
    setDateRange({ from: undefined, to: undefined });
  };

  const goToTrip = (trip: Trip) => {
    const tripId = trip.id ?? trip.tripId;
    if (!tripId) {
      alert("This trip does not have a valid id.");
      return;
    }
    router.push(
      `/trips/plan?mode=view&tripId=${encodeURIComponent(
        String(tripId)
      )}&username=${encodeURIComponent(username)}`
    );
  };

  // Helper to check if a trip is within the selected date range
  const isWithinRange = (trip: Trip, range: DateRange) => {
    if (!range.from || !range.to || !trip.startDate || !trip.endDate)
      return true;
    const tripStart = new Date(trip.startDate).setHours(0, 0, 0, 0);
    const tripEnd = new Date(trip.endDate).setHours(0, 0, 0, 0);
    const filterStart = range.from.setHours(0, 0, 0, 0);
    const filterEnd = range.to.setHours(0, 0, 0, 0);
    // Overlap: trip must have at least one day in the range
    return tripEnd >= filterStart && tripStart <= filterEnd;
  };

  // Sort trips by start date ascending
  const sortedTrips = [...trips].sort((a, b) => {
    const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
    const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
    return aDate - bDate;
  });

  // Filter trips by search and date range
  const filteredTrips = sortedTrips.filter((trip) => {
    const matchesSearch = search.trim()
      ? (trip.name || "").toLowerCase().includes(search.trim().toLowerCase())
      : true;
    const matchesDate = isWithinRange(trip, filterDateRange);
    return matchesSearch && matchesDate;
  });

  // Only scroll to the next/live trip on initial mount or when trips change, not on every api or filteredTrips change
  const hasAutoScrolled = React.useRef(false);
  React.useEffect(() => {
    if (!api || filteredTrips.length === 0 || hasAutoScrolled.current) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextIndex = 0;
    for (let i = 0; i < filteredTrips.length; i++) {
      const trip = filteredTrips[i];
      if (trip.startDate && trip.endDate) {
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        if (today >= start && today <= end) {
          nextIndex = i;
          break;
        } else if (today < start) {
          nextIndex = i;
          break;
        }
      }
    }
    api.scrollTo(nextIndex);
    hasAutoScrolled.current = true;
  }, [api, filteredTrips]);

  // Reset auto-scroll if trips change (e.g., after creating a new trip)
  React.useEffect(() => {
    hasAutoScrolled.current = false;
  }, [trips.length]);

  return (
    <div className="flex min-h-[calc(100vh-2rem)] w-full items-center justify-center p-4">
      <div className="flex w-full max-w-5xl items-stretch gap-8">
        {/* Left: Trips Carousel */}
        <div className="flex-1 flex items-center justify-center">
          <div className="mx-auto w-full max-w-sm text-center">
            <Card className="mb-3">
              <CardHeader>
                <CardTitle>Your Trips</CardTitle>
                <CardDescription>Click a card to view details</CardDescription>
              </CardHeader>
              {/* Search & Date Filter Box inside Card */}
              <div className="flex flex-row gap-2 px-4 mb-2 items-center">
                <Input
                  type="text"
                  placeholder="Search trips by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                  aria-label="Search trips by name"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <RangeDatePicker
                    value={filterDateRange}
                    onChange={(range) =>
                      setFilterDateRange(
                        range ?? { from: undefined, to: undefined }
                      )
                    }
                    placeholder=""
                  />
                  {(filterDateRange.from || filterDateRange.to) && (
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Clear date filter"
                      title="Clear date filter"
                      onClick={() =>
                        setFilterDateRange({ from: undefined, to: undefined })
                      }
                      className="ml-1"
                    >
                      <span aria-hidden="true">×</span>
                    </Button>
                  )}
                </div>
              </div>
              <CardContent>
                <Carousel setApi={setApi} className="w-full">
                  <CarouselContent>
                    {loading ? (
                      <CarouselItem>
                        <Card>
                          <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                            <LoadingComponent />
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ) : error ? (
                      <CarouselItem>
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-red-600">{error}</span>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ) : filteredTrips.length > 0 ? (
                      filteredTrips.map((trip, index) => {
                        const label = trip.name || `Trip ${index + 1}`;
                        return (
                          <CarouselItem
                            key={(trip.id ?? trip.tripId ?? index).toString()}
                          >
                            <Card
                              className="cursor-pointer transition-shadow hover:shadow-lg"
                              onClick={() => goToTrip(trip)}
                            >
                              <CardContent className="flex aspect-square items-center justify-center p-6">
                                <div className="space-y-2 w-full">
                                  <div className="text-2xl font-semibold text-center">
                                    {label}
                                  </div>
                                  <div className="text-sm text-muted-foreground text-center">
                                    {trip.destination
                                      ? `Destination: ${trip.destination}`
                                      : "\u200b"}
                                  </div>
                                  <div className="text-xs text-muted-foreground text-center">
                                    {trip.startDate && trip.endDate ? (
                                      <>
                                        {new Date(
                                          trip.startDate
                                        ).toLocaleDateString()}{" "}
                                        -{" "}
                                        {new Date(
                                          trip.endDate
                                        ).toLocaleDateString()}
                                      </>
                                    ) : null}
                                  </div>
                                  <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                                    {trip.startDate && trip.endDate
                                      ? (() => {
                                          const start = new Date(
                                            trip.startDate
                                          );
                                          const end = new Date(trip.endDate);
                                          const msPerDay = 1000 * 60 * 60 * 24;
                                          const days = Math.max(
                                            1,
                                            Math.round(
                                              (end.getTime() -
                                                start.getTime()) /
                                                msPerDay
                                            ) + 1
                                          );
                                          const nights = Math.max(0, days - 1);
                                          return (
                                            <>
                                              <span className="inline-flex items-center gap-1">
                                                <Sun className="w-4 h-4" />
                                                {days}
                                              </span>
                                              <span className="inline-flex items-center gap-1 ml-2">
                                                <Moon className="w-4 h-4" />
                                                {nights}
                                              </span>
                                            </>
                                          );
                                        })()
                                      : null}
                                  </div>
                                  <div className="text-xs text-muted-foreground text-center">
                                    {typeof trip.budget === "number" && (
                                      <>
                                        {`Budget: €${trip.budget}`}
                                        {(() => {
                                          if (trip.startDate && trip.endDate) {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const start = new Date(
                                              trip.startDate
                                            );
                                            const end = new Date(trip.endDate);
                                            start.setHours(0, 0, 0, 0);
                                            end.setHours(0, 0, 0, 0);
                                            if (
                                              today >= start &&
                                              today <= end
                                            ) {
                                              return (
                                                <div className="mt-1">
                                                  <span
                                                    className="text-green-600 animate-blink font-bold"
                                                    style={{
                                                      textShadow:
                                                        "0 0 2px #22c55e",
                                                    }}
                                                  >
                                                    Live
                                                  </span>
                                                </div>
                                              );
                                            } else if (today < start) {
                                              // Future trip: show days left
                                              const msPerDay =
                                                1000 * 60 * 60 * 24;
                                              const daysLeft = Math.ceil(
                                                (start.getTime() -
                                                  today.getTime()) /
                                                  msPerDay
                                              );
                                              return (
                                                <div className="mt-1 font-semibold">
                                                  {daysLeft === 1
                                                    ? "In 1 day"
                                                    : `In ${daysLeft} days`}
                                                </div>
                                              );
                                            } else if (today > end) {
                                              // Past trip: show days passed since end
                                              const msPerDay =
                                                1000 * 60 * 60 * 24;
                                              const daysPassed = Math.ceil(
                                                (today.getTime() -
                                                  end.getTime()) /
                                                  msPerDay
                                              );
                                              return (
                                                <div className="mt-1 text-gray-500 font-semibold">
                                                  {daysPassed === 1
                                                    ? "1 day ago"
                                                    : `${daysPassed} days ago`}
                                                </div>
                                              );
                                            }
                                          }
                                          return null;
                                        })()}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </CarouselItem>
                        );
                      })
                    ) : (
                      <CarouselItem>
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-muted-foreground">
                              No trips found
                            </span>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
              <CardFooter className="justify-center text-sm text-muted-foreground">
                {filteredTrips.length > 0
                  ? `Trip ${current} of ${filteredTrips.length}`
                  : "—"}
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-border" />

        {/* Right: New Trip Planner */}
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-[360px]">
            <CardHeader>
              <CardHeader className="flex flex-col items-center justify-center text-center">
                <CardTitle>Plan Trip</CardTitle>
                <CardDescription>
                  Start planning your next adventure
                </CardDescription>
              </CardHeader>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePlanSubmit}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Name of your trip"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="date">When are you going?</Label>
                    <RangeDatePicker
                      value={dateRange}
                      onChange={(range) =>
                        setDateRange(
                          range ?? { from: undefined, to: undefined }
                        )
                      }
                    />
                  </div>
                </div>
                <div className="sr-only">
                  {/* keep username in URL flow */}
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    readOnly
                    name="username"
                    value={username}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="ghost" onClick={handleReset}>
                Reset
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handlePlanSubmit}
              >
                Plan
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
