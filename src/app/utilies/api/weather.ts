export interface DailyWeather {
  date: string;
  weatherCode: number;
  minTemperature: number;
  maxTemperature: number;
  weatherStatus: string;
}

export interface WeatherStatusResponse {
  latitude: number;
  longitude: number;
  dailyWeather: DailyWeather[];
}

const BASE_URL =
  process.env.NEXT_PUBLIC_WEATHER_BASE_URL ||
  "https://weather-buddy-fs-production.up.railway.app";

export async function getWeatherStatus(
  latitude: number,
  longitude: number,
  dates: string[]
): Promise<WeatherStatusResponse> {
  const dateParam = dates.join(",");
  const res = await fetch(
    `${BASE_URL}/weather/check?latitude=${latitude}&longitude=${longitude}&dates=${dateParam}`
  );
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}
