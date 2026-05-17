"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import {
  CalendarCheck, CheckSquare, Clock, Plus, X, AlertTriangle,
  CheckCircle, Circle, Loader, ChevronLeft, ChevronRight,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, parseISO } from "date-fns";
import clsx from "clsx";

type PlanTab = "tasks" | "deadlines";

/* ─── Tasks ─────────────────────────────────────────────────────── */
interface Task { id:string; title:string; description?:string; status:"todo"|"in_progress"|"done"; priority:"low"|"medium"|"high"; course_name?:string; due_date?:string; }
interface Course { id:string; name:string; }

const STATUS_CONFIG = {
  todo:        { label:"To Do",       icon:<Circle size={13}/>,    color:"text-slate-400",     bg:"bg-slate-100 dark:bg-slate-800/60"   },
  in_progress: { label:"In Progress", icon:<Loader size={13}/>,    color:"text-amber-500",     bg:"bg-amber-50 dark:bg-amber-950/20"    },
  done:        { label:"Done",        icon:<CheckCircle size={13}/>,color:"text-emerald-500",  bg:"bg-emerald-50 dark:bg-emerald-950/20" },
};

const PRIORITY_COLOR: Record<string,string> = { high:"red", medium:"yellow", low:"gray" };

function TasksTab() {
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [courses, setCourses]     = useState<Course[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState<Task["status"]|null>(null);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ title:"", description:"", priority:"medium", course_id:"", due_date:"" });
  const toast = useToast();

  useEffect(()=>{
    Promise.all([fetch("/api/tasks"),fetch("/api/courses")]).then(async([tr,cr])=>{
      if(tr.ok) setTasks(await tr.json());
      if(cr.ok) setCourses(await cr.json());
      setLoading(false);
    });
  },[]);

  async function addTask(e:React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const r = await fetch("/api/tasks",{ method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,status:showAdd}) });
    if(r.ok){ const t=await r.json(); setTasks(p=>[t,...p]); setShowAdd(null); setForm({title:"",description:"",priority:"medium",course_id:"",due_date:""}); toast("success","Task added"); }
    setSaving(false);
  }

  async function move(task:Task, status:Task["status"]) {
    const r = await fetch(`/api/tasks/${task.id}`,{ method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status}) });
    if(r.ok) setTasks(p=>p.map(t=>t.id===task.id?{...t,status}:t));
  }

  async function del(id:string) {
    const r = await fetch(`/api/tasks/${id}`,{ method:"DELETE" });
    if(r.ok) setTasks(p=>p.filter(t=>t.id!==id));
  }

  if(loading) return <div className="flex justify-center py-10"><LoadingSpinner/></div>;

  const cols: Task["status"][] = ["todo","in_progress","done"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cols.map(col => {
          const cfg = STATUS_CONFIG[col];
          const colTasks = tasks.filter(t=>t.status===col);
          return (
            <div key={col} className={clsx("rounded-2xl p-3 space-y-2", cfg.bg)}>
              <div className="flex items-center justify-between px-1 mb-1">
                <div className={clsx("flex items-center gap-1.5 text-sm font-bold", cfg.color)}>
                  {cfg.icon} {cfg.label}
                  <span className="ml-1 w-5 h-5 rounded-full bg-white/60 dark:bg-white/10 text-xs flex items-center justify-center text-slate-500">{colTasks.length}</span>
                </div>
                <button onClick={()=>setShowAdd(col)} className="w-6 h-6 rounded-lg bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-slate-600 transition">
                  <Plus size={12}/>
                </button>
              </div>

              {showAdd===col && (
                <form onSubmit={addTask} className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow-card space-y-2 border border-slate-200/60 dark:border-slate-700/60">
                  <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required placeholder="Task title…"
                    className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white dark:bg-slate-900" />
                  <div className="flex gap-2">
                    <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}
                      className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900">
                      <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                    </select>
                    <input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))}
                      className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="flex-1 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition">
                      {saving?"Saving…":"Add Task"}
                    </button>
                    <button type="button" onClick={()=>setShowAdd(null)} className="w-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600 flex items-center justify-center">
                      <X size={12}/>
                    </button>
                  </div>
                </form>
              )}

              {colTasks.map(task=>(
                <div key={task.id} className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow-card border border-slate-100/80 dark:border-slate-700/40 group">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight flex-1">{task.title}</p>
                    <button onClick={()=>del(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition flex-shrink-0"><X size={12}/></button>
                  </div>
                  {task.course_name && <p className="text-[10px] text-slate-400 mt-1">{task.course_name}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <Badge color={PRIORITY_COLOR[task.priority] as any}>{task.priority}</Badge>
                    {task.due_date && <span className="text-[10px] text-slate-400">{format(new Date(task.due_date),"MMM d")}</span>}
                  </div>
                  {col!=="done" && (
                    <div className="flex gap-1 mt-2">
                      {cols.filter(c=>c!==col).map(c=>(
                        <button key={c} onClick={()=>move(task,c)}
                          className="flex-1 text-[10px] py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:text-brand-600 dark:hover:text-brand-400 transition font-medium">
                          → {STATUS_CONFIG[c].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {colTasks.length===0 && (
                <p className="text-xs text-slate-400 text-center py-4">No tasks here</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Deadlines ─────────────────────────────────────────────────── */
interface Deadline { id:string; title:string; course_name:string; due_date:string; risk:"safe"|"due_soon"|"at_risk"|"overdue"; type:string; }

const RISK_COLOR: Record<string,"red"|"yellow"|"green"|"blue"> = { overdue:"red", at_risk:"red", due_soon:"yellow", safe:"green" };
const RISK_BORDER: Record<string,string> = { overdue:"#ef4444", at_risk:"#ef4444", due_soon:"#f59e0b", safe:"#10b981" };

function DeadlinesTab() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading]     = useState(true);
  const [month, setMonth]         = useState(new Date());
  const [filter, setFilter]       = useState<"all"|"at_risk"|"due_soon">("all");

  useEffect(()=>{
    fetch("/api/deadlines").then(r=>r.ok&&r.json()).then(d=>{ if(d) setDeadlines(d); setLoading(false); });
  },[]);

  const days = eachDayOfInterval({ start:startOfMonth(month), end:endOfMonth(month) });
  const firstDay = startOfMonth(month).getDay();

  const visible = deadlines.filter(d => filter==="all" || d.risk===filter);

  if(loading) return <div className="flex justify-center py-10"><LoadingSpinner/></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Calendar */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={()=>setMonth(m=>subMonths(m,1))} className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition"><ChevronLeft size={14}/></button>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{format(month,"MMMM yyyy")}</h3>
          <button onClick={()=>setMonth(m=>addMonths(m,1))} className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition"><ChevronRight size={14}/></button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center mb-2">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} className="text-[10px] font-bold text-slate-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`}/>)}
          {days.map(day => {
            const hasDeadline = deadlines.some(d=>isSameDay(parseISO(d.due_date),day));
            const urgent = deadlines.some(d=>isSameDay(parseISO(d.due_date),day)&&(d.risk==="at_risk"||d.risk==="overdue"));
            return (
              <div key={day.toISOString()} className={clsx("relative flex flex-col items-center py-1.5 rounded-lg text-xs transition cursor-default",
                isToday(day)?"bg-brand-500 text-white font-bold":"hover:bg-white/60 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300")}>
                {day.getDate()}
                {hasDeadline && <span className={clsx("w-1.5 h-1.5 rounded-full mt-0.5", urgent?"bg-red-400":"bg-amber-400")} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Deadline list */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex-1">Deadlines</h3>
          {(["all","at_risk","due_soon"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={clsx("px-2.5 py-1 rounded-lg text-xs font-semibold transition",
                filter===f?"bg-amber-500 text-white":"bg-white/60 dark:bg-white/5 text-slate-500 hover:bg-white/80")}>
              {f==="all"?"All":f==="at_risk"?"At Risk":"Due Soon"}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {visible.length===0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-sm text-slate-400">All clear!</p>
            </div>
          ) : visible.map(d=>(
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition"
              style={{ borderLeft:`3px solid ${RISK_BORDER[d.risk]}`, paddingLeft:"12px" }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{d.title}</p>
                <p className="text-xs text-slate-400 truncate">{d.course_name}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <Badge color={RISK_COLOR[d.risk]||"gray"}>{d.risk.replace("_"," ")}</Badge>
                <p className="text-[10px] text-slate-400 mt-1">{format(parseISO(d.due_date),"MMM d")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default function PlanPage() {
  const [tab, setTab] = useState<PlanTab>("tasks");

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Plan</h1>
        <p className="text-sm text-slate-500 mt-0.5">Tasks and deadlines in one place</p>
      </div>

      <div className="flex gap-1 p-1 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-white/10 w-fit">
        {([
          { id:"tasks",     label:"Tasks",     icon:<CheckSquare size={15}/> },
          { id:"deadlines", label:"Deadlines", icon:<Clock size={15}/>       },
        ] as const).map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={clsx("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              tab===t.id ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab==="tasks"     && <TasksTab />}
      {tab==="deadlines" && <DeadlinesTab />}
    </div>
  );
}
