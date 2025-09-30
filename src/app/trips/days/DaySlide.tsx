"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";
import type { Activity } from "../types/activity";
import { timeToMinutes, localDateKey } from "../../utilies/lib/dates";
import { makeId } from "../../utilies/lib/day";

type DaySlideProps = {
  date: Date;
  initialActivities?: Activity[];
  currency?: string;
  onChange?: (activities: Activity[]) => void;
  disabled?: boolean;
  height?: number | string;
};

export function DaySlide({
  date,
  initialActivities,
  currency = "EUR",
  onChange,
  height = 560,
}: DaySlideProps) {
  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState<{
    time: string;
    title: string;
    notes?: string;
    price?: string;
  }>({
    time: "",
    title: "",
    notes: "",
    price: "",
  });

  const [items, setItems] = React.useState<Activity[]>([]);

  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = React.useState<Activity | null>(
    null
  );

  React.useEffect(() => {
    const key = localDateKey(date);
    const storedTime =
      typeof window !== "undefined"
        ? localStorage.getItem(`dayslide:lastTime:${key}`)
        : null;
    setForm((f) => ({ ...f, time: storedTime || "" }));
  }, [date]);

  React.useEffect(() => {
    const key = `dayslide:items:${localDateKey(date)}`;
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Activity[];
          setItems(Array.isArray(parsed) ? parsed : []);
          return;
        } catch {
          // ignore parse errors
        }
      }
    }
    setItems(initialActivities ? [...initialActivities] : []);
  }, [date, initialActivities]);

  React.useEffect(() => {
    const key = `dayslide:items:${localDateKey(date)}`;
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(items));
    }
    onChange?.(items);
  }, [items, date, onChange]);

  // Defensive sort for rendering & totals
  const ordered = React.useMemo(
    () =>
      [...items].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)),
    [items]
  );

  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => titleRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const nf = React.useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }),
    [currency]
  );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const time = form.time?.trim();
    const title = form.title?.trim();
    if (!time || !title) return;

    // Parse optional price (accept comma decimals)
    const raw = form.price?.toString().trim();
    const parsed =
      raw && raw.length > 0
        ? Number.parseFloat(raw.replace(",", "."))
        : undefined;
    const price = Number.isFinite(parsed as number)
      ? (parsed as number)
      : undefined;

    const payload = {
      time,
      title,
      notes: form.notes?.trim() || "",
      price,
    };

    if (editingId) {
      // Update existing
      setItems((prev) =>
        prev.map((x) => (x.id === editingId ? { ...x, ...payload } : x))
      );
    } else {
      // Add new
      const id = makeId();
      const next: Activity = { id, ...payload };
      setItems((prev) => [...prev, next]);
    }

    // Persist last time per day
    if (typeof window !== "undefined") {
      const key = localDateKey(date);
      localStorage.setItem(`dayslide:lastTime:${key}`, time);
    }

    // Close & reset (keep time per your UX)
    setOpen(false);
    setEditingId(null);
    setForm((f) => ({ ...f, title: "", notes: "", price: "" }));
  };

  const onNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const total = React.useMemo(
    () =>
      ordered.reduce(
        (sum, a) => sum + (typeof a.price === "number" ? a.price : 0),
        0
      ),
    [ordered]
  );

  const beginEdit = (a: Activity) => {
    setEditingId(a.id);
    setForm({
      time: a.time,
      title: a.title,
      notes: a.notes ?? "",
      price:
        typeof a.price === "number" && !Number.isNaN(a.price)
          ? String(a.price)
          : "",
    });
  };

  const doDelete = React.useCallback(() => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setItems((prev) => prev.filter((x) => x.id !== id));
    setPendingDelete(null);
  }, [pendingDelete]);

  const rowClass =
    "flex items-start justify-between rounded-md border p-3 min-h-[64px]";

  const launchingFromMenuRef = React.useRef(false);

  return (
    <Card
      className="flex flex-col"
      style={{
        height: typeof height === "number" ? `${height}px` : height,
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{`Day — ${date.toLocaleDateString()}`}</CardTitle>

        {/* Add / Edit activity */}
        <Popover
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditingId(null);
          }}
          modal={false}
        >
          <PopoverTrigger asChild>
            <Button size="sm" aria-label="Add activity">
              {editingId ? "Edit activity" : "Add activity"}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="z-[60] w-80 p-4 sm:w-96"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              const target = e.target as HTMLElement | null;
              if (
                launchingFromMenuRef.current ||
                target?.closest?.("[data-radix-dropdown-menu-content]")
              ) {
                e.preventDefault();
                launchingFromMenuRef.current = false;
              }
            }}
            onPointerDownOutside={(e) => {
              const target = e.target as HTMLElement | null;
              if (
                launchingFromMenuRef.current ||
                target?.closest?.("[data-radix-dropdown-menu-content]")
              ) {
                e.preventDefault();
                launchingFromMenuRef.current = false;
              }
            }}
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Title</label>
                <input
                  ref={titleRef}
                  type="text"
                  className="w-full rounded-md border p-2"
                  placeholder="What will you do?"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">Time</label>
                <input
                  type="time"
                  className="w-full rounded-md border p-2"
                  value={form.time}
                  min="00:00"
                  max="23:45"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                  onBlur={(e) =>
                    setForm((f) => ({
                      ...f,
                      time: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">
                  Price (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="w-full rounded-md border p-2"
                  placeholder="e.g. 12.50"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {form.price
                    ? `Will be saved as ${nf.format(
                        Number.parseFloat(
                          form.price.replace(",", ".") || "0"
                        ) || 0
                      )}`
                    : `Formatted as ${currency}`}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">
                  Notes (optional)
                </label>
                <textarea
                  className="w-full rounded-md border p-2"
                  rows={2}
                  placeholder="Any details?"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  onKeyDown={onNotesKeyDown}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Tip: Press{" "}
                  <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground">
                    Ctrl/⌘ + Enter
                  </kbd>{" "}
                  to {editingId ? "save" : "add"}.
                </p>
              </div>

              <div className="mt-1 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setOpen(false);
                    setEditingId(null);
                    setForm((f) => ({
                      ...f,
                      title: "",
                      notes: "",
                      price: "",
                    }));
                  }}
                >
                  Close
                </Button>
                <Button type="submit">{editingId ? "Save" : "Add"}</Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col space-y-6">
        <section className="flex min-h-0 flex-1 flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Activities</h3>
          </div>

          {/* Scrollable list */}
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {ordered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3">
                No activities yet for this day.
              </div>
            ) : (
              <ul className="space-y-2">
                {ordered.map((a) => (
                  <li key={a.id} className={rowClass}>
                    <div className="space-y-1">
                      <div className="font-medium">
                        <span className="mr-2 inline-block rounded bg-secondary px-2 py-0.5 text-xs">
                          {a.time}
                        </span>
                        {a.title}
                      </div>
                      {a.notes ? (
                        <p className="text-sm text-muted-foreground">
                          {a.notes}
                        </p>
                      ) : null}
                    </div>

                    {/* price + 3dots */}
                    <div className="ml-4 flex items-center gap-1 shrink-0">
                      <div className="text-sm font-medium">
                        {typeof a.price === "number"
                          ? nf.format(a.price)
                          : "Free"}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            aria-label={`More actions for ${a.title}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          <DropdownMenuItem
                            onSelect={() => {
                              beginEdit(a);
                              launchingFromMenuRef.current = true;
                              requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                  setOpen(true);
                                });
                              });
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              setPendingDelete(a);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-end">
            <div className="text-sm font-semibold">
              Total: {nf.format(total)}
            </div>
          </div>
        </section>
      </CardContent>

      {/* ChadCN Delete Confirmation */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete activity?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `This will permanently remove "${pendingDelete.title}" at ${pendingDelete.time}.`
                : "This will permanently remove the activity."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={doDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
