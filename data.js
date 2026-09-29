/* =====================================================================
   F26 COURSE DATA — the single source of truth for the dashboard.
   ---------------------------------------------------------------------
   Edit this file when a prof moves a date or announces a time.

   Item fields
     id          unique string
     course      course key (see COURSES below)
     title       short name
     type        assignment | quiz | test | exam | project | sprint |
                 participation | meeting | presentation | release
     due         "YYYY-MM-DDTHH:MM" (local time) or "YYYY-MM-DD" if the
                 time is unknown
     end         optional end time "HH:MM" for sit-down assessments
     window      optional ["YYYY-MM-DD","YYYY-MM-DD"] — for "week of" or
                 TBD-within-a-range items
     weight      % of the final grade (number, used for math)
     weightLabel optional text shown instead of "N%"
     penalty     optional % lost if missed (e.g. 3760 sprint meetings)
     tentative   true if the outline says tentative / approximate
     tbd         true if the date is not yet announced
     location    optional
     notes       optional
   ===================================================================== */

const TERM = {
  name: "Fall 2026",
  start: "2026-09-10",
  firstWeek: "2026-09-07",        // Monday of Week 0
  lastClass: "2026-12-04",
  examStart: "2026-12-07",
  examEnd: "2026-12-22",
  keyDates: [
    { date: "2026-09-10", label: "First day of classes" },
    { date: "2026-09-15", label: "First CIS*3090 / CIS*3760 lecture" },
    { date: "2026-10-12", end: "2026-10-13", label: "Thanksgiving + fall study break: no classes" },
    { date: "2026-11-02", label: "SAS Exam Centre: last day to book fall finals (SAS students only)" },
    { date: "2026-11-06", label: "40th class day: you should have feedback on ≥20% of each course grade" },
    { date: "2026-12-02", label: "Last regularly scheduled class day" },
    { date: "2026-12-03", label: "Makeup day: runs the Tuesday schedule" },
    { date: "2026-12-04", label: "Makeup day: runs the MONDAY schedule. Classes end. Last day to drop F26 courses" },
    { date: "2026-12-07", end: "2026-12-22", label: "Final exam period (weekends possible; Dec 22 is a contingency day)" },
  ],
  /* No-class days, and makeup days that run another weekday's schedule (1 = Mon … 5 = Fri).
     Source: U of G Fall 2026 Schedule of Dates. */
  noClass: ["2026-10-12", "2026-10-13"],
  makeup: { "2026-12-03": 2, "2026-12-04": 1 },
};

