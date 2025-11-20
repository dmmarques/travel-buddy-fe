"use client";

import { useEffect, useState, useCallback } from "react";
import WorldMap from "./WorldMap";
import { listTripsByUsername } from "@/app/utilies/api/activities";
import { getCurrentUser } from "../../../../server/users";
import { Accommodation } from "@/app/(bo)/trips/types/accommodation";
import { Trip } from "@/app/(bo)/trips/types/trip";

export default function Map() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);

  const fetchAccommodations = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const username = user?.currentUser?.name;
      if (!username) return;
      const trips = (await listTripsByUsername(username)) as Trip[];
      const allAccommodations = trips
        .flatMap((trip) => trip.accommodations || [])
        .filter((a) => a.latitude && a.longitude);
      setAccommodations(allAccommodations);
    } catch {
      setAccommodations([]);
    }
  }, []);

  useEffect(() => {
    fetchAccommodations();
  }, [fetchAccommodations]);

  return (
    <div className="w-full h-full" style={{ minHeight: 400 }}>
      <WorldMap accommodations={accommodations} />
    </div>
  );
}
