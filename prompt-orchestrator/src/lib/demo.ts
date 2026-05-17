import { NextResponse } from "next/server";

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_USER = {
  id: "demo-user-001",
  email: "sara.almansouri@mba.ae",
  full_name: "Sara Al-Mansouri",
  avatar_url: null,
};

/* ── Courses ───────────────────────────────────────────────────── */
export const DEMO_COURSES = [
  { id: "c-01", user_id: "demo-user-001", name: "Strategic Management",       code: "MGMT 601", instructor: "Dr. Khalid Al-Rashidi", category: "Core",     semester: "Spring 2026", status: "active",    progress: 68, starred: true,  last_accessed: new Date().toISOString() },
  { id: "c-02", user_id: "demo-user-001", name: "Corporate Finance",           code: "FIN 502",  instructor: "Dr. Aisha Hamdan",       category: "Core",     semester: "Spring 2026", status: "active",    progress: 45, starred: true,  last_accessed: new Date().toISOString() },
  { id: "c-03", user_id: "demo-user-001", name: "Marketing Analytics",         code: "MKT 505",  instructor: "Prof. Omar Al-Farsi",    category: "Elective", semester: "Spring 2026", status: "active",    progress: 82, starred: false, last_accessed: new Date().toISOString() },
  { id: "c-04", user_id: "demo-user-001", name: "Operations & Supply Chain",   code: "OPS 610",  instructor: "Dr. Fatima Malik",       category: "Core",     semester: "Spring 2026", status: "active",    progress: 30, starred: false, last_accessed: new Date().toISOString() },
  { id: "c-05", user_id: "demo-user-001", name: "Leadership & Organisations",  code: "HRM 520",  instructor: "Dr. Layla Hassan",       category: "Core",     semester: "Spring 2026", status: "active",    progress: 55, starred: false, last_accessed: new Date().toISOString() },
];

/* ── Deadlines ─────────────────────────────────────────────────── */
const now = new Date();
const d = (days: number) => new Date(now.getTime() + days * 86_400_000).toISOString();
export const DEMO_DEADLINES = [
  { id: "dl-01", user_id: "demo-user-001", title: "DCF Valuation Assignment",          course_name: "Corporate Finance",          course_id: "c-02", due_date: d(-1),  risk: "overdue",  type: "assignment", is_done: false },
  { id: "dl-02", user_id: "demo-user-001", title: "Porter's Five Forces Essay",         course_name: "Strategic Management",       course_id: "c-01", due_date: d(1),   risk: "at_risk",  type: "assignment", is_done: false },
  { id: "dl-03", user_id: "demo-user-001", title: "Digital Marketing Campaign Plan",   course_name: "Marketing Analytics",        course_id: "c-03", due_date: d(3),   risk: "due_soon", type: "project",    is_done: false },
  { id: "dl-04", user_id: "demo-user-001", title: "Midterm Exam – Finance",            course_name: "Corporate Finance",          course_id: "c-02", due_date: d(5),   risk: "due_soon", type: "exam",       is_done: false },
  { id: "dl-05", user_id: "demo-user-001", title: "Supply Chain Disruption Case Study",course_name: "Operations & Supply Chain",  course_id: "c-04", due_date: d(9),   risk: "safe",     type: "assignment", is_done: false },
  { id: "dl-06", user_id: "demo-user-001", title: "Leadership Reflection Journal",     course_name: "Leadership & Organisations", course_id: "c-05", due_date: d(14),  risk: "safe",     type: "assignment", is_done: false },
  { id: "dl-07", user_id: "demo-user-001", title: "Final Group Project Presentation",  course_name: "Strategic Management",       course_id: "c-01", due_date: d(21),  risk: "safe",     type: "project",    is_done: false },
];

