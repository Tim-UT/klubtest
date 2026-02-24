"use client";





import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Home,
  Megaphone,
  MessageCircle,
  User,
  Menu,
  Heart,
  Bookmark,
  Send,
  ShieldCheck,
  CalendarDays,
  Clock,
  Users,
  Compass,
  HelpCircle,
  ChevronLeft,
  SlidersHorizontal,
} from "lucide-react";

/**
 * Campus Platform — Mobile-first prototype
 *
 * Bottom nav (5):
 * 1) Post
 * 2) Recruitment
 * 3) + Letter (Send Post)
 * 4) Message
 * 5) Profile
 *
 * Post screen top channels (5):
 * - Timetable
 * - Following
 * - Explore
 * - Ask-how
 * - Recruitment
 *
 * Changes implemented per your spec:
 * - Students + managers can post
 * - Timetable: filter + authorized add (staff/club manager simulated)
 * - Following: show followed clubs/students posts
 * - Ask-how: question posts
 * - Recruitment: all recruitment + events + hiring + dates
 * - Apply button text = "Apply"
 * - Apply form fields exactly as specified + template auto-fill button
 * - Post detail: comments, follow button (top-right), love/save (bottom-right)
 *   - Love toggles heart red, Save toggles bookmark yellow
 * - Recruitment detail shows deadline + seats left bar + apply button
 * - Message includes: Announcement + Inbox + Deadline notice
 * - Inbox categorized by clubs → sub group chats + DMs; progress bar + update
 * - Profile includes: viewing history, saved posts, loved posts, applied items
 *
 * Note: This is frontend-only (in-memory state).
 */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type AuthorType = "club" | "person";
type PostType = "post" | "recruitment";

type Post = {
  id: string;
  type: PostType;
  authorType: AuthorType;
  authorId: string;
  createdAt: string;
  title: string;
  body: string;
  abstract?: string;
  media: string;
  tags: string[];
  comments: { id: string; user: string; text: string; time: string }[];
  // recruitment only
  deadline?: string;
  capacity?: number;
  appliedCount?: number;
  requirementNote?: string;
};

const sampleClubs = [
  {
    id: "club_utfr",
    name: "UTFR Club",
    tags: ["Dance", "Community"],
    verified: true,
  },
  {
    id: "club_rsX",
    name: "Robotics Society",
    tags: ["Robotics", "Mechanical", "AI"],
    verified: true,
  },
  {
    id: "club_vf",
    name: "Viewfinder Photography",
    tags: ["Photography", "Street", "Landscape"],
    verified: false,
  },
  {
    id: "club_ready",
    name: "Ready Lab",
    tags: ["Research", "Lab", "Hiring"],
    verified: true,
  },
];

const samplePeople = [
  { id: "u_alex", name: "Alex Chen", role: "Student" },
  { id: "u_maya", name: "Maya Singh", role: "Student" },
  { id: "u_sam", name: "Sam Lee", role: "Club Lead" },
  { id: "u_jordan", name: "Jordan Park", role: "Staff" },
];

const seedPosts: Post[] = [
  {
    id: "p1",
    type: "post",
    authorType: "club",
    authorId: "club_rsX",
    createdAt: "Today",
    title: "Arm build night — torque testing + CAD review",
    body:
      "We’re doing a quick build night in the shop.\n\n• Bring your laptop\n• Safety glasses recommended\n• New members welcome\n\n📍 Mech Lab\n🕖 7–9pm\n\nWe’ll share CAD files + part list after the session.",
    media:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80",
    tags: ["#robotics", "#workshop", "#cad"],
    comments: [
      { id: "c11", user: "Maya Singh", text: "Do we need machine training to join?", time: "2h" },
      {
        id: "c12",
        user: "Robotics Society",
        text: "Nope! You can observe + help with assembly. Training is only for certain tools.",
        time: "1h",
      },
    ],
  },
  {
    id: "p2",
    type: "recruitment",
    authorType: "club",
    authorId: "club_vf",
    createdAt: "1d",
    title: "Recruiting: photo walk team + socials editor",
    abstract:
      "Plan weekly photo walks and create short social posts. Beginners welcome — we’ll teach editing.",
    body:
      "We’re recruiting for Spring term.\n\nRoles (optional):\n• Photo walk coordinator\n• Socials editor\n\nWhat you’ll get:\n• Weekly practice\n• Feedback + presets\n• Fun community\n\nWe care more about consistency than experience.",
    media:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    tags: ["#photo", "#creative", "#beginnerfriendly"],
    deadline: "Mar 10",
    capacity: 25,
    appliedCount: 14,
    requirementNote: "Open to all years. Phone camera is OK.",
    comments: [
      { id: "c21", user: "Alex Chen", text: "Is there any equipment requirement?", time: "20h" },
      { id: "c22", user: "Viewfinder Photography", text: "Phone is fine. DSLR optional.", time: "18h" },
    ],
  },
  {
    id: "p3",
    type: "post",
    authorType: "person",
    authorId: "u_alex",
    createdAt: "2d",
    title: "Pool lane schedule? when is it less crowded",
    body:
      "I went today and it was packed. Does anyone know what time lanes are usually free?\nAlso do we need to book in advance?",
    media:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    tags: ["#askhow", "#gym", "#pool"],
    comments: [
      {
        id: "c31",
        user: "Jordan Park",
        text: "Usually quieter 8–10am. Some schools require booking; check your athletics portal.",
        time: "1d",
      },
      { id: "c32", user: "Sam Lee", text: "After 9pm is often better too.", time: "1d" },
    ],
  },
  {
    id: "p4",
    type: "recruitment",
    authorType: "club",
    authorId: "club_ready",
    createdAt: "3d",
    title: "Hiring: Lab assistant / TA (Spring)",
    abstract:
      "Paid position. Help with equipment setup, scheduling, and basic data entry. Training provided.",
    body:
      "We’re hiring for Spring.\n\nTasks:\n• Setup and teardown\n• Scheduling assistance\n• Basic data entry\n\nNice to have:\n• Good communication\n• Reliable schedule\n\n(Training provided.)",
    media:
      "https://images.unsplash.com/photo-1559757175-5700dde67538?auto=format&fit=crop&w=1200&q=80",
    tags: ["#recruitment", "#hiring", "#lab"],
    deadline: "Mar 12",
    capacity: 8,
    appliedCount: 5,
    requirementNote: "Must be available 2 shifts/week.",
    comments: [
      { id: "c41", user: "Maya Singh", text: "Is prior lab experience required?", time: "2d" },
      { id: "c42", user: "Ready Lab", text: "Not required. We train you.", time: "2d" },
    ],
  },
  {
    id: "p5",
    type: "post",
    authorType: "club",
    authorId: "club_utfr",
    createdAt: "4d",
    title: "Dinner dance date released 💃🕺",
    body:
      "Save the date!\n\n📅 Mar 8\n📍 Student Hall\n\nDress code: semi-formal\nTickets open next week.\n\nHashtag your outfit ideas below 👇",
    media:
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1200&q=80",
    tags: ["#utfr", "#event", "#dance"],
    comments: [
      { id: "c51", user: "Alex Chen", text: "Is it okay to bring a friend from another school?", time: "3d" },
      { id: "c52", user: "UTFR Club", text: "Yes! Guest tickets will be available.", time: "3d" },
    ],
  },
];

