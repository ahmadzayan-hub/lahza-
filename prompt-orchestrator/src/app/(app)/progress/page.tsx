"use client";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  TrendingUp, BarChart3, Star, Flame, Brain, Clock, Award,
  BookOpen, CheckSquare, Target, Zap, Lock, Trophy,
} from "lucide-react";
import clsx from "clsx";

type ProgressTab = "grades" | "achievements";

/* ─── Grades ─────────────────────────────────────────────────────── */
interface Grade  { id:string; course_id:string; category:string; item_name:string; score:number|null; max_score:number; weight:number; }
interface Course { id:string; name:string; }

function letter(pct:number|null) {
  if(pct===null) return "—";
  if(pct>=90) return "A"; if(pct>=80) return "B"; if(pct>=70) return "C"; if(pct>=60) return "D"; return "F";
}
function letterColor(pct:number|null) {
  if(pct===null) return "text-slate-400";
  if(pct>=80) return "text-emerald-500"; if(pct>=70) return "text-amber-500"; return "text-red-500";
}
function barColor(pct:number|null) {
  if(pct===null) return "#94a3b8";
  if(pct>=80) return "#10b981"; if(pct>=70) return "#f59e0b"; return "#ef4444";
}

function GradesTab() {
  const [grades, setGrades]   = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("all");

  useEffect(()=>{
    Promise.all([fetch("/api/grades"),fetch("/api/courses")]).then(async([gr,cr])=>{
      if(gr.ok) setGrades(await gr.json());
      if(cr.ok) setCourses(await cr.json());
      setLoading(false);
    });
  },[]);

  if(loading) return <div className="flex justify-center py-10"><LoadingSpinner/></div>;

  // Compute per-course averages
  const courseAverages = courses.map(c=>{
    const cg = grades.filter(g=>g.course_id===c.id && g.score!==null);
    const pct = cg.length ? Math.round(cg.reduce((s,g)=>(s+(g.score!/g.max_score)*100),0)/cg.length) : null;
    return { course:c, pct, letter:letter(pct) };
  });

  const overall = courseAverages.filter(c=>c.pct!==null);
  const avg = overall.length ? Math.round(overall.reduce((s,c)=>s+c.pct!,0)/overall.length) : null;

  const visibleGrades = selected==="all" ? grades : grades.filter(g=>g.course_id===selected);
  const filteredByStatus = visibleGrades.filter(g=>g.score!==null);

  return (
    <div className="space-y-5">
      {/* Overall stat */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Overall Average", value:avg!==null?`${avg}%`:"—", sub:avg!==null?letter(avg):"No grades yet", color:"from-brand-500 to-blue-600" },
          { label:"Graded Items",    value:grades.filter(g=>g.score!==null).length, sub:"completed",               color:"from-emerald-500 to-teal-500" },
          { label:"Pending Items",   value:grades.filter(g=>g.score===null).length, sub:"not yet graded",           color:"from-amber-500 to-orange-500" },
        ].map(s=>(
          <div key={s.label} className="card text-center">
            <p className={clsx("text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br", s.color)}>{s.value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
            <p className="text-[10px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Course bar chart */}
      <div className="card">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 size={15} className="text-brand-500" /> Grade by Course
        </h3>
        <div className="flex items-end gap-3 h-32">
          {courseAverages.map(({course, pct})=>(
            <button key={course.id} onClick={()=>setSelected(s=>s===course.id?"all":course.id)}
              className={clsx("flex-1 flex flex-col items-center gap-1.5 group cursor-pointer transition-opacity", selected!=="all"&&selected!==course.id&&"opacity-40")}>
              <span className={clsx("text-xs font-bold", letterColor(pct))}>{pct!==null?`${pct}%`:"—"}</span>
              <div className="w-full rounded-t-lg transition-all duration-700 group-hover:opacity-80" style={{ height:`${pct!==null?(pct/100)*72:8}px`, backgroundColor:barColor(pct) }} />
              <span className="text-[9px] text-slate-400 text-center w-full truncate leading-tight">{course.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">Click a bar to filter</p>
      </div>

      {/* Grade items */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Grade Items</h3>
          <select value={selected} onChange={e=>setSelected(e.target.value)}
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 bg-white/70 dark:bg-slate-800/70">
            <option value="all">All Courses</option>
            {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          {filteredByStatus.length===0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No graded items yet</p>
          ) : filteredByStatus.map(g=>{
            const pct = Math.round((g.score!/g.max_score)*100);
            return (
              <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{g.item_name}</p>
                  <p className="text-xs text-slate-400">{g.category}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, backgroundColor:barColor(pct) }} />
                  </div>
                  <span className={clsx("text-sm font-black w-10 text-right", letterColor(pct))}>{pct}%</span>
                  <span className={clsx("text-xs font-bold w-5", letterColor(pct))}>{letter(pct)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Achievements ───────────────────────────────────────────────── */
interface Badge { id:string; icon:React.ReactNode; title:string; description:string; earned:boolean; earnedDate?:string; category:string; progress?:number; target?:number; color:string; }

const BADGES: Badge[] = [
  { id:"b-01", icon:<Flame className="w-5 h-5"/>,       title:"7-Day Streak",       description:"Studied 7 days in a row",           earned:true,  earnedDate:"May 1, 2026",  category:"Consistency", color:"from-orange-400 to-red-500"     },
  { id:"b-02", icon:<BookOpen className="w-5 h-5"/>,    title:"Study Pack Creator",  description:"Generated first AI Study Pack",      earned:true,  earnedDate:"Apr 15, 2026", category:"Learning",     color:"from-violet-400 to-purple-600"  },
  { id:"b-03", icon:<Brain className="w-5 h-5"/>,       title:"Quiz Master",         description:"Scored 90%+ on 3 quizzes",           earned:true,  earnedDate:"Apr 22, 2026", category:"Academic",     color:"from-blue-400 to-indigo-600"    },
  { id:"b-04", icon:<CheckSquare className="w-5 h-5"/>, title:"Task Champion",       description:"Completed 50 tasks",                 earned:true,  earnedDate:"Apr 28, 2026", category:"Productivity", color:"from-emerald-400 to-teal-600"   },
  { id:"b-05", icon:<Target className="w-5 h-5"/>,      title:"On-Time Achiever",    description:"10 assignments before deadline",     earned:true,  earnedDate:"May 3, 2026",  category:"Productivity", color:"from-amber-400 to-yellow-500"   },
  { id:"b-06", icon:<Zap className="w-5 h-5"/>,         title:"AI Power User",       description:"100 AI Tutor sessions",              earned:false, category:"Learning",     color:"from-yellow-400 to-orange-500",  progress:47,  target:100 },
  { id:"b-07", icon:<TrendingUp className="w-5 h-5"/>,  title:"Grade Climber",       description:"Improve GPA by 5+ points",           earned:false, category:"Academic",     color:"from-green-400 to-emerald-600",  progress:3,   target:5   },
  { id:"b-08", icon:<Star className="w-5 h-5"/>,        title:"Dean's List",         description:"Maintain 85%+ average",              earned:false, category:"Academic",     color:"from-amber-400 to-yellow-600",   progress:72,  target:85  },
  { id:"b-09", icon:<Clock className="w-5 h-5"/>,       title:"30-Day Streak",       description:"Study 30 days in a row",             earned:false, category:"Consistency",  color:"from-red-400 to-rose-600",       progress:7,   target:30  },
  { id:"b-10", icon:<Trophy className="w-5 h-5"/>,      title:"Top Performer",       description:"Rank #1 in your cohort",             earned:false, category:"Academic",     color:"from-yellow-400 to-amber-600",   progress:0,   target:1   },
  { id:"b-11", icon:<Award className="w-5 h-5"/>,       title:"Flashcard Fanatic",   description:"Review 500 flashcards",              earned:false, category:"Learning",     color:"from-pink-400 to-rose-500",      progress:120, target:500 },
  { id:"b-12", icon:<BookOpen className="w-5 h-5"/>,    title:"Completionist",       description:"100% progress on 3 courses",         earned:false, category:"Academic",     color:"from-indigo-400 to-brand-600",   progress:0,   target:3   },
];

function AchievementsTab() {
  const [filter, setFilter] = useState("all");
  const categories = ["all", ...Array.from(new Set(BADGES.map(b=>b.category)))];
  const visible = filter==="all" ? BADGES : BADGES.filter(b=>b.category===filter);
  const earned  = BADGES.filter(b=>b.earned).length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="card bg-gradient-to-br from-amber-50/80 to-yellow-50/60 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-100/60 dark:border-amber-800/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
            <Trophy size={24} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-600">{earned}<span className="text-base font-medium text-slate-400">/{BADGES.length}</span></p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Badges Earned</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-28 h-1.5 rounded-full bg-amber-200 dark:bg-amber-900/40 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width:`${(earned/BADGES.length)*100}%` }} />
              </div>
              <span className="text-xs text-amber-600 font-semibold">{Math.round((earned/BADGES.length)*100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(c=>(
          <button key={c} onClick={()=>setFilter(c)}
            className={clsx("px-3 py-1.5 rounded-xl text-xs font-semibold transition capitalize",
              filter===c?"bg-amber-500 text-white":"bg-white/60 dark:bg-white/5 text-slate-500 hover:bg-white/80")}>
            {c}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map(b=>(
          <div key={b.id} className={clsx("card text-center p-4 transition-all", b.earned?"hover:-translate-y-0.5 hover:shadow-card-hover":"opacity-60")}>
            <div className={clsx("w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-md relative",
              b.earned ? `bg-gradient-to-br ${b.color} text-white` : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
              {b.icon}
              {!b.earned && <Lock size={10} className="absolute -bottom-0.5 -right-0.5 text-slate-400 bg-white dark:bg-slate-900 rounded-full p-0.5" />}
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{b.title}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{b.description}</p>
            {b.earned && b.earnedDate && (
              <p className="text-[9px] text-amber-500 font-semibold mt-1.5">✓ {b.earnedDate}</p>
            )}
            {!b.earned && b.progress!==undefined && b.target && (
              <div className="mt-2">
                <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width:`${Math.min((b.progress/b.target)*100,100)}%` }} />
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">{b.progress}/{b.target}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default function ProgressPage() {
  const [tab, setTab] = useState<ProgressTab>("grades");

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Progress</h1>
        <p className="text-sm text-slate-500 mt-0.5">Grades and achievements</p>
      </div>

      <div className="flex gap-1 p-1 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-white/10 w-fit">
        {([
          { id:"grades",       label:"Grades",       icon:<BarChart3 size={15}/> },
          { id:"achievements", label:"Achievements", icon:<Trophy size={15}/>    },
        ] as const).map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={clsx("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              tab===t.id?"bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm":"text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab==="grades"       && <GradesTab />}
      {tab==="achievements" && <AchievementsTab />}
    </div>
  );
}
