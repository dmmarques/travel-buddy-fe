"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DaySlide } from "../days/DaySlide";
import type { Activity } from "../../trips/types/activity";

type Trip = {
  id?: string | number;
  tripId?: string | number;
  name: string;
  destination?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  budget?: number;
  spent?: number;
  creatorUsername?: string;
  participantUsernames?: string[];
  username?: string;
  activities?: Activity[];
};

const BASE_URL = "http://localhost:8080/travel-management-ms";

function toYMD(d?: Date | string) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toStartOfDayIso(dateYmd: string) {
  if (!dateYmd) return "";
  // keep local midnight; adjust to your backend expectations if needed (e.g., add 'Z')
  return `${dateYmd}T00:00:00`;
}

export default function PlanTripPage() {
  // Group activities by date: YYYY-MM-DD -> Activity[]
  const [activitiesByDay, setActivitiesByDay] = React.useState<
    Record<string, Activity[]>
  >({});
  // Local date key (no timezone surprises from toISOString)
  const dateKey = React.useCallback((d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }, []);

  // trip state
  const [tripData, setTripData] = React.useState<Trip | null>(null);

  // Compute activitiesByDay from tripData.activities if available
  React.useEffect(() => {
    if (!tripData || !Array.isArray(tripData.activities)) return;
    const grouped: Record<string, Activity[]> = {};
    alert(JSON.stringify(tripData.activities));
    for (const activity of tripData.activities) {
      // Use the correct property for the activity date (adjust as needed)
      const activityWithDate = activity as { date?: string };
      const activityDate = activityWithDate.date;
      if (!activityDate) continue;
      const key = dateKey(new Date(activityDate));
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(activity);
    }
    setActivitiesByDay(grouped);
  }, [tripData, dateKey]);

  // Local date key (no timezone surprises from toISOString)
  const router = useRouter();
  const searchParams = useSearchParams();

  const modeParam = (searchParams.get("mode") ?? "create").toLowerCase() as
    | "create"
    | "view"
    | "edit";
  const [mode, setMode] = React.useState<"create" | "view" | "edit">(modeParam);

  const tripId = searchParams.get("tripId") ?? undefined;
  const initialName = searchParams.get("name") ?? "";
  const initialFrom = searchParams.get("from") ?? "";
  const initialTo = searchParams.get("to") ?? "";
  //TODO: REPLACE BY SESSION LOCAL STORAGE OR AUTH CONTEXT
  const USERNAME = searchParams.get("username") ?? "dmmarques";

  // carousel state
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  // trip state
  // (removed duplicate tripData declaration)
  const [loading, setLoading] = React.useState<boolean>(!!tripId);
  const [error, setError] = React.useState<string | null>(null);

  // form fields
  const [name, setName] = React.useState<string>(initialName);
  const [from, setFrom] = React.useState<string>(initialFrom);
  const [to, setTo] = React.useState<string>(initialTo);
  const [destination, setDestination] = React.useState<string>("");
  const [budgetLimit, setBudgetLimit] = React.useState<number>(0);
  const [spent, setSpent] = React.useState<number>(0);

  // days for slides
  const days: Date[] = React.useMemo(() => {
    const fromYmd = from || toYMD(tripData?.startDate);
    const toYmd = to || toYMD(tripData?.endDate);
    if (!fromYmd || !toYmd) return [];
    const start = new Date(fromYmd);
    const end = new Date(toYmd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
    const list: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      list.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return list;
  }, [from, to, tripData?.startDate, tripData?.endDate]);

  const slides = React.useMemo(
    () => [
      { key: "overview", label: "Overview" },
      ...days.map((d, i) => ({
        key: `day-${i + 1}`,
        label: `Day ${i + 1} – ${d.toLocaleDateString()}`,
        date: d,
      })),
    ],
    [days]
  );

  React.useEffect(() => {
    if (!tripId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(
      `${BASE_URL}/trips?username=${encodeURIComponent(
        USERNAME
      )}&tripId=${encodeURIComponent(tripId)}`
    )
      .then(async (res) => {
        console.log("Fetch trip response:");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Trip) => {
        if (!isMounted) return;
        setTripData(data);
        setName(data.name ?? "");
        setDestination(data.destination ?? "");
        setBudgetLimit(Number(data.budget ?? 0));
        setSpent(Number(data.spent ?? 0));

        // Respect URL from/to if provided, otherwise use trip data
        if (!initialFrom) setFrom(toYMD(data.startDate));
        if (!initialTo) setTo(toYMD(data.endDate));
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching trip:", err);
        setError(
          "Failed to load this trip. It may have been deleted or the link is invalid."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  // carousel selection handling
  React.useEffect(() => {
    if (!api) return;
    setActiveIndex(api.selectedScrollSnap());
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
  }, [api]);

  const goToSlide = (i: number) => api?.scrollTo(i);

  const disabled = mode === "view" || loading;

  const handleReset = () => {
    if (tripData) {
      // reset to loaded data
      setName(tripData.name ?? "");
      setDestination(tripData.destination ?? "");
      setBudgetLimit(Number(tripData.budget ?? 0));
      setSpent(Number(tripData.spent ?? 0));
      setFrom(toYMD(tripData.startDate));
      setTo(toYMD(tripData.endDate));
    } else {
      // clear for create mode
      setName(initialName ?? "");
      setDestination("");
      setBudgetLimit(0);
      setSpent(0);
      setFrom(initialFrom ?? "");
      setTo(initialTo ?? "");
    }
  };

  const handleSave = async () => {
    // basic validation
    if (!name) {
      alert("Please provide a trip name.");
      return;
    }
    if (!from || !to) {
      alert("Please provide a valid date range.");
      return;
    }

    // Resolve update vs create smartly
    const resolvedTripId =
      tripId ?? (tripData?.tripId ?? tripData?.id)?.toString();

    const isUpdate = Boolean(resolvedTripId);

    // Coerce numeric fields safely
    const budgetNum = Number.isFinite(budgetLimit) ? Number(budgetLimit) : 0;
    const spentNum = Number.isFinite(spent) ? Number(spent) : 0;

    // Base you already have / you may enrich as needed
    const base: Trip = tripData ?? {
      name,
      destination,
      budget: budgetNum,
      spent: spentNum,
      creatorUsername: USERNAME,
      participantUsernames: [USERNAME],
      username: USERNAME,
    };

    const payload: Trip = {
      ...base,
      // ensure we send the current values from the form
      name,
      destination,
      budget: budgetNum,
      spent: spentNum,
      startDate: toStartOfDayIso(from),
      endDate: toStartOfDayIso(to),
      creatorUsername: base.creatorUsername ?? USERNAME,
      participantUsernames: base.participantUsernames ?? [USERNAME],
      username: base.username ?? USERNAME,
      ...(isUpdate ? { tripId: resolvedTripId } : {}),
    };

    // Use one endpoint with method switching and include username in the query (consistent with your GET)
    const qs = new URLSearchParams({ username: USERNAME }).toString();
    const url = `${BASE_URL}/trips/trip?${qs}`;
    const method = isUpdate ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // try to read text for better debugging
        const errText = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${errText}`);
      }

      // Prefer JSON response from API (if available)
      let responseBody: Trip | string | null = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        responseBody = (await res.json()) as Trip;
      } else {
        responseBody = await res.text();
      }

      if (isUpdate) {
        alert("Trip updated successfully!");
        // If API returns updated trip, sync local state
        if (responseBody && typeof responseBody === "object") {
          setTripData(responseBody);
          // also sync form values in case backend normalized anything
          setName(responseBody.name ?? name);
          setDestination(responseBody.destination ?? destination);
          setBudgetLimit(Number(responseBody.budget ?? budgetNum));
          setSpent(Number(responseBody.spent ?? spentNum));
          if (responseBody.startDate) setFrom(toYMD(responseBody.startDate));
          if (responseBody.endDate) setTo(toYMD(responseBody.endDate));
        }
        setMode("view");
      } else {
        console.log("Trip created:", responseBody);
        alert("Trip created successfully!");
        router.push(`/trips?username=${encodeURIComponent(USERNAME)}`);
      }
    } catch (err) {
      console.error("Error saving trip:", err);
      alert("Failed to save trip. Please check console for details.");
    }
  };

  const handleEnterEdit = () => {
    setMode("edit");
  };

  const remaining = Math.max((budgetLimit ?? 0) - (spent ?? 0), 0);
  const usagePct =
    (budgetLimit ?? 0) > 0
      ? Math.min(((spent ?? 0) / (budgetLimit ?? 0)) * 100, 100)
      : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">
          {mode === "create"
            ? "Create Trip"
            : mode === "edit"
            ? "Edit Trip"
            : "Trip Details"}
        </h1>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          Loading…
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
          {/* Main area (centered carousel) */}
          <section className="flex justify-center">
            <Carousel setApi={setApi} className="w-full max-w-3xl">
              <CarouselContent>
                {/* Slide 0: Overview */}
                <CarouselItem className="basis-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trip Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <label
                          htmlFor="trip-name"
                          className="block text-sm font-medium"
                        >
                          Name
                        </label>
                        <Input
                          id="trip-name"
                          placeholder="Trip name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={disabled}
                        />
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="from"
                            className="block text-sm font-medium"
                          >
                            From
                          </label>
                          <Input
                            id="from"
                            placeholder="YYYY-MM-DD"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            disabled={disabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="to"
                            className="block text-sm font-medium"
                          >
                            To
                          </label>
                          <Input
                            id="to"
                            placeholder="YYYY-MM-DD"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            disabled={disabled}
                          />
                        </div>
                      </div>

                      {/* Budget Section */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Budget</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="budget-limit"
                              className="block text-sm font-medium"
                            >
                              Limit
                            </label>
                            <Input
                              id="budget-limit"
                              type="number"
                              placeholder="Enter limit"
                              value={
                                Number.isFinite(budgetLimit) ? budgetLimit : 0
                              }
                              onChange={(e) =>
                                setBudgetLimit(Number(e.target.value || 0))
                              }
                              disabled={disabled}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="budget-spent"
                              className="block text-sm font-medium"
                            >
                              Spent
                            </label>
                            <Input
                              id="budget-spent"
                              type="number"
                              placeholder="Enter spent"
                              value={Number.isFinite(spent) ? spent : 0}
                              onChange={(e) =>
                                setSpent(Number(e.target.value || 0))
                              }
                              disabled={disabled}
                            />
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>
                              Used: {Number.isFinite(spent) ? spent : 0}
                            </span>
                            <span>Remaining: {remaining}</span>
                          </div>
                          <div className="relative h-2 w-full overflow-hidden rounded bg-muted">
                            <div
                              className={`h-full transition-all ${
                                spent > budgetLimit
                                  ? "bg-red-500"
                                  : "bg-primary"
                              }`}
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Destination */}
                      <div className="space-y-2">
                        <label
                          htmlFor="destination"
                          className="block text-sm font-medium"
                        >
                          Destination
                        </label>
                        <Input
                          id="destination"
                          placeholder="Enter destination"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          disabled={disabled}
                        />
                      </div>

                      {/* Footer Buttons */}
                      <CardFooter className="flex flex-wrap gap-2 justify-between p-0 pt-4">
                        <div className="flex gap-2">
                          {mode === "view" ? (
                            <Button variant="default" onClick={handleEnterEdit}>
                              Edit
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                type="button"
                                onClick={handleReset}
                              >
                                Reset
                              </Button>
                              <Button
                                variant="default"
                                type="button"
                                onClick={handleSave}
                                disabled={loading}
                              >
                                {tripId ? "Update Trip" : "Create Trip"}
                              </Button>
                            </>
                          )}
                        </div>
                      </CardFooter>
                    </CardContent>
                  </Card>
                </CarouselItem>

                {/* Slides for each day */}
                {days.map((day) => {
                  const key = dateKey(day);
                  const activities = activitiesByDay[key] ?? [];
                  return (
                    <CarouselItem key={key} className="basis-full">
                      {/* DaySlide already renders a Card, so no extra Card wrapper here */}
                      <DaySlide
                        date={day}
                        initialActivities={activities}
                        disabled={disabled}
                        onChange={(updated) => {
                          setActivitiesByDay((prev) => ({
                            ...prev,
                            [key]: updated,
                          }));
                        }}
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>

          {/* Right menu (slide index + quick nav) */}
          <aside className="hidden md:block">
            <div className="sticky top-6">
              <div className="mb-2 text-sm font-medium text-muted-foreground">
                Trip sections
              </div>
              <div className="overflow-hidden rounded-md border">
                <nav aria-label="Trip sections">
                  {slides.map((s, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <button
                        key={s.key}
                        onClick={() => goToSlide(i)}
                        className={[
                          "block w-full px-3 py-2 text-left text-sm transition-colors",
                          "hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "border-b last:border-0",
                          isActive
                            ? "bg-primary/10 font-semibold"
                            : "bg-background",
                        ].join(" ")}
                        aria-current={isActive ? "true" : "false"}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {activeIndex + 1} / {slides.length}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