const seedTimetable = [
  { id: "t1", tag: "UTFR", title: "UTFR — Dinner Dance", date: "Mar 08", type: "Club", by: "UTFR Club" },
  { id: "t2", tag: "MIDTERM", title: "Midterm week starts", date: "Feb 24", type: "School", by: "Staff" },
  { id: "t3", tag: "ELECTIVE", title: "Elective selection opens", date: "Mar 01", type: "School", by: "Staff" },
  { id: "t4", tag: "POOL", title: "Pool maintenance", date: "Feb 28", type: "Facility", by: "Staff" },
];

const seedInboxCategories = [
  {
    id: "cat_rsX",
    clubId: "club_rsX",
    title: "Robotics Society",
    unread: 2,
    progress: { label: "Arm Project", value: 0.62 },
    chats: [
      { id: "chat_rsX_general", title: "General", last: "Announcement: lab access instructions posted.", unread: 2 },
      { id: "chat_rsX_arm", title: "Arm Project", last: "New CAD rev is up — please review.", unread: 0 },
      { id: "chat_rsX_dm_alex", title: "Alex Chen (DM)", last: "Can you send the notes?", unread: 1, dm: true },
    ],
  },
  {
    id: "cat_vf",
    clubId: "club_vf",
    title: "Viewfinder Photography",
    unread: 0,
    progress: { label: "Photo Walk", value: 0.25 },
    chats: [
      { id: "chat_vf_general", title: "General", last: "Next photo walk: Sat 3pm @ campus gate.", unread: 0 },
      { id: "chat_vf_edit", title: "Editing", last: "Preset pack shared in files.", unread: 0 },
      { id: "chat_vf_dm_maya", title: "Maya Singh (DM)", last: "See you at the meeting!", unread: 0, dm: true },
    ],
  },
];

const seedDeadlineNotices = [
  { id: "d1", title: "Apply: Viewfinder — socials editor", date: "Mar 10", source: "Recruitment" },
  { id: "d2", title: "Meeting: Robotics build night", date: "Feb 26", source: "Club" },
  { id: "d3", title: "Course: Elective selection opens", date: "Mar 01", source: "School" },
];

function AvatarDot() {
  return <div className="h-7 w-7 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-100 shadow-sm" />;
}

function seatsLeft(capacity?: number, appliedCount?: number) {
  const c = capacity ?? 0;
  const a = appliedCount ?? 0;
  return Math.max(0, c - a);
}

function SeatsBar({ capacity, appliedCount }: { capacity?: number; appliedCount?: number }) {
  const c = capacity ?? 0;
  const a = appliedCount ?? 0;
  const left = seatsLeft(c, a);
  const ratio = c ? Math.min(1, a / c) : 0;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[12px] text-zinc-600">
        <span className="font-medium">Seats left: {left}</span>
        <span className="tabular-nums">
          {a}/{c} applied
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full bg-zinc-900" style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
    </div>
  );
}

function useMasonry<T>(items: T[], columns = 2) {
  return useMemo(() => {
    const cols: T[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => cols[i % columns].push(item));
    return cols;
  }, [items, columns]);
}
function TopBar({
  label,
  onOpenMenu,
  query,
  setQuery,
}: {
  label: string;
  onOpenMenu: () => void;
  query: string;
  setQuery: (v: string) => void;
}) {
  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onOpenMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-zinc-100"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="text-lg font-semibold text-zinc-900">{label}</div>

          <div
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-zinc-100"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, clubs, events…"
              className="h-11 rounded-2xl pl-9"
            />
          </div>
        </div>
      </div>
      <div className="h-px bg-zinc-100" />
    </div>
  );
}

type Channel = "timetable" | "following" | "explore" | "askhow" | "recruitment";

