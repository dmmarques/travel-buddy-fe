export function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function localDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function groupByDay<T extends { date: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, it) => {
    (acc[it.date] ||= []).push(it);
    return acc;
  }, {});
}
