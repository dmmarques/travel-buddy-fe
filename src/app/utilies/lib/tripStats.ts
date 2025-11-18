import { Trip } from "@/app/(bo)/trips/types/trip";
import type { Travel } from "@/app/(bo)/trips/types/travel";
import type { Accommodation } from "@/app/(bo)/trips/types/accommodation";
import type { Activity } from "@/app/(bo)/trips/types/activity";

export function getNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = outDate.getTime() - inDate.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export function getLongestPlannedTrip(trips: Trip[]): Trip | null {
  let longestTrip: Trip | null = null;
  let maxDuration = -1;
  for (const trip of trips) {
    if (!trip.startDate || !trip.endDate) continue;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const duration = end.getTime() - start.getTime();
    if (duration > maxDuration) {
      maxDuration = duration;
      longestTrip = trip;
    }
  }
  return longestTrip;
}

export function getTotalPlannedCosts(trips: Trip[]): number {
  let total = 0;
  for (const trip of trips) {
    // Travel costs: use estimatedCost (string, parse as number)
    if (trip.travelList) {
      for (const travel of trip.travelList as Travel[]) {
        const est =
          typeof travel.estimatedCost === "string"
            ? parseFloat(travel.estimatedCost)
            : 0;
        if (!isNaN(est)) total += est;
      }
    }
    // Accommodation costs (per night * nights)
    if (trip.accommodations) {
      for (const acc of trip.accommodations as Accommodation[]) {
        if (acc.checkInDate && acc.checkOutDate) {
          const nights = getNights(acc.checkInDate, acc.checkOutDate);
          if (typeof acc.priceForAdult === "number")
            total += acc.priceForAdult * nights;
          if (typeof acc.priceForChild === "number")
            total += acc.priceForChild * nights;
          if (typeof acc.priceForPet === "number")
            total += acc.priceForPet * nights;
        }
      }
    }
    // Activity costs
    if (trip.activityList) {
      for (const act of trip.activityList as Activity[]) {
        if (typeof act.cost === "number") total += act.cost;
      }
    }
  }
  return total;
}

export function getTotalBudget(trips: Trip[]): number {
  return trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
}

export function getTotalKMs(trips: Trip[]): number {
  // travelList?.distance is a string, assume it's in KM and parseFloat
  return trips.reduce((sum, trip) => {
    if (!trip.travelList) return sum;
    return (
      sum +
      trip.travelList.reduce((tSum, travel) => {
        const km = parseFloat((travel as Travel).distance || "0");
        return tSum + (isNaN(km) ? 0 : km);
      }, 0)
    );
  }, 0);
}

export type TripStatusTotals = {
  planned: number;
  past: number;
  live: number;
  incoming: number;
};

export function getTripStatusTotals(trips: Trip[]): TripStatusTotals {
  const now = new Date();
  let planned = 0,
    past = 0,
    live = 0,
    incoming = 0;
  for (const trip of trips) {
    planned++;
    if (!trip.startDate || !trip.endDate) continue;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const isToday =
      start <= now &&
      end >= now &&
      now.getFullYear() === start.getFullYear() &&
      now.getMonth() === start.getMonth() &&
      now.getDate() >= start.getDate() &&
      now.getDate() <= end.getDate();
    if (isToday) {
      live++;
    } else if (end < now) {
      past++;
    } else if (start > now) {
      incoming++;
    }
  }
  return { planned, past, live, incoming };
}

export function getNextIncomingTrip(trips: Trip[]): Trip | null {
  const today = new Date();
  // Filter trips with a valid startDate in the future
  const futureTrips = trips.filter((trip) => {
    if (!trip.startDate) return false;
    const start = new Date(trip.startDate);
    return start >= today;
  });
  if (futureTrips.length === 0) return null;
  // Find the trip with the closest startDate
  return futureTrips.reduce((next, trip) => {
    const nextStart = new Date(next.startDate!);
    const tripStart = new Date(trip.startDate!);
    return tripStart < nextStart ? trip : next;
  });
}