const COURSES = {
  "CIS3150": {
    code: "CIS*3150",
    name: "Theory of Computation",
    color: "#7c5cff",
    instructor: "Prof. Charlie Obimbo",
    email: "cobimbo@uoguelph.ca",
    office: "Reynolds 3310 · 519-824-4120 x52634",
    officeHours: "Tue 12:00–1:00 PM · GTAs and GTA hours: TBA",
    lectures: "Sec 01 · Tue/Thu 10:00–11:20 AM · in person / partly online",
    platform: "CourseLink",
    textbook: "Sipser, Introduction to the Theory of Computation (3rd ed.), required. Some class material isn't in the book",
    rmpName: "Charlie Obimbo",
    passRules: [
      "You must attempt ALL course work.",
      "You need ≥50% on course work (assignments + participation, 30%) AND ≥50% on tests + final (70%) to pass.",
      "Miss either 50% bar and you don't pass. Your mark becomes 30% of your course-work marks + your test/final marks. Over 50 → INC, cleared by an extra assignment the instructor sets. 50 or under → that number is your grade.",
    ],
    policies: [
      "Missed or late work gets a zero, unless you give the instructor a valid reason in a timely fashion. Then its marks may be moved to another assessment.",
      "Programming assignments are zipped and submitted to the CIS*3150 CourseLink dropbox. Keep a copy: you may be asked to resubmit.",
      "Remark requests must be made within 1 week of work being returned.",
      "No Chegg or similar sites. TurnItIn and AI detectors may be used.",
      "Lectures are not recorded. Phones off in class.",
      "You're responsible for announcements made in class, on CourseLink and by email.",
      "Email subject line: 'Your Name: CIS*3150'. Only the teaching team, CourseLink and @uoguelph email count: info from Discord/Reddit is not grounds for regrades or extensions.",
      "Test/exam format, allowed aids and rooms are not in the outline. Ask in class.",
    ],
    topics: [
      "1 · Introduction (Sipser 0.1–0.4)",
      "2 · Finite automata (1.1)",
      "3 · NFAs and regular expressions (1.2–1.3)",
      "4 · Pumping lemma, context-free grammars (1.4, 2.1)",
      "5 · Chomsky Normal Form (2.1)",
      "6 · CFG applications, pushdown automata (2.1–2.2)",
      "7 · Turing machines (3.1)",
      "8 · Variants of Turing machines (3.2)",
      "9 · Decidability / undecidability (4.1–4.2)",
      "10 · Complexity (7.1–7.3)",
      "11 · NP-completeness (7.4–7.5)",
      "No dates in the outline: topics run in this order.",
    ],
    facts: { maxItem: 35, examShare: 70, gated: true, lateStrict: 1.0 },
  },
  "CIS3210": {
    code: "CIS*3210",
    name: "Computer Networks",
    color: "#0ea5a4",
    instructor: "Sajid Marhon",
    email: "cis3210@socs.uoguelph.ca",
    office: "Reynolds 3304",
    officeHours: "Tue & Thu 12:00–1:00 PM · TA hours: TBD",
    lectures: "Sec 0101 · Tue/Thu 8:30–9:50 AM · MCKN 120 · Lab Fri 4:30–5:20 PM · MCKN 121",
    platform: "CourseLink",
    textbook: "Kurose & Ross, Computer Networking: A Top-Down Approach (9th ed.). Optional: Comer, Computer Networks and Internets (6th ed.)",
    rmpName: "Sajid Marhon",
    passRules: [
      "Two components: Assignments (24) and Tests (quizzes + midterm + final = 76).",
      "You must pass BOTH: ≥12/24 on assignments AND ≥38/76 on tests (quiz bonus counts toward tests).",
      "Fail one component and your final grade is that component's %. Fail both and it's the LOWER of the two.",
      "Pass both and your grade is assignments + tests (bonus included), capped at 100%.",
      "Once your 4 grace days are gone, ANY late assignment is a 0. No extensions outside Academic Consideration.",
    ],
    policies: [
      "4 grace days total, whole days only (1 second late uses a full day). At most 1 grace day on A4. You don't need to tell anyone you're using them. A resubmission after the deadline counts as late.",
      "Assignments are due 11:59 PM through the dropbox. Only your most recent submission is graded. A wrong submission (file names, makefile, structure, corrupt files) gets a zero.",
      "Code must compile and run on the environment named in the assignment. Code that doesn't compile gets 0. Warnings lose marks.",
      "20 in-person quizzes (5–10 min) run in lecture through CourseLink. Your best 15 count. A missed quiz is a 0 (no makeups).",
      "Quiz bonus: up to +3, equal to your average over all 20 quizzes × 3 (missed quizzes count as 0).",
      "Quiz/exam passwords are confidential. If you're absent, don't open the quiz or pass the password on: both count as misconduct.",
      "ONLY the Casio fx-300MS PLUS 2 calculator is allowed at ALL in-person assessments (quizzes, midterm, final). Anything else is confiscated.",
      "The midterm covers material up to and including Thu Oct 22. The final is cumulative. Both are closed book and in person.",
      "Assignment regrades: email the course address with a detailed explanation within 5 calendar days of getting the grade. The whole submission is regraded (the mark can go down), and only once.",
      "Missed work for medical/compassionate reasons: book a meeting with the instructor. Missed the final? Contact your Program Counsellor ASAP to petition for a deferred exam; the instructor can't grant one.",
      "You may be called to an oral check (FACE) on your submitted work. If it doesn't match, marks are deducted.",
      "Any AI use not explicitly allowed is misconduct. You must pass the SoCS Academic Integrity Self-Test.",
      "TAs: Ali Bagheri, Bamikole Adewale, Mina Khoshbazm Farimani, Somaye Ahangarsaryazdi. Labs are hands-on: Wireshark, Linux, network programming.",
    ],
    topics: [
      "Wk 0 (Sep 7) · Course overview",
      "Wk 1 (Sep 14) · Introduction to networking",
      "Wk 2 (Sep 21) · Application-layer protocols",
      "Wk 3 (Sep 28) · Socket programming",
      "Wk 4–5 (Oct 5–16) · Transport layer",
      "Wk 6 (Oct 19) · Reliable data transfer · midterm Sat Oct 24",
      "Wk 7–8 (Oct 26–Nov 6) · Network layer",
      "Wk 9 (Nov 9) · Link layer",
      "Wk 10–11 (Nov 16–27) · Network security",
      "Wk 12 (Nov 30) · Wireless networks",
      "Tentative: the outline says topics may shift.",
    ],
    facts: { maxItem: 45, examShare: 76, gated: true, lateStrict: 0.35 },
  },
  "CIS3090": {
    code: "CIS*3090",
    name: "Parallel Programming",
    color: "#f59e0b",
    instructor: "Dr. Denis Nikitenko",
    email: "cis3090@socs.uoguelph.ca",
    office: "Not listed (appointments only)",
    officeHours: "By appointment (see Moodle). TAs during lab times (online)",
    lectures: "Sec 0106 · Tue/Thu 2:30–3:50 PM · Lab Wed 12:30–1:20 PM (online TA advising; occasional in-person tutorials, announced ahead)",
    platform: "Moodle (moodle.socs.uoguelph.ca)",
    textbook: "Pacheco & Malensek, An Introduction to Parallel Programming (2nd ed., 2020), required",
    rmpName: "Denis Nikitenko",
    passRules: [
      "Your final grade is simply the weighted sum: 3 assignments × 18% + 2 midterms × 23%.",
      "No drop-lowest and no midterm reweighting in the outline. Can't write a midterm? Request consideration BEFORE the test.",
      "Code must compile AND run on the platform named in each assignment description, not just on your machine. Doesn't compile = 0.",
    ],
    policies: [
      "Assignments are submitted on Moodle, before midnight on the due date (exact time is in each assignment description).",
      "Late work is accepted for 48 h at −2% per hour (24 h late = −48%). After that it's a zero.",
      "Code that doesn't compile gets a zero. Compiler warnings lose marks.",
      "Wrong file names or build scripts lose marks.",
      "Regrades are only for marker errors: Regrade dropbox on Moodle within 5 calendar days of getting the grade. The WHOLE submission is re-marked (can go down), once only.",
      "Academic consideration (SAS students too) must be requested BEFORE the deadline, from your @uoguelph.ca email to cis3090@socs.uoguelph.ca. Nothing is accepted during the late window. Work commitments and other courses' deadlines don't count.",
      "Keep copies of everything you submit. You may be called to online assignment evaluation sessions (8:30 AM–5 PM ET).",
      "Questions: lectures, labs or the Moodle forum. Personal matters: the course email only. Anything else gets no response.",
      "Only selected notes are posted, so take your own. No recording lectures without permission. You must pass the SoCS Academic Integrity Self-Test.",
    ],
    topics: [
      "Wk 1 (Sep 14) · Basics of parallel programming",
      "Wk 2 (Sep 21) · Shared-memory parallelism",
      "Wk 3 (Sep 28) · Shared memory cont., thinking about performance · A1 out",
      "Wk 4 (Oct 5) · Parallel hardware, parallel simulation case study (shared memory)",
      "Wk 5 (Oct 12) · Thanksgiving mini-break",
      "Wk 6 (Oct 19) · Distributed memory with MPI · Midterm 1, A1 due",
      "Wk 7 (Oct 26) · MPI communication patterns, MPI case studies",
      "Wk 8 (Nov 2) · MPI case studies",
      "Wk 9 (Nov 9) · More on performance, GPGPU intro",
      "Wk 10 (Nov 16) · GPGPU with Warp · A2 due",
      "Wk 11 (Nov 23) · GPGPU with Warp · Midterm 2",
      "Wk 12 (Nov 30) · Special/advanced topics · A3 due",
      "Approximate: the outline says topics may be revised.",
    ],
    facts: { maxItem: 23, examShare: 46, gated: false, lateStrict: 0.55 },
  },
  "CIS3760": {
    code: "CIS*3760",
    name: "Software Engineering",
    color: "#3b82f6",
    instructor: "Dr. Denis Nikitenko",
    email: "cis3760@socs.uoguelph.ca",
    office: "By appointment",
    officeHours: "By appointment (see Moodle; hours may vary). TA hours: TBA",
    lectures: "Sec 0102 · Tue/Thu 11:30 AM–12:50 PM · Lab Fri 2:30–4:20 PM · blended (in person + online)",
    platform: "Moodle + SoCS GitLab",
    textbook: "None required",
    rmpName: "Denis Nikitenko",
    passRules: [
      "100% of the grade is the team project: 4 sprints.",
      "Sprints are ranked by YOUR individual grade (team mark after peer-evaluation scaling): best 35%, 2nd 25%, 3rd 25%, worst 15%. This never hurts you.",
      "−4.5 points off your FINAL grade for every sprint planning meeting you miss.",
      "A sprint not submitted within the 12 h late window is a 0, unless consideration was arranged beforehand.",
    ],
    policies: [
      "Late sprints are accepted for 12 h at −2% per hour. After that you can't submit.",
      "Academic consideration (SAS students too) must be requested by course email BEFORE the sprint deadline or meeting. Nothing is accepted during the late window.",
      "Sick for a planning meeting? Email cis3760@socs.uoguelph.ca BEFORE the meeting to avoid the penalty. Repeated illness may need documentation.",
      "Heavily in-person course: weekly team sprint meetings and meetings with the instructor. Skipping in-person activities costs marks.",
      "Code must compile clean and run exactly as the sprint description says. Doesn't compile = 0. Warnings lose marks.",
      "Wrong file names or missing/broken build scripts lose marks.",
      "Regrades are only for marker errors: Moodle Regrade dropbox within 5 calendar days of the grade. The whole sprint is re-marked (can go down), once only. Auto-denied if the wiki or any deliverable was edited after the grade came out.",
      "Work commitments and other courses' deadlines are not grounds for academic consideration.",
      "No recording lectures without permission. You must pass the SoCS Academic Integrity Self-Test.",
    ],
    topics: [
      "Wk 1 (Sep 14) · Course intro, Agile practices, project overview",
      "Wk 2 (Sep 21) · User stories, sprint planning, Git basics, coding standards · form teams",
      "Wk 3 (Sep 28) · Docker, testing basics, unit-testing frameworks · Sprint 1 out",
      "Wk 4 (Oct 5) · Backlog refinement, Scrum retrospective, intro to CI/CD",
      "Wk 5 (Oct 12) · Thanksgiving mini-break · Sprint 1 due, Sprint 2 out",
      "Wk 6 (Oct 19) · Advanced Git, static analysis, code reviews",
      "Wk 7 (Oct 26) · Software architecture, RESTful services, distributed systems",
      "Wk 8 (Nov 2) · OO design principles, SOLID · Sprint 2 due, Sprint 3 out",
      "Wk 9 (Nov 9) · Integration testing, advanced testing strategies",
      "Wk 10 (Nov 16) · Code smells, refactoring · Sprint 3 due, Sprint 4 out",
      "Wk 11 (Nov 23) · Design patterns",
      "Wk 12 (Nov 30) · Software quality, technical debt, DevOps · Sprint 4 due",
      "Approximate: the outline says topics may be revised.",
    ],
    facts: { maxItem: 35, examShare: 0, gated: false, lateStrict: 0.85 },
  },
  "ECON3500": {
    code: "ECON*3500",
    name: "Urban Economics",
    color: "#e11d48",
    instructor: "Jiangnan Zeng",
    email: "jiangnan@uoguelph.ca",
    office: "MCKN 743",
    officeHours: "Mon/Wed 1:00–2:00 & 4:00–5:00 PM (other times by email appointment; may move to Zoom) · TA: TBD",
    lectures: "Sec 02 · Mon/Wed 2:30–3:50 PM · MCKN 116",
    platform: "CourseLink + Gradescope",
    textbook: "Sieg (2020), Urban Economics and Fiscal Policy, Princeton UP (recommended; eBook is cheap; copies on library reserve)",
    rmpName: "Jiangnan Zeng",
    passRules: [
      "No final exam. The grade is the weighted sum of quizzes, assignments, midterms, project and participation.",
      "Miss a midterm with no legitimate excuse = 0%. With a medical/compassionate reason you write the ONE make-up (date TBA) or move its weight to the other midterm, never to assignments or the project.",
      "Miss an assignment = 0 unless you're ill or have compassionate grounds. Its weight is never moved to other work.",
      "No late work is accepted once graded assignments have been returned to the class.",
    ],
    policies: [
      "Late penalty: 3% of the total grade earned per day, weekends included, deducted from that assessment's mark (unless you arranged an extension well before the due date).",
      "Extensions only for valid medical/personal reasons: email the prof as soon as possible, well before the due date.",
      "Participation: after you ask or answer a question, see the prof right after class so it gets recorded.",
      "Quizzes (~30 min) are mock midterms. Solutions are explained in class afterwards. Midterm solutions and grades are posted on CourseLink.",
      "Course questions: CourseLink discussion board (answers in 24–48 h). Personal matters: email the prof directly (replies within 24 h, Mon–Fri 9–5). CourseLink messages are never read.",
      "Can't meet a requirement (illness/compassionate)? Tell the prof in writing with your name, student ID and email.",
      "Read the assigned Sieg chapter before each lecture (about 1 chapter per lecture).",
      "Always attend your own section (Sec 2). No recording lectures without consent.",
    ],
    topics: [
      "Sep 14 · Introduction to urban economics",
      "Sep 21 · Empirical methods I: correlation, causality, regression",
      "Sep 28 · Economic rationale of cities (Ch 2), fiscal federalism (Ch 3)",
      "Oct 5 · Efficient provision of local public goods (Ch 4) · A1 due (tentative)",
      "Oct 12 · Mon Thanksgiving; Wed rest of Ch 4 + review · Quiz 1",
      "Oct 19 · Midterm 1 (Mon) · Fiscal policy and urban development (Ch 5)",
      "Oct 26 · Ch 5, empirical methods II (Ch 6)",
      "Nov 2 · Tiebout sorting (Ch 7), zoning (Ch 8)",
      "Nov 9 · Zoning (Ch 8), monocentric model and transportation (Ch 12) · Quiz 2, A2 due (tentative)",
      "Nov 16 · Midterm 2 (Mon) · Housing affordability",
      "Nov 23 · Housing affordability + group project presentations",
      "Nov 30 & Dec 2 · Group project presentations · A3 ~Dec 7, project Dec 10",
    ],
    facts: { maxItem: 20, examShare: 45, gated: false, lateStrict: 0.4 },
  },
};

