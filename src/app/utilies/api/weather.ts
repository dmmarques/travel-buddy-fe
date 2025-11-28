export async function getWeatherStatus(
  latitude: number,
  longitude: number,
  dates: string[]
): Promise<any> {
  const dateParam = dates.join(",");
  const res = await fetch(
    `http://localhost:8082/weather/check?latitude=${latitude}&longitude=${longitude}&dates=${dateParam}`
  );
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}
