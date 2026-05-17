"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/Toast";
import {
  Brain, Layers, BookOpen, Mic, Bot, Send, Plus, ChevronLeft,
  ChevronRight, RotateCcw, ThumbsUp, ThumbsDown, CheckCircle,
  XCircle, RefreshCw, Sparkles, X, ChevronDown, AlertCircle,
} from "lucide-react";
import clsx from "clsx";

type Tab = "tutor" | "flashcards" | "quizzes" | "packs" | "lecture";

/* ─── AI Tutor ─────────────────────────────────────────────────── */
interface Message { role: "user"|"assistant"; content: string; citations?: {file_name:string;page_num?:number}[]; }
interface Chat    { id: string; title: string; created_at: string; }
interface Course  { id: string; name: string; }

function TutorTab() {
  const toast = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [chats, setChats]             = useState<Chat[]>([]);
  const [courses, setCourses]         = useState<Course[]>([]);
  const [activeChatId, setActiveChatId] = useState<string|null>(null);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [sending, setSending]         = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    fetch("/api/tutor").then(r => r.ok && r.json()).then(d => d && setChats(d));
    fetch("/api/courses").then(r => r.ok && r.json()).then(d => d && setCourses(d));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  async function newChat() {
    const res = await fetch("/api/tutor", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ course_id: selectedCourse||null }) });
    if (res.ok) {
      const chat = await res.json();
      setChats(p => [chat, ...p]);
      setActiveChatId(chat.id);
      setMessages([]);
    }
  }

  async function loadChat(id:string) {
    setActiveChatId(id);
    const r = await fetch(`/api/tutor/${id}/messages`);
    if (r.ok) setMessages(await r.json());
  }

  async function send() {
    if (!input.trim()||sending||!activeChatId) return;
    const userMsg:Message = { role:"user", content:input.trim() };
    setMessages(p => [...p, userMsg]);
    setInput(""); setSending(true);
    try {
      const r = await fetch(`/api/tutor/${activeChatId}/messages`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ content:userMsg.content }) });
      if (r.ok) { const msg = await r.json(); setMessages(p => [...p, msg]); }
    } finally { setSending(false); }
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[480px]">
      {/* Chat list */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-2 hidden sm:flex">
        <div className="flex items-center gap-2 mb-1">
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-2 py-1.5 text-slate-700 dark:text-slate-300">
            <option value="">All courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={newChat} className="w-8 h-8 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center flex-shrink-0 transition">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {chats.map(c => (
            <button key={c.id} onClick={() => loadChat(c.id)}
              className={clsx("w-full text-left px-3 py-2 rounded-xl text-xs transition",
                activeChatId===c.id ? "bg-brand-500 text-white" : "hover:bg-white/60 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400")}>
              <p className="font-medium truncate">{c.title||"New chat"}</p>
            </button>
          ))}
          {chats.length===0 && <p className="text-xs text-slate-400 text-center mt-4">No chats yet</p>}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col card !p-0 overflow-hidden">
        {!activeChatId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Bot size={28} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">MBA AI Tutor</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">Ask anything about your courses. Start a new chat or continue a previous one.</p>
            </div>
            <button onClick={newChat} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
              <Plus size={15} /> New Chat
            </button>
            {/* Mobile: show chat list */}
            {chats.length>0 && (
              <div className="w-full sm:hidden space-y-1 mt-2">
                {chats.slice(0,5).map(c => (
                  <button key={c.id} onClick={() => loadChat(c.id)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/60 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition border border-slate-200/60 dark:border-slate-700/60">
                    {c.title||"New chat"}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={clsx("flex", m.role==="user" ? "justify-end" : "justify-start")}>
                  <div className={clsx("max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    m.role==="user" ? "bg-brand-500 text-white rounded-br-md" : "bg-white/70 dark:bg-white/10 text-slate-800 dark:text-slate-200 rounded-bl-md shadow-sm")}>
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white/70 dark:bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-slate-200/60 dark:border-slate-700/40 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())}
                placeholder="Ask your tutor anything…"
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <button onClick={send} disabled={sending||!input.trim()}
                className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white flex items-center justify-center transition flex-shrink-0">
                <Send size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Flashcards ────────────────────────────────────────────────── */
interface Flashcard { id:string; pack_id:string; pack_topic?:string; course_name?:string; front:string; back:string; }
interface StudyPack { id:string; topic:string; course_name?:string; }

function FlashcardsTab() {
  const [packs, setPacks]         = useState<StudyPack[]>([]);
  const [selected, setSelected]   = useState("all");
  const [cards, setCards]         = useState<Flashcard[]>([]);
  const [loading, setLoading]     = useState(true);
  const [current, setCurrent]     = useState(0);
  const [flipped, setFlipped]     = useState(false);
  const [session, setSession]     = useState({ known:0, review:0 });
  const [done, setDone]           = useState(false);

  useEffect(() => {
    fetch("/api/study-packs").then(r => r.ok&&r.json()).then(d => d && setPacks(d.filter((p:any)=>p.status==="ready")));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!packs.length) return;
    setLoading(true);
    const url = selected==="all" ? "/api/flashcards" : `/api/flashcards?pack_id=${selected}`;
    fetch(url).then(r => r.ok&&r.json()).then(d => {
      if (d) { setCards([...d].sort(()=>Math.random()-.5)); setCurrent(0); setFlipped(false); setDone(false); setSession({known:0,review:0}); }
      setLoading(false);
    });
  }, [selected, packs]);

  function vote(known:boolean) {
    setSession(s => ({ known: s.known+(known?1:0), review: s.review+(!known?1:0) }));
    if (current+1>=cards.length) { setDone(true); return; }
    setCurrent(c => c+1); setFlipped(false);
  }

  function restart() { setCards(c=>[...c].sort(()=>Math.random()-.5)); setCurrent(0); setFlipped(false); setDone(false); setSession({known:0,review:0}); }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;

  const card = cards[current];

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Pack selector */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={()=>setSelected("all")}
          className={clsx("px-3 py-1.5 rounded-xl text-xs font-semibold transition", selected==="all"?"bg-amber-500 text-white":"bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/80")}>
          All Packs
        </button>
        {packs.map(p => (
          <button key={p.id} onClick={()=>setSelected(p.id)}
            className={clsx("px-3 py-1.5 rounded-xl text-xs font-semibold transition", selected===p.id?"bg-amber-500 text-white":"bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/80")}>
            {p.topic}
          </button>
        ))}
      </div>

      {cards.length===0 ? (
        <div className="card text-center py-12 text-slate-400">
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No flashcards yet. Generate a study pack first.</p>
          <Link href="/study#packs"><button className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold">Go to Study Packs</button></Link>
        </div>
      ) : done ? (
        <div className="card text-center py-12 space-y-4">
          <div className="text-4xl">🎉</div>
          <h3 className="font-bold text-xl text-slate-900 dark:text-white">Session Complete!</h3>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center"><p className="text-2xl font-black text-emerald-500">{session.known}</p><p className="text-slate-400">Known</p></div>
            <div className="text-center"><p className="text-2xl font-black text-amber-500">{session.review}</p><p className="text-slate-400">Review</p></div>
          </div>
          <button onClick={restart} className="flex items-center gap-2 mx-auto bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
            <RotateCcw size={14} /> Study Again
          </button>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{current+1}/{cards.length}</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width:`${((current+1)/cards.length)*100}%` }} />
            </div>
          </div>

          {/* Flip card */}
          <div className="cursor-pointer" onClick={() => setFlipped(f=>!f)} style={{ perspective:"1200px" }}>
            <div style={{ transformStyle:"preserve-3d", transition:"transform 0.5s cubic-bezier(0.34,1.56,0.64,1)", transform:flipped?"rotateY(180deg)":"rotateY(0deg)", minHeight:"220px", position:"relative" }}>
              <div className="card absolute inset-0 flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility:"hidden" }}>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">Question</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">{card.front}</p>
                <p className="text-xs text-slate-400 mt-6">Tap to reveal answer</p>
              </div>
              <div className="card absolute inset-0 flex flex-col items-center justify-center p-8 text-center" style={{ backfaceVisibility:"hidden", transform:"rotateY(180deg)", background:"linear-gradient(135deg,rgba(245,158,11,.08),rgba(249,115,22,.06))" }}>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4">Answer</p>
                <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed">{card.back}</p>
              </div>
            </div>
          </div>

          {flipped && (
            <div className="flex gap-3">
              <button onClick={()=>vote(false)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-950/50 transition">
                <ThumbsDown size={15} /> Need Review
              </button>
              <button onClick={()=>vote(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition">
                <ThumbsUp size={15} /> Got It!
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Quizzes ───────────────────────────────────────────────────── */
interface Quiz { id:string; pack_id:string; course_name?:string; pack_topic?:string; title:string; questions:QuizQuestion[]; status:string; }
interface QuizQuestion { q:string; options:string[]; answer:number; explanation?:string; }

function QuizzesTab() {
  const [quizzes, setQuizzes]   = useState<Quiz[]>([]);
  const [packs, setPacks]       = useState<StudyPack[]>([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState<Quiz|null>(null);
  const [current, setCurrent]   = useState(0);
  const [picked, setPicked]     = useState<number|null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers]   = useState<(number|null)[]>([]);
  const [done, setDone]         = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]         = useState({ pack_id:"", num_questions:"10" });
  const toast = useToast();

  useEffect(() => {
    Promise.all([fetch("/api/quizzes"), fetch("/api/study-packs")]).then(async ([qr,pr]) => {
      if (qr.ok) setQuizzes(await qr.json());
      if (pr.ok) setPacks((await pr.json()).filter((p:any)=>p.status==="ready"));
      setLoading(false);
    });
  }, []);

  async function generate(e:React.FormEvent) {
    e.preventDefault(); setGenerating(true);
    const r = await fetch("/api/quizzes", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ pack_id:form.pack_id, num_questions:Number(form.num_questions) }) });
    if (r.ok) { const q=await r.json(); setQuizzes(p=>[q,...p]); setShowCreate(false); toast("success","Quiz generated!"); }
    setGenerating(false);
  }

  function startQuiz(q:Quiz) { setActive(q); setCurrent(0); setPicked(null); setAnswered(false); setAnswers(Array(q.questions.length).fill(null)); setDone(false); }

  function submit() {
    if (picked===null) return;
    const newAnswers = [...answers]; newAnswers[current]=picked; setAnswers(newAnswers); setAnswered(true);
  }

  function next() {
    if (current+1>=active!.questions.length) { setDone(true); return; }
    setCurrent(c=>c+1); setPicked(null); setAnswered(false);
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;

  if (done && active) {
    const correct = answers.filter((a,i)=>a===active.questions[i].answer).length;
    const pct = Math.round((correct/active.questions.length)*100);
    return (
      <div className="max-w-md mx-auto card text-center py-10 space-y-4">
        <div className="text-4xl">{pct>=80?"🏆":pct>=60?"👍":"📚"}</div>
        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Quiz Complete!</h3>
        <p className="text-4xl font-black text-brand-600">{pct}%</p>
        <p className="text-slate-500 text-sm">{correct} of {active.questions.length} correct</p>
        <button onClick={()=>setActive(null)} className="flex items-center gap-2 mx-auto bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (active) {
    const q = active.questions[current];
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={()=>setActive(null)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"><ChevronLeft size={13}/> Back</button>
          <span className="text-xs text-slate-400">{current+1} / {active.questions.length}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width:`${((current+1)/active.questions.length)*100}%` }} />
        </div>
        <div className="card">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-500 mb-3">Question {current+1}</p>
          <p className="text-base font-semibold text-slate-900 dark:text-white mb-5 leading-relaxed">{q.q}</p>
          <div className="space-y-2">
            {q.options.map((opt,i) => {
              const isCorrect = i===q.answer;
              const isPicked  = i===picked;
              return (
                <button key={i} onClick={()=>!answered&&setPicked(i)}
                  className={clsx("w-full text-left px-4 py-3 rounded-xl text-sm transition border",
                    answered && isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-800 dark:text-emerald-300" :
                    answered && isPicked && !isCorrect ? "bg-red-50 dark:bg-red-950/30 border-red-400 text-red-800 dark:text-red-300" :
                    isPicked ? "bg-violet-50 dark:bg-violet-950/30 border-violet-400 text-violet-800 dark:text-violet-300" :
                    "border-slate-200 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300")}>
                  <span className="font-semibold mr-2">{String.fromCharCode(65+i)}.</span>{opt}
                </button>
              );
            })}
          </div>
          {answered && q.explanation && (
            <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
              💡 {q.explanation}
            </div>
          )}
          <div className="flex justify-end mt-4">
            {!answered ? (
              <button onClick={submit} disabled={picked===null} className="px-5 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-40 text-white text-sm font-semibold transition">
                Submit
              </button>
            ) : (
              <button onClick={next} className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition">
                {current+1>=active.questions.length ? "See Results" : "Next →"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white">My Quizzes</h3>
        <button onClick={()=>setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-semibold transition">
          <Sparkles size={13} /> Generate Quiz
        </button>
      </div>

      {showCreate && (
        <div className="card bg-violet-50/80 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
          <form onSubmit={generate} className="space-y-3">
            <select value={form.pack_id} onChange={e=>setForm(f=>({...f,pack_id:e.target.value}))} required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm">
              <option value="">Select a study pack…</option>
              {packs.map(p=><option key={p.id} value={p.id}>{p.topic}{p.course_name&&` · ${p.course_name}`}</option>)}
            </select>
            <div className="flex gap-2">
              <select value={form.num_questions} onChange={e=>setForm(f=>({...f,num_questions:e.target.value}))}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm">
                {["5","10","15","20"].map(n=><option key={n} value={n}>{n} questions</option>)}
              </select>
              <button type="submit" disabled={generating||!form.pack_id} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition">
                {generating ? <><RefreshCw size={13} className="animate-spin"/>Generating…</> : <><Sparkles size={13}/>Generate</>}
              </button>
              <button type="button" onClick={()=>setShowCreate(false)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 flex items-center justify-center transition"><X size={14}/></button>
            </div>
          </form>
        </div>
      )}

      {quizzes.length===0 ? (
        <div className="card text-center py-12 text-slate-400">
          <Brain className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No quizzes yet. Generate one from a study pack.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quizzes.map(q => (
            <div key={q.id} className="card-hover cursor-pointer group" onClick={()=>startQuiz(q)}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <Brain size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{q.pack_topic||q.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{q.course_name||"General"} · {q.questions?.length||0} questions</p>
                </div>
              </div>
              <button className="mt-3 w-full py-2 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 text-xs font-semibold hover:bg-violet-100 dark:hover:bg-violet-950/50 transition group-hover:bg-violet-500 group-hover:text-white">
                Start Quiz →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Study Packs ───────────────────────────────────────────────── */
interface Pack { id:string; topic:string; course_name?:string; status:string; overview?:string; key_notes?:string[]; created_at:string; }

function PacksTab() {
  const [packs, setPacks]         = useState<Pack[]>([]);
  const [courses, setCourses]     = useState<Course[]>([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected]   = useState<Pack|null>(null);
  const [form, setForm]           = useState({ course_id:"", topic:"" });
  const toast = useToast();

  useEffect(() => {
    Promise.all([fetch("/api/study-packs"),fetch("/api/courses")]).then(async([pr,cr])=>{
      if (pr.ok) setPacks(await pr.json());
      if (cr.ok) setCourses(await cr.json());
      setLoading(false);
    });
  }, []);

  async function generate(e:React.FormEvent) {
    e.preventDefault(); setGenerating(true);
    const r = await fetch("/api/study-packs",{ method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form) });
    if (r.ok) { const p=await r.json(); setPacks(prev=>[p,...prev]); setForm({course_id:"",topic:""}); toast("success","Study pack created!"); }
    setGenerating(false);
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;

  if (selected) return (
    <div className="space-y-4">
      <button onClick={()=>setSelected(null)} className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:underline"><ChevronLeft size={14}/>Back</button>
      <div className="card">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{selected.topic}</h2>
        <p className="text-xs text-slate-400 mb-4">{selected.course_name}</p>
        {selected.overview && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Overview</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{selected.overview}</p>
          </div>
        )}
        {selected.key_notes && selected.key_notes.length>0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Key Points</h3>
            <ul className="space-y-2">
              {selected.key_notes.map((n,i)=>(
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0"/>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Generate form */}
      <div className="card bg-gradient-to-br from-brand-50/80 to-purple-50/60 dark:from-brand-950/30 dark:to-purple-950/20 border border-brand-100/60 dark:border-brand-800/30">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-brand-500" /> Generate AI Study Pack
        </h3>
        <form onSubmit={generate} className="flex flex-col sm:flex-row gap-2">
          <select value={form.course_id} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))} required
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm">
            <option value="">Select course…</option>
            {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))} required
            placeholder="Topic (e.g. Chapter 3: Porter's Five Forces)"
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <button type="submit" disabled={generating}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition whitespace-nowrap">
            {generating ? <><RefreshCw size={13} className="animate-spin"/>Generating…</> : <><Sparkles size={13}/>Generate</>}
          </button>
        </form>
      </div>

      {packs.length===0 ? (
        <div className="card text-center py-12 text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No study packs yet. Generate your first one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packs.map(p => (
            <div key={p.id} onClick={()=>p.status==="ready"&&setSelected(p)}
              className={clsx("card-hover cursor-pointer", p.status!=="ready"&&"opacity-60 cursor-not-allowed")}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <BookOpen size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{p.topic}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.course_name||"General"}</p>
                  {p.status==="processing" && <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1"><RefreshCw size={9} className="animate-spin"/>Processing…</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Lecture ───────────────────────────────────────────────────── */
function LectureTab() {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="card text-center py-10 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg mx-auto">
          <Mic size={28} className="text-white" />
        </div>
        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Lecture Transcription</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">Record your lecture and get instant AI summaries, key points, and exportable notes.</p>
        <Link href="/lecture">
          <button className="flex items-center gap-2 mx-auto bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition">
            <Mic size={15} /> Open Lecture Tool
          </button>
        </Link>
      </div>
      <div className="card bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-2">How it works</h4>
        <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
          {["Press record before your lecture starts","AI transcribes in real-time as you listen","Get an AI summary + key points instantly","Export notes to email or PDF"].map((s,i)=>(
            <li key={i} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */
const TABS: { id:Tab; label:string; icon:React.ReactNode; color:string }[] = [
  { id:"tutor",      label:"AI Tutor",     icon:<Bot size={16}/>,     color:"text-teal-500"   },
  { id:"flashcards", label:"Flashcards",   icon:<Layers size={16}/>,  color:"text-amber-500"  },
  { id:"quizzes",    label:"Quizzes",      icon:<Brain size={16}/>,   color:"text-violet-500" },
  { id:"packs",      label:"Study Packs",  icon:<BookOpen size={16}/>,color:"text-brand-500"  },
  { id:"lecture",    label:"Lecture",      icon:<Mic size={16}/>,     color:"text-red-500"    },
];

export default function StudyPage() {
  const [tab, setTab] = useState<Tab>("tutor");

  useEffect(() => {
    const hash = window.location.hash.replace("#","") as Tab;
    if (TABS.find(t=>t.id===hash)) setTab(hash);
  }, []);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Study Tools</h1>
        <p className="text-sm text-slate-500 mt-0.5">All your learning tools in one place</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-white/10 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
              tab===t.id
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}>
            <span className={tab===t.id ? t.color : ""}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab==="tutor"      && <TutorTab />}
        {tab==="flashcards" && <FlashcardsTab />}
        {tab==="quizzes"    && <QuizzesTab />}
        {tab==="packs"      && <PacksTab />}
        {tab==="lecture"    && <LectureTab />}
      </div>
    </div>
  );
}