/* ── Announcements ─────────────────────────────────────────────── */
export const DEMO_ANNOUNCEMENTS = [
  { id: "a-01", user_id: "demo-user-001", course_id: "c-01", course_name: "Strategic Management",       title: "Midterm moved to Week 9 — prepare Porter's + VRIO",         summary: "The midterm has been moved one week forward. Topics now include Porter's Five Forces, VRIO framework, and Blue Ocean Strategy.", risk_level: "high",   required_action: "Update your study schedule immediately.", is_archived: false, source: "instructor", created_at: d(-1) },
  { id: "a-02", user_id: "demo-user-001", course_id: "c-02", course_name: "Corporate Finance",           title: "DCF Model template uploaded to course portal",               summary: "A new Excel DCF model template has been uploaded. Use it as a base for your valuation assignment.",                             risk_level: "medium", required_action: "Download template before Friday.",          is_archived: false, source: "instructor", created_at: d(-2) },
  { id: "a-03", user_id: "demo-user-001", course_id: "c-03", course_name: "Marketing Analytics",         title: "Guest speaker: Head of Digital at Emirates Airlines — Week 8", summary: "Emirates Airlines CMO will deliver a live case study session. Attendance is mandatory.",                                         risk_level: "low",    required_action: "Mark your calendar for Week 8 Thursday.",   is_archived: false, source: "instructor", created_at: d(-3) },
  { id: "a-04", user_id: "demo-user-001", course_id: "c-04", course_name: "Operations & Supply Chain",   title: "Extra office hours this week — bring your case questions",    summary: "Dr. Fatima Malik will hold extra office hours Tuesday and Thursday 4-6 PM for students struggling with the Walmart case.",      risk_level: "low",    required_action: "",                                          is_archived: false, source: "instructor", created_at: d(-4) },
  { id: "a-05", user_id: "demo-user-001", course_id: "c-05", course_name: "Leadership & Organisations",  title: "Leadership journal rubric updated — read before submitting",   summary: "The grading rubric for the reflection journal has been updated to include a new 'self-awareness' criterion worth 20%.",         risk_level: "high",   required_action: "Re-read rubric before submission.",          is_archived: false, source: "instructor", created_at: d(-5) },
];

/* ── Grades ────────────────────────────────────────────────────── */
export const DEMO_GRADES = [
  { id: "g-01", user_id: "demo-user-001", course_id: "c-01", category: "Assignment",  item_name: "Industry Analysis Report",        score: 87,  max_score: 100, weight: 20, is_final: false },
  { id: "g-02", user_id: "demo-user-001", course_id: "c-01", category: "Quiz",        item_name: "Strategy Frameworks Quiz",         score: 92,  max_score: 100, weight: 10, is_final: false },
  { id: "g-03", user_id: "demo-user-001", course_id: "c-01", category: "Assignment",  item_name: "Competitive Strategy Essay",       score: null,max_score: 100, weight: 30, is_final: false },
  { id: "g-04", user_id: "demo-user-001", course_id: "c-02", category: "Assignment",  item_name: "Time Value of Money Problem Set",  score: 78,  max_score: 100, weight: 15, is_final: false },
  { id: "g-05", user_id: "demo-user-001", course_id: "c-02", category: "Quiz",        item_name: "Financial Ratios Quiz",            score: 82,  max_score: 100, weight: 10, is_final: false },
  { id: "g-06", user_id: "demo-user-001", course_id: "c-02", category: "Assignment",  item_name: "DCF Valuation Assignment",         score: null,max_score: 100, weight: 25, is_final: false },
  { id: "g-07", user_id: "demo-user-001", course_id: "c-03", category: "Project",     item_name: "SEO Audit & Strategy Report",      score: 91,  max_score: 100, weight: 25, is_final: false },
  { id: "g-08", user_id: "demo-user-001", course_id: "c-03", category: "Assignment",  item_name: "Consumer Persona Workshop",        score: 88,  max_score: 100, weight: 15, is_final: false },
  { id: "g-09", user_id: "demo-user-001", course_id: "c-04", category: "Quiz",        item_name: "Lean Six Sigma Concepts Quiz",     score: 74,  max_score: 100, weight: 10, is_final: false },
  { id: "g-10", user_id: "demo-user-001", course_id: "c-05", category: "Assignment",  item_name: "Leadership Style Self-Assessment", score: 85,  max_score: 100, weight: 20, is_final: false },
];

