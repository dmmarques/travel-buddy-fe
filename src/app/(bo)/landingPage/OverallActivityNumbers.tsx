"use client";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trip } from "@/app/(bo)/trips/types/trip";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function OverallActivityNumbers({ trips }: { trips: Trip[] }) {
  // Define the fixed categories as in Itinerary
  const ACTIVITY_CATEGORIES = [
    { value: "sightseeing", label: "Sightseeing" },
    { value: "food", label: "Food" },
    { value: "sport", label: "Sport" },
    { value: "entertainment", label: "Entertainment" },
    { value: "other", label: "Other" },
  ];
  // Category colors matching Itinerary
  const categoryColors: Record<string, string> = {
    food: "var(--chart-2)",
    sport: "var(--chart-3)",
    sightseeing: "var(--chart-4)",
    entertainment: "var(--chart-5)",
    other: "var(--chart-6)",
  };

  // Gather all activities from all trips
  const allActivities = (trips ?? []).flatMap(
    (trip) => trip.activityList ?? []
  );
  // Count activities by category
  const categoryCounts: Record<string, number> = {};
  allActivities.forEach((activity) => {
    if (!activity.category) return;
    categoryCounts[activity.category] =
      (categoryCounts[activity.category] || 0) + 1;
  });
  // Prepare chart data: always show all categories, even if zero
  const chartData = ACTIVITY_CATEGORIES.map(({ value, label }) => ({
    category: label,
    value,
    count: categoryCounts[value] || 0,
  }));
  const chartConfig = {
    count: {
      label: "Total",
      color: "var(--chart-1)", // fallback, not used
    },
  } satisfies ChartConfig;
  return (
    <Card>
      <CardHeader>
        <CardDescription>Sum of all activities across trips</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            height={320}
            margin={{ top: 40 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={8} name="">
              {chartData.map((entry) => (
                <Cell
                  key={entry.value}
                  fill={categoryColors[entry.value] || "var(--chart-7)"}
                />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
