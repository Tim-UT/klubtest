"use client";
import React, { useMemo, useState } from "react";
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
  MapPin,
  Heart,
  Send,
  ShieldCheck,
} from "lucide-react";

/**
 * CampusClubs — mobile-first web UI inspired by Rednote (Xiaohongshu) layout.
 *
 * Tabs (bottom):
 * - Post (feed)
 * - Recruitment
 * - + Letter (compose)
 * - Message
 * - Profile
 *
 * This is a front-end prototype with local in-memory state.
 * Hook it to your backend later (auth, DB, storage, messaging).
 */

const sampleClubs = [
  {
    id: "club_rsX",
    name: "Robotics Society",
    school: "University",
    tags: ["Robotics", "Mechanical", "AI"],
    verified: true,
  },
  {
    id: "club_vf",
    name: "Viewfinder Photography",
    school: "University",
    tags: ["Photography", "Street", "Landscape"],
    verified: false,
  },
  {
    id: "club_fin",
    name: "Finance & Investing Club",
    school: "University",
    tags: ["Career", "Networking"],
    verified: true,
  },
  {
    id: "club_design",
    name: "Product Design Studio",
    school: "University",
    tags: ["Design", "UX", "Prototyping"],
    verified: false,
  },
];

const seedPosts = [
  {
    id: "p1",
    type: "post",
    clubId: "club_rsX",
    title: "Arm build night — torque testing + CAD review",
    body: "We’re doing a quick build night. Bring your laptop + safety glasses. New members welcome.",
    media: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=80",
    likes: 774,
    createdAt: "Today",
  },
  {
    id: "p2",
    type: "recruitment",
    clubId: "club_vf",
    title: "Recruiting: photo walk team + socials editor",
    body: "If you like street photography or want to learn editing, apply in 30 seconds. No experience needed.",
    media: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    likes: 2053,
    createdAt: "1d",
    deadline: "Mar 10",
    formFields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "email", label: "School email", type: "email", required: true },
      { key: "year", label: "Year", type: "text", required: false },
      { key: "why", label: "Why do you want to join?", type: "textarea", required: true },
    ],
  },
  {
    id: "p3",
    type: "post",
    clubId: "club_fin",
    title: "Career fair prep: 5-minute resume roast",
    body: "Drop in with your resume. We’ll help you tailor it for PEY/Co-op postings.",
    media: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    likes: 670,
    createdAt: "2d",
  },
  {
    id: "p4",
    type: "recruitment",
    clubId: "club_design",
    title: "Recruiting: UI/UX + Prototyping (Figma)",
    body: "We’re building a campus app. Looking for designers who want a real portfolio project.",
    media: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
    likes: 106,
    createdAt: "3d",
    deadline: "Mar 15",
    formFields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "email", label: "School email", type: "email", required: true },
      { key: "portfolio", label: "Portfolio link (optional)", type: "text", required: false },
      { key: "role", label: "Role you’re applying for", type: "text", required: true },
      { key: "why", label: "Why you?", type: "textarea", required: true },
    ],
  },
];