/* ── Tasks ─────────────────────────────────────────────────────── */
export const DEMO_TASKS = [
  { id: "t-01", user_id: "demo-user-001", title: "Review DCF model template",              description: "Go through the uploaded Excel template section by section", status: "todo",        priority: "high",   course_id: "c-02", course_name: "Corporate Finance",          due_date: d(1),  created_at: d(-1) },
  { id: "t-02", user_id: "demo-user-001", title: "Draft Porter's Five Forces analysis",    description: "Focus on the UAE telecom industry for the essay",           status: "in_progress", priority: "high",   course_id: "c-01", course_name: "Strategic Management",       due_date: d(1),  created_at: d(-2) },
  { id: "t-03", user_id: "demo-user-001", title: "Create Marketing campaign outline",      description: "Digital campaign for Emirates tourism board",               status: "in_progress", priority: "medium", course_id: "c-03", course_name: "Marketing Analytics",        due_date: d(3),  created_at: d(-1) },
  { id: "t-04", user_id: "demo-user-001", title: "Read Walmart supply chain case",         description: "Ch. 4 in case packet — prepare 3 discussion points",        status: "todo",        priority: "medium", course_id: "c-04", course_name: "Operations & Supply Chain",  due_date: d(7),  created_at: d(-1) },
  { id: "t-05", user_id: "demo-user-001", title: "Write leadership journal entry 3",       description: "Reflect on team conflict scenario from Week 6",             status: "todo",        priority: "low",    course_id: "c-05", course_name: "Leadership & Organisations", due_date: d(14), created_at: d(-1) },
  { id: "t-06", user_id: "demo-user-001", title: "Flashcard review – Finance ratios",      description: "30 min spaced repetition session",                         status: "done",        priority: "medium", course_id: "c-02", course_name: "Corporate Finance",          due_date: d(-1), created_at: d(-3) },
  { id: "t-07", user_id: "demo-user-001", title: "Industry Analysis Report submission",    description: "Already submitted via Blackboard",                         status: "done",        priority: "high",   course_id: "c-01", course_name: "Strategic Management",       due_date: d(-5), created_at: d(-6) },
];

