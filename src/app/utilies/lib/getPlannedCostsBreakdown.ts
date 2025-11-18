import { Trip } from "@/app/(bo)/trips/types/trip";
import { Travel } from "@/app/(bo)/trips/types/travel";
import { Accommodation } from "@/app/(bo)/trips/types/accommodation";
import { Activity } from "@/app/(bo)/trips/types/activity";
import { getNights } from "@/app/utilies/lib/tripStats";

export function getPlannedCostsBreakdown(trips: Trip[]) {
  let accommodation = 0;
  let travel = 0;
  let activities = 0;

  for (const trip of trips) {
    // Travel costs
    if (trip.travelList) {
      for (const t of trip.travelList as Travel[]) {
        const est =
          typeof t.estimatedCost === "string" ? parseFloat(t.estimatedCost) : 0;
        if (!isNaN(est)) travel += est;
      }
    }
    // Accommodation costs
    if (trip.accommodations) {
      for (const acc of trip.accommodations as Accommodation[]) {
        if (acc.checkInDate && acc.checkOutDate) {
          const nights = getNights(acc.checkInDate, acc.checkOutDate);
          if (typeof acc.priceForAdult === "number")
            accommodation += acc.priceForAdult * nights;
          if (typeof acc.priceForChild === "number")
            accommodation += acc.priceForChild * nights;
          if (typeof acc.priceForPet === "number")
            accommodation += acc.priceForPet * nights;
        }
      }
    }
    // Activity costs
    if (trip.activityList) {
      for (const act of trip.activityList as Activity[]) {
        if (typeof act.cost === "number") activities += act.cost;
      }
    }
  }
  return { accommodation, travel, activities };
}
