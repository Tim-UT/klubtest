"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type TimetableEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  allDay: boolean;
  tags: string; // JSON string
  visibility: string;
  ownerId: string;
};

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonthExclusive(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

function startOfCalendarGrid(month: Date) {
  const first = startOfMonth(month);
  const day = first.getDay(); // 0 Sun
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - day);
  return gridStart;
}

export default function TimetablePage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [tagFilter, setTagFilter] = useState(""); // comma separated
  const [view, setView] = useState<"all" | "mine">("all");

  // create form
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState(""); // comma separated
  const [visibility, setVisibility] = useState<"personal" | "public">("personal");

  const range = useMemo(() => {
    const from = startOfCalendarGrid(month);
    const to = new Date(from);
    to.setDate(from.getDate() + 42); // 6 weeks grid
    return { from, to };
  }, [month]);

  async function load() {
    setLoading(true);
    try {
      const url = new URL("/api/timetable", window.location.origin);
      url.searchParams.set("from", range.from.toISOString());
      url.searchParams.set("to", range.to.toISOString());
      url.searchParams.set("view", view);
      if (tagFilter.trim()) url.searchParams.set("tags", tagFilter.trim());

      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      setEvents(data.events || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, tagFilter, view]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, TimetableEvent[]>();
    for (const e of events) {
      const key = ymd(new Date(e.startAt));
      const arr = map.get(key) || [];
      arr.push(e);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const gridDays = useMemo(() => {
    const days: Date[] = [];
    const d = new Date(range.from);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [range.from]);

  const selectedKey = selectedDay ? ymd(selectedDay) : null;
  const selectedEvents = selectedKey ? eventsByDay.get(selectedKey) || [] : [];

  async function addEvent() {
    if (!selectedDay) {
      alert("Click a day first.");
      return;
    }
    const start = new Date(selectedDay);
    start.setHours(12, 0, 0, 0);
    const end = new Date(start);
    end.setHours(13, 0, 0, 0);

    const tagArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        tags: tagArr,
        visibility,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      alert("Add failed: " + t);
      return;
    }

    setTitle("");
    setTags("");
    await load();
  }

  function monthLabel(d: Date) {
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  }

  function prevMonth() {
    setSelectedDay(null);
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  }
  function nextMonth() {
    setSelectedDay(null);
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">{monthLabel(month)}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={prevMonth}>
            Prev
          </Button>
          <Button variant="outline" onClick={nextMonth}>
            Next
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <Input
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder='Filter tags (ex: UTFR,Midterm)'
            />
            <div className="flex gap-2">
              <Button
                variant={view === "all" ? "default" : "outline"}
                onClick={() => setView("all")}
              >
                All
              </Button>
              <Button
                variant={view === "mine" ? "default" : "outline"}
                onClick={() => setView("mine")}
              >
                Mine
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
              <div key={w} className="text-center">
                {w}
              </div>
            ))}
          </div>

          {/* Month view grid */}
          <div className="grid grid-cols-7 gap-2">
            {gridDays.map((d) => {
              const inMonth = d.getMonth() === month.getMonth();
              const key = ymd(d);
              const count = (eventsByDay.get(key) || []).length;
              const isSelected = selectedKey === key;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(new Date(d))}
                  className={[
                    "rounded-lg border p-2 text-left min-h-[64px] hover:bg-muted/50",
                    inMonth ? "opacity-100" : "opacity-40",
                    isSelected ? "ring-2 ring-black" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{d.getDate()}</div>
                    {count > 0 && (
                      <div className="text-[11px] px-2 py-0.5 rounded-full bg-black text-white">
                        {count}
                      </div>
                    )}
                  </div>

                  {/* tiny “Apple calendar” style dots */}
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                      <span
                        key={i}
                        className="inline-block w-1.5 h-1.5 rounded-full bg-black"
                      />
                    ))}
                    {count > 4 && <span className="text-[10px]">+{count - 4}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        </CardContent>
      </Card>

      {/* Day “zoom in” */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">
              {selectedDay ? `Day view: ${selectedKey}` : "Day view: (click a day)"}
            </div>
          </div>

          {selectedDay && (
            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-2">
                {selectedEvents.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No events yet for this day.
                  </div>
                ) : (
                  selectedEvents.map((e) => {
                    let tagArr: string[] = [];
                    try {
                      tagArr = JSON.parse(e.tags || "[]");
                    } catch {}
                    return (
                      <div key={e.id} className="rounded-lg border p-3">
                        <div className="font-medium">{e.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(e.startAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" – "}
                          {new Date(e.endAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" • "}
                          {e.visibility}
                        </div>
                        {tagArr.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tagArr.map((t) => (
                              <span
                                key={t}
                                className="text-xs px-2 py-0.5 rounded-full border"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-2 rounded-lg border p-3">
                <div className="font-semibold">Add personal event</div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (ex: Gym swim)"
                />
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (ex: Gym,Swim)"
                />
                <div className="flex gap-2">
                  <Button
                    variant={visibility === "personal" ? "default" : "outline"}
                    onClick={() => setVisibility("personal")}
                  >
                    Personal
                  </Button>
                  <Button
                    variant={visibility === "public" ? "default" : "outline"}
                    onClick={() => setVisibility("public")}
                  >
                    Public
                  </Button>
                </div>
                <Button onClick={addEvent} disabled={!title.trim()}>
                  Add
                </Button>
                <div className="text-xs text-muted-foreground">
                  (Prototype: event time is 12:00–13:00 automatically.)
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