/* ── Messages ──────────────────────────────────────────────────── */
export const DEMO_MESSAGES = [
  {
    id: "m-01", thread_id: "th-01",
    from_id: "inst-001", from_name: "Dr. Khalid Al-Rashidi", from_role: "instructor",
    to_id: "demo-user-001",
    subject: "Your Industry Analysis — Excellent work, one suggestion",
    body: "Dear Sara,\n\nI reviewed your Industry Analysis Report and I'm impressed with your application of Porter's framework to the UAE logistics sector. Your data sourcing was thorough.\n\nOne suggestion: in your final project, consider integrating the VRIO framework to assess internal resources, not just external forces. This will strengthen your strategic recommendations significantly.\n\nLooking forward to seeing your continued progress.\n\nBest regards,\nDr. Al-Rashidi",
    read: false, course_id: "c-01", course_name: "Strategic Management",
    ai_summary: "Positive feedback on your Industry Analysis Report. Suggestion to incorporate VRIO framework in the final project for stronger internal resource assessment.",
    ai_reply_suggestion_en: "Dear Dr. Al-Rashidi,\n\nThank you for your detailed feedback. I'll integrate the VRIO framework into the final project to complement the Porter's analysis — I can see how assessing internal resources would strengthen the strategic recommendations.\n\nI appreciate your guidance.\n\nBest regards,\nSara Al-Mansouri",
    ai_reply_suggestion_ar: "عزيزي الدكتور الراشدي،\n\nشكراً جزيلاً على ملاحظاتك القيّمة. سأدمج إطار VRIO في المشروع النهائي لتعزيز تحليل الموارد الداخلية بجانب نموذج بورتر.\n\nأقدّر توجيهاتكم كثيراً.\n\nمع أطيب التحيات،\nسارة المنصوري",
    created_at: d(-1),
  },
  {
    id: "m-02", thread_id: "th-02",
    from_id: "inst-002", from_name: "Dr. Aisha Hamdan", from_role: "instructor",
    to_id: "demo-user-001",
    subject: "DCF Assignment deadline — important clarification",
    body: "Dear Class,\n\nA quick note regarding the DCF Valuation Assignment. Several students asked about the discount rate assumption. Please use the WACC provided in the case appendix (8.4%). Do not derive your own unless explicitly asked in a bonus question.\n\nAlso — the Excel DCF template I uploaded includes dropdown assumptions. Use it as a scaffold, not a crutch. Your commentary on the sensitivity analysis is worth 40% of the grade.\n\nDeadline is unchanged: midnight tonight.\n\nDr. Hamdan",
    read: true, course_id: "c-02", course_name: "Corporate Finance",
    ai_summary: "Clarification on DCF assignment: use WACC of 8.4% from case appendix. Commentary on sensitivity analysis is worth 40% of grade. Deadline unchanged — midnight tonight.",
    ai_reply_suggestion_en: "Dear Dr. Hamdan,\n\nThank you for the clarification. I'll use the WACC of 8.4% from the appendix and will make sure my sensitivity analysis commentary is thorough.\n\nBest regards,\nSara Al-Mansouri",
    ai_reply_suggestion_ar: "عزيزتي الدكتورة حمدان،\n\nشكراً على التوضيح. سأستخدم معدل الـ WACC البالغ 8.4% المحدد في الملحق، وسأحرص على أن يكون تعليقي على تحليل الحساسية شاملاً.\n\nمع التحية،\nسارة المنصوري",
    created_at: d(-2),
  },
  {
    id: "m-03", thread_id: "th-03",
    from_id: "admin-001", from_name: "MBA Programme Office", from_role: "admin",
    to_id: "demo-user-001",
    subject: "Semester 2 registration opens May 20 — your course eligibility",
    body: "Dear Sara,\n\nThis is a reminder that Semester 2 course registration opens on May 20, 2026 at 9:00 AM GST.\n\nBased on your current academic standing, you are eligible for all core Year 2 electives. Your registration priority window is 9:00 AM – 12:00 PM on opening day.\n\nRecommended electives based on your profile:\n• International Business Strategy (MGMT 620)\n• Venture Capital & Private Equity (FIN 615)\n• Digital Transformation (MIS 510)\n\nPlease log in to the student portal to confirm your selections.\n\nMBA Programme Team",
    read: true, course_id: null, course_name: null,
    ai_summary: "Semester 2 registration opens May 20 at 9 AM. Priority window is 9 AM–12 PM. Recommended electives: MGMT 620, FIN 615, MIS 510. Log in to confirm selections.",
    ai_reply_suggestion_en: "Dear MBA Programme Office,\n\nThank you for the registration reminder. I will log in on May 20 during my priority window and select my electives.\n\nBest regards,\nSara Al-Mansouri",
    ai_reply_suggestion_ar: null,
    created_at: d(-4),
  },
];

