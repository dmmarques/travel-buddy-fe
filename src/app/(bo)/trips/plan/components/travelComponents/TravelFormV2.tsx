"use client";

import React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Travel } from "@/app/(bo)/trips/types/travel";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TravelPredictions from "./TravelPredictions";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAIEstimatedTravelCost } from "@/app/utilies/api/aiService";
import { InfoIcon, ReceiptEuro } from "lucide-react";
import { LuFuel } from "react-icons/lu";
import { FaRoad } from "react-icons/fa";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  transport: z.string(),
  fromInput: z.string().min(1),
  fromTimeInput: z.preprocess(
    (arg) =>
      typeof arg === "string" || arg instanceof Date
        ? new Date(arg)
        : undefined,
    z.date()
  ),
  toInput: z.string().min(1),
  toTimeInput: z.preprocess(
    (arg) =>
      typeof arg === "string" || arg instanceof Date
        ? new Date(arg)
        : undefined,
    z.date()
  ),
});

import type { GenTravelCost } from "@/app/(bo)/trips/types/GenTravelCost";
import { Separator } from "@/components/ui/separator";
type TravelFormV2Props = {
  onFromPick?: (coords: { lat: number; lng: number }) => void;
  onToPick?: (coords: { lat: number; lng: number }) => void;
  estimatedDistance?: string;
  estimatedDuration?: string;
  fromCoords?: { lat: number; lng: number };
  toCoords?: { lat: number; lng: number };
  tripId?: string | number;
  onTravelAdded?: (travel: Travel) => void;
  travel?: Travel; // for edit mode
  onTravelEdited?: (travel: Travel) => void;
};

