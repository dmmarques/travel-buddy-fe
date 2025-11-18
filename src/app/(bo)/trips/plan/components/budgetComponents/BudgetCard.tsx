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
}

export default function BudgetCard({
  budget,
  activities,
  accommodations = [],
  travelList = [],
}: BudgetCardProps) {
  // ...existing code...
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );

  // Restore missing calculations
  const dayStatsMap: Record<string, { cost: number; activitiesCount: number }> =
    {};
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
  const barChartData = Object.entries(dayStatsMap).map(([day, stats]) => ({
    day,
    cost: stats.cost,
    activitiesCount: stats.activitiesCount,
  }));
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
    <Card className="flex-1 h-full p-6">
      <div className="flex h-full w-full">
        {/* Left Column - 40% */}
        <div className="w-2/5 h-full flex flex-col justify-center items-center border-r pr-6">
          {/* Pie Chart - 65% height, full width, colored bg */}
          <div
            className="w-full"
            style={{
              height: "65%",
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
          {/* Bar Chart - 35% height, full width, colored bg */}
          <div
            className="w-full mt-2"
            style={{
              height: "35%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "0.5rem",
            }}
          >
            <BarChartComponent chartData={barChartData} />
          </div>
        </div>
        {/* Right Column - 60% */}
        <div className="w-3/5 h-full flex flex-col justify-center items-center pl-6">
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
          <div className="w-full flex-1 flex items-center justify-center border rounded text-gray-400">
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