/* ── Study Packs ───────────────────────────────────────────────── */
export const DEMO_STUDY_PACKS = [
  {
    id: "sp-01", user_id: "demo-user-001", course_id: "c-01", course_name: "Strategic Management",
    topic: "Porter's Five Forces & Competitive Advantage",
    status: "ready", file_id: null,
    overview: "Porter's Five Forces is a framework for analyzing industry competition and profitability. The five forces — competitive rivalry, supplier power, buyer power, threat of substitution, and threat of new entry — determine the intensity of competition and the potential for profitability in an industry.",
    key_notes: [
      "Competitive rivalry is the most central force; high rivalry drives down profitability.",
      "Supplier power increases when there are few suppliers or high switching costs.",
      "Buyer power is high when buyers purchase in large volumes or products are undifferentiated.",
      "Substitutes cap the price ceiling — always scan adjacent markets.",
      "Barriers to entry (economies of scale, capital requirements, brand loyalty) determine new entrant threat.",
      "Porter's framework is complemented by the VRIO model for internal resource analysis.",
    ],
    created_at: d(-10),
  },
  {
    id: "sp-02", user_id: "demo-user-001", course_id: "c-02", course_name: "Corporate Finance",
    topic: "DCF Valuation — Discounted Cash Flow Fundamentals",
    status: "ready", file_id: null,
    overview: "DCF valuation estimates the value of an investment based on its expected future cash flows, discounted back to present value using an appropriate discount rate (typically WACC). It is the most widely used intrinsic valuation method in investment banking and corporate finance.",
    key_notes: [
      "Free Cash Flow to Firm (FCFF) = EBIT(1-t) + D&A − CAPEX − ΔNWC",
      "WACC = (E/V)×Re + (D/V)×Rd×(1-t) — weight each component by market value",
      "Terminal value typically represents 60-80% of total enterprise value; scrutinize your assumptions",
      "Sensitivity analysis on WACC ±1% and growth rate ±0.5% is mandatory for professional models",
      "Gordon Growth Model: TV = FCF(1+g) / (WACC-g) — g must be below nominal GDP growth",
      "Always cross-check DCF with comparables (EV/EBITDA) and precedent transactions",
    ],
    created_at: d(-7),
  },
  {
    id: "sp-03", user_id: "demo-user-001", course_id: "c-03", course_name: "Marketing Analytics",
    topic: "Digital Marketing Metrics & Attribution Models",
    status: "processing", file_id: null,
    overview: "Generating...",
    key_notes: [],
    created_at: d(-1),
  },
];

