// components/trip/TripOverviewCard.tsx
"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TripOverviewCardProps {
  name: string;
  from: string;
  to: string;
  destination: string;
  setDestination: (val: string) => void;
  budgetLimit: number;
  setBudgetLimit: (val: number) => void;
  spent: number;
  setSpent: (val: number) => void;
  onSave: () => void;
}

export default function TripOverviewCard({
  name,
  from,
  to,
  destination,
  setDestination,
  budgetLimit,
  setBudgetLimit,
  spent,
  setSpent,
  onSave,
}: TripOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          <strong>Name:</strong> {name || "—"}
        </p>
        <p>
          <strong>From:</strong> {from || "—"}
        </p>
        <p>
          <strong>To:</strong> {to || "—"}
        </p>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Budget</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="budget-limit"
                className="block text-sm font-medium"
              >
                Limit
              </label>
              <Input
                id="budget-limit"
                type="number"
                placeholder="Enter limit"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(Number(e.target.value))}
              />
            </div>
            <div>
              <label
                htmlFor="budget-allocated"
                className="block text-sm font-medium"
              >
                Spent
              </label>
              <Input
                id="budget-allocated"
                type="number"
                placeholder="Enter spent"
                value={spent}
                onChange={(e) => setSpent(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Used: {spent || 0}</span>
              <span>Remaining: {Math.max(budgetLimit - spent, 0)}</span>
            </div>
            <div className="relative h-2 w-full rounded bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${
                  spent > budgetLimit ? "bg-red-500" : "bg-primary"
                }`}
                style={{
                  width:
                    budgetLimit > 0
                      ? `${Math.min((spent / budgetLimit) * 100, 100)}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="destination" className="block text-sm font-medium">
            Destination
          </label>
          <Input
            id="destination"
            placeholder="Enter destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            setDestination("");
            setBudgetLimit(0);
            setSpent(0);
          }}
        >
          Reset
        </Button>
        <Button variant="default" onClick={onSave}>
          Save Trip
        </Button>
      </CardFooter>
    </Card>
  );
}