/* Weekly recurring classes, labs & office hours (Mon=1 … Fri=5), from WebAdvisor.
   Optional `from`: first date the row meets. */
const SCHEDULE = [
  { course: "CIS3210", kind: "lecture", days: [2, 4], start: "08:30", end: "09:50", where: "MCKN 120" },
  { course: "CIS3150", kind: "lecture", days: [2, 4], start: "10:00", end: "11:20", where: "" },
  { course: "CIS3760", kind: "lecture", days: [2, 4], start: "11:30", end: "12:50", where: "", from: "2026-09-15" },
  { course: "CIS3090", kind: "lecture", days: [2, 4], start: "14:30", end: "15:50", where: "", from: "2026-09-15" },
  { course: "ECON3500", kind: "lecture", days: [1, 3], start: "14:30", end: "15:50", where: "MCKN 116" },
  { course: "CIS3090", kind: "lab", days: [3], start: "12:30", end: "13:20", where: "", from: "2026-09-15" },
  { course: "CIS3760", kind: "lab", days: [5], start: "14:30", end: "16:20", where: "", from: "2026-09-15" },
  { course: "CIS3210", kind: "lab", days: [5], start: "16:30", end: "17:20", where: "MCKN 121" },
  { course: "CIS3150", kind: "office", days: [2], start: "12:00", end: "13:00", where: "Reynolds 3310" },
  { course: "CIS3210", kind: "office", days: [2, 4], start: "12:00", end: "13:00", where: "Reynolds 3304" },
  { course: "ECON3500", kind: "office", days: [1, 3], start: "13:00", end: "14:00", where: "MCKN 743" },
  { course: "ECON3500", kind: "office", days: [1, 3], start: "16:00", end: "17:00", where: "MCKN 743" },
];

