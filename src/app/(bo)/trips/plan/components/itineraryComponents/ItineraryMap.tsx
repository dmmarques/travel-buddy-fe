"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

import { isSameDay, parseISO } from "date-fns";

interface Activity {
  id: string;
  latitude: string;
  longitude: string;
  activityDate?: string; // Add activityDate for filtering
  // Add other fields as needed
}

interface ItineraryMapProps {
  location?: { latitude: string; longitude: string } | null;
  activities?: Activity[];
  selectedDay?: Date | null;
}

export default function ItineraryMap({
  location,
  activities,
  selectedDay,
}: ItineraryMapProps) {
  const defaultCenter = { lat: 54.526, lng: 15.2551 };
  const defaultZoom = 4;
  // Convert location to numbers if present
  const mapLocation =
    location &&
    !isNaN(Number(location.latitude)) &&
    !isNaN(Number(location.longitude))
      ? { lat: Number(location.latitude), lng: Number(location.longitude) }
      : null;

  // Filter and convert activities with valid coordinates
  const validActivities =
    activities?.filter(
      (a) => !isNaN(Number(a.latitude)) && !isNaN(Number(a.longitude))
    ) || [];

  // Filter activities for the selected day
  const filteredActivities = selectedDay
    ? validActivities.filter(
        (a) =>
          a.activityDate && isSameDay(parseISO(a.activityDate), selectedDay)
      )
    : validActivities;

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
      <div className="p-2 w-full h-full">
        <Map
          defaultZoom={defaultZoom}
          defaultCenter={mapLocation || defaultCenter}
          style={{ width: "100%", height: "100%" }}
        >
          {mapLocation && <Marker position={mapLocation} />}
          {/* Render markers for each activity for the selected day */}
          {filteredActivities.map((activity: Activity) => (
            <Marker
              key={activity.id}
              position={{
                lat: Number(activity.latitude),
                lng: Number(activity.longitude),
              }}
            />
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}
