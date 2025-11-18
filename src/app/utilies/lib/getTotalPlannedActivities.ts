import { Trip } from "@/app/(bo)/trips/types/trip";

export function getTotalPlannedActivities(trips: Trip[]): number {
  let total = 0;
  for (const trip of trips) {
    if (trip.activityList && Array.isArray(trip.activityList)) {
      total += trip.activityList.length;
    }
  }
  return total;
}
