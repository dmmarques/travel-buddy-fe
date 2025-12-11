"use client";

import { useEffect, useState, useCallback } from "react";
import WorldMap from "./WorldMap";
import { listTripsByUsername } from "@/app/utilies/api/activities";
import { getCurrentUser } from "../../../../server/users";

import { Travel } from "@/app/(bo)/trips/types/travel";
import { Trip } from "@/app/(bo)/trips/types/trip";

export default function Map() {
  const [travelList, setTravelList] = useState<Travel[]>([]);

  const fetchTravelList = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const username = user?.currentUser?.name;
      if (!username) return;
      const trips = (await listTripsByUsername(username)) as Trip[];
      const allTravels = trips
        .flatMap((trip) => trip.travelList || [])
        .filter((t) => t.toLat && t.toLng);
      setTravelList(allTravels);
    } catch {
      setTravelList([]);
    }
  }, []);

  useEffect(() => {
    fetchTravelList();
  }, [fetchTravelList]);

  return (
    <div className="w-full h-full" style={{ minHeight: 400 }}>
      <WorldMap travelList={travelList} />
    </div>
  );
}