/* ── Flashcards ────────────────────────────────────────────────── */
export const DEMO_FLASHCARDS = [
  // Porter's Five Forces pack
  { id: "fc-01", user_id: "demo-user-001", pack_id: "sp-01", pack_topic: "Porter's Five Forces & Competitive Advantage", course_name: "Strategic Management", front: "What are Porter's Five Forces?", back: "Competitive Rivalry, Supplier Power, Buyer Power, Threat of Substitution, Threat of New Entry — together they determine industry profitability.", difficulty: 1 },
  { id: "fc-02", user_id: "demo-user-001", pack_id: "sp-01", pack_topic: "Porter's Five Forces & Competitive Advantage", course_name: "Strategic Management", front: "What factors increase Supplier Power?", back: "Few suppliers, high switching costs, unique/differentiated inputs, credible forward integration threat, and supplier concentration relative to buyer concentration.", difficulty: 2 },
  { id: "fc-03", user_id: "demo-user-001", pack_id: "sp-01", pack_topic: "Porter's Five Forces & Competitive Advantage", course_name: "Strategic Management", front: "What is a 'switching cost' and why does it matter?", back: "A switching cost is the cost (financial, time, or relational) a buyer incurs when changing suppliers. High switching costs increase supplier power and reduce buyer power.", difficulty: 2 },
  { id: "fc-04", user_id: "demo-user-001", pack_id: "sp-01", pack_topic: "Porter's Five Forces & Competitive Advantage", course_name: "Strategic Management", front: "How does VRIO complement Porter's Five Forces?", back: "Porter's Five Forces analyses external competitive forces; VRIO (Valuable, Rare, Inimitable, Organised) analyses internal resources. Together they form a complete strategic picture.", difficulty: 3 },
  { id: "fc-05", user_id: "demo-user-001", pack_id: "sp-01", pack_topic: "Porter's Five Forces & Competitive Advantage", course_name: "Strategic Management", front: "What is Blue Ocean Strategy?", back: "A strategy that creates uncontested market space by making competition irrelevant — simultaneously pursuing differentiation AND low cost, targeting non-customers.", difficulty: 2 },
  { id: "fc-06", user_id: "demo-user-001", pack_id: "sp-01", pack_topic: "Porter's Five Forces & Competitive Advantage", course_name: "Strategic Management", front: "Name 3 barriers to entry in an industry.", back: "1) Economies of scale, 2) Capital requirements, 3) Brand loyalty / switching costs. Others include: regulatory licenses, access to distribution, and proprietary technology.", difficulty: 1 },
  // DCF pack
  { id: "fc-07", user_id: "demo-user-001", pack_id: "sp-02", pack_topic: "DCF Valuation — Discounted Cash Flow Fundamentals", course_name: "Corporate Finance", front: "What is the FCFF formula?", back: "FCFF = EBIT × (1 − Tax Rate) + D&A − CAPEX − Change in Net Working Capital", difficulty: 2 },
  { id: "fc-08", user_id: "demo-user-001", pack_id: "sp-02", pack_topic: "DCF Valuation — Discounted Cash Flow Fundamentals", course_name: "Corporate Finance", front: "What does WACC stand for and when is it used?", back: "Weighted Average Cost of Capital — used as the discount rate in a DCF to reflect the blended cost of debt and equity financing, weighted by market value proportions.", difficulty: 1 },
  { id: "fc-09", user_id: "demo-user-001", pack_id: "sp-02", pack_topic: "DCF Valuation — Discounted Cash Flow Fundamentals", course_name: "Corporate Finance", front: "What is the Gordon Growth Model for Terminal Value?", back: "TV = FCF × (1 + g) / (WACC − g), where g = perpetuity growth rate. The growth rate must be below long-run nominal GDP growth to be realistic.", difficulty: 3 },
  { id: "fc-10", user_id: "demo-user-001", pack_id: "sp-02", pack_topic: "DCF Valuation — Discounted Cash Flow Fundamentals", course_name: "Corporate Finance", front: "Why does terminal value typically dominate DCF value?", back: "Terminal value represents 60–80% of total enterprise value because it captures all cash flows beyond the explicit forecast period, which extends to infinity in theory.", difficulty: 2 },
  { id: "fc-11", user_id: "demo-user-001", pack_id: "sp-02", pack_topic: "DCF Valuation — Discounted Cash Flow Fundamentals", course_name: "Corporate Finance", front: "What is sensitivity analysis in a DCF model?", back: "Testing how enterprise value changes when key assumptions (WACC ±1%, growth rate ±0.5%) are varied. It quantifies model risk and shows the range of reasonable valuations.", difficulty: 2 },
  { id: "fc-12", user_id: "demo-user-001", pack_id: "sp-02", pack_topic: "DCF Valuation — Discounted Cash Flow Fundamentals", course_name: "Corporate Finance", front: "Name two methods to cross-check a DCF valuation.", back: "1) Trading Comparables (EV/EBITDA multiples of similar public companies), 2) Precedent Transactions (multiples from M&A deals in the same sector).", difficulty: 2 },
];