const seedConversations = [
  {
    id: "c1",
    clubId: "club_rsX",
    title: "Robotics Society",
    lastMessage: "Announcement: lab access instructions posted.",
    unread: 2,
  },
  {
    id: "c2",
    clubId: "club_vf",
    title: "Viewfinder Photography",
    lastMessage: "Next photo walk: Saturday 3pm @ campus gate.",
    unread: 0,
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function useMasonry(items, columns = 2) {
  return useMemo(() => {
    const cols = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => cols[i % columns].push(item));
    return cols;
  }, [items, columns]);
}

function ClubChip({ club }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-100 shadow-sm" />
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-zinc-900">{club.name}</span>
        {club.verified ? (
          <span className="inline-flex items-center text-zinc-700">
            <ShieldCheck className="h-4 w-4" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function PostCard({ post, club, onApply, onLike }) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm">
      <div className="relative">
        <img
          src={post.media}
          alt={post.title}
          className="w-full object-cover"
          style={{ aspectRatio: "4/5" }}
          loading="lazy"
        />
        {post.type === "recruitment" ? (
          <div className="absolute left-2 top-2">
            <Badge className="rounded-full">Recruiting</Badge>
          </div>
        ) : null}
      </div>
      <CardContent className="p-3">
        <div className="mb-2">
          <div className="text-[15px] font-semibold leading-snug text-zinc-950">
            {post.title}
          </div>
          <div className="mt-1 line-clamp-2 text-[13px] leading-snug text-zinc-600">
            {post.body}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <ClubChip club={club} />
          <button
            onClick={() => onLike(post.id)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
            aria-label="Like"
          >
            <Heart className="h-4 w-4" />
            <span className="tabular-nums">{post.likes}</span>
          </button>
        </div>

        {post.type === "recruitment" ? (
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-[12px] text-zinc-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {club.school}
              </span>
              <span className="font-medium">Deadline: {post.deadline}</span>
            </div>
            <Button
              className="w-full rounded-2xl"
              onClick={() => onApply(post.id)}
            >
              Apply in 30s
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TopBar({ tabLabel, onOpenMenu, query, setQuery }) {
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

          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-zinc-900">{tabLabel}</div>
          </div>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-zinc-100" aria-label="Search">
            <Search className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clubs, events, career fairs…"
              className="h-11 rounded-2xl pl-9"
            />
          </div>
        </div>
      </div>
      <div className="h-px bg-zinc-100" />
    </div>
  );
}

function BottomNav({ active, onChange, onCompose }) {
  const Item = ({ id, label, icon: Icon, onClick }) => {
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

          <Item id="message" label="Message" icon={MessageCircle} onClick={() => onChange("message")} />
          <Item id="profile" label="Profile" icon={User} onClick={() => onChange("profile")} />
        </div>
      </div>
    </div>
  );
}

function ApplyDialog({ open, onOpenChange, post, club, onSubmit }) {
  const [form, setForm] = useState({});

  React.useEffect(() => {
    if (open) setForm({});
  }, [open]);

  if (!post || !club) return null;

  const fields = post.formFields || [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "email", label: "School email", type: "email", required: true },
    { key: "why", label: "Why do you want to join?", type: "textarea", required: true },
  ];

  const missingRequired = fields.some((f) => f.required && !String(form[f.key] || "").trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-950">Apply to {club.name}</DialogTitle>
          <DialogDescription>
            {post.title} • Deadline {post.deadline}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <div className="text-sm font-medium text-zinc-900">
                {f.label}{" "}
                {f.required ? <span className="text-zinc-400">*</span> : null}
              </div>
              {f.type === "textarea" ? (
                <Textarea
                  value={form[f.key] || ""}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="min-h-24 rounded-2xl"
                  placeholder="Type here…"
                />
              ) : (
                <Input
                  value={form[f.key] || ""}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="h-11 rounded-2xl"
                  placeholder="Type here…"
                />
              )}
            </div>
          ))}

          <Button
            className="w-full rounded-2xl"
            disabled={missingRequired}
            onClick={() => onSubmit({ postId: post.id, clubId: club.id, form })}
          >
            Submit application
          </Button>

          <div className="text-xs text-zinc-500">
            Your application will be sent to the club manager dashboard.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ComposeDialog({ open, onOpenChange, clubs, isClubManager, onCreate }) {
  const [mode, setMode] = useState("post"); // post | recruitment
  const [clubId, setClubId] = useState(clubs[0]?.id || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deadline, setDeadline] = useState("Mar 20");

  React.useEffect(() => {
    if (open) {
      setMode("post");
      setClubId(clubs[0]?.id || "");
      setTitle("");
      setBody("");
      setDeadline("Mar 20");
    }
  }, [open, clubs]);

  const canPost = isClubManager;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-950">+ Letter (Send Post)</DialogTitle>
          <DialogDescription>
            Club founders/managers can post updates and recruitment.
          </DialogDescription>
        </DialogHeader>

        {!canPost ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
              You’re currently in <span className="font-medium">Student</span> mode.
              Switch to <span className="font-medium">Club Manager</span> in Profile to publish posts.
            </div>
            <Button className="w-full rounded-2xl" onClick={() => onOpenChange(false)}>
              OK
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setMode("post")}
                className={cn(
                  "flex-1 rounded-2xl border px-3 py-2 text-sm",
                  mode === "post"
                    ? "border-zinc-900 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700"
                )}
              >
                Activity
              </button>
              <button
                onClick={() => setMode("recruitment")}
                className={cn(
                  "flex-1 rounded-2xl border px-3 py-2 text-sm",
                  mode === "recruitment"
                    ? "border-zinc-900 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700"
                )}
              >
                Recruitment
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-900">Posting as</div>
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-900">Title</div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-2xl"
                placeholder={mode === "recruitment" ? "e.g., Recruiting: Marketing + Ops" : "e.g., Workshop tonight"}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-900">Details</div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-24 rounded-2xl"
                placeholder="What’s happening? Include time/location/what to bring." 
              />
            </div>

            {mode === "recruitment" ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-zinc-900">Deadline</div>
                <Input
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="h-11 rounded-2xl"
                  placeholder="Mar 20"
                />
                <div className="text-xs text-zinc-500">
                  (Prototype) The application form fields can be customized later.
                </div>
              </div>
            ) : null}

            <Button
              className="w-full rounded-2xl"
              disabled={!clubId || !title.trim() || !body.trim()}
              onClick={() =>
                onCreate({
                  type: mode,
                  clubId,
                  title: title.trim(),
                  body: body.trim(),
                  deadline: mode === "recruitment" ? deadline : undefined,
                })
              }
            >
              Publish
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SideMenu({ open, onOpenChange, clubs }) {
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
              {["Career fair", "Hackathon", "Resume", "Photo walk", "Robotics"].map((t) => (
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
                <div key={c.id} className="flex items-center justify-between rounded-2xl px-2 py-2 hover:bg-zinc-50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-sm font-medium text-zinc-900">
                      {c.name}
                      {c.verified ? <ShieldCheck className="h-4 w-4 text-zinc-700" /> : null}
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

function MessagesView({ conversations, clubsById, onOpenChat }) {
  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-base font-semibold text-zinc-900">Inbox</div>
        <Button variant="secondary" className="rounded-2xl" size="sm">
          New
        </Button>
      </div>

      <div className="space-y-2">
        {conversations.map((c) => {
          const club = clubsById[c.clubId];
          return (
            <button
              key={c.id}
              onClick={() => onOpenChat(c.id)}
              className="w-full rounded-2xl border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-100" />
                  <div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-zinc-900">
                      {c.title}
                      {club?.verified ? <ShieldCheck className="h-4 w-4 text-zinc-700" /> : null}
                    </div>
                    <div className="line-clamp-1 text-xs text-zinc-600">{c.lastMessage}</div>
                  </div>
                </div>

                {c.unread ? (
                  <div className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-950 px-2 text-xs font-semibold text-white">
                    {c.unread}
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <Megaphone className="h-4 w-4" />
          Announcements
        </div>
        <div className="mt-1 text-xs text-zinc-600">
          Club leaders can send notices to members here.
        </div>
      </div>
    </div>
  );
}

function ChatDialog({ open, onOpenChange, title }) {
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
              Welcome! This is where members and leaders can communicate.
            </div>
          </div>
          <div className="flex items-start justify-end gap-2">
            <div className="max-w-[78%] rounded-2xl bg-zinc-950 p-3 text-sm text-white">
              Nice — can I join the next meeting?
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
            (Prototype) Real-time messaging requires a backend (WebSocket/Firestore/etc.).
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProfileView({ isClubManager, setIsClubManager, myClubs, applications, clubsById, postsById, onToggleMembership }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-100" />
        <div className="flex-1">
          <div className="text-base font-semibold text-zinc-950">Student</div>
          <div className="text-xs text-zinc-500">Mobile web prototype</div>
        </div>
        <button
          onClick={() => setIsClubManager((v) => !v)}
          className={cn(
            "rounded-2xl border px-3 py-2 text-xs font-medium",
            isClubManager
              ? "border-zinc-900 bg-zinc-950 text-white"
              : "border-zinc-200 bg-white text-zinc-700"
          )}
        >
          {isClubManager ? "Club Manager" : "Student"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 p-3">
        <div className="text-sm font-semibold text-zinc-900">My Clubs</div>
        <div className="mt-2 space-y-2">
          {myClubs.map((club) => (
            <div key={club.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2">
              <div>
                <div className="text-sm font-medium text-zinc-900">{club.name}</div>
                <div className="text-xs text-zinc-500">{club.tags.join(" • ")}</div>
              </div>
              <Button variant="secondary" className="rounded-2xl" size="sm" onClick={() => onToggleMembership(club.id)}>
                Leave
              </Button>
            </div>
          ))}
          {!myClubs.length ? (
            <div className="text-xs text-zinc-500">No clubs joined yet — apply from Recruitment.</div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 p-3">
        <div className="text-sm font-semibold text-zinc-900">Club Founder signup</div>
        <div className="mt-1 text-xs text-zinc-600">
          (Prototype) In production, this would verify you as a club admin.
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="secondary" className="rounded-2xl">Create club</Button>
          <Button variant="secondary" className="rounded-2xl">Manage club</Button>
        </div>
      </div>

      {isClubManager ? (
        <div className="mt-4 rounded-2xl border border-zinc-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900">Applications (Manager)</div>
              <div className="text-xs text-zinc-500">Received from recruitment posts</div>
            </div>
            <Badge variant="secondary" className="rounded-full">
              {applications.length}
            </Badge>
          </div>

          <div className="mt-3 space-y-2">
            {applications.length ? (
              applications.map((a) => {
                const club = clubsById[a.clubId];
                const post = postsById[a.postId];
                return (
                  <div key={a.id} className="rounded-2xl bg-zinc-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-zinc-900">{a.form.name || "(No name)"}</div>
                      <div className="text-xs text-zinc-500">{a.createdAt}</div>
                    </div>
                    <div className="mt-1 text-xs text-zinc-600">
                      {club?.name} • {post?.title}
                    </div>
                    <div className="mt-2 text-xs text-zinc-700">
                      <div><span className="font-medium">Email:</span> {a.form.email || "—"}</div>
                      {a.form.portfolio ? (
                        <div><span className="font-medium">Portfolio:</span> {a.form.portfolio}</div>
                      ) : null}
                      {a.form.role ? (
                        <div><span className="font-medium">Role:</span> {a.form.role}</div>
                      ) : null}
                      {a.form.why ? (
                        <div className="mt-1 line-clamp-3"><span className="font-medium">Why:</span> {a.form.why}</div>
                      ) : null}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button className="rounded-2xl" size="sm">Accept</Button>
                      <Button variant="secondary" className="rounded-2xl" size="sm">Decline</Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-zinc-500">
                No applications yet. Publish a recruitment post from +.
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-6 text-center text-xs text-zinc-400">
        Tip: This is a UI prototype. Add auth + database next.
      </div>
    </div>
  );
}

export default function CampusClubsMobile() {
  const [tab, setTab] = useState("post");
  const [query, setQuery] = useState("");

  const [clubs] = useState(sampleClubs);
  const clubsById = useMemo(() => Object.fromEntries(clubs.map((c) => [c.id, c])), [clubs]);

  const [posts, setPosts] = useState(seedPosts);
  const postsById = useMemo(() => Object.fromEntries(posts.map((p) => [p.id, p])), [posts]);

  const [isClubManager, setIsClubManager] = useState(false);
  const [myClubIds, setMyClubIds] = useState(["club_fin"]);

  const myClubs = useMemo(() => myClubIds.map((id) => clubsById[id]).filter(Boolean), [myClubIds, clubsById]);

  const [applications, setApplications] = useState([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [applyForId, setApplyForId] = useState(null);

  const [conversations] = useState(seedConversations);
  const [openChatId, setOpenChatId] = useState(null);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = posts.filter((p) => {
      const club = clubsById[p.clubId];
      const hay = `${p.title} ${p.body} ${club?.name || ""} ${(club?.tags || []).join(" ")}`.toLowerCase();
      return !q || hay.includes(q);
    });

    if (tab === "recruitment") return list.filter((p) => p.type === "recruitment");
    if (tab === "post") return list; // show all in main feed (like Explore)
    return [];
  }, [posts, clubsById, query, tab]);

  const masonryCols = useMasonry(filteredPosts, 2);

  const applyPost = applyForId ? postsById[applyForId] : null;
  const applyClub = applyPost ? clubsById[applyPost.clubId] : null;

  function onLike(postId) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p)));
  }

  function onSubmitApplication({ postId, clubId, form }) {
    const id = `app_${Math.random().toString(16).slice(2)}`;
    setApplications((prev) => [
      {
        id,
        postId,
        clubId,
        form,
        createdAt: "Just now",
      },
      ...prev,
    ]);

    // auto-join as a simple prototype behavior
    setMyClubIds((prev) => (prev.includes(clubId) ? prev : [clubId, ...prev]));

    setApplyForId(null);
  }

  function onCreatePost(payload) {
    const id = `p_${Math.random().toString(16).slice(2)}`;
    const newPost = {
      id,
      type: payload.type,
      clubId: payload.clubId,
      title: payload.title,
      body: payload.body,
      media:
        payload.type === "recruitment"
          ? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
          : "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      likes: 0,
      createdAt: "Now",
      ...(payload.type === "recruitment"
        ? {
            deadline: payload.deadline || "TBD",
            formFields: [
              { key: "name", label: "Name", type: "text", required: true },
              { key: "email", label: "School email", type: "email", required: true },
              { key: "role", label: "Role you’re applying for", type: "text", required: true },
              { key: "why", label: "Why do you want to join?", type: "textarea", required: true },
            ],
          }
        : {}),
    };

    setPosts((prev) => [newPost, ...prev]);
    setComposeOpen(false);
    setTab(payload.type === "recruitment" ? "recruitment" : "post");
  }

  function onToggleMembership(clubId) {
    setMyClubIds((prev) => prev.filter((id) => id !== clubId));
  }

  const tabLabel = tab === "recruitment" ? "Recruitment" : tab === "message" ? "Message" : tab === "profile" ? "Profile" : "Explore";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[480px]">
        <TopBar tabLabel={tabLabel} onOpenMenu={() => setMenuOpen(true)} query={query} setQuery={setQuery} />

        {/* content */}
        <div className="pb-28">
          {(tab === "post" || tab === "recruitment") && (
            <div className="px-3 py-4">
              <div className="grid grid-cols-2 gap-3">
                {masonryCols.map((col, idx) => (
                  <div key={idx} className="flex flex-col gap-3">
                    {col.map((p) => (
                      <PostCard
                        key={p.id}
                        post={p}
                        club={clubsById[p.clubId]}
                        onApply={(id) => setApplyForId(id)}
                        onLike={onLike}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {!filteredPosts.length ? (
                <div className="mt-10 text-center text-sm text-zinc-500">
                  No results. Try searching “Career fair” or a club name.
                </div>
              ) : null}
            </div>
          )}

          {tab === "message" && (
            <MessagesView
              conversations={conversations}
              clubsById={clubsById}
              onOpenChat={(id) => setOpenChatId(id)}
            />
          )}

          {tab === "profile" && (
            <ProfileView
              isClubManager={isClubManager}
              setIsClubManager={setIsClubManager}
              myClubs={myClubs}
              applications={applications}
              clubsById={clubsById}
              postsById={postsById}
              onToggleMembership={onToggleMembership}
            />
          )}
        </div>
      </div>

      <BottomNav
        active={tab}
        onChange={(t) => setTab(t)}
        onCompose={() => setComposeOpen(true)}
      />

      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} clubs={clubs} />

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        clubs={clubs}
        isClubManager={isClubManager}
        onCreate={onCreatePost}
      />

      <ApplyDialog
        open={!!applyForId}
        onOpenChange={(v) => setApplyForId(v ? applyForId : null)}
        post={applyPost}
        club={applyClub}
        onSubmit={onSubmitApplication}
      />

      <ChatDialog
        open={!!openChatId}
        onOpenChange={(v) => setOpenChatId(v ? openChatId : null)}
        title={openChatId ? conversations.find((c) => c.id === openChatId)?.title || "Chat" : "Chat"}
      />
    </div>
  );
}
