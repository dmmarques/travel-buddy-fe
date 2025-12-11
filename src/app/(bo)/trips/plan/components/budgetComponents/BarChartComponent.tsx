"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import React from "react";

export const description = "A bar chart with a label";

export function BarChartComponent({
  chartData,
}: {
  chartData: { day: string; cost: number; activitiesCount: number }[];
}) {
  const config = {
    cost: {
      label: "Cost",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;
  return (
    <ChartContainer
      config={config}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        width={400}
        height={180}
        margin={{ top: 20, bottom: 30 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.split("T")[0]}
        />
        <ChartTooltip
          cursor={false}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div
                  style={{
                    background: "white",
                    padding: 12,
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <div>
                    <strong>Cost:</strong> {data.cost}
                  </div>
                  <div>
                    <strong>Activities:</strong> {data.activitiesCount}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="cost" fill="var(--color-desktop)" radius={8}>
          <LabelList position="inside" className="fill-white" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