/* ── Quizzes ───────────────────────────────────────────────────── */
export const DEMO_QUIZZES = [
  {
    id: "qz-01", user_id: "demo-user-001", pack_id: "sp-01",
    pack_topic: "Porter's Five Forces & Competitive Advantage",
    course_name: "Strategic Management", title: "Strategy Frameworks Quiz",
    status: "ready",
    questions: [
      { q: "Which of Porter's Five Forces directly caps the price ceiling a firm can charge?", options: ["Competitive Rivalry","Threat of New Entry","Threat of Substitutes","Supplier Power"], answer: 2, explanation: "Substitute products set an upper limit on pricing because buyers will switch if prices exceed the substitute's value." },
      { q: "VRIO stands for:", options: ["Value, Rarity, Innovation, Organisation","Valuable, Rare, Inimitable, Organised","Value, Risk, Insight, Operations","Viable, Reliable, Innovative, Original"], answer: 1, explanation: "VRIO = Valuable, Rare, Inimitable, Organised. A resource must satisfy all four criteria for sustainable competitive advantage." },
      { q: "In Blue Ocean Strategy, firms aim to:", options: ["Beat competitors through cost leadership","Create uncontested market space","Focus on a niche segment","Maximise competitive rivalry"], answer: 1, explanation: "Blue Ocean Strategy makes competition irrelevant by creating new market space rather than competing in existing (red ocean) markets." },
      { q: "Which factor would INCREASE buyer power?", options: ["High switching costs","Undifferentiated products","Small buyer purchase volumes","Buyers having little information"], answer: 1, explanation: "When products are undifferentiated (commoditised), buyers can easily switch between suppliers, increasing their bargaining power." },
      { q: "High barriers to entry typically result in:", options: ["Increased competitive rivalry","Lower industry profitability","Higher industry profitability","More substitute products"], answer: 2, explanation: "High barriers to entry protect incumbent firms from new competition, reducing rivalry and supporting higher profitability." },
    ],
    created_at: d(-5),
  },
  {
    id: "qz-02", user_id: "demo-user-001", pack_id: "sp-02",
    pack_topic: "DCF Valuation — Discounted Cash Flow Fundamentals",
    course_name: "Corporate Finance", title: "DCF & Valuation Quiz",
    status: "ready",
    questions: [
      { q: "In the FCFF formula, what does CAPEX stand for?", options: ["Capital Expenditure","Capital Equity","Cash and Profit Expansion","Capital Extraction"], answer: 0, explanation: "CAPEX = Capital Expenditure — the investment in fixed assets such as property, plant, and equipment." },
      { q: "If WACC increases, enterprise value:", options: ["Increases","Decreases","Stays the same","Cannot be determined"], answer: 1, explanation: "A higher WACC means a higher discount rate, which reduces the present value of future cash flows and therefore enterprise value." },
      { q: "Which growth rate assumption in the Gordon Growth Model is unrealistic?", options: ["2%","3%","5%","8%"], answer: 3, explanation: "A terminal growth rate of 8% exceeds long-run nominal GDP growth, implying the firm will eventually become larger than the whole economy — impossible." },
      { q: "Terminal value typically represents what percentage of total DCF value?", options: ["10–20%","30–40%","60–80%","90–100%"], answer: 2, explanation: "Terminal value usually accounts for 60–80% of total enterprise value because it captures the perpetuity of cash flows beyond the explicit forecast period." },
    ],
    created_at: d(-3),
  },
];

