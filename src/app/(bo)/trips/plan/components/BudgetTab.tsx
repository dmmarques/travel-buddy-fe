import BudgetCard from "./budgetComponents/BudgetCard";
import { Trip } from "@/app/(bo)/trips/types/trip";
import { Activity } from "@/app/(bo)/trips/types/activity";
import { useAccommodationStore } from "@/stores/accommodation-store";

interface BudgetTabProps {
  trip: Trip;
  activities: Activity[];
}

export default function BudgetTab({ trip, activities }: BudgetTabProps) {
  const { accommodations } = useAccommodationStore();
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="w-full bg-white rounded-2xl shadow-md flex flex-col justify-between min-h-[600px]">
        <BudgetCard
          budget={trip.budget}
          activities={activities}
          accommodations={accommodations}
          travelList={trip.travelList || []}
          tripStartDate={trip.startDate}
          tripEndDate={trip.endDate}
        />
      </div>
    </div>
  );
}
