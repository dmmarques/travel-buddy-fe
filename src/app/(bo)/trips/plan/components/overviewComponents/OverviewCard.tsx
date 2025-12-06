"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Utensils,
  Volleyball,
  Binoculars,
  FerrisWheel,
  HelpCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Trip } from "@/app/(bo)/trips/types/trip";
import { updateTrip } from "@/app/utilies/api/activities";

interface OverviewCardProps {
  trip: Trip;
  onTripUpdate?: (trip: Trip) => void;
}

const formSchema = z.object({
  tripName: z.string().min(1),
  date: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }),
  budget: z
    .number()
    .min(0, { message: "Budget must be at least 0" })
    .optional(),
  preferences: z.array(z.string()).optional(),
});

export default function OverviewCard({
  trip,
  onTripUpdate,
}: OverviewCardProps) {
  const [showSaved, setShowSaved] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripName: trip.name || "",
      date: {
        from: trip.startDate ? new Date(trip.startDate) : undefined,
        to: trip.endDate ? new Date(trip.endDate) : undefined,
      },
      budget: typeof trip.budget === "number" ? trip.budget : undefined,
      preferences: Array.isArray(trip.preferences) ? trip.preferences : [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload: Partial<Trip> & { preferenceList?: string[] } = {
        name: values.tripName,
        startDate: values.date.from
          ? format(values.date.from, "yyyy-MM-dd")
          : undefined,
        endDate: values.date.to
          ? format(values.date.to, "yyyy-MM-dd")
          : undefined,
        budget: typeof values.budget === "number" ? values.budget : undefined,
        preferenceList: values.preferences,
      };
      console.log("Submitting form with values:", payload);
      await updateTrip(trip.id ?? trip.tripId!, payload);
      toast.success("Trip updated successfully!");
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1500);
      // Reset form to current values to clear dirty state and disable buttons
      form.reset({
        tripName: values.tripName,
        date: values.date,
        budget: values.budget,
        preferences: values.preferences,
      });
      // Call onTripUpdate if provided
      if (typeof onTripUpdate === "function") {
        onTripUpdate({
          ...trip,
          name: values.tripName,
          startDate: values.date.from
            ? format(values.date.from, "yyyy-MM-dd")
            : undefined,
          endDate: values.date.to
            ? format(values.date.to, "yyyy-MM-dd")
            : undefined,
          budget: typeof values.budget === "number" ? values.budget : undefined,
          preferences: values.preferences,
        });
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to update the trip. Please try again.");
    }
  }

  return (
    <Card className="p-4 mt-2 mb-4 h-1/2 flex flex-col justify-center relative overflow-hidden">
      {/* Animated checkmark on save - full card overlay */}
      <div
        className={
          "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 transition-opacity duration-500 z-20 " +
          (showSaved ? "opacity-100" : "opacity-0 pointer-events-none")
        }
      >
        <CheckCircle2 className="w-12 h-12 text-green-600" />
        <span className="text-green-700 font-semibold text-xl">
          Trip Updated!
        </span>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 max-w-2xl w-full mx-auto py-2 flex-1 overflow-auto relative"
          style={{ maxHeight: "100%", minHeight: 0 }}
        >
          <FormField
            control={form.control}
            name="tripName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Trip Name"
                    type="text"
                    {...field}
                    className="w-40"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="m-0">Budget</FormLabel>
                </div>
                <FormControl>
                  <Input
                    placeholder="Budget"
                    type="number"
                    min={0}
                    step={0.01}
                    {...field}
                    value={field.value ?? ""}
                    className="w-32"
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? undefined : Number(val));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex items-center gap-2">
                  <FormLabel className="m-0">Dates</FormLabel>
                  <span className="text-[10px] text-muted-foreground">
                    YYYY-MM-DD
                  </span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value?.from && "text-muted-foreground"
                        )}
                      >
                        {field.value?.from || field.value?.to ? (
                          field.value.from && field.value.to ? (
                            `${format(
                              field.value.from,
                              "yyyy-MM-dd"
                            )} - ${format(field.value.to, "yyyy-MM-dd")}`
                          ) : field.value.from ? (
                            format(field.value.from, "yyyy-MM-dd")
                          ) : field.value.to ? (
                            format(field.value.to, "yyyy-MM-dd")
                          ) : null
                        ) : (
                          <span>Year - Month - Day</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={
                        field.value as {
                          from: Date | undefined;
                          to: Date | undefined;
                        }
                      }
                      onSelect={field.onChange}
                      initialFocus
                      month={
                        (field.value?.from as Date | undefined) ||
                        (field.value?.to as Date | undefined) ||
                        (trip.startDate ? new Date(trip.startDate) : undefined)
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferences"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="m-0">Preferences</FormLabel>
                </div>
                <FormControl>
                  <ToggleGroup
                    type="multiple"
                    value={field.value ?? []}
                    onValueChange={(val) => field.onChange(val)}
                    className="gap-2"
                  >
                    <div className="relative group">
                      <ToggleGroupItem
                        value="sightseeing"
                        aria-label="Sightseeing"
                        className="data-[state=on]:bg-[var(--chart-4)] data-[state=on]:text-white"
                      >
                        <Binoculars className="h-6 w-6" />
                      </ToggleGroupItem>
                      <span className="absolute left-0 translate-x-0 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                        Sightseeing
                      </span>
                    </div>
                    <div className="relative group">
                      <ToggleGroupItem
                        value="food"
                        aria-label="Food"
                        className="data-[state=on]:bg-[var(--chart-2)] data-[state=on]:text-white"
                      >
                        <Utensils className="h-6 w-6" />
                      </ToggleGroupItem>
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                        Food
                      </span>
                    </div>
                    <div className="relative group">
                      <ToggleGroupItem
                        value="sport"
                        aria-label="Sport"
                        className="data-[state=on]:bg-[var(--chart-3)] data-[state=on]:text-white"
                      >
                        <Volleyball className="h-6 w-6" />
                      </ToggleGroupItem>
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                        Sport
                      </span>
                    </div>
                    <div className="relative group">
                      <ToggleGroupItem
                        value="entertainment"
                        aria-label="Entertainment"
                        className="data-[state=on]:bg-[var(--chart-5)] data-[state=on]:text-black"
                      >
                        <FerrisWheel className="h-6 w-6" />
                      </ToggleGroupItem>
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                        Entertainment
                      </span>
                    </div>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* </div><div className="flex gap-2"> */}
          <div className="flex gap-2 absolute bottom-0 right-0 p-4">
            <Button type="submit" disabled={!form.formState.isDirty}>
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!form.formState.isDirty}
              onClick={() => form.reset()}
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
