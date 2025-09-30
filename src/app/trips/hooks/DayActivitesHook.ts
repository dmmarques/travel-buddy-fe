// hooks/useDayActivities.ts
"use client";
import * as React from "react";
import type { Activity } from "../types/activity";
import { localDateKey, timeToMinutes, makeId } from "../../utilies/lib/day";

export function DayActivitiesHook(date: Date, seed?: Activity[]) {
  const storageKey = React.useMemo(
    () => `dayslide:items:${localDateKey(date)}`,
    [date]
  );

  const [items, setItems] = React.useState<Activity[]>([]);

  // Load from localStorage (or seed) when date changes
  React.useEffect(() => {
    if (typeof window === "undefined") {
      setItems(seed ? [...seed] : []);
      return;
    }
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Activity[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
          return;
        }
      } catch {}
    }
    setItems(seed ? [...seed] : []);
  }, [storageKey, seed]);

  // Persist when items change
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const ordered = React.useMemo(
    () =>
      [...items].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)),
    [items]
  );

  const total = React.useMemo(
    () =>
      ordered.reduce(
        (sum, a) => sum + (typeof a.price === "number" ? a.price : 0),
        0
      ),
    [ordered]
  );

  // Actions
  const add = React.useCallback((payload: Omit<Activity, "id">) => {
    setItems((prev) => [...prev, { id: makeId(), ...payload }]);
  }, []);

  const update = React.useCallback(
    (id: string, payload: Omit<Activity, "id">) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...payload } : item))
      );
    },
    []
  );

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { items, ordered, total, add, update, remove, setItems };
}
