"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  BookOpen, Clock, Brain, Zap, ArrowRight, Flame,
  CheckCircle, AlertTriangle, Megaphone, CalendarCheck,
  TrendingUp, Bot, Layers,
} from "lucide-react";
import { format } from "date-fns";

interface Course    { id: string; name: string; code: string; progress: number; instructor: string; }
interface Deadline  { id: string; title: string; course_name: string; due_date: string; risk: "safe"|"due_soon"|"at_risk"|"overdue"; type: string; }
interface Announcement { id: string; title: string; summary: string; risk_level: string; course_name: string; created_at: string; }

function RingProgress({ value, size = 48, stroke = 4, color = "#3b82f6" }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

const riskColors: Record<string, "red"|"yellow"|"green"|"blue"> = {
  overdue: "red", at_risk: "red", due_soon: "yellow", safe: "green",
};
const riskLabels: Record<string, string> = {
  overdue: "Overdue", at_risk: "At Risk", due_soon: "Due Soon", safe: "Safe",
};

export default function DashboardPage() {
  const [courses, setCourses]             = useState<Course[]>([]);
  const [deadlines, setDeadlines]         = useState<Deadline[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [profile, setProfile]             = useState<{ full_name?: string } | null>(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/courses"),
      fetch("/api/deadlines?view=week"),
      fetch("/api/announcements?limit=3"),
      fetch("/api/profile"),
    ]).then(async ([cR, dR, aR, pR]) => {
      if (cR.ok) setCourses(await cR.json());
      if (dR.ok) setDeadlines(await dR.json());
      if (aR.ok) setAnnouncements(await aR.json());
      if (pR.ok) setProfile(await pR.json());
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name?.split(" ")[0] ?? "Student";
  const urgent = deadlines.filter(d => d.risk === "overdue" || d.risk === "at_risk");

  if (loading) return (
    <div className="space-y-5 animate-fade-in">
      <div className="skeleton h-44 rounded-3xl" />
      <div className="grid grid-cols-2 gap-4"><div className="skeleton h-56 rounded-2xl" /><div className="skeleton h-56 rounded-2xl" /></div>
      <div className="skeleton h-40 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-up">

      {/* ── Hero / greeting ── */}
      <div className="relative rounded-3xl overflow-hidden hero-gradient p-6 text-white shadow-float">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-15 animate-float-slow"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,.35),transparent)", transform: "translate(30%,-30%)" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="flex-1">
            <p className="text-white/70 text-sm mb-1">{greeting} 👋</p>
            <h1 className="text-2xl font-bold mb-1">{profile?.full_name ?? "Welcome back!"}</h1>
            <p className="text-white/65 text-sm mb-4">MBA Year 2 · {courses.length} active courses</p>

            {/* Urgent alert */}
            {urgent.length > 0 && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 rounded-xl px-3.5 py-2 mb-4 text-sm">
                <AlertTriangle size={14} className="text-red-300 flex-shrink-0" />
                <span className="font-semibold">{urgent.length} item{urgent.length > 1 ? "s" : ""} need your attention</span>
                <Link href="/plan" className="ml-auto text-xs text-red-200 hover:text-white underline">View</Link>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Link href="/study">
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:scale-105">
                  <Brain size={14} /> Start Studying <ArrowRight size={12} />
                </button>
              </Link>
              <Link href="/plan">
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2 text-sm transition-all hover:scale-105">
                  <CalendarCheck size={14} /> My Plan
                </button>
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex sm:flex-col gap-3 flex-shrink-0">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/20">
              <div className="relative">
                <RingProgress value={72} size={40} stroke={4} color="#34d399" />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">72%</span>
              </div>
              <div><p className="text-[10px] text-white/60">Readiness</p><p className="text-xs font-bold">Exam Ready</p></div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/20">
              <Flame size={18} className="text-orange-300 animate-pulse-soft" />
              <div><p className="text-[10px] text-white/60">Streak</p><p className="text-xs font-bold">14 days 🔥</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Deadlines + Courses ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Upcoming deadlines */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Clock size={13} className="text-white" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Deadlines This Week</h2>
            </div>
            <Link href="/plan" className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1">
              Full Plan <ArrowRight size={11} />
            </Link>
          </div>

          {deadlines.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="w-9 h-9 mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-sm text-slate-400">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deadlines.slice(0, 5).map(d => {
                const isUrgent = d.risk === "overdue" || d.risk === "at_risk";
                const isSoon   = d.risk === "due_soon";
                const left = isUrgent ? "#ef4444" : isSoon ? "#f59e0b" : "#10b981";
                return (
                  <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition"
                    style={{ borderLeft: `3px solid ${left}`, paddingLeft: "10px" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{d.title}</p>
                      <p className="text-xs text-slate-400 truncate">{d.course_name} · {format(new Date(d.due_date), "MMM d")}</p>
                    </div>
                    <Badge color={riskColors[d.risk] || "gray"}>{riskLabels[d.risk]}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Courses progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center">
                <BookOpen size={13} className="text-white" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">My Courses</h2>
            </div>
            <Link href="/courses" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1">
              All Courses <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {courses.slice(0, 5).map((c, i) => {
              const cols = ["#3b82f6","#a855f7","#14b8a6","#f59e0b","#ef4444"];
              const col  = cols[i % cols.length];
              return (
                <Link key={c.id} href={`/courses/${c.id}`}>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition cursor-pointer">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${col}, ${col}99)` }}>
                      {c.code?.slice(0,2) || "CO"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200/60 dark:bg-slate-700/60">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${c.progress}%`, background: `linear-gradient(90deg, ${col}, ${col}cc)` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{c.progress}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Study tools quick access ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Study Tools</h2>
          <Link href="/study" className="ml-auto text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1">
            All Tools <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/study#tutor",      icon: <Bot size={20} />,    label: "AI Tutor",       sub: "Ask anything",        grad: "from-teal-500 to-cyan-500"       },
            { href: "/study#flashcards", icon: <Layers size={20} />, label: "Flashcards",     sub: "18 due for review",   grad: "from-amber-500 to-orange-500"    },
            { href: "/study#quizzes",    icon: <Brain size={20} />,  label: "Quiz Me",        sub: "Test your knowledge", grad: "from-violet-500 to-purple-600"   },
            { href: "/study#packs",      icon: <BookOpen size={20}/>, label: "Study Packs",   sub: "AI-generated notes",  grad: "from-brand-500 to-blue-600"      },
          ].map(t => (
            <Link key={t.href} href={t.href}>
              <div className="group flex flex-col gap-2 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10 transition-all hover:-translate-y-0.5 cursor-pointer">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.grad} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                  {t.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent announcements ── */}
      {announcements.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Megaphone size={13} className="text-white" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Recent Announcements</h2>
            </div>
          </div>
          <div className="space-y-2">
            {announcements.map(a => (
              <div key={a.id} className="flex gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/8 transition">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0 animate-pulse-soft" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.title}</p>
                  {a.summary && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.summary}</p>}
                  <p className="text-[10px] text-slate-400 mt-1">{a.course_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