/* ── Files ─────────────────────────────────────────────────────── */
export const DEMO_FILES = [
  { id: "f-01", user_id: "demo-user-001", course_id: "c-01", course_name: "Strategic Management", file_name: "Strategic_Management_Lecture_3.pdf",     file_type: "application/pdf", file_size: 2_400_000, processing_status: "ready", chunk_count: 42, created_at: d(-10) },
  { id: "f-02", user_id: "demo-user-001", course_id: "c-02", course_name: "Corporate Finance",    file_name: "DCF_Model_Template_Week5.xlsx",            file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", file_size: 890_000, processing_status: "ready", chunk_count: 18, created_at: d(-7) },
  { id: "f-03", user_id: "demo-user-001", course_id: "c-03", course_name: "Marketing Analytics",  file_name: "Digital_Marketing_Case_Emirates.pdf",      file_type: "application/pdf", file_size: 1_700_000, processing_status: "ready", chunk_count: 31, created_at: d(-5) },
  { id: "f-04", user_id: "demo-user-001", course_id: "c-04", course_name: "Operations & Supply Chain", file_name: "Walmart_Supply_Chain_Case_2024.pdf", file_type: "application/pdf", file_size: 3_100_000, processing_status: "ready", chunk_count: 55, created_at: d(-3) },
];

/* ── Tutor Chats ───────────────────────────────────────────────── */
export const DEMO_TUTOR_CHATS = [
  { id: "chat-01", user_id: "demo-user-001", course_id: "c-01", title: "Porter's Five Forces deep dive", created_at: d(-3), updated_at: d(-3) },
  { id: "chat-02", user_id: "demo-user-001", course_id: "c-02", title: "DCF sensitivity analysis help",  created_at: d(-1), updated_at: d(-1) },
];

/* ── Profile ───────────────────────────────────────────────────── */
export const DEMO_PROFILE = {
  id: "demo-user-001",
  email: "sara.almansouri@mba.ae",
  full_name: "Sara Al-Mansouri",
  avatar_url: null,
  program: "MBA",
  year: 2,
  cohort: "Spring 2026",
};

/* ── Weekly Brief ──────────────────────────────────────────────── */
export const DEMO_WEEKLY_BRIEF = {
  id: "wb-01",
  user_id: "demo-user-001",
  week_start: d(-3),
  week_end: d(4),
  focus_question_answer: "This week's key focus: completing the DCF assignment and starting the Porter's essay. Finance exam prep begins this weekend.",
  summary: "Busy but manageable week. Two high-priority deadlines in the next 48 hours. Marketing Analytics is tracking well ahead of schedule. Operations needs catch-up.",
  top_priorities: [
    "Submit DCF Valuation Assignment tonight (OVERDUE)",
    "Draft Porter's Five Forces essay — due in 1 day",
    "Begin Finance midterm exam prep (exam in 5 days)",
  ],
  at_risk_items: [
    "DCF Assignment is past due — submit immediately",
    "Porter's essay needs a complete first draft by tomorrow morning",
  ],
  wins: [
    "Marketing Analytics progressing well — 82% course completion",
    "Scored 91% on SEO Audit project — highest in the section",
    "Maintained 14-day study streak",
  ],
  ai_recommendations: [
    "Use the DCF study pack flashcards for 20 min before the Finance midterm",
    "Generate a Porter's study pack from your uploaded lecture notes",
    "Schedule 2 hours for Supply Chain case study reading this weekend",
  ],
  study_hours_target: 20,
  readiness_score: 72,
  created_at: d(-1),
};

/* ── demoReturn ────────────────────────────────────────────────── */
const DEMO_DATA: Record<string, unknown> = {
  "courses":       DEMO_COURSES,
  "announcements": DEMO_ANNOUNCEMENTS,
  "grades":        DEMO_GRADES,
  "tasks":         DEMO_TASKS,
  "messages":      DEMO_MESSAGES,
  "study-packs":   DEMO_STUDY_PACKS,
  "quizzes":       DEMO_QUIZZES,
  "files":         DEMO_FILES,
  "tutor-chats":   DEMO_TUTOR_CHATS,
  "profile":       DEMO_PROFILE,
  "weekly-brief":  DEMO_WEEKLY_BRIEF,
};

export function demoReturn(key: string, status = 200): NextResponse | null {
  if (!isDemoMode) return null;
  const data = DEMO_DATA[key];
  if (data === undefined) return NextResponse.json(null, { status });
  return NextResponse.json(data, { status });
}

export function demoDeadlines(view: string): NextResponse | null {
  if (!isDemoMode) return null;
  const now = Date.now();
  let filtered = DEMO_DEADLINES;
  if (view === "today")  filtered = DEMO_DEADLINES.filter(d => new Date(d.due_date).getTime() <= now + 86_400_000);
  else if (view === "week")  filtered = DEMO_DEADLINES.filter(d => new Date(d.due_date).getTime() <= now + 7 * 86_400_000);
  else if (view === "month") filtered = DEMO_DEADLINES.filter(d => new Date(d.due_date).getTime() <= now + 30 * 86_400_000);
  return NextResponse.json(filtered);
}

export function demoFlashcards(packId: string | null): NextResponse | null {
  if (!isDemoMode) return null;
  const cards = packId ? DEMO_FLASHCARDS.filter(f => f.pack_id === packId) : DEMO_FLASHCARDS;
  return NextResponse.json(cards);
}
