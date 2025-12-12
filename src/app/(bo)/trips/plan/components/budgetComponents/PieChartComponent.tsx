"use client";

import React from "react";
import { Pie, PieChart } from "recharts";
import {
  Utensils,
  Volleyball,
  Binoculars,
  FerrisWheel,
  HelpCircle,
  Hotel,
  CarFront,
} from "lucide-react";
// Map category names to Lucide icons (black stroke)
const categoryIconMap: Record<string, React.ReactNode> = {
  food: <Utensils className="h-6 w-5" stroke="black" />,
  sport: <Volleyball className="h-5 w-5" stroke="black" />,
  sightseeing: <Binoculars className="h-5 w-5" stroke="black" />,
  entertainment: <FerrisWheel className="h-5 w-5" stroke="black" />,
  other: <HelpCircle className="h-5 w-5" stroke="black" />,
  Accommodation: <Hotel className="h-5 w-5" stroke="black" />,
  Travel: <CarFront className="h-5 w-5" stroke="black" />,
};

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export const description = "A pie chart with a legend";

import type { Activity } from "@/app/(bo)/trips/types/activity";

export interface PieChartTripProps {
  accommodationCost: number;
  travelCost?: number;
  activities: Activity[];
  selectedCategory?: string | null;
  setSelectedCategory?: (category: string) => void;
}

export function PieChartComponent({
  accommodationCost,
  travelCost = 0,
  activities,
  setSelectedCategory,
}: PieChartTripProps) {
  // Group activities by category and sum costs
  const categoryMap: Record<string, number> = {};
  activities.forEach((act) => {
    if (act.category && typeof act.cost === "number") {
      categoryMap[act.category] = (categoryMap[act.category] || 0) + act.cost;
    }
  });
  // Fixed color mapping for categories
  const categoryColors: Record<string, string> = {
    food: "var(--chart-2)",
    sport: "var(--chart-3)",
    sightseeing: "var(--chart-4)",
    entertainment: "var(--chart-5)",
    other: "var(--chart-6)",
  };
  const lightBlue = "#7FDBFF";
  const tripChartData = [
    { name: "Accommodation", value: accommodationCost, fill: "var(--chart-1)" },
    { name: "Travel", value: travelCost, fill: lightBlue },
    ...Object.entries(categoryMap).map(([category, value]) => ({
      name: category,
      value,
      fill: categoryColors[category] || "var(--chart-7)",
    })),
  ];
  const tripChartConfig: ChartConfig = {
    value: { label: "Cost" },
    Accommodation: { label: "Accommodation", color: "var(--chart-1)" },
    Travel: { label: "Travel", color: lightBlue },
    ...Object.entries(categoryMap).reduce((acc, [category]) => {
      acc[category] = {
        label: category,
        color: categoryColors[category] || "var(--chart-7)",
      };
      return acc;
    }, {} as Record<string, { label: string; color: string }>),
  };
  return (
    <Card className="flex flex-col h-full w-full overflow-visible">
      <CardContent className="flex-1 pb-0 pt-2 px-2 overflow-visible">
        <ChartContainer
          config={tripChartConfig}
          className="mx-auto aspect-square max-h-[260px] w-full"
        >
          <PieChart>
            <Pie
              data={tripChartData}
              dataKey="value"
              nameKey="name"
              label={({ name, value }) => `${name}: €${value}`}
              onClick={(data) => {
                if (setSelectedCategory && data && data.name) {
                  setSelectedCategory(data.name);
                }
              }}
            />
            <ChartLegend
              content={<ChartLegendContent />}
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