const ITEMS = [
  /* ---------------- CIS*3150 Theory of Computation ---------------- */
  { id: "3150-p1", course: "CIS3150", title: "Participation / Exercise 1", type: "participation", due: "2026-09-15T10:00", weight: 2.5, weightLabel: "10% total for 4 (equal split assumed)", notes: "In class." },
  { id: "3150-a1", course: "CIS3150", title: "Assignment 1", type: "assignment", due: "2026-09-22T10:00", weight: 5, weightLabel: "20% total for 4 (equal split assumed)", notes: "In class." },
  { id: "3150-p2", course: "CIS3150", title: "Participation / Exercise 2", type: "participation", due: "2026-09-29T10:00", weight: 2.5, weightLabel: "10% total for 4 (equal split assumed)", notes: "Outline gives the date only. Time assumed = lecture start." },
  { id: "3150-a2", course: "CIS3150", title: "Assignment 2", type: "assignment", due: "2026-10-06", weight: 5, weightLabel: "20% total for 4 (equal split assumed)", notes: "Due time: check CourseLink. Programming work is zipped to the CourseLink dropbox." },
  { id: "3150-t1", course: "CIS3150", title: "Test 1", type: "test", due: "2026-10-08T10:00", end: "11:20", weight: 17, notes: "Outline gives the date only. Time, room, coverage and aids assumed/unknown: confirm in class." },
  { id: "3150-p3", course: "CIS3150", title: "Participation / Exercise 3", type: "participation", due: "2026-10-20T10:00", weight: 2.5, weightLabel: "10% total for 4 (equal split assumed)", notes: "Outline gives the date only. Time assumed = lecture start." },
  { id: "3150-a3", course: "CIS3150", title: "Assignment 3", type: "assignment", due: "2026-10-27", weight: 5, weightLabel: "20% total for 4 (equal split assumed)", notes: "Due time: check CourseLink. Programming work is zipped to the CourseLink dropbox." },
  { id: "3150-p4", course: "CIS3150", title: "Participation / Exercise 4", type: "participation", due: "2026-11-03T10:00", weight: 2.5, weightLabel: "10% total for 4 (equal split assumed)", notes: "Outline gives the date only. Time assumed = lecture start." },
  { id: "3150-a4", course: "CIS3150", title: "Assignment 4", type: "assignment", due: "2026-11-09", weight: 5, weightLabel: "20% total for 4 (equal split assumed)", notes: "A MONDAY (no class that day). Due time: check CourseLink." },
  { id: "3150-t2", course: "CIS3150", title: "Test 2", type: "test", due: "2026-11-12T10:00", end: "11:20", weight: 18, notes: "Outline gives the date only. Time, room, coverage and aids assumed/unknown: confirm in class." },
  { id: "3150-fx", course: "CIS3150", title: "Final Exam", type: "exam", due: "2026-12-07", window: ["2026-12-07", "2026-12-22"], tbd: true, weight: 35, notes: "Date set by the university exam schedule (Dec 7–22; posted on WebAdvisor around mid-October). Format and aids not in the outline." },

  /* ---------------- CIS*3210 Computer Networks ---------------- */
  ...[
    ["2026-09-17", 1], ["2026-09-22", 2], ["2026-09-24", 3], ["2026-09-29", 4], ["2026-10-01", 5],
    ["2026-10-06", 6], ["2026-10-08", 7], ["2026-10-15", 8], ["2026-10-20", 9], ["2026-10-22", 10],
    ["2026-10-27", 11], ["2026-10-29", 12], ["2026-11-03", 13], ["2026-11-05", 14], ["2026-11-10", 15],
    ["2026-11-12", 16], ["2026-11-17", 17], ["2026-11-19", 18], ["2026-11-24", 19], ["2026-11-26", 20],
  ].map(([d, n]) => ({
    id: `3210-q${n}`, course: "CIS3210", title: `Quiz ${n}`, type: "quiz", due: `${d}T08:30`,
    weight: 0.3, badge: "0.4%", weightLabel: "6% total · best 15 of 20 count (≈0.4% each) · every quiz also feeds the +3 bonus", location: "In lecture · MCKN 120",
    notes: "In-person, 5–10 min, on CourseLink. Exact time in the lecture isn't announced. A missed quiz is a zero. Absent? Don't open it or share the password.",
  })),
  { id: "3210-a1r", course: "CIS3210", title: "Assignment 1 released", type: "release", due: "2026-09-24", weight: 0 },
  { id: "3210-a1", course: "CIS3210", title: "Assignment 1", type: "assignment", due: "2026-10-05T23:59", weight: 6, notes: "Dropbox. Grace days apply (4 total). Once they're used up, late = 0." },
  { id: "3210-a2r", course: "CIS3210", title: "Assignment 2 released", type: "release", due: "2026-10-08", weight: 0 },
  { id: "3210-a2", course: "CIS3210", title: "Assignment 2", type: "assignment", due: "2026-10-19T23:59", weight: 6, notes: "Dropbox. Grace days apply. Once they're used up, late = 0." },
  { id: "3210-mt", course: "CIS3210", title: "Midterm", type: "test", due: "2026-10-24T16:00", end: "18:00", weight: 25, location: "RICH 2520 & RICH 2529", notes: "SATURDAY. In person, closed book. Covers everything up to and including Thu Oct 22. Bring the Casio fx-300MS PLUS 2." },
  { id: "3210-a3r", course: "CIS3210", title: "Assignment 3 released", type: "release", due: "2026-10-29", weight: 0 },
  { id: "3210-a3", course: "CIS3210", title: "Assignment 3", type: "assignment", due: "2026-11-09T23:59", weight: 6, notes: "Dropbox. Grace days apply. Once they're used up, late = 0." },
  { id: "3210-a4r", course: "CIS3210", title: "Assignment 4 released", type: "release", due: "2026-11-12", weight: 0 },
  { id: "3210-a4", course: "CIS3210", title: "Assignment 4", type: "assignment", due: "2026-11-23T23:59", weight: 6, notes: "Max ONE grace day on this one: more than 1 day late = 0." },
  { id: "3210-fx", course: "CIS3210", title: "Final Exam", type: "exam", due: "2026-12-07", window: ["2026-12-07", "2026-12-22"], tbd: true, weight: 45, notes: "Cumulative, closed book, in person. Casio fx-300MS PLUS 2 only. Date comes from the university exam schedule (posted on WebAdvisor around mid-October). Miss it → Program Counsellor for a deferred-exam petition." },

  /* ---------------- CIS*3090 Parallel Programming ---------------- */
  { id: "3090-a1r", course: "CIS3090", title: "Assignment 1 released", type: "release", due: "2026-09-28", window: ["2026-09-28", "2026-10-04"], weight: 0 },
  { id: "3090-m1", course: "CIS3090", title: "Midterm 1", type: "test", due: "2026-10-20T14:30", end: "15:50", weight: 23, notes: "Outline gives the date only: time, room, format and aids assumed/unknown. Confirm on Moodle. Coverage not stated; topics before it: basics, shared memory, performance, parallel hardware, simulation case study. Can't write it? Email cis3090@ BEFORE the test." },
  { id: "3090-a1", course: "CIS3090", title: "Assignment 1", type: "assignment", due: "2026-10-23T23:59", weight: 18, notes: "Submit on Moodle. 'Before midnight'; exact time in the assignment description. Late: 48 h window at −2%/h." },
  { id: "3090-a2", course: "CIS3090", title: "Assignment 2", type: "assignment", due: "2026-11-16T23:59", weight: 18, notes: "Submit on Moodle. 'Before midnight'; exact time in the assignment description. Late: 48 h window at −2%/h." },
  { id: "3090-m2", course: "CIS3090", title: "Midterm 2", type: "test", due: "2026-11-26T14:30", end: "15:50", weight: 23, notes: "Outline gives the date only: time, room, format and aids assumed/unknown. Confirm on Moodle. Coverage not stated; topics since M1: MPI, MPI case studies, performance, GPGPU/Warp. Can't write it? Email cis3090@ BEFORE the test." },
  { id: "3090-a3", course: "CIS3090", title: "Assignment 3", type: "assignment", due: "2026-12-04T23:59", weight: 18, notes: "Fri Dec 4 is the last day of CIS*3090. Submit on Moodle. Late: 48 h window at −2%/h (zero after Dec 6 11:59 PM)." },

  /* ---------------- CIS*3760 Software Engineering ---------------- */
  { id: "3760-s1r", course: "CIS3760", title: "Sprint 1 released", type: "release", due: "2026-09-28", window: ["2026-09-28", "2026-10-04"], weight: 0 },
  ...[
    ["2026-09-28", 1], ["2026-10-05", 1], ["2026-10-19", 2], ["2026-10-26", 2],
    ["2026-11-02", 3], ["2026-11-09", 3], ["2026-11-16", 4], ["2026-11-23", 4],
  ].map(([mon, s], i) => ({
    id: `3760-mtg${i + 1}`, course: "CIS3760", title: `Sprint ${s} planning meeting`, type: "meeting",
    due: mon, window: [mon, addDaysISO(mon, 4)], weight: 0, penalty: 4.5, weightLabel: "−4.5% if missed",
    notes: "Attendance is mandatory. In person during class time (the outline lists it as that week's in-class activity); which slot, Tue/Thu 11:30 lecture or Fri 2:30 lab, isn't stated. If you're sick, email cis3760@socs.uoguelph.ca BEFORE the meeting.",
  })),
  { id: "3760-s1", course: "CIS3760", title: "Sprint 1", type: "sprint", due: "2026-10-14T23:59", weight: 25, badge: "15–35%", weightLabel: "ranked: best sprint 35%, worst 15%", notes: "Submit via SoCS GitLab, including the sprint wiki page (don't edit it after grading). Late: 12 h at −2%/h; window closes ~noon Thu Oct 15." },
  { id: "3760-s2r", course: "CIS3760", title: "Sprint 2 released", type: "release", due: "2026-10-12", window: ["2026-10-12", "2026-10-18"], weight: 0 },
  { id: "3760-s2", course: "CIS3760", title: "Sprint 2", type: "sprint", due: "2026-11-02T23:59", weight: 25, badge: "15–35%", weightLabel: "ranked: best sprint 35%, worst 15%", notes: "Submit via SoCS GitLab, including the sprint wiki page (don't edit it after grading). Late: 12 h at −2%/h; window closes ~noon Tue Nov 3." },
  { id: "3760-s3r", course: "CIS3760", title: "Sprint 3 released", type: "release", due: "2026-11-02", window: ["2026-11-02", "2026-11-08"], weight: 0 },
  { id: "3760-s3", course: "CIS3760", title: "Sprint 3", type: "sprint", due: "2026-11-16T23:59", weight: 25, badge: "15–35%", weightLabel: "ranked: best sprint 35%, worst 15%", notes: "Submit via SoCS GitLab, including the sprint wiki page (don't edit it after grading). Late: 12 h at −2%/h; window closes ~noon Tue Nov 17." },
  { id: "3760-s4r", course: "CIS3760", title: "Sprint 4 released", type: "release", due: "2026-11-16", window: ["2026-11-16", "2026-11-22"], weight: 0 },
  { id: "3760-s4", course: "CIS3760", title: "Sprint 4", type: "sprint", due: "2026-11-30T23:59", weight: 25, badge: "15–35%", weightLabel: "ranked: best sprint 35%, worst 15%", notes: "Submit via SoCS GitLab, including the sprint wiki page (don't edit it after grading). Late: 12 h at −2%/h; window closes ~noon Tue Dec 1." },

  /* ---------------- ECON*3500 Urban Economics (Section 2) ---------------- */
  { id: "3500-part", course: "ECON3500", title: "Class participation (ongoing)", type: "participation", due: "2026-09-14", window: ["2026-09-14", "2026-12-04"], weight: 5, ongoing: true, notes: "Ask or answer questions in class, then see the prof right after so it gets recorded. Fri Dec 4 runs the Monday schedule, so Sec 2 meets that day too." },
  { id: "3500-a1", course: "ECON3500", title: "Assignment 1", type: "assignment", due: "2026-10-05", window: ["2026-10-05", "2026-10-09"], tentative: true, weight: 10, weightLabel: "30% total for 3 (equal split assumed)", location: "Gradescope", notes: "Outline says 'week of Oct 5 (tentative)'. Due time not in the outline. Watch CourseLink for the exact date." },
  { id: "3500-q1", course: "ECON3500", title: "Quiz 1", type: "quiz", due: "2026-10-14T14:30", weight: 2.5, weightLabel: "5% total for '1–2 quizzes'", location: "In class · MCKN 116", notes: "~30 min, a mock midterm. Same class also finishes Ch 4 + review. Exact time within class not stated." },
  { id: "3500-m1", course: "ECON3500", title: "Midterm 1", type: "test", due: "2026-10-19T14:30", end: "15:50", weight: 20, weightLabel: "40% total for 2 (equal split assumed)", location: "In class · MCKN 116", notes: "Coverage not stated; the schedule implies intro, empirical methods I, Ch 2–4. Length, format and aids not in the outline. No legitimate excuse = 0%." },
  { id: "3500-q2", course: "ECON3500", title: "Quiz 2", type: "quiz", due: "2026-11-09", window: ["2026-11-09", "2026-11-11"], tentative: true, weight: 2.5, weightLabel: "5% total for '1–2 quizzes'", location: "In class · MCKN 116", notes: "Week of Nov 9. Quiz 1 was the last class before Midterm 1, so likely Wed Nov 11. Outline says '1–2 quizzes' for 5%: if there's no Quiz 2, Quiz 1 = 5%." },
  { id: "3500-a2", course: "ECON3500", title: "Assignment 2", type: "assignment", due: "2026-11-09", window: ["2026-11-09", "2026-11-13"], tentative: true, weight: 10, weightLabel: "30% total for 3 (equal split assumed)", location: "Gradescope", notes: "Outline says 'week of Nov 9 (tentative)'. Due time not in the outline." },
  { id: "3500-m2", course: "ECON3500", title: "Midterm 2", type: "test", due: "2026-11-16T14:30", end: "15:50", weight: 20, weightLabel: "40% total for 2 (equal split assumed)", location: "In class · MCKN 116", notes: "Coverage not stated; the schedule implies Oct 19–Nov 11 material (Ch 5, 6, 7, 8, 12). Length, format and aids not in the outline. No legitimate excuse = 0%." },
  { id: "3500-pres", course: "ECON3500", title: "Group project presentation", type: "presentation", due: "2026-11-23", window: ["2026-11-23", "2026-12-02"], tentative: true, weight: 0, weightLabel: "no separate weight listed (likely inside the project's 20%)", location: "In class · MCKN 116", notes: "Presentations run in class the week of Nov 23, Mon Nov 30 and Wed Dec 2. Your group's slot is TBA." },
  { id: "3500-a3", course: "ECON3500", title: "Assignment 3", type: "assignment", due: "2026-12-07", tentative: true, weight: 10, weightLabel: "30% total for 3 (equal split assumed)", location: "Gradescope", notes: "Outline says 'around Dec 7 (tentative)'. Due time not in the outline." },
  { id: "3500-proj", course: "ECON3500", title: "Final group research project", type: "project", due: "2026-12-10", weight: 20, notes: "Group research proposal: theory + real data + empirical analysis + visualization. Submission method and due time not in the outline." },
];

