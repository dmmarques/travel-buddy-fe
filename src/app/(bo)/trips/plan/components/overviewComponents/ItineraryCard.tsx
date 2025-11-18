import { Card } from "@/components/ui/card";
import { Trip } from "@/app/(bo)/trips/types/trip";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  format,
  addDays,
  differenceInCalendarDays,
  parseISO,
  isSameDay,
} from "date-fns";

import type { Activity } from "@/app/(bo)/trips/types/activity";

interface ItineraryCardProps {
  trip: Trip;
  activities: Activity[];
  onGoToItineraryTab?: (day: Date) => void;
}

export default function ItineraryCard({
  trip,
  activities,
  onGoToItineraryTab,
}: ItineraryCardProps) {
  // Parse start and end dates
  const start = trip.startDate ? parseISO(trip.startDate) : null;
  const end = trip.endDate ? parseISO(trip.endDate) : null;

  const days: Date[] = [];
  if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
    const numDays = differenceInCalendarDays(end, start) + 1;
    for (let i = 0; i < numDays; i++) {
      days.push(addDays(start, i));
    }
  }

  // Use activities prop for summary

  return (
    <Card className="p-4 mt-4 mb-4 h-1/4 flex flex-col justify-center">
      <Carousel>
        <CarouselContent>
          {days.length > 0 ? (
            days.map((day, idx) => {
              // Activities for this day
              const activitiesForDay = activities.filter((a) => {
                if (!a.activityDate) return false;
                const activityDate =
                  typeof a.activityDate === "string"
                    ? parseISO(a.activityDate)
                    : a.activityDate;
                if (
                  !(activityDate instanceof Date) ||
                  isNaN(activityDate.getTime())
                )
                  return false;
                // Use isSameDay from date-fns for comparison
                return isSameDay(activityDate, day);
              });
              const totalCost = activitiesForDay.reduce(
                (sum, a) => sum + (Number(a.cost) || 0),
                0
              );
              return (
                <CarouselItem key={idx}>
                  <div className="flex flex-row h-32 w-full bg-white rounded transition shadow-sm border hover:bg-gray-50">
                    {/* Left: Day button */}
                    <button
                      className="flex flex-col items-center justify-center w-1/2 h-full focus:outline-none hover:bg-gray-100 rounded-l"
                      type="button"
                      onClick={() =>
                        onGoToItineraryTab && onGoToItineraryTab(day)
                      }
                    >
                      <span className="text-lg font-semibold">
                        Day {idx + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(day, "PPP")}
                      </span>
                    </button>
                    {/* Vertical separator */}
                    <div className="w-px bg-gray-300 h-4/5 self-center" />
                    {/* Right: Summary */}
                    <div className="flex flex-col justify-center w-1/2 h-full px-4">
                      <span className="text-sm text-gray-500 mt-1">
                        Total activities: {activitiesForDay.length}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        Estimated cost: €{totalCost}
                      </span>
                    </div>
                  </div>
                </CarouselItem>
              );
            })
          ) : (
            <CarouselItem>
              <div className="flex flex-col items-center justify-center h-32">
                <span className="text-lg font-semibold">No trip days</span>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </Card>
  );
}
