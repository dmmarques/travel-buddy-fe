export type ActivityDTO = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  notes?: string;
  price?: number; // number in your currency units
};

const BASE = "http://localhost:8080/travel-management-ms";

export async function listActivities(params: {
  username: string;
  tripName: string;
}): Promise<ActivityDTO[]> {
  const url = `${BASE}/activities?username=${encodeURIComponent(
    params.username
  )}&tripName=${encodeURIComponent(params.tripName)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to list activities (${res.status})`);
  }
  return res.json();
}

export async function createActivity(input: {
  username: string;
  tripName: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  notes?: string;
  price?: number;
}): Promise<ActivityDTO> {
  const res = await fetch(`${BASE}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to create activity (${res.status}) ${text}`);
  }
  return res.json();
}

export async function updateActivity(
  id: string,
  input: Partial<
    Pick<ActivityDTO, "date" | "time" | "title" | "notes" | "price">
  > & {
    username?: string;
    tripName?: string;
  }
): Promise<ActivityDTO> {
  const res = await fetch(`${BASE}/activities/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to update activity (${res.status}) ${text}`);
  }
  return res.json();
}

export async function deleteActivity(id: string): Promise<void> {
  const res = await fetch(`${BASE}/activities/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to delete activity (${res.status}) ${text}`);
  }
}
