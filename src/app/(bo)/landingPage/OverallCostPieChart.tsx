"use client";
import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
// Removed unused Card and TrendingUp imports
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
export const description = "A donut chart with text";
// Removed unused chartData and chartConfig
export function OverallCostPieChart({
  total,
  accommodation,
  travel,
  activities,
}: {
  total: number;
  accommodation: number;
  travel: number;
  activities: number;
}) {
  const chartData = [
    { name: "Accommodation", value: accommodation, fill: "var(--chart-1)" },
    { name: "Travel", value: travel, fill: "var(--chart-2)" },
    { name: "Activities", value: activities, fill: "var(--chart-3)" },
  ];
  const chartConfig = {
    value: { label: "Cost" },
    Accommodation: { label: "Accommodation", color: "var(--chart-1)" },
    Travel: { label: "Travel", color: "var(--chart-2)" },
    Activities: { label: "Activities", color: "var(--chart-3)" },
  } satisfies ChartConfig;
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {total.toLocaleString(undefined, {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground text-base"
                    >
                      Total
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