export default function TravelFormV2({
  onFromPick,
  onToPick,
  estimatedDistance,
  estimatedDuration,
  fromCoords,
  toCoords,
  tripId,
  onTravelAdded,
  travel,
  onTravelEdited,
}: TravelFormV2Props) {
  // If editing, use travel.estimatedCost and travel.genTravelCost, else use AI cost
  const [estimatedCost, setEstimatedCost] = React.useState<string>(
    travel?.estimatedCost ? String(travel.estimatedCost) : ""
  );
  const [genTravelCost, setGenTravelCost] = React.useState<
    GenTravelCost | undefined
  >(travel?.genTravelCost);
  const [loadingCost, setLoadingCost] = React.useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: travel
      ? {
          transport: travel.transport,
          fromInput: travel.name?.split(" - ")[0] || "",
          fromTimeInput: travel.departureDate
            ? new Date(travel.departureDate)
            : new Date(),
          toInput: travel.name?.split(" - ")[1] || "",
          toTimeInput: travel.arrivalDate
            ? new Date(travel.arrivalDate)
            : new Date(),
        }
      : {
          transport: "car",
          fromInput: "",
          fromTimeInput: new Date(),
          toInput: "",
          toTimeInput: new Date(),
        },
  });

  // If travel changes (edit mode), reset form values
  React.useEffect(() => {
    if (travel) {
      form.reset({
        transport: travel.transport,
        fromInput: travel.name?.split(" - ")[0] || "",
        fromTimeInput: travel.departureDate
          ? new Date(travel.departureDate)
          : new Date(),
        toInput: travel.name?.split(" - ")[1] || "",
        toTimeInput: travel.arrivalDate
          ? new Date(travel.arrivalDate)
          : new Date(),
      });
    }
  }, [travel, form]);

  // Watch departure time and estimatedDuration to update arrival
  const departure = form.watch("fromTimeInput");
  const duration = estimatedDuration;
  const arrival = React.useMemo(() => {
    if (departure && departure instanceof Date && duration) {
      let totalMinutes = 0;
      const hMatch = duration.match(/(\d+)\s*h/);
      const mMatch = duration.match(/(\d+)\s*min/);
      if (hMatch) totalMinutes += parseInt(hMatch[1], 10) * 60;
      if (mMatch) totalMinutes += parseInt(mMatch[1], 10);
      const arr = new Date(departure.getTime() + totalMinutes * 60000);
      return `${arr.toLocaleDateString()} ${arr.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    return "--";
  }, [departure, duration]);

  // Fetch AI estimated cost when both fromInput and toInput are filled, but only if not editing
  React.useEffect(() => {
    if (travel) return; // Don't fetch if editing
    const fetchCost = async () => {
      const fromInput = form.getValues("fromInput");
      const toInput = form.getValues("toInput");
      if (fromInput && toInput) {
        setLoadingCost(true);
        try {
          const data = (await getAIEstimatedTravelCost(
            fromInput,
            toInput
          )) as GenTravelCost;
          setGenTravelCost(data);
          setEstimatedCost(data.totalCost?.toString() ?? "N/A");
        } catch {
          setGenTravelCost(undefined);
          setEstimatedCost("N/A");
        } finally {
          setLoadingCost(false);
        }
      }
    };
    fetchCost();
  }, [form.watch("fromInput"), form.watch("toInput"), travel]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!fromCoords || !toCoords) {
        toast.error("Please select both origin and destination on the map.");
        return;
      }
      if (!tripId) {
        toast.error("Trip ID is missing.");
        return;
      }
      // Calculate ArrivalDate from departure and estimatedDuration
      let arrivalDate: Date | undefined = undefined;
      if (values.fromTimeInput && estimatedDuration) {
        let totalMinutes = 0;
        const hMatch = estimatedDuration.match(/(\d+)\s*h/);
        const mMatch = estimatedDuration.match(/(\d+)\s*min/);
        if (hMatch) totalMinutes += parseInt(hMatch[1], 10) * 60;
        if (mMatch) totalMinutes += parseInt(mMatch[1], 10);
        arrivalDate = new Date(
          (values.fromTimeInput as Date).getTime() + totalMinutes * 60000
        );
      }
      const travelObj: Travel = {
        name: `${values.fromInput} - ${values.toInput}`,
        transport: values.transport,
        fromLat: String(fromCoords.lat),
        fromLng: String(fromCoords.lng),
        departureDate: values.fromTimeInput,
        toLat: String(toCoords.lat),
        toLng: String(toCoords.lng),
        arrivalDate: arrivalDate || values.toTimeInput,
        estimatedDuration: estimatedDuration || "0",
        distance: estimatedDistance || "0",
        estimatedCost: estimatedCost || "N/A",
        genTravelCost: genTravelCost as GenTravelCost,
      };
      if (travel && onTravelEdited) {
        await onTravelEdited({ ...travel, ...travelObj });
        toast.success("Travel updated!");
      } else if (onTravelAdded) {
        await onTravelAdded(travelObj);
        toast.success("Travel added to trip!");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-5"
      >
        <FormField
          control={form.control}
          name="transport"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex flex-row justify-center space-x-4">
                How are you going ?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-row justify-center space-x-4"
                >
                  {(
                    [
                      ["Car", "car", false],
                      ["Plane", "plane", true],
                      ["Bus", "bus", true],
                    ] as [string, string, boolean][]
                  ).map(([label, value, disabled], index) => (
                    <FormItem
                      className="flex items-center space-x-3 space-y-0"
                      key={index}
                    >
                      <FormControl>
                        <RadioGroupItem value={value} disabled={disabled} />
                      </FormControl>
                      <FormLabel className="font-normal">{label}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row gap-6">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="fromInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    From
                    {travel && travel.name && (
                      <span className="ml-1">
                        - {travel.name.split(" - ")[0]}
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <TravelPredictions
                      onPick={(place) => {
                        // Use main_text and secondary_text if available, else fallback
                        const main =
                          place.structured_formatting?.main_text ||
                          place.description ||
                          "";
                        const secondary =
                          place.structured_formatting?.secondary_text || "";
                        const value = secondary
                          ? `${main}, ${secondary}`
                          : main;
                        field.onChange(value);
                        console.log("Picked place:", place);
                        if (place.geometry?.location) {
                          console.log(
                            "Picked place LAT:",
                            place.geometry.location.lat
                          );
                          console.log(
                            "Picked place LNG:",
                            place.geometry.location.lng
                          );
                        }
                        // If place has geometry/location, call onFromPick
                        if (onFromPick && place.geometry?.location) {
                          const { lat, lng } = place.geometry.location;
                          onFromPick({ lat, lng });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fromTimeInput"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Departure Day & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Input
                        value={
                          field.value && field.value instanceof Date
                            ? `${field.value.toLocaleDateString()} ${field.value.toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}`
                            : ""
                        }
                        readOnly
                        placeholder="Pick a date and time"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          field.value && field.value instanceof Date
                            ? (field.value as Date)
                            : undefined
                        }
                        onSelect={field.onChange}
                        initialFocus
                      />
                      {/* Time Picker */}
                      <div className="flex flex-row gap-2 mt-2 items-center">
                        <label htmlFor="departure-hour" className="text-xs">
                          Hour:
                        </label>
                        <input
                          id="departure-hour"
                          type="number"
                          min={0}
                          max={23}
                          value={
                            field.value && field.value instanceof Date
                              ? field.value.getHours()
                              : ""
                          }
                          onChange={(e) => {
                            if (field.value && field.value instanceof Date) {
                              const newDate = new Date(field.value);
                              newDate.setHours(Number(e.target.value));
                              field.onChange(newDate);
                            }
                          }}
                          className="w-12 border rounded px-1 py-0.5 text-xs"
                        />
                        <label htmlFor="departure-minute" className="text-xs">
                          Min:
                        </label>
                        <input
                          id="departure-minute"
                          type="number"
                          min={0}
                          max={59}
                          value={
                            field.value && field.value instanceof Date
                              ? field.value.getMinutes()
                              : ""
                          }
                          onChange={(e) => {
                            if (field.value && field.value instanceof Date) {
                              const newDate = new Date(field.value);
                              newDate.setMinutes(Number(e.target.value));
                              field.onChange(newDate);
                            }
                          }}
                          className="w-12 border rounded px-1 py-0.5 text-xs"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="toInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    To
                    {travel && travel.name && (
                      <span className="ml-1">
                        - {travel.name.split(" - ")[1]}
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <TravelPredictions
                      onPick={(place) => {
                        // Use main_text and secondary_text if available, else fallback
                        const main =
                          place.structured_formatting?.main_text ||
                          place.description ||
                          "";
                        const secondary =
                          place.structured_formatting?.secondary_text || "";
                        const value = secondary
                          ? `${main}, ${secondary}`
                          : main;
                        field.onChange(value);
                        // If place has geometry/location, call onToPick
                        if (onToPick && place.geometry?.location) {
                          const { lat, lng } = place.geometry.location;
                          onToPick({ lat, lng });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Arrival time is calculated from departure and estimatedDuration, updates live */}
            <FormItem className="flex flex-col">
              <FormLabel>Arrival (calculated)</FormLabel>
              <Input
                value={arrival}
                readOnly
                placeholder="Arrival will be calculated"
              />
            </FormItem>
          </div>
        </div>
        {/* Trip Summary Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-lg shadow-md bg-white dark:bg-slate-900 p-2 mb-0 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-row justify-between gap-1 items-center">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <span className="text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
                    Distance
                  </span>
                  <span className="font-medium text-sm">
                    {estimatedDistance || "-- km"}
                  </span>
                </div>
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <span className="text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
                    Estimated Time
                  </span>
                  <span className="font-medium text-sm">
                    {estimatedDuration || "-- h -- min"}
                  </span>
                </div>
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <span className="text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap flex items-center gap-1">
                    Est. Cost
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          tabIndex={0}
                          aria-label="Show cost breakdown"
                        >
                          <InfoIcon className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-30 p-3 text-xs">
                        <div className="font-semibold mb-3 text-center">
                          Cost
                        </div>
                        {loadingCost ? (
                          <div className="flex justify-center items-center py-4">
                            <Spinner className="size-6" />
                          </div>
                        ) : genTravelCost ? (
                          <div className="relative grid grid-cols-5 gap-0 text-center items-stretch">
                            {/* Top row: Fuel and Toll */}
                            <div className="col-span-2 flex flex-col items-center justify-center">
                              <span className="flex items-center gap-1">
                                <LuFuel className="w-4 h-4 text-black dark:text-white" />
                                <span className="font-medium whitespace-nowrap">
                                  {genTravelCost.fuel} €
                                </span>
                              </span>
                            </div>
                            <div></div>
                            <div className="col-span-2 flex flex-col items-center justify-center">
                              <span className="flex items-center gap-1">
                                <FaRoad className="w-4 h-4 text-black dark:text-white" />
                                <span className="font-medium whitespace-nowrap">
                                  {genTravelCost.tollCost} €
                                </span>
                              </span>
                            </div>
                            {/* Middle row: Equal sign */}
                            <Separator
                              orientation="horizontal"
                              className="col-span-5 my-2"
                            />
                            {/* Bottom row: Total */}
                            <div className="col-span-5 flex flex-col items-center justify-center mt-1">
                              <span className="flex items-center gap-1">
                                <ReceiptEuro className="w-4 h-4 text-black dark:text-white" />
                                <span className="font-medium whitespace-nowrap">
                                  {genTravelCost.totalCost} €
                                </span>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span>No breakdown available.</span>
                        )}
                      </PopoverContent>
                    </Popover>
                  </span>
                  <span className="font-medium text-sm">
                    {loadingCost ? (
                      <Spinner className="size-4" />
                    ) : estimatedCost && estimatedCost !== "N/A" ? (
                      `${estimatedCost} €`
                    ) : (
                      "--"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
