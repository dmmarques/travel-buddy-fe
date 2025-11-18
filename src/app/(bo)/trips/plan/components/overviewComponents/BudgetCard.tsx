import { Card, CardContent } from "@/components/ui/card";
import { Trip } from "@/app/(bo)/trips/types/trip";
import { AlertTriangle } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useAccommodationStore } from "@/stores/accommodation-store";

export interface BudgetCardProps {
  trip: Trip;
  onGoToBudgetTab?: () => void;
}

export default function BudgetCard({ trip, onGoToBudgetTab }: BudgetCardProps) {
  // Use global accommodations state for live updates
  const { accommodations } = useAccommodationStore();
  const budget = trip.budget || 0;
  let totalSpending = 0;
  if (Array.isArray(trip.activityList) && Array.isArray(accommodations)) {
    const activitiesCost = trip.activityList.reduce(
      (sum: number, act) => sum + (act.cost || 0),
      0
    );
    const accommodationCost = accommodations.reduce((sum: number, acc) => {
      const checkIn = acc.checkInDate ? new Date(acc.checkInDate) : null;
      const checkOut = acc.checkOutDate ? new Date(acc.checkOutDate) : null;
      let numDays = 1;
      if (checkIn && checkOut) {
        numDays = Math.max(
          1,
          Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          )
        );
      }
      let dailyTotal = 0;
      if (typeof acc.priceForAdult === "number")
        dailyTotal += acc.priceForAdult;
      if (typeof acc.priceForChild === "number")
        dailyTotal += acc.priceForChild;
      if (typeof acc.priceForPet === "number") dailyTotal += acc.priceForPet;
      return sum + dailyTotal * numDays;
    }, 0);
    // Add travel cost (sum of estimatedCost if present and numeric)
    let travelCost = 0;
    if (Array.isArray(trip.travelList)) {
      travelCost = trip.travelList.reduce((sum: number, travel) => {
        const cost = travel.estimatedCost
          ? parseFloat(travel.estimatedCost)
          : 0;
        if (!isNaN(cost)) {
          return sum + cost;
        }
        return sum;
      }, 0);
    }
    totalSpending = activitiesCost + accommodationCost + travelCost;
  }
  const percent = budget > 0 ? (totalSpending / budget) * 100 : 0;
  let iconColor = "#22c55e"; // green-500
  let iconClass = "";
  if (percent >= 90) {
    iconColor = "#ef4444"; // red-500
    iconClass = "flashing-alert";
  } else if (percent >= 75) {
    iconColor = "#eab308"; // yellow-500
    iconClass = "flashing-alert";
  }

  return (
    <button
      type="button"
      className="flex-1 mt-2 basis-1/3 flex flex-col p-0 h-full focus:outline-none cursor-pointer group"
      onClick={onGoToBudgetTab}
      style={{ background: "none", border: "none" }}
    >
      <Card className="flex-1 flex flex-col p-2 h-full w-full transition-colors group-hover:bg-gray-100 group-active:bg-gray-200">
        <CardContent className="pt-0 flex-1 grid place-items-center">
          <span className="text-base font-semibold mb-2 flex items-center gap-1">
            Budget
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="ml-1">
                  <AlertTriangle
                    size={18}
                    color={iconColor}
                    className={iconClass}
                  />
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="text-xs text-center">
                {budget > 0
                  ? `You have used ${percent.toFixed(1)}% of your budget.`
                  : "No budget set"}
              </HoverCardContent>
            </HoverCard>
          </span>
          <div className="text-sm text-gray-600 mb-1 text-center">
            {trip.budget ? `€${trip.budget}` : "No budget set"}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
