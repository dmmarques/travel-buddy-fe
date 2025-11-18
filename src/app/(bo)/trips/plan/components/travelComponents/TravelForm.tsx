import React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Predictions from "../accommodationComponents/Predictions";

export type PredictionType = {
  formatted_address?: string;
  description?: string;
  geometry?: {
    location: { lat: number; lng: number };
  };
};

export type TravelFormFields = { origin: string; destination: string };
export type TravelFormProps = {
  form: ReturnType<typeof import("react-hook-form").useForm<TravelFormFields>>;
  onOriginPick: (prediction: PredictionType) => void;
  onDestinationPick: (prediction: PredictionType) => void;
  onSubmit: (data: TravelFormFields) => void;
  disabled?: boolean;
  buttonLabel?: string;
};

export default function TravelForm({
  form,
  onOriginPick,
  onDestinationPick,
  onSubmit,
  disabled = false,
  buttonLabel = "Add Travel",
}: TravelFormProps) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 bg-white p-4 rounded-lg shadow relative"
        autoComplete="off"
        style={{
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        <div className="flex-1">
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From</FormLabel>
                <FormControl>
                  <div>
                    <Input
                      placeholder="From where are you going ?"
                      {...field}
                      disabled={disabled}
                    />
                    <Predictions onPick={onOriginPick} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex-1">
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To</FormLabel>
                <FormControl>
                  <div>
                    <Input
                      placeholder="To where are you going ?"
                      {...field}
                      disabled={disabled}
                    />
                    <Predictions onPick={onDestinationPick} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full" disabled={disabled}>
            {buttonLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
