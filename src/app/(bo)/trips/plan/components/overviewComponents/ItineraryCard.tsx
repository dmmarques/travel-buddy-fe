import { Card } from "@/components/ui/card";
import { Trip } from "@/app/(bo)/trips/types/trip";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  format,
  addDays,
  differenceInCalendarDays,
  parseISO,
  isSameDay,
} from "date-fns";

import type { Activity } from "@/app/(bo)/trips/types/activity";
import { useEffect, useState } from "react";
import { getWeatherStatus, type DailyWeather } from "@/app/utilies/api/weather";
import {
  Sun,
  Cloud,
  Snowflake,
  CloudFog,
  CloudRain,
  CloudDrizzle,
  CloudRainWind,
  CloudOff,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ItineraryCardProps {
  trip: Trip;
  activities: Activity[];
  onGoToItineraryTab?: (day: Date) => void;
}

export default function ItineraryCard({
  trip,
  activities,
  onGoToItineraryTab,
}: ItineraryCardProps) {
  // Weather state
  const [weatherByDate, setWeatherByDate] = useState<
    Record<string, DailyWeather>
  >({});
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  // Parse start and end dates
  const start = trip.startDate ? parseISO(trip.startDate) : null;
  const end = trip.endDate ? parseISO(trip.endDate) : null;

  const days: Date[] = [];
  if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
    const numDays = differenceInCalendarDays(end, start) + 1;
    for (let i = 0; i < numDays; i++) {
      days.push(addDays(start, i));
    }
  }

  // Get destination geopoint from trip.travelList (assume first item is destination)
  const destination =
    Array.isArray(trip.travelList) && trip.travelList.length > 0
      ? trip.travelList[0]
      : null;
  console.log("Destination:", destination);
  const latitude = destination?.toLat ? Number(destination.toLat) : undefined;
  const longitude = destination?.toLng ? Number(destination.toLng) : undefined;

  // Fetch weather for all days
  useEffect(() => {
    if (!latitude || !longitude || days.length === 0) return;
    setWeatherLoading(true);
    setWeatherError(null);
    // Only send first and last day
    const dateStrings = [
      format(days[0], "yyyy-MM-dd"),
      format(days[days.length - 1], "yyyy-MM-dd"),
    ];
    console.log("Fetching weather for dates:", dateStrings);
    getWeatherStatus(latitude, longitude, dateStrings)
      .then((res) => {
        // Map weather by date for quick lookup
        const weatherMap: Record<string, DailyWeather> = {};
        res.dailyWeather.forEach((w) => {
          weatherMap[w.date] = w;
        });
        setWeatherByDate(weatherMap);
      })
      .catch((err) => {
        setWeatherError("Failed to fetch weather");
      })
      .finally(() => setWeatherLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, trip.startDate, trip.endDate]);

  // Use activities prop for summary

  // Weather code to icon and label mapping
  function getWeatherIconAndLabel(code: number): {
    icon: JSX.Element;
    label: string;
  } {
    if (code >= 0 && code <= 0)
      return { icon: <Sun size={24} />, label: "Clear sky" };
    if (code >= 1 && code <= 3)
      return { icon: <Cloud size={24} />, label: "Cloudy" };
    if (code >= 30 && code <= 39)
      return { icon: <Snowflake size={24} />, label: "Snow" };
    if (code >= 40 && code <= 49)
      return { icon: <CloudFog size={24} />, label: "Fog" };
    if (code >= 50 && code <= 59)
      return { icon: <CloudDrizzle size={24} />, label: "Light rain" };
    if (code >= 60 && code <= 69)
      return { icon: <CloudRain size={24} />, label: "Rain" };
    if (code >= 70 && code <= 99)
      return { icon: <CloudRainWind size={24} />, label: "Heavy Rain" };
    return { icon: <Cloud size={24} />, label: "Unknown" };
  }

  return (
    <TooltipProvider>
      <Card className="p-4 mt-4 mb-4 h-1/4 flex flex-col justify-center">
        <Carousel>
          <CarouselContent>
            {days.length > 0 ? (
              days.map((day, idx) => {
                // Activities for this day
                const activitiesForDay = activities.filter((a) => {
                  if (!a.activityDate) return false;
                  const activityDate =
                    typeof a.activityDate === "string"
                      ? parseISO(a.activityDate)
                      : a.activityDate;
                  if (
                    !(activityDate instanceof Date) ||
                    isNaN(activityDate.getTime())
                  )
                    return false;
                  // Use isSameDay from date-fns for comparison
                  return isSameDay(activityDate, day);
                });
                const totalCost = activitiesForDay.reduce(
                  (sum, a) => sum + (Number(a.cost) || 0),
                  0
                );
                return (
                  <CarouselItem key={idx}>
                    <div className="flex flex-row h-32 w-full bg-white rounded transition shadow-sm border hover:bg-gray-50">
                      {/* Left: Day button */}
                      <button
                        className="flex flex-col items-center justify-center w-1/2 h-full focus:outline-none hover:bg-gray-100 rounded-l"
                        type="button"
                        onClick={() =>
                          onGoToItineraryTab && onGoToItineraryTab(day)
                        }
                      >
                        <span className="text-lg font-semibold">
                          Day {idx + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(day, "PPP")}
                        </span>
                      </button>
                      {/* Vertical separator */}
                      <div className="w-px bg-gray-300 h-4/5 self-center" />
                      {/* Center: Summary */}
                      <div className="flex flex-col justify-center w-1/2 h-full px-4">
                        <span className="text-sm text-gray-500 mt-1">
                          Total activities: {activitiesForDay.length}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          Estimated cost: €{totalCost}
                        </span>
                      </div>
                      {/* Vertical separator */}
                      <div className="w-px bg-gray-300 h-4/5 self-center" />
                      {/* Right: Weather */}
                      <div className="flex flex-col justify-center w-1/2 h-full px-4">
                        {weatherLoading ? (
                          <span className="text-sm text-gray-500 mt-1">
                            Loading weather...
                          </span>
                        ) : weatherError ? (
                          <span className="text-sm text-red-500 mt-1">
                            {weatherError}
                          </span>
                        ) : (
                          (() => {
                            const dateKey = format(day, "yyyy-MM-dd");
                            const weather = weatherByDate[dateKey];
                            if (!weather) {
                              return (
                                <span className="text-sm text-gray-500 mt-1">
                                  <CloudOff size={16} className="inline mr-1" />
                                </span>
                              );
                            }
                            const { icon, label } = getWeatherIconAndLabel(
                              weather.weatherCode
                            );
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex flex-col items-center justify-center mt-1 cursor-pointer">
                                    {icon}
                                    <span className="text-xs text-gray-500 mt-1">
                                      Min: {weather.minTemperature}°C
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Max: {weather.maxTemperature}°C
                                    </span>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>{label}</span>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                );
              })
            ) : (
              <CarouselItem>
                <div className="flex flex-col items-center justify-center h-32">
                  <span className="text-lg font-semibold">No trip days</span>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Card>
    </TooltipProvider>
  );
}
