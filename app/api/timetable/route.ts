export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Helper: read logged-in username from cookie "session"
async function getUser() {
  const session = cookies().get("session")?.value || "";
  if (!session) return null;
  // session cookie stores username (your prototype)
  const username = session;
  return prisma.user.findUnique({ where: { username } });
}

// GET /api/timetable?from=2026-02-01&to=2026-02-29&tags=UTFR,Midterm&view=all|mine
export async function GET(req: Request) {
  const user = await prisma.user.findFirst();
if (!user) {
  return NextResponse.json({ error: "No users in DB" }, { status: 400 });
}

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const tagsParam = url.searchParams.get("tags") || "";
  const view = url.searchParams.get("view") || "all";

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from/to" }, { status: 400 });
  }

  const tags = tagsParam
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const events = await prisma.timetableEvent.findMany({
    where: {
      startAt: { gte: new Date(from), lt: new Date(to) },
      ...(view === "mine"
        ? { ownerId: user.id }
        : {
            OR: [{ visibility: "public" }, { ownerId: user.id }],
          }),
    },
    orderBy: { startAt: "asc" },
  });

  // Filter tags in code (because tags stored as JSON string)
  const filtered = tags.length
    ? events.filter((e) => {
        try {
          const arr = JSON.parse(e.tags || "[]");
          return Array.isArray(arr) && tags.every((t) => arr.includes(t));
        } catch {
          return false;
        }
      })
    : events;

  return NextResponse.json({ events: filtered });
}

// POST /api/timetable
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json();
  const title = String(body.title || "").trim();
  const startAt = body.startAt ? new Date(body.startAt) : null;
  const endAt = body.endAt ? new Date(body.endAt) : null;

  if (!title || !startAt || !endAt) {
    return NextResponse.json({ error: "Missing title/startAt/endAt" }, { status: 400 });
  }

  const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
  const visibility = body.visibility === "public" ? "public" : "personal";

  const created = await prisma.timetableEvent.create({
    data: {
      title,
      description: body.description ? String(body.description) : null,
      location: body.location ? String(body.location) : null,
      startAt,
      endAt,
      allDay: Boolean(body.allDay),
      tags: JSON.stringify(tags),
      visibility,
      ownerId: user.id,
    },
  });

  return NextResponse.json({ event: created });
}
