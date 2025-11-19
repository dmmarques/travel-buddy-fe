"use client";

import * as React from "react";
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

const BASE_URL = "http://localhost:8080/travel-management-ms";

export default function TripsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const USERNAME = "dmmarques";

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [trips, setTrips] = React.useState<Trip[]>([]);
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

    fetch(`${BASE_URL}/trips/${encodeURIComponent(USERNAME)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setTrips(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error loading trips:", err);
        setError("Failed to load trips. Please try again.");
      })
      .finally(() => {
        if (!isMounted) return;
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 1000);
      });

    return () => {
      isMounted = false;
    };
  }, [USERNAME]);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", onSelect);

    // ...existing code...
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
        creatorUsername: USERNAME,
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
            )}&username=${encodeURIComponent(USERNAME)}`
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
      )}&username=${encodeURIComponent(USERNAME)}`
    );
  };

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
                    ) : trips.length > 0 ? (
                      trips.map((trip, index) => {
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
                                    {typeof trip.budget === "number"
                                      ? `Budget: €${trip.budget}`
                                      : null}
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
                {trips.length > 0 ? `Trip ${current} of ${trips.length}` : "—"}
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
              <CardTitle>Plan Trip</CardTitle>
              <CardDescription>
                Start planning your next adventure
              </CardDescription>
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
                  <input readOnly name="username" value={USERNAME} />
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
