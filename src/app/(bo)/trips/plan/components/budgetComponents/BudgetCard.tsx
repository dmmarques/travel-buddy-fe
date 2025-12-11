import React from "react";
import { Card } from "@/components/ui/card";
import { PieChartComponent } from "./PieChartComponent";
import type { Activity } from "@/app/(bo)/trips/types/activity";
import { BarChartComponent } from "./BarChartComponent";
import ProgressChartComponent from "./ProgressChartComponent";

import { Accommodation } from "@/app/(bo)/trips/types/accommodation";
import ExpenseListComponent from "./ExpenseListComponent";

import type { Travel } from "@/app/(bo)/trips/types/travel";

interface BudgetCardProps {
  budget?: number;
  activities: Activity[];
  accommodations?: Accommodation[];
  travelList?: Travel[];
  tripStartDate?: string;
  tripEndDate?: string;
}

export default function BudgetCard({
  budget,
  activities,
  accommodations = [],
  travelList = [],
  tripStartDate,
  tripEndDate,
}: BudgetCardProps) {
  // ...existing code...
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );

  // Generate all days in the trip range
  const generateAllTripDays = (): string[] => {
    if (!tripStartDate || !tripEndDate) return [];
    const days: string[] = [];
    const start = new Date(tripStartDate);
    const end = new Date(tripEndDate);
    const current = new Date(start);

    while (current <= end) {
      days.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  // Restore missing calculations
  const dayStatsMap: Record<string, { cost: number; activitiesCount: number }> =
    {};

  // Initialize all trip days with zero values
  const allTripDays = generateAllTripDays();
  allTripDays.forEach((day) => {
    dayStatsMap[day] = { cost: 0, activitiesCount: 0 };
  });

  // Fill in actual activity data
  activities.forEach((act) => {
    if (act.activityDate) {
      const day = act.activityDate.split("T")[0];
      if (!dayStatsMap[day]) {
        dayStatsMap[day] = { cost: 0, activitiesCount: 0 };
      }
      dayStatsMap[day].cost += act.cost || 0;
      dayStatsMap[day].activitiesCount += 1;
    }
  });

  const barChartData = Object.entries(dayStatsMap)
    .map(([day, stats]) => ({
      day,
      cost: stats.cost,
      activitiesCount: stats.activitiesCount,
    }))
    .sort((a, b) => a.day.localeCompare(b.day)); // Sort by date
  const activitiesCost = activities.reduce(
    (sum, act) => sum + (act.cost || 0),
    0
  );
  const accommodationCost = (accommodations || []).reduce(
    (sum: number, acc) => {
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
    },
    0
  );
  // Calculate total travel cost (sum of estimatedCost if present and numeric)
  const travelCost = (travelList || []).reduce((sum: number, travel) => {
    // estimatedCost is a string, try to parse to number
    const cost = travel.estimatedCost ? parseFloat(travel.estimatedCost) : 0;
    if (!isNaN(cost)) {
      return sum + cost;
    }
    return sum;
  }, 0);
  const totalSpending = activitiesCost + accommodationCost + travelCost;

  return (
    <Card className="flex-1 h-full p-4 md:p-6">
      <div className="flex flex-col lg:flex-row h-full w-full gap-6">
        {/* Left Column - Charts */}
        <div className="w-full lg:w-2/5 h-auto lg:h-full flex flex-col justify-start items-center lg:border-r lg:pr-6">
          {/* Pie Chart - 65% height, full width, colored bg */}
          <div className="w-full overflow-visible">
            <div
              className="min-w-[300px]"
              style={{
                minHeight: "350px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "0.5rem",
              }}
            >
            <PieChartComponent
              accommodationCost={accommodationCost}
              travelCost={travelCost}
              activities={activities}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            </div>
          </div>
          {/* Bar Chart - 35% height, full width, colored bg */}
          <div className="w-full overflow-x-auto mt-2">
            <div
              className="min-w-[300px]"
              style={{
                height: "200px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "0.5rem",
              }}
            >
            <BarChartComponent chartData={barChartData} />
            </div>
          </div>
        </div>
        {/* Right Column - 60% */}
        <div className="w-full lg:w-3/5 h-auto lg:h-full flex flex-col justify-start items-center lg:pl-6">
          {/* Top row: Progress chart (smaller height) */}
          <div
            className="w-full"
            style={{
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <ProgressChartComponent
              budget={budget}
              totalSpending={totalSpending}
            />
          </div>
          {/* Bottom row: Expense List */}
          <div className="w-full flex-1 flex flex-col border rounded text-gray-400 overflow-auto min-h-0">
            <ExpenseListComponent
              activities={activities}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
