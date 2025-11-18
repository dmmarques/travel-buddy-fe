import { Card, CardContent } from "@/components/ui/card";
import { Trip } from "@/app/(bo)/trips/types/trip";
import { Sun, Moon } from "lucide-react";
import { differenceInCalendarDays, parseISO } from "date-fns";

interface DurationCardProps {
  trip: Trip;
}

export default function DurationCard({ trip }: DurationCardProps) {
  let days = 0;
  let nights = 0;
  const iconSize = 18;

  if (trip.startDate && trip.endDate) {
    const start = parseISO(trip.startDate);
    const end = parseISO(trip.endDate);
    days = differenceInCalendarDays(end, start) + 1;
    nights = Math.max(days - 1, 0);
  }

  return (
    <Card className="flex-1 mt-2 basis-1/4 flex flex-col p-2 h-full">
      <CardContent className="pt-0 flex-1 grid place-items-center">
        <span className="text-base font-semibold mb-2">Duration</span>
        <div className="flex gap-6 mt-0 justify-center items-center">
          <div className="flex flex-col items-center">
            <Sun size={iconSize} className="text-yellow-500 mb-0.5" />
            <span className="font-medium text-xs leading-tight">{days}</span>
          </div>
          <div className="flex flex-col items-center">
            <Moon size={iconSize} className="text-blue-500 mb-0.5" />
            <span className="font-medium text-xs leading-tight">{nights}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
