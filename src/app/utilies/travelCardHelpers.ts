// Helper to parse distance string like '1,275KM' to meters
export function parseDistance(str: string | undefined): number {
  if (!str) return 0;
  // Remove commas, spaces, and non-numeric except dot
  const num = parseFloat(str.replace(/,/g, '').replace(/[^\d.]/g, ''));
  // If string contains 'km' or 'KM', treat as kilometers
  if (/km/i.test(str)) return Math.round(num * 1000);
  // If string contains 'm' or 'meter', treat as meters
  if (/m(?![ai])/i.test(str)) return Math.round(num);
  return Math.round(num); // fallback
}

// Helper to parse duration string like '12 hours 25 mins' to minutes
export function parseDuration(str: string | undefined): number {
  if (!str) return 0;
  let total = 0;
  const h = /([\d,.]+)\s*(h|hour)/i.exec(str);
  const m = /([\d,.]+)\s*(m|min)/i.exec(str);
  if (h) total += parseInt(h[1].replace(/,/g, ''), 10) * 60;
  if (m) total += parseInt(m[1].replace(/,/g, ''), 10);
  return total;
}

// Helper to format total distance in km with comma
export function formatDistance(meters: number): string {
  const km = Math.round(meters / 1000);
  return km.toLocaleString() + ' KM';
}

// Helper to format total duration in h min
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}