function addDaysISO(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/* Rate My Professors snapshot (not live; RMP has no public API).
   null fields = not found / unverified. */
const RMP = {
  asOf: "2026-09-28",
  profs: {
    "Charlie Obimbo": {
      url: "https://www.ratemyprofessors.com/professor/3048931",
      quality: 2.3, difficulty: 4.0, wouldTakeAgain: 25, count: 4,
      tags: ["Tough grader", "Lecture heavy"],
      summary: "Only 4 reviews, all from CIS*4520. Most describe a kind person whose explanations and slides are hard to follow, in a tough course. One review found it easy.",
      courseNote: "No CIS*3150-specific reviews yet.",
    },
    "Sajid Marhon": {
      url: "https://www.ratemyprofessors.com/professor/3133432",
      quality: 1.0, difficulty: 3.5, wouldTakeAgain: 0, count: 2,
      tags: ["Test heavy", "Lecture heavy"],
      summary: "Only 2 reviews. Both call him knowledgeable but say the teaching is weak and the exams hard. Lectures track the Kurose textbook closely.",
      courseNote: "1 CIS*3210 review: difficulty 2/5, grade A. The advice was to lean on the textbook.",
    },
    "Denis Nikitenko": {
      url: "https://www.ratemyprofessors.com/professor/2294627",
      quality: 4.6, difficulty: 3.2, wouldTakeAgain: 87.5, count: 39,
      tags: ["Respected", "Amazing lectures", "Gives good feedback", "Hilarious", "Clear grading criteria"],
      summary: "Widely liked: funny, fair, clear and approachable. Assignments are heavy but manageable if you start early.",
      courseNote: "CIS*3090 (3 reviews): difficulty 2–3/5, lectures are fast-paced. CIS*3760 (1 review): difficulty 1/5, but sprint grading was inconsistent.",
    },
    "Jiangnan Zeng": {
      url: "https://www.ratemyprofessors.com/professor/3071199",
      quality: 4.0, difficulty: 2.3, wouldTakeAgain: 75, count: 3,
      tags: ["Amazing lectures", "Clear grading criteria", "Participation matters"],
      summary: "Clear, engaging lectures and fair grading. Practice midterms and exam hints are provided. The prof is approachable.",
      courseNote: "2 ECON*3500 reviews: difficulty 1–2/5, both got an A.",
    },
  },
};
