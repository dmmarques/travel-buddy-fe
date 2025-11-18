import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

type Prediction = {
  formatted_address?: string;
  description?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
};

import Predictions from "../accommodationComponents/Predictions";

const activitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  cost: z.number().min(0, "Cost must be a non-negative number"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time is required (hh:mm)"),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  onSubmit: (activity: ActivityFormValues) => void;
  defaultDate: Date;
  defaultValues?: Partial<ActivityFormValues>;
  submitLabel?: string;
  onLocationPick?: (location: { lat: number; lng: number } | null) => void;
}

export function ActivityForm({
  onSubmit,
  defaultDate,
  defaultValues,
  submitLabel = "Add Activity",
  onLocationPick,
}: ActivityFormProps) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      address: "",
      cost: 0,
      time: "12:00",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="off"
      >
        <div className="flex gap-4">
          <div className="flex-[0_0_58%]">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Activity name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div style={{ minWidth: 180, maxWidth: 220, width: 200 }}>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger style={{ width: 150 }}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sightseeing">Sightseeing</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="sport">Sport</SelectItem>
                        <SelectItem value="entertainment">
                          Entertainment
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <div>
                  <Input placeholder="Address" {...field} />
                  <Predictions
                    onPick={(prediction: Prediction) => {
                      // Try to get the address from prediction details or fallback to description
                      const address =
                        prediction.formatted_address ||
                        prediction.description ||
                        "";
                      form.setValue("address", address);
                      // If coordinates are available, call onLocationPick
                      if (onLocationPick) {
                        if (
                          prediction.geometry &&
                          prediction.geometry.location
                        ) {
                          const { lat, lng } = prediction.geometry.location;
                          onLocationPick({ lat, lng });
                        } else {
                          onLocationPick(null);
                        }
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-xs text-gray-500 mb-2">
          Activity date: {format(defaultDate, "PPP")} (Time:{" "}
          {form.watch("time")})
        </div>
        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
