import type { Activity } from "../../trips/types/activity"; // adjust to your path
import { localDateKey } from "./dates"; // adjust to your path

export type ActivityInput = {
  time: string;
  title: string;
  notes?: string;
  price?: number;
};

function jsonHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function dateKey(date: Date) {
  // If your localDateKey already formats correctly use that directly, else:
  return localDateKey(date);
}

async function parseOrThrow(res: Response) {
  if (res.ok) {
    // Some endpoints might return 204
    if (res.status === 204) return null;
    try {
      return await res.json();
    } catch {
      // No JSON body
      return null;
    }
  }
  const text = await res.text();
  throw new Error(text || res.statusText);
}

export async function getDay(
  date: Date,
  signal?: AbortSignal
): Promise<{ activities: Activity[]; lastTime?: string }> {
  const res = await fetch(`/api/days/${encodeURIComponent(dateKey(date))}`, {
    method: "GET",
    signal,
  });
  const data = await parseOrThrow(res);
  return (data ?? { activities: [], lastTime: undefined }) as {
    activities: Activity[];
    lastTime?: string;
  };
}

export async function createActivity(
  date: Date,
  input: ActivityInput,
  token?: string
): Promise<Activity> {
  const res = await fetch(
    `/api/days/${encodeURIComponent(dateKey(date))}/activities`,
    {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(input),
    }
  );
  const data = await parseOrThrow(res);
  return data as Activity;
}

export async function updateActivityApi(
  date: Date,
  id: string,
  input: ActivityInput,
  token?: string
): Promise<Activity> {
  const res = await fetch(
    `/api/days/${encodeURIComponent(
      dateKey(date)
    )}/activities/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify(input),
    }
  );
  const data = await parseOrThrow(res);
  return data as Activity;
}

export async function deleteActivityApi(
  date: Date,
  id: string,
  token?: string
): Promise<void> {
  const res = await fetch(
    `/api/days/${encodeURIComponent(
      dateKey(date)
    )}/activities/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: jsonHeaders(token),
    }
  );
  await parseOrThrow(res);
}

export async function saveLastTime(
  date: Date,
  time: string,
  token?: string
): Promise<void> {
  const res = await fetch(
    `/api/days/${encodeURIComponent(dateKey(date))}/last-time`,
    {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify({ time }),
    }
  );
  await parseOrThrow(res);
}
