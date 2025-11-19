import { Accommodation } from "@/app/(bo)/trips/types/accommodation";
import { Activity } from "@/app/(bo)/trips/types/activity";
import { Travel } from "@/app/(bo)/trips/types/travel";
import { Trip } from "@/app/(bo)/trips/types/trip";
import axios from "axios";

const BASE_URL =
  process.env.TRAVEL_API_BASE_URL ??
  "https://travel-management-fs-production.up.railway.app";

// Delete a travel entry from a trip by name (unique per trip)
export async function deleteTravelFromTrip(
  tripId: string | number,
  travelName: string
) {
  // Adjust endpoint and param name as per your backend API
  const res = await axios.delete(`${BASE_URL}/trips/trip/${tripId}/travel`, {
    params: { travelName },
  });
  return res.data;
}

export async function addActivityToTrip(tripId: string, activity: Activity) {
  const res = await axios.put(`${BASE_URL}/trips/trip/${tripId}`, activity);
  return res.data;
}

export async function editActivity(tripId: string, activity: Activity) {
  const res = await axios.put(`${BASE_URL}/trips/activity/${tripId}`, activity);
  return res.data;
}

export async function deleteActivity(tripId: string, activityId: string) {
  const res = await axios.delete(`${BASE_URL}/trips/trip/${tripId}`, {
    params: { activityId },
  });
  return res.data;
}

// If you have a `GET /trips/:username/:tripId` use that; otherwise fetch list and find by id.
export async function getTripById(
  username: string,
  tripId: string | number
): Promise<Trip | null> {
  try {
    const res = await axios.get<Trip>(
      `${BASE_URL}/trips/${encodeURIComponent(username)}/${encodeURIComponent(
        String(tripId)
      )}`
    );
    return res.data;
  } catch {}

  try {
    const resList = await axios.get<Trip[]>(
      `${BASE_URL}/trips/${encodeURIComponent(username)}`
    );
    const list = resList.data;
    const found = list.find((t) => String(t.id ?? t.tripId) === String(tripId));
    return found ?? null;
  } catch {
    return null;
  }
}

export async function createTrip(trip: Partial<Trip>) {
  const res = await axios.post(`${BASE_URL}/trips/trip`, trip);
  return res.data;
}

export async function listTripsByUsername(username: string) {
  const res = await axios.get(
    `${BASE_URL}/trips/${encodeURIComponent(username)}`
  );
  return res.data;
}

export async function updateTrip(tripId: string | number, data: Partial<Trip>) {
  const BASE_URL =
    process.env.TRAVEL_API_BASE_URL ??
    "https://travel-management-fs-production.up.railway.app";
  return axios.put(`${BASE_URL}/trips/trip/partial/${tripId}`, data);
}

export async function addAccommodation(
  tripId: string | number,
  accommodation: Accommodation
) {
  const res = await axios.put(
    `${BASE_URL}/trips/trip/${tripId}/accommodation`,
    accommodation
  );
  return res.data;
}

export async function updateAccommodation(
  tripId: string | number,
  accommodation: Accommodation
) {
  const res = await axios.put(
    `${BASE_URL}/trips/trip/${tripId}/accommodation/update`,
    accommodation
  );
  return res.data;
}

export async function deleteAccommodation(
  tripId: string | number,
  accommodationId: string | number
) {
  const res = await axios.delete(
    `${BASE_URL}/trips/trip/${tripId}/accommodation`,
    {
      params: { accommodationId },
    }
  );
  return res.data;
}

export async function getAccommodations(tripId: string | number) {
  const res = await axios.get(`${BASE_URL}/trips/trip/${tripId}/accommodation`);
  return res.data;
}

export async function addTravelToTrip(tripId: string | number, travel: Travel) {
  console.log("Adding travel to trip", tripId, travel);
  const res = await axios.put(
    `${BASE_URL}/trips/trip/${tripId}/travel`,
    travel
  );
  return res.data;
}

export async function updateTravelFromTrip(
  tripId: string | number,
  travel: Travel
) {
  console.log("Updating travel from trip", tripId, travel);
  const res = await axios.put(
    `${BASE_URL}/trips/trip/${tripId}/travel/update`,
    travel
  );
  return res.data;
}