function ChannelTabs({
  channel,
  setChannel,
}: {
  channel: Channel;
  setChannel: (c: Channel) => void;
}) {
  const tabs = [
    { id: "timetable", label: "Timetable", icon: CalendarDays },
    { id: "following", label: "Following", icon: Users },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "askhow", label: "Ask-how", icon: HelpCircle },
    { id: "recruitment", label: "Recruitment", icon: Megaphone },
  ] as const;

  return (
    <div className="sticky top-[118px] z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="px-3 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => {
            const active = channel === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setChannel(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border px-3 py-2 text-sm",
                  active
                    ? "border-zinc-900 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-px bg-zinc-100" />
    </div>
  );
}

function AuthorLine({
  authorLabel,
  authorType,
  verified,
}: {
  authorLabel: string;
  authorType: AuthorType;
  verified: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <AvatarDot />
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-zinc-900">{authorLabel}</span>
        {verified ? (
          <span className="inline-flex items-center text-zinc-700">
            <ShieldCheck className="h-4 w-4" />
          </span>
        ) : null}
        <span className="text-xs text-zinc-500">
          • {authorType === "club" ? "Club" : "Student"}
        </span>
      </div>
    </div>
  );
}

function PostCard({
  post,
  authorLabel,
  verified,
  onOpen,
  onApply,
}: {
  post: Post;
  authorLabel: string;
  verified: boolean;
  onOpen: (postId: string) => void;
  onApply: (postId: string) => void;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm">
      <div className="relative">
        <button onClick={() => onOpen(post.id)} className="block w-full text-left">
          <img
            src={post.media}
            alt={post.title}
            className="w-full object-cover"
            style={{ aspectRatio: "4/5" }}
            loading="lazy"
          />
        </button>

        <div className="absolute left-2 top-2 flex items-center gap-2">
          {post.type === "recruitment" ? (
            <Badge className="rounded-full">Recruitment</Badge>
          ) : post.tags.some((t) => t.toLowerCase().includes("#askhow")) ? (
            <Badge variant="secondary" className="rounded-full">
              Ask-how
            </Badge>
          ) : null}
        </div>

        <div className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 text-xs text-zinc-700 shadow">
          {post.createdAt}
        </div>
      </div>

      <CardContent className="p-3">
        <button onClick={() => onOpen(post.id)} className="w-full text-left">
          <div className="text-[15px] font-semibold leading-snug text-zinc-950">
            {post.title}
          </div>
          <div className="mt-1 line-clamp-2 text-[13px] leading-snug text-zinc-600">
            {post.type === "recruitment" ? post.abstract : post.body}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-600"
              >
                {t}
              </span>
            ))}
          </div>
        </button>

        <div className="mt-3 flex items-center justify-between gap-2">
          <AuthorLine
            authorLabel={authorLabel}
            authorType={post.authorType}
            verified={verified}
          />
        </div>

        {post.type === "recruitment" ? (
          <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-between text-[12px] text-zinc-600">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Deadline:{" "}
                <span className="font-semibold text-zinc-900">{post.deadline}</span>
              </span>
            </div>
            <div className="mt-1 text-xs text-zinc-600">{post.requirementNote}</div>
            <SeatsBar capacity={post.capacity} appliedCount={post.appliedCount} />
            <Button className="mt-3 w-full rounded-2xl" onClick={() => onApply(post.id)}>
              Apply
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SideMenu({
  open,
  onOpenChange,
  clubs,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clubs: any[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[320px] rounded-r-2xl">
        <SheetHeader>
          <SheetTitle>Explore</SheetTitle>
          <SheetDescription>Quick access to clubs and campus info.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-zinc-200 p-3">
            <div className="text-sm font-semibold text-zinc-900">Trending</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Career fair", "Hackathon", "Resume", "Pool", "Electives"].map((t) => (
                <Badge key={t} variant="secondary" className="rounded-full">
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-3">
            <div className="text-sm font-semibold text-zinc-900">Clubs</div>
            <div className="mt-2 space-y-2">
              {clubs.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl px-2 py-2 hover:bg-zinc-50"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-sm font-medium text-zinc-900">
                      {c.name}
                      {c.verified ? (
                        <ShieldCheck className="h-4 w-4 text-zinc-700" />
                      ) : null}
                    </div>
                    <div className="text-xs text-zinc-500">{c.tags.join(" • ")}</div>
                  </div>
                  <Button variant="secondary" className="rounded-2xl" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TimetableView({
  items,
  filters,
  setFilters,
  canAdd,
  onAdd,
}: {
  items: any[];
  filters: any;
  setFilters: (fn: any) => void;
  canAdd: boolean;
  onAdd: () => void;
}) {
  const filtered = items.filter((it) => {
    const tagOk = !filters.tag || it.tag.toLowerCase().includes(filters.tag.toLowerCase());
    const typeOk = !filters.type || it.type === filters.type;
    return tagOk && typeOk;
  });

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-base font-semibold text-zinc-900">Timetable</div>
        <div className="inline-flex items-center gap-2">
          <Button
            variant="secondary"
            className="rounded-2xl"
            size="sm"
            onClick={() => setFilters((p: any) => ({ ...p, open: true }))}
          >
            <SlidersHorizontal className="mr-1 h-4 w-4" />
            Filter
          </Button>
          {canAdd ? (
            <Button className="rounded-2xl" size="sm" onClick={onAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((it) => (
          <div key={it.id} className="rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-zinc-900">{it.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {it.date}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-1">#{it.tag}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-1">{it.type}</span>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {it.by}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {!filtered.length ? (
        <div className="mt-10 text-center text-sm text-zinc-500">
          No results — try changing the filter.
        </div>
      ) : null}
    </div>
  );
}

function FilterSheet({
  open,
  onOpenChange,
  filters,
  setFilters,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  filters: any;
  setFilters: (fn: any) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-w-[480px] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Filter Timetable</SheetTitle>
          <SheetDescription>Find tags you care about.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-medium text-zinc-900">Tag</div>
            <Input
              value={filters.tag}
              onChange={(e) => setFilters((p: any) => ({ ...p, tag: e.target.value }))}
              className="h-11 rounded-2xl"
              placeholder="e.g., MIDTERM / UTFR / POOL"
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-zinc-900">Type</div>
            <select
              value={filters.type}
              onChange={(e) => setFilters((p: any) => ({ ...p, type: e.target.value }))}
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
            >
              <option value="">All</option>
              <option value="School">School</option>
              <option value="Club">Club</option>
              <option value="Facility">Facility</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="rounded-2xl"
              onClick={() => setFilters({ tag: "", type: "", open: false })}
            >
              Reset
            </Button>
            <Button className="rounded-2xl" onClick={() => onOpenChange(false)}>
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PostDetail({
  open,
  onOpenChange,
  post,
  authorLabel,
  verified,
  isFollowing,
  isLoved,
  isSaved,
  onToggleFollow,
  onToggleLove,
  onToggleSave,
  onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  post: Post | null;
  authorLabel: string;
  verified: boolean;
  isFollowing: boolean;
  isLoved: boolean;
  isSaved: boolean;
  onToggleFollow: () => void;
  onToggleLove: () => void;
  onToggleSave: () => void;
  onApply: () => void;
}) {
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (open) setCommentText("");
  }, [open]);

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] rounded-2xl p-0">
        {/* Header */}
        <div className="border-b border-zinc-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-zinc-100"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-semibold text-zinc-900">
                      {authorLabel}
                    </div>
                    {verified ? <ShieldCheck className="h-4 w-4 text-zinc-700" /> : null}
                    <div className="text-xs text-zinc-500">• {post.createdAt}</div>
                  </div>
                  <div className="truncate text-xs text-zinc-500">
                    {post.authorType === "club" ? "Club" : "Student"}
                  </div>
                </div>

                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  className="rounded-2xl"
                  size="sm"
                  onClick={onToggleFollow}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[72vh] overflow-auto">
          <div className="p-4">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={post.media}
                alt={post.title}
                className="w-full object-cover"
                style={{ aspectRatio: "4/5" }}
              />
            </div>

            <div className="mt-3 text-base font-semibold text-zinc-950">{post.title}</div>
            {post.type === "recruitment" && post.abstract ? (
              <div className="mt-1 text-sm text-zinc-700">{post.abstract}</div>
            ) : null}
            <div className="mt-2 whitespace-pre-line text-sm text-zinc-700">{post.body}</div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-600"
                >
                  {t}
                </span>
              ))}
            </div>

            {post.type === "recruitment" ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold text-zinc-900">Deadline</div>
                  <div className="text-zinc-700">{post.deadline}</div>
                </div>
                <div className="mt-2 text-xs text-zinc-600">{post.requirementNote}</div>
                <SeatsBar capacity={post.capacity} appliedCount={post.appliedCount} />
                <Button className="mt-3 w-full rounded-2xl" onClick={onApply}>
                  Apply
                </Button>
              </div>
            ) : null}

            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold text-zinc-900">Comments</div>
              <div className="space-y-2">
                {post.comments.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-zinc-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-zinc-900">{c.user}</div>
                      <div className="text-xs text-zinc-500">{c.time}</div>
                    </div>
                    <div className="mt-1 text-sm text-zinc-700">{c.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="border-t border-zinc-100 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="h-11 flex-1 rounded-2xl"
                placeholder="Add a comment…"
              />
              <Button
                className="h-11 rounded-2xl"
                disabled={!commentText.trim()}
                onClick={() => setCommentText("")}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggleLove}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl hover:bg-zinc-100"
                aria-label="Love"
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    isLoved ? "fill-red-500 text-red-500" : "text-zinc-700"
                  )}
                />
              </button>
              <button
                onClick={onToggleSave}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl hover:bg-zinc-100"
                aria-label="Save"
              >
                <Bookmark
                  className={cn(
                    "h-5 w-5",
                    isSaved ? "fill-yellow-400 text-yellow-500" : "text-zinc-700"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function ApplyDialog({
  open,
  onOpenChange,
  post,
  authorLabel,
  template,
  setTemplate,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  post: Post | null;
  authorLabel: string;
  template: any;
  setTemplate: (fn: any) => void;
  onSubmit: (payload: { postId: string; form: any }) => void;
}) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (open) setForm({});
  }, [open]);

  if (!post) return null;

  const fields = [
    { key: "firstName", label: "First Name", required: true },
    { key: "lastName", label: "Last Name", required: true },
    { key: "middleName", label: "Middle Name (O)", required: false },
    { key: "preferredName", label: "Preferred Name (O)", required: false },
    { key: "gender", label: "Gender (O)", required: false },
    { key: "position", label: "Applied Position (O)", required: false },
    { key: "grade", label: "Grade (O)", required: false },
    {
      key: "why",
      label: "Why do you want to join? (O)",
      required: false,
      type: "textarea" as const,
    },
  ];

  const missingRequired = fields.some(
    (f) => f.required && !String(form[f.key] || "").trim()
  );

  function applyTemplate() {
    setForm((p: any) => ({
      ...p,
      firstName: template.firstName || p.firstName,
      lastName: template.lastName || p.lastName,
      preferredName: template.preferredName || p.preferredName,
      grade: template.grade || p.grade,
      gender: template.gender || p.gender,
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-950">Apply</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{authorLabel}</span> • {post.title}
            {post.abstract ? ` — ${post.abstract}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-zinc-900">
                  Basic info template
                </div>
                <div className="text-xs text-zinc-600">
                  Tap “Use” to auto-fill your name/grade.
                </div>
              </div>
              <Button
                variant="secondary"
                className="rounded-2xl"
                size="sm"
                onClick={applyTemplate}
              >
                Use
              </Button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Input
                value={template.firstName}
                onChange={(e) =>
                  setTemplate((p: any) => ({ ...p, firstName: e.target.value }))
                }
                className="h-11 rounded-2xl"
                placeholder="Template First"
              />
              <Input
                value={template.lastName}
                onChange={(e) =>
                  setTemplate((p: any) => ({ ...p, lastName: e.target.value }))
                }
                className="h-11 rounded-2xl"
                placeholder="Template Last"
              />
              <Input
                value={template.preferredName}
                onChange={(e) =>
                  setTemplate((p: any) => ({
                    ...p,
                    preferredName: e.target.value,
                  }))
                }
                className="h-11 rounded-2xl"
                placeholder="Preferred (O)"
              />
              <Input
                value={template.grade}
                onChange={(e) =>
                  setTemplate((p: any) => ({ ...p, grade: e.target.value }))
                }
                className="h-11 rounded-2xl"
                placeholder="Grade (O)"
              />
            </div>
          </div>

          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <div className="text-sm font-medium text-zinc-900">
                {f.label}{" "}
                {f.required ? <span className="text-zinc-400">*</span> : null}
              </div>

              {f.type === "textarea" ? (
                <Textarea
                  value={form[f.key] || ""}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, [f.key]: e.target.value }))
                  }
                  className="min-h-24 rounded-2xl"
                  placeholder="(Optional)"
                />
              ) : (
                <Input
                  value={form[f.key] || ""}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, [f.key]: e.target.value }))
                  }
                  className="h-11 rounded-2xl"
                  placeholder={f.required ? "Required" : "(Optional)"}
                />
              )}
            </div>
          ))}

          <div className="rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="font-semibold text-zinc-900">Deadline</div>
              <div className="text-zinc-700">{post.deadline}</div>
            </div>
            <div className="mt-2 text-xs text-zinc-600">
              {post.requirementNote}
            </div>
            <SeatsBar capacity={post.capacity} appliedCount={post.appliedCount} />
          </div>

          <Button
            className="w-full rounded-2xl"
            disabled={missingRequired}
            onClick={() => onSubmit({ postId: post.id, form })}
          >
            Submit
          </Button>

          <div className="text-xs text-zinc-500">
            (Prototype) Application will appear in Profile → Applied items.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ComposeDialog({
  open,
  onOpenChange,
  profile,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: any;
  onCreate: (payload: any) => void;
}) {
  const [mode, setMode] = useState<"post" | "askhow" | "recruitment">("post");
  const [who, setWho] = useState<"student" | "club">("student");
  const [authorId, setAuthorId] = useState(profile.userId);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("#campus");

  const [deadline, setDeadline] = useState("Mar 20");
  const [capacity, setCapacity] = useState(10);
  const [requirementNote, setRequirementNote] = useState("Open to all.");

  useEffect(() => {
    if (!open) return;
    setMode("post");
    setWho("student");
    setAuthorId(profile.userId);
    setTitle("");
    setBody("");
    setTags("#campus");
    setDeadline("Mar 20");
    setCapacity(10);
    setRequirementNote("Open to all.");
  }, [open, profile.userId]);

  function submit() {
    const tagList = tags
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    onCreate({
      mode,
      who,
      authorId,
      title: title.trim(),
      body: body.trim(),
      tags: tagList,
      deadline,
      capacity,
      requirementNote,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-950">
            + Letter (Send Post)
          </DialogTitle>
          <DialogDescription>
            Students can share life & questions. Clubs/staff can publish
            recruitment and updates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            {(["post", "askhow", "recruitment"] as const).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 rounded-2xl border px-3 py-2 text-sm",
                    active
                      ? "border-zinc-900 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-700"
                  )}
                >
                  {m === "post"
                    ? "Post"
                    : m === "askhow"
                      ? "Ask-how"
                      : "Recruitment"}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="text-sm font-medium text-zinc-900">Post as</div>
              <select
                value={who}
                onChange={(e) => {
                  const v = e.target.value as "student" | "club";
                  setWho(v);
                  setAuthorId(v === "student" ? profile.userId : profile.defaultClubId);
                }}
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
              >
                <option value="student">Student</option>
                <option value="club">Club</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-zinc-900">Author</div>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
              >
                {who === "student" ? (
                  <option value={profile.userId}>{profile.displayName}</option>
                ) : (
                  profile.myClubOptions.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-zinc-900">Title</div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-2xl"
              placeholder={
                mode === "recruitment"
                  ? "e.g., Hiring: Lab assistant"
                  : mode === "askhow"
                    ? "e.g., How to select electives?"
                    : "e.g., My campus day"
              }
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-zinc-900">Content</div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-24 rounded-2xl"
              placeholder="Share details…"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-zinc-900">Hashtags</div>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="h-11 rounded-2xl"
              placeholder="#campus #electives"
            />
          </div>

          {mode === "recruitment" ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <div className="text-sm font-semibold text-zinc-900">
                Recruitment settings
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-zinc-900">Deadline</div>
                  <Input
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-11 rounded-2xl"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-zinc-900">Capacity</div>
                  <Input
                    value={String(capacity)}
                    onChange={(e) => setCapacity(Number(e.target.value || 0))}
                    className="h-11 rounded-2xl"
                  />
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-sm font-medium text-zinc-900">
                  Requirement note
                </div>
                <Input
                  value={requirementNote}
                  onChange={(e) => setRequirementNote(e.target.value)}
                  className="h-11 rounded-2xl"
                />
              </div>
            </div>
          ) : null}

          <Button
            className="w-full rounded-2xl"
            disabled={!title.trim() || !body.trim()}
            onClick={submit}
          >
            Publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MessageScreen({
  inboxCategories,
  deadlines,
  onOpenInboxCategory,
  onSaveDeadline,
}: {
  inboxCategories: any[];
  deadlines: any[];
  onOpenInboxCategory: (id: string) => void;
  onSaveDeadline: (id: string) => void;
}) {
  const [tab, setTab] = useState<"announcement" | "inbox" | "deadline">(
    "announcement"
  );

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-base font-semibold text-zinc-900">Message</div>
        <Badge variant="secondary" className="rounded-full">
          Center
        </Badge>
      </div>

      <div className="mb-3 flex gap-2">
        {[
          { id: "announcement", label: "Announcement" },
          { id: "inbox", label: "Inbox" },
          { id: "deadline", label: "Deadline notice" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn(
              "flex-1 rounded-2xl border px-3 py-2 text-sm",
              tab === t.id
                ? "border-zinc-900 bg-zinc-950 text-white"
                : "border-zinc-200 bg-white text-zinc-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "announcement" ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Megaphone className="h-4 w-4" /> Broadcasts
          </div>
          <div className="mt-1 text-xs text-zinc-600">
            Club leaders and staff can announce important updates here.
          </div>
          <div className="mt-3 space-y-2">
            {[
              "Career fair tomorrow 10am",
              "Pool lane closure Feb 28",
              "Recruitment deadline reminder",
            ].map((t) => (
              <div
                key={t}
                className="rounded-2xl bg-white p-3 text-sm text-zinc-800"
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      ) : tab === "inbox" ? (
        <div className="space-y-2">
          {inboxCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => onOpenInboxCategory(c.id)}
              className="w-full rounded-2xl border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-100" />
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-zinc-900">
                        {c.title}
                      </div>
                      {c.unread ? (
                        <div className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-950 px-2 text-xs font-semibold text-white">
                          {c.unread}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-zinc-600">
                      {c.chats?.[0]?.last || "Open to see chats"}
                    </div>
                  </div>
                </div>

                {c.progress ? (
                  <div className="min-w-[110px]">
                    <div className="text-xs font-medium text-zinc-700">
                      {c.progress.label}
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full bg-zinc-900"
                        style={{
                          width: `${Math.round((c.progress.value || 0) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-500">
                      {Math.round((c.progress.value || 0) * 100)}%
                    </div>
                  </div>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {deadlines.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border border-zinc-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">
                    {d.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {d.date}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{d.source}</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  size="sm"
                  onClick={() => onSaveDeadline(d.id)}
                >
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InboxCategorySheet({
  open,
  onOpenChange,
  category,
  onOpenChat,
  onUpdateProgress,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: any | null;
  onOpenChat: (chatId: string) => void;
  onUpdateProgress: (categoryId: string, value: number) => void;
}) {
  const [progress, setProgress] = useState("0");

  useEffect(() => {
    if (!open || !category?.progress) return;
    setProgress(String(Math.round((category.progress.value || 0) * 100)));
  }, [open, category]);

  if (!category) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-w-[480px] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{category.title}</SheetTitle>
          <SheetDescription>Sub group chats + individual chats.</SheetDescription>
        </SheetHeader>

        {category.progress ? (
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-900">Progress</div>
                <div className="text-xs text-zinc-600">{category.progress.label}</div>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {Math.round((category.progress.value || 0) * 100)}%
              </Badge>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Input
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="h-11 rounded-2xl"
                placeholder="0 - 100"
              />
              <Button
                className="h-11 rounded-2xl"
                onClick={() => onUpdateProgress(category.id, Number(progress) / 100)}
              >
                Update
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          {category.chats.map((g: any) => (
            <button
              key={g.id}
              onClick={() => onOpenChat(g.id)}
              className="w-full rounded-2xl border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">{g.title}</div>
                  <div className="mt-1 line-clamp-1 text-xs text-zinc-600">{g.last}</div>
                </div>
                {g.unread ? (
                  <div className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-950 px-2 text-xs font-semibold text-white">
                    {g.unread}
                  </div>
                ) : null}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <Button className="w-full rounded-2xl" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ChatDialog({
  open,
  onOpenChange,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
}) {
  const [text, setText] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] rounded-2xl p-0">
        <div className="border-b border-zinc-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900">{title}</div>
              <div className="text-xs text-zinc-500">Prototype chat</div>
            </div>
            <Button variant="secondary" className="rounded-2xl" size="sm">
              Notice
            </Button>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-auto p-4">
          <div className="flex items-start gap-2">
            <div className="h-8 w-8 rounded-full bg-zinc-200" />
            <div className="max-w-[78%] rounded-2xl bg-zinc-100 p-3 text-sm text-zinc-800">
              Welcome! Track tasks and meeting updates here.
            </div>
          </div>
          <div className="flex items-start justify-end gap-2">
            <div className="max-w-[78%] rounded-2xl bg-zinc-950 p-3 text-sm text-white">
              Got it — I’ll update my progress after today.
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-100 p-3">
          <div className="flex items-center gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-11 flex-1 rounded-2xl"
              placeholder="Message…"
            />
            <Button
              className="h-11 rounded-2xl"
              disabled={!text.trim()}
              onClick={() => setText("")}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            (Prototype) Real-time chat requires backend.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProfileView({
  profile,
  setProfile,
  history,
  savedIds,
  lovedIds,
  appliedItems,
  postsById,
  onOpenPost,
}: {
  profile: any;
  setProfile: (fn: any) => void;
  history: string[];
  savedIds: string[];
  lovedIds: string[];
  appliedItems: any[];
  postsById: Record<string, Post>;
  onOpenPost: (id: string) => void;
}) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-100" />
        <div className="flex-1">
          <div className="text-base font-semibold text-zinc-950">{profile.displayName}</div>
          <div className="text-xs text-zinc-500">
            Student / manager tools (prototype)
          </div>
        </div>

        <button
          onClick={() => setProfile((p: any) => ({ ...p, isStaff: !p.isStaff }))}
          className={cn(
            "rounded-2xl border px-3 py-2 text-xs font-medium",
            profile.isStaff
              ? "border-zinc-900 bg-zinc-950 text-white"
              : "border-zinc-200 bg-white text-zinc-700"
          )}
          title="Toggle Staff (for timetable add permission)"
        >
          {profile.isStaff ? "Staff" : "Student"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 p-3">
        <div className="text-sm font-semibold text-zinc-900">History of looking</div>
        <div className="mt-2 space-y-2">
          {history.length ? (
            history.slice(0, 6).map((id) => {
              const p = postsById[id];
              if (!p) return null;
              return (
                <button
                  key={id}
                  onClick={() => onOpenPost(id)}
                  className="w-full rounded-2xl bg-zinc-50 p-3 text-left"
                >
                  <div className="text-sm font-semibold text-zinc-900 line-clamp-1">
                    {p.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600 line-clamp-1">
                    {p.createdAt}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-xs text-zinc-500">
              No history yet — open a post to view details.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 p-3">
        <div className="text-sm font-semibold text-zinc-900">Saved post</div>
        <div className="mt-2 space-y-2">
          {savedIds.length ? (
            savedIds.slice(0, 6).map((id) => {
              const p = postsById[id];
              if (!p) return null;
              return (
                <button
                  key={id}
                  onClick={() => onOpenPost(id)}
                  className="w-full rounded-2xl bg-zinc-50 p-3 text-left"
                >
                  <div className="text-sm font-semibold text-zinc-900 line-clamp-1">
                    {p.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">Saved</div>
                </button>
              );
            })
          ) : (
            <div className="text-xs text-zinc-500">
              No saved posts yet — tap bookmark.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 p-3">
        <div className="text-sm font-semibold text-zinc-900">Posts you loved</div>
        <div className="mt-2 space-y-2">
          {lovedIds.length ? (
            lovedIds.slice(0, 6).map((id) => {
              const p = postsById[id];
              if (!p) return null;
              return (
                <button
                  key={id}
                  onClick={() => onOpenPost(id)}
                  className="w-full rounded-2xl bg-zinc-50 p-3 text-left"
                >
                  <div className="text-sm font-semibold text-zinc-900 line-clamp-1">
                    {p.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">Loved</div>
                </button>
              );
            })
          ) : (
            <div className="text-xs text-zinc-500">
              No loved posts yet — tap heart.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 p-3">
        <div className="text-sm font-semibold text-zinc-900">
          Applied parties/events/clubs
        </div>
        <div className="mt-2 space-y-2">
          {appliedItems.length ? (
            appliedItems.slice(0, 6).map((a: any) => (
              <div key={a.id} className="rounded-2xl bg-zinc-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-zinc-900 line-clamp-1">
                    {a.title}
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {a.status}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-zinc-600">Applied {a.time}</div>
              </div>
            ))
          ) : (
            <div className="text-xs text-zinc-500">
              No applications yet — apply from recruitment posts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type MainTab = "post" | "recruitment" | "message" | "profile";

function BottomNav({
  active,
  onChange,
  onCompose,
}: {
  active: MainTab;
  onChange: (t: MainTab) => void;
  onCompose: () => void;
}) {
  const Item = ({ id, label, icon: Icon, onClick }: any) => {
    const isActive = active === id;
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs",
          isActive ? "text-zinc-950" : "text-zinc-500"
        )}
        aria-label={label}
      >
        <Icon className={cn("h-5 w-5", isActive && "scale-[1.02]")} />
        <span className="leading-none">{label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white">
      <div className="mx-auto max-w-[480px]">
        <div className="h-px bg-zinc-100" />
        <div className="relative flex items-stretch px-2 pb-safe">
          <Item id="post" label="Post" icon={Home} onClick={() => onChange("post")} />
          <Item
            id="recruitment"
            label="Recruitment"
            icon={Megaphone}
            onClick={() => onChange("recruitment")}
          />

          <div className="-mt-5 flex flex-1 items-start justify-center">
            <button
              onClick={onCompose}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg active:scale-[0.98]"
              aria-label="Create"
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>

          <Item
            id="message"
            label="Message"
            icon={MessageCircle}
            onClick={() => onChange("message")}
          />
          <Item id="profile" label="Profile" icon={User} onClick={() => onChange("profile")} />
        </div>
      </div>
    </div>
  );
}

export default function CampusApp() {
  
  useEffect(() => {
  const hasSession = document.cookie.includes("session=");
  if (!hasSession) {
    window.location.href = "/login";
  }
}, []);

  const [mainTab, setMainTab] = useState<MainTab>("post");
  const [channel, setChannel] = useState<Channel>("explore");
  const [query, setQuery] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const [clubs] = useState(sampleClubs);
  const clubsById = useMemo(() => Object.fromEntries(clubs.map((c) => [c.id, c])), [clubs]);
  const peopleById = useMemo(() => Object.fromEntries(samplePeople.map((p) => [p.id, p])), []);

  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const postsById = useMemo(() => Object.fromEntries(posts.map((p) => [p.id, p])), [posts]);

  const [timetable, setTimetable] = useState<any[]>(seedTimetable);
  const [ttFilters, setTTFilters] = useState<any>({ tag: "", type: "", open: false });

  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [applyPostId, setApplyPostId] = useState<string | null>(null);

  const [lovedIds, setLovedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>(["club_rsX"]); // clubs or people ids
  const [history, setHistory] = useState<string[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  const [deadlines, setDeadlines] = useState<any[]>(seedDeadlineNotices);

  const [inboxCategories, setInboxCategories] = useState<any[]>(seedInboxCategories);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>({
    userId: "u_maya",
    displayName: "Maya Singh",
    isStaff: false,
    defaultClubId: "club_rsX",
    myClubOptions: sampleClubs,
  });

  const [applyTemplate, setApplyTemplate] = useState<any>({
    firstName: "Maya",
    lastName: "Singh",
    preferredName: "Maya",
    grade: "2",
    gender: "",
  });

  function authorMeta(p: Post) {
    if (p.authorType === "club") {
      const c = clubsById[p.authorId];
      return { label: c?.name || "Club", verified: !!c?.verified };
    }
    const u = peopleById[p.authorId];
    return { label: u?.name || "Student", verified: false };
  }

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = posts.filter((p) => {
      const meta = authorMeta(p);
      const hay = `${p.title} ${p.body} ${p.abstract || ""} ${meta.label} ${(p.tags || []).join(" ")}`.toLowerCase();
      return !q || hay.includes(q);
    });

    const effectiveChannel: Channel = mainTab === "recruitment" ? "recruitment" : channel;

    if (effectiveChannel === "recruitment") return base.filter((p) => p.type === "recruitment");
    if (effectiveChannel === "askhow") return base.filter((p) => p.tags.some((t) => t.toLowerCase().includes("#askhow")));
    if (effectiveChannel === "following") return base.filter((p) => followingIds.includes(p.authorId));
    if (effectiveChannel === "timetable") return [];
    return base;
  }, [posts, query, channel, followingIds, mainTab]);

  const effectiveChannel: Channel = mainTab === "recruitment" ? "recruitment" : channel;
  const masonryCols = useMasonry(filteredPosts, 2);

  const openPost = openPostId ? postsById[openPostId] : null;
  const openMeta = openPost ? authorMeta(openPost) : { label: "", verified: false };

  const applyPost = applyPostId ? postsById[applyPostId] : null;
  const applyMeta = applyPost ? authorMeta(applyPost) : { label: "", verified: false };

  const openCategory = openCategoryId ? inboxCategories.find((c) => c.id === openCategoryId) : null;

  function openPostDetail(id: string) {
    setOpenPostId(id);
    setHistory((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 50));
  }

  function toggleFollow(authorId: string) {
    setFollowingIds((prev) => (prev.includes(authorId) ? prev.filter((x) => x !== authorId) : [authorId, ...prev]));
  }
  function toggleLove(postId: string) {
    setLovedIds((prev) => (prev.includes(postId) ? prev.filter((x) => x !== postId) : [postId, ...prev]));
  }
  function toggleSave(postId: string) {
    setSavedIds((prev) => (prev.includes(postId) ? prev.filter((x) => x !== postId) : [postId, ...prev]));
  }

  function createPost(payload: any) {
    const id = `p_${Math.random().toString(16).slice(2)}`;

    const media =
      payload.mode === "recruitment"
        ? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
        : payload.mode === "askhow"
          ? "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80"
          : "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80";

    const tagList =
      payload.mode === "askhow"
        ? Array.from(new Set(["#askhow", ...(payload.tags || [])]))
        : payload.tags || [];

    const newPost: Post = {
      id,
      type: payload.mode === "recruitment" ? "recruitment" : "post",
      authorType: payload.who === "club" ? "club" : "person",
      authorId: payload.authorId,
      createdAt: "Now",
      title: payload.title,
      body: payload.body,
      abstract:
        payload.mode === "recruitment"
          ? payload.body.slice(0, 120) + (payload.body.length > 120 ? "…" : "")
          : undefined,
      media,
      tags: tagList,
      comments: [
        {
          id: `c_${id}_1`,
          user: profile.displayName,
          text: "(Prototype) First comment!",
          time: "Now",
        },
      ],
      deadline: payload.mode === "recruitment" ? payload.deadline : undefined,
      capacity: payload.mode === "recruitment" ? Number(payload.capacity || 10) : undefined,
      appliedCount: payload.mode === "recruitment" ? 0 : undefined,
      requirementNote: payload.mode === "recruitment" ? payload.requirementNote : undefined,
    };

    setPosts((prev) => [newPost, ...prev]);

    setComposeOpen(false);
    setMainTab(payload.mode === "recruitment" ? "recruitment" : "post");
    setChannel(payload.mode === "recruitment" ? "recruitment" : payload.mode === "askhow" ? "askhow" : "explore");
  }

  function submitApplication({ postId, form }: { postId: string; form: any }) {
    const p = postsById[postId];
    const meta = authorMeta(p);

    setApplications((prev) => [
      {
        id: `app_${Math.random().toString(16).slice(2)}`,
        postId,
        title: `${meta.label} — ${p.title}`,
        time: "Just now",
        status: "Submitted",
        form,
      },
      ...prev,
    ]);

    setPosts((prev) => prev.map((x) => (x.id === postId ? { ...x, appliedCount: (x.appliedCount || 0) + 1 } : x)));

    if (p.deadline) {
      setDeadlines((prev) => {
        const exists = prev.some((d) => d.title.includes(p.title));
        if (exists) return prev;
        return [
          { id: `d_${Math.random().toString(16).slice(2)}`, title: `Apply: ${meta.label} — ${p.title}`, date: p.deadline, source: "Recruitment" },
          ...prev,
        ];
      });
    }

    setApplyPostId(null);
  }

  function addTimetableItem() {
    const id = `t_${Math.random().toString(16).slice(2)}`;
    setTimetable((prev) => [
      { id, tag: "CUSTOM", title: "Custom timetable item (demo)", date: "Mar 05", type: "Custom", by: profile.isStaff ? "Staff" : "User" },
      ...prev,
    ]);
  }

  function saveDeadline(id: string) {
    setDeadlines((prev) => prev.map((d) => (d.id === id ? { ...d, saved: true } : d)));
  }

  function updateCategoryProgress(categoryId: string, value: number) {
    setInboxCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId && c.progress
          ? { ...c, progress: { ...c.progress, value: Math.max(0, Math.min(1, value)) } }
          : c
      )
    );
  }

  const topLabel =
    mainTab === "post" ? "Campus" :
    mainTab === "recruitment" ? "Recruitment" :
    mainTab === "message" ? "Message" : "Profile";

  const canAddTimetable = !!profile.isStaff;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[480px]">
        <TopBar
          label={topLabel}
          onOpenMenu={() => setMenuOpen(true)}
          query={query}
          setQuery={setQuery}
        />

        <div className="pb-28">
          {(mainTab === "post" || mainTab === "recruitment") ? (
            <>
              <ChannelTabs channel={effectiveChannel} setChannel={setChannel} />

              {effectiveChannel === "timetable" ? (
                <>
                  <TimetableView
                    items={timetable}
                    filters={ttFilters}
                    setFilters={setTTFilters}
                    canAdd={canAddTimetable}
                    onAdd={addTimetableItem}
                  />
                  <FilterSheet
                    open={!!ttFilters.open}
                    onOpenChange={(v) => setTTFilters((p: any) => ({ ...p, open: v }))}
                    filters={ttFilters}
                    setFilters={setTTFilters}
                  />
                </>
              ) : (
                <div className="px-3 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    {masonryCols.map((col, idx) => (
                      <div key={idx} className="flex flex-col gap-3">
                        {col.map((p) => {
                          const meta = authorMeta(p);
                          return (
                            <PostCard
                              key={p.id}
                              post={p}
                              authorLabel={meta.label}
                              verified={meta.verified}
                              onOpen={(id) => openPostDetail(id)}
                              onApply={(id) => setApplyPostId(id)}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {!filteredPosts.length ? (
                    <div className="mt-10 text-center text-sm text-zinc-500">
                      No results. Try searching “electives”, “pool”, or a club name.
                    </div>
                  ) : null}
                </div>
              )}
            </>
          ) : null}

          {mainTab === "message" ? (
            <MessageScreen
              inboxCategories={inboxCategories}
              deadlines={deadlines}
              onOpenInboxCategory={(id) => setOpenCategoryId(id)}
              onSaveDeadline={saveDeadline}
            />
          ) : null}

          {mainTab === "profile" ? (
            <ProfileView
              profile={profile}
              setProfile={setProfile}
              history={history}
              savedIds={savedIds}
              lovedIds={lovedIds}
              appliedItems={applications}
              postsById={postsById}
              onOpenPost={(id) => openPostDetail(id)}
            />
          ) : null}
        </div>
      </div>

      <BottomNav
        active={mainTab}
        onChange={(t) => {
          setMainTab(t);
          if (t === "recruitment") setChannel("recruitment");
        }}
        onCompose={() => setComposeOpen(true)}
      />

      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} clubs={clubs} />

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        profile={profile}
        onCreate={createPost}
      />

      <PostDetail
        open={!!openPostId}
        onOpenChange={(v) => setOpenPostId(v ? openPostId : null)}
        post={openPost}
        authorLabel={openMeta.label}
        verified={openMeta.verified}
        isFollowing={openPost ? followingIds.includes(openPost.authorId) : false}
        isLoved={openPostId ? lovedIds.includes(openPostId) : false}
        isSaved={openPostId ? savedIds.includes(openPostId) : false}
        onToggleFollow={() => openPost && toggleFollow(openPost.authorId)}
        onToggleLove={() => openPostId && toggleLove(openPostId)}
        onToggleSave={() => openPostId && toggleSave(openPostId)}
        onApply={() => openPostId && setApplyPostId(openPostId)}
      />

      <ApplyDialog
        open={!!applyPostId}
        onOpenChange={(v) => setApplyPostId(v ? applyPostId : null)}
        post={applyPost}
        authorLabel={applyMeta.label}
        template={applyTemplate}
        setTemplate={setApplyTemplate}
        onSubmit={submitApplication}
      />

      <InboxCategorySheet
        open={!!openCategoryId}
        onOpenChange={(v) => setOpenCategoryId(v ? openCategoryId : null)}
        category={openCategory}
        onOpenChat={(chatId) => setOpenChatId(chatId)}
        onUpdateProgress={updateCategoryProgress}
      />

      <ChatDialog
        open={!!openChatId}
        onOpenChange={(v) => setOpenChatId(v ? openChatId : null)}
        title={
          openChatId
            ? (() => {
                for (const cat of inboxCategories) {
                  const g = (cat.chats || []).find((x: any) => x.id === openChatId);
                  if (g) return `${cat.title} • ${g.title}`;
                }
                return "Chat";
              })()
            : "Chat"
        }
      />
    </div>
  );
}
