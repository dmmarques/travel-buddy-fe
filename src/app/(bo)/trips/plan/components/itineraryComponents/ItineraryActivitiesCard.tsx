import { addActivityToTrip, editActivity } from "@/app/utilies/api/activities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { columns as baseColumns } from "./table/columns";
import { DataTable } from "./table/data-table";
import {
  format,
  parseISO,
  addDays,
  isSameDay,
  differenceInCalendarDays,
} from "date-fns";
import { Trip } from "@/app/(bo)/trips/types/trip";
import { deleteActivity } from "@/app/utilies/api/activities";
import { toast } from "sonner";
import React from "react";

import { useState } from "react";
import { X } from "lucide-react";
import { ActivityForm } from "./ActivityForm";

import type { Activity } from "@/app/(bo)/trips/types/activity";
interface ItineraryActivitiesCardProps {
  trip: Trip;
  selectedDay: Date | null;
  setSelectedDay: (day: Date) => void;
  onLocationPick?: (location: { lat: number; lng: number } | null) => void;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

function getTripDays(startDate?: string, endDate?: string): Date[] {
  if (!startDate || !endDate) return [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = [];
  for (let i = 0; i <= differenceInCalendarDays(end, start); i++) {
    days.push(addDays(start, i));
  }
  return days;
}

export default function ItineraryActivitiesCard({
  trip,
  selectedDay,
  setSelectedDay,
  onLocationPick,
  activities,
  setActivities,
}: ItineraryActivitiesCardProps) {
  const days = getTripDays(trip.startDate, trip.endDate);
  const [open, setOpen] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // State for editing
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Filter activities for the selected day
  const activitiesForDay = selectedDay
    ? activities.filter((a) => isSameDay(parseISO(a.activityDate), selectedDay))
    : [];

  // Calculate total cost for the selected day
  const totalCost = activitiesForDay.reduce(
    (sum, a) => sum + (Number(a.cost) || 0),
    0
  );

  return (
    <Card className="flex-1 flex flex-col relative">
      {/* Top bar with days */}
      <div className="flex gap-1 md:gap-2 p-2 border-b overflow-x-auto justify-start md:justify-center">
        {days.length === 0 && (
          <span className="text-gray-400">No trip days</span>
        )}
        {days.map((day) => (
          <Button
            key={day.toISOString()}
            variant={
              selectedDay && isSameDay(day, selectedDay)
                ? "default"
                : "secondary"
            }
            onClick={() => setSelectedDay(day)}
            className="min-w-[56px] md:min-w-[64px] text-xs md:text-sm hover:bg-gray-400 hover:text-white shrink-0"
          >
            {format(day, "MMM d")}
          </Button>
        ))}
      </div>
      {/* Activities section */}
      <div className="flex-1 p-6 overflow-y-auto relative">
        {/* Sticky Add Activity Button */}
        <Button
          className="sticky top-0 right-0 float-right z-20 text-white hover:bg-gray-400"
          onClick={() => {
            setEditingActivity(null);
            setOpen(true);
          }}
        >
          Add Activity
        </Button>

        {selectedDay ? (
          <>
            <div className="mb-4 flex gap-5 items-center">
              {/* Chadcn Card for number of activities */}
              <Card className="p-0 w-[150px] flex flex-col items-center justify-center shadow-none border border-black bg-white">
                <div className="flex flex-col items-center py-2">
                  <span className="text-lg font-bold text-black">
                    {activitiesForDay.length}
                  </span>
                  <span className="text-xs font-medium text-black">
                    {activitiesForDay.length === 1 ? "Activity" : "Activities"}
                  </span>
                </div>
              </Card>
              {/* Chadcn Card for total cost */}
              <Card className="p-0 w-[150px] flex flex-col items-center justify-center shadow-none border border-black bg-white">
                <div className="flex flex-col items-center py-2">
                  <span className="text-lg font-bold text-black">
                    €{totalCost}
                  </span>
                  <span className="text-xs font-medium text-black">
                    Total Cost
                  </span>
                </div>
              </Card>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-[600px] px-4 md:px-0">
                <DataTable
                  columns={baseColumns({
                    onDelete: async (activity) => {
                      if (!trip.id && !trip.tripId) {
                        toast.error("Missing trip id");
                        return;
                      }
                      if (!activity.id) {
                        toast.error("Missing activity id");
                        return;
                      }
                      try {
                        const tripId = String(trip.id ?? trip.tripId);
                        await deleteActivity(tripId, activity.id);
                        setActivities((prev) =>
                          prev.filter((a) => a.id !== activity.id)
                        );
                        toast.success("Activity deleted!");
                      } catch (e) {
                        console.error("Failed to delete activity", e);
                        toast.error("Failed to delete activity");
                      }
                    },
                    onEdit: (activity) => {
                      setEditingActivity(activity);
                      setPickedLocation(
                        activity.latitude && activity.longitude
                          ? {
                              lat: Number(activity.latitude),
                              lng: Number(activity.longitude),
                            }
                          : null
                      );
                      setOpen(true);
                    },
                  })}
                  data={activitiesForDay}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-400">Select a day to view activities.</div>
        )}
      </div>

      {/* Add/Edit Activity Overlay (local to card) */}
      {open && (
        <div className="fixed top-0 left-0 z-50 flex items-start justify-start w-full h-full pointer-events-none">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-in fade-in border border-gray-300 mt-24 ml-32 pointer-events-auto"
            style={{ minWidth: 600 }}
          >
            <div className="text-base font-bold mb-2">
              {editingActivity ? "Edit Activity" : "Add Activity"}
            </div>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setOpen(false);
                setEditingActivity(null);
              }}
              aria-label="Close"
              type="button"
            >
              <X size={20} />
            </button>
            <ActivityForm
              defaultDate={selectedDay || new Date()}
              defaultValues={
                editingActivity
                  ? {
                      name: editingActivity.name,
                      category: editingActivity.category,
                      description: editingActivity.description || "",
                      address: editingActivity.address,
                      cost: Number(editingActivity.cost) || 0,
                      time: (() => {
                        if (!editingActivity.activityDate) return "12:00";
                        const t = editingActivity.activityDate.split("T")[1];
                        return t ? t.slice(0, 5) : "12:00";
                      })(),
                    }
                  : undefined
              }
              submitLabel={editingActivity ? "Edit Activity" : "Add Activity"}
              onSubmit={async (data) => {
                if (!selectedDay) return;
                const [hours, minutes] = data.time.split(":");
                const localDate = new Date(selectedDay);
                localDate.setHours(Number(hours), Number(minutes), 0, 0);
                const pad = (n: number) => n.toString().padStart(2, "0");
                const activityDate = `${localDate.getFullYear()}-${pad(
                  localDate.getMonth() + 1
                )}-${pad(localDate.getDate())}T${pad(
                  localDate.getHours()
                )}:${pad(localDate.getMinutes())}:00`;
                if (editingActivity) {
                  const updatedActivity: Activity = {
                    ...editingActivity,
                    name: data.name,
                    address: data.address,
                    category: data.category,
                    description: data.description || "",
                    cost: data.cost,
                    activityDate,
                    latitude: pickedLocation
                      ? String(pickedLocation.lat)
                      : editingActivity.latitude,
                    longitude: pickedLocation
                      ? String(pickedLocation.lng)
                      : editingActivity.longitude,
                  };
                  try {
                    const tripId = String(trip.id ?? trip.tripId);
                    await editActivity(tripId, updatedActivity);
                    setActivities((prev) =>
                      prev.map((a) =>
                        a.id === updatedActivity.id ? updatedActivity : a
                      )
                    );
                    toast.success("Activity updated!");
                  } catch (e) {
                    console.error("Failed to update activity", e);
                    toast.error("Failed to update activity");
                  }
                } else {
                  const newActivity: Activity = {
                    id: Math.random().toString(36).slice(2),
                    name: data.name,
                    address: data.address,
                    category: data.category,
                    description: data.description || "",
                    cost: data.cost,
                    activityDate,
                    creatorUsername: trip.creatorUsername || "user",
                    creationDate: new Date().toISOString(),
                    latitude: pickedLocation ? String(pickedLocation.lat) : "",
                    longitude: pickedLocation ? String(pickedLocation.lng) : "",
                  };
                  try {
                    const tripId = String(trip.id ?? trip.tripId);
                    await addActivityToTrip(tripId, newActivity);
                    setActivities((prev) => [...prev, newActivity]);
                  } catch (e) {
                    console.error("Failed to add activity", e);
                  }
                }
                setOpen(false);
                setPickedLocation(null);
                setEditingActivity(null);
              }}
              onLocationPick={(location) => {
                setPickedLocation(location);
                if (onLocationPick) onLocationPick(location);
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
