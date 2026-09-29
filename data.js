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
    { date: "2026-10-12", end: "2026-10-13", label: "Thanksgiving break: no classes" },
    { date: "2026-12-02", label: "Last regularly scheduled class day" },
    { date: "2026-12-03", label: "Makeup day (runs Tuesday Oct 13 schedule)" },
    { date: "2026-12-04", label: "Last day to drop courses" },
    { date: "2026-12-07", end: "2026-12-22", label: "Final exam period" },
  ],
};

const COURSES = {
  "CIS3150": {
    code: "CIS*3150",
    name: "Theory of Computation",
    color: "#7c5cff",
    instructor: "Prof. Charlie Obimbo",
    email: "cobimbo@uoguelph.ca",
    office: "Reynolds 3310 · x52634",
    officeHours: "Tue 12:00–1:00 PM",
    lectures: "Sec 01 · Tue/Thu 10:00–11:20 AM",
    platform: "CourseLink",
    textbook: "Sipser, Introduction to the Theory of Computation (3rd ed.)",
    rmpName: "Charlie Obimbo",
    passRules: [
      "You must attempt ALL course work.",
      "You need ≥50% on course work (assignments + participation, 30%) AND ≥50% on tests + final (70%) to pass.",
      "If you miss either 50% bar, your grade becomes INC or a reduced formula grade.",
    ],
    policies: [
      "Late or missed work gets a zero unless you give the instructor a valid reason in a timely fashion.",
      "Programming assignments are zipped and submitted to the CourseLink dropbox.",
      "Remark requests must be made within 1 week of work being returned.",
      "No Chegg or similar sites. TurnItIn and AI detectors may be used.",
      "Lectures are not recorded. Phones off in class.",
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
    officeHours: "Tue & Thu 12:00–1:00 PM",
    lectures: "Sec 0101 · Tue/Thu 8:30–9:50 AM · MCKN 120 · Lab Fri 4:30–5:20 PM · MCKN 121",
    platform: "CourseLink",
    textbook: "Kurose & Ross, Computer Networking: A Top-Down Approach (9th ed.)",
    rmpName: "Sajid Marhon",
    passRules: [
      "Two components: Assignments (24) and Tests (quizzes + midterm + final = 76).",
      "You must pass BOTH: ≥12/24 on assignments AND ≥38/76 on tests (quiz bonus counts toward tests).",
      "Fail one component and your final grade is that component's %.",
    ],
    policies: [
      "4 grace days total, whole days only (1 second late uses a full day). At most 1 grace day on A4.",
      "Assignments are due 11:59 PM through the dropbox. A wrong submission (file names, makefile, structure) gets a zero.",
      "20 in-person quizzes (5–10 min) run in lecture through CourseLink. Your best 15 count. A missed quiz is a 0.",
      "Quiz bonus: up to +3, equal to your average over all 20 quizzes × 3.",
      "ONLY the Casio fx-300MS PLUS 2 calculator is allowed on tests and exams.",
      "The midterm covers material up to and including Thu Oct 22. The final is cumulative. Both are closed book.",
      "Regrade requests go by email within 5 days. Any AI use not explicitly allowed is misconduct.",
    ],
    facts: { maxItem: 45, examShare: 76, gated: true, lateStrict: 0.35 },
  },
  "CIS3090": {
    code: "CIS*3090",
    name: "Parallel Programming",
    color: "#f59e0b",
    instructor: "Dr. Denis Nikitenko",
    email: "cis3090@socs.uoguelph.ca",
    office: "By appointment",
    officeHours: "By appointment (see Moodle). TAs during lab times (online)",
    lectures: "Sec 0106 · Tue/Thu 2:30–3:50 PM · Lab Wed 12:30–1:20 PM (TA consulting)",
    platform: "Moodle (moodle.socs.uoguelph.ca)",
    textbook: "Pacheco & Malensek, An Introduction to Parallel Programming (2nd ed.)",
    rmpName: "Denis Nikitenko",
    passRules: [
      "Your final grade is simply the weighted sum: 3 assignments × 18% + 2 midterms × 23%.",
    ],
    policies: [
      "Late work is accepted for 48 h at −2% per hour. After that it's a zero.",
      "Code that doesn't compile gets a zero. Compiler warnings lose marks.",
      "Wrong file names or build scripts lose marks.",
      "Regrades go through the Regrade dropbox within 5 calendar days. The grade can go down.",
      "Academic consideration must be requested BEFORE the deadline. Nothing is accepted during the late window.",
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
    officeHours: "By appointment (see Moodle)",
    lectures: "Sec 0102 · Tue/Thu 11:30 AM–12:50 PM · Lab Fri 2:30–4:20 PM",
    platform: "Moodle + SoCS GitLab",
    textbook: "None required",
    rmpName: "Denis Nikitenko",
    passRules: [
      "100% of the grade is the team project: 4 sprints.",
      "Sprints are ranked by YOUR grade: best 35%, 2nd 25%, 3rd 25%, worst 15%. This never hurts you.",
      "−4.5 points off your FINAL grade for every sprint planning meeting you miss.",
    ],
    policies: [
      "Late sprints are accepted for 12 h at −2% per hour. After that you can't submit.",
      "Sick for a planning meeting? Email the course address BEFORE the meeting to avoid the penalty.",
      "Code that doesn't compile gets a zero. Warnings lose marks.",
      "Regrades are denied if the wiki or deliverables were edited after the grade was released.",
      "Work commitments and other courses' deadlines are not grounds for academic consideration.",
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
    officeHours: "Mon/Wed 1:00–2:00 & 4:00–5:00 PM",
    lectures: "Sec 02 · Mon/Wed 2:30–3:50 PM · MCKN 116",
    platform: "CourseLink + Gradescope",
    textbook: "Sieg, Urban Economics and Fiscal Policy (recommended; eBook is cheap)",
    rmpName: "Jiangnan Zeng",
    passRules: [
      "No final exam. The grade is the weighted sum of quizzes, assignments, midterms, project and participation.",
      "Weight from a missed assignment can't be moved elsewhere. Midterm weight can only move to the other midterm.",
    ],
    policies: [
      "Late work loses 3% of the grade earned per day, weekends included.",
      "Participation: after you ask or answer a question, see the prof right after class so it gets recorded.",
      "Quizzes (~30 min) are mock midterms. Solutions are explained in class afterwards.",
      "Email the prof directly. CourseLink messages are never read.",
      "Always attend your own section (Sec 2).",
    ],
    facts: { maxItem: 20, examShare: 45, gated: false, lateStrict: 0.4 },
  },
};

/* Weekly recurring classes, labs & office hours (Mon=1 … Fri=5), from WebAdvisor. */
const SCHEDULE = [
  { course: "CIS3210", kind: "lecture", days: [2, 4], start: "08:30", end: "09:50", where: "MCKN 120" },
  { course: "CIS3150", kind: "lecture", days: [2, 4], start: "10:00", end: "11:20", where: "" },
  { course: "CIS3760", kind: "lecture", days: [2, 4], start: "11:30", end: "12:50", where: "" },
  { course: "CIS3090", kind: "lecture", days: [2, 4], start: "14:30", end: "15:50", where: "" },
  { course: "ECON3500", kind: "lecture", days: [1, 3], start: "14:30", end: "15:50", where: "MCKN 116" },
  { course: "CIS3090", kind: "lab", days: [3], start: "12:30", end: "13:20", where: "" },
  { course: "CIS3760", kind: "lab", days: [5], start: "14:30", end: "16:20", where: "" },
  { course: "CIS3210", kind: "lab", days: [5], start: "16:30", end: "17:20", where: "MCKN 121" },
  { course: "CIS3150", kind: "office", days: [2], start: "12:00", end: "13:00", where: "Reynolds 3310" },
  { course: "CIS3210", kind: "office", days: [2, 4], start: "12:00", end: "13:00", where: "Reynolds 3304" },
  { course: "ECON3500", kind: "office", days: [1, 3], start: "13:00", end: "14:00", where: "MCKN 743" },
  { course: "ECON3500", kind: "office", days: [1, 3], start: "16:00", end: "17:00", where: "MCKN 743" },
];

const ITEMS = [
  /* ---------------- CIS*3150 Theory of Computation ---------------- */
  { id: "3150-p1", course: "CIS3150", title: "Participation / Exercise 1", type: "participation", due: "2026-09-15T10:00", weight: 2.5, notes: "In class." },
  { id: "3150-a1", course: "CIS3150", title: "Assignment 1", type: "assignment", due: "2026-09-22T10:00", weight: 5, notes: "In class." },
  { id: "3150-p2", course: "CIS3150", title: "Participation / Exercise 2", type: "participation", due: "2026-09-29T10:00", weight: 2.5, notes: "In class." },
  { id: "3150-a2", course: "CIS3150", title: "Assignment 2", type: "assignment", due: "2026-10-06", weight: 5, notes: "Due time: check CourseLink." },
  { id: "3150-t1", course: "CIS3150", title: "Test 1", type: "test", due: "2026-10-08T10:00", end: "11:20", weight: 17, notes: "Assumed to be in the lecture slot. Confirm in class." },
  { id: "3150-p3", course: "CIS3150", title: "Participation / Exercise 3", type: "participation", due: "2026-10-20T10:00", weight: 2.5 },
  { id: "3150-a3", course: "CIS3150", title: "Assignment 3", type: "assignment", due: "2026-10-27", weight: 5, notes: "Due time: check CourseLink." },
  { id: "3150-p4", course: "CIS3150", title: "Participation / Exercise 4", type: "participation", due: "2026-11-03T10:00", weight: 2.5 },
  { id: "3150-a4", course: "CIS3150", title: "Assignment 4", type: "assignment", due: "2026-11-09", weight: 5, notes: "Due time: check CourseLink." },
  { id: "3150-t2", course: "CIS3150", title: "Test 2", type: "test", due: "2026-11-12T10:00", end: "11:20", weight: 18, notes: "Assumed to be in the lecture slot. Confirm in class." },
  { id: "3150-fx", course: "CIS3150", title: "Final Exam", type: "exam", due: "2026-12-07", window: ["2026-12-07", "2026-12-22"], tbd: true, weight: 35, notes: "The date is set by the university exam schedule (Dec 7–22)." },

  /* ---------------- CIS*3210 Computer Networks ---------------- */
  ...[
    ["2026-09-17", 1], ["2026-09-22", 2], ["2026-09-24", 3], ["2026-09-29", 4], ["2026-10-01", 5],
    ["2026-10-06", 6], ["2026-10-08", 7], ["2026-10-15", 8], ["2026-10-20", 9], ["2026-10-22", 10],
    ["2026-10-27", 11], ["2026-10-29", 12], ["2026-11-03", 13], ["2026-11-05", 14], ["2026-11-10", 15],
    ["2026-11-12", 16], ["2026-11-17", 17], ["2026-11-19", 18], ["2026-11-24", 19], ["2026-11-26", 20],
  ].map(([d, n]) => ({
    id: `3210-q${n}`, course: "CIS3210", title: `Quiz ${n}`, type: "quiz", due: `${d}T08:30`,
    weight: 0.3, badge: "0.4%", weightLabel: "6% total · best 15 of 20 count (≈0.4% each)", location: "In lecture · MCKN 120",
    notes: "In-person, 5–10 min, on CourseLink. A missed quiz is a zero.",
  })),
  { id: "3210-a1r", course: "CIS3210", title: "Assignment 1 released", type: "release", due: "2026-09-24", weight: 0 },
  { id: "3210-a1", course: "CIS3210", title: "Assignment 1", type: "assignment", due: "2026-10-05T23:59", weight: 6, notes: "Dropbox. Grace days apply (4 total)." },
  { id: "3210-a2r", course: "CIS3210", title: "Assignment 2 released", type: "release", due: "2026-10-08", weight: 0 },
  { id: "3210-a2", course: "CIS3210", title: "Assignment 2", type: "assignment", due: "2026-10-19T23:59", weight: 6, notes: "Dropbox. Grace days apply." },
  { id: "3210-mt", course: "CIS3210", title: "Midterm", type: "test", due: "2026-10-24T16:00", end: "18:00", weight: 25, location: "RICH 2520 & RICH 2529", notes: "SATURDAY. Covers everything up to Thu Oct 22. Bring the Casio fx-300MS PLUS 2." },
  { id: "3210-a3r", course: "CIS3210", title: "Assignment 3 released", type: "release", due: "2026-10-29", weight: 0 },
  { id: "3210-a3", course: "CIS3210", title: "Assignment 3", type: "assignment", due: "2026-11-09T23:59", weight: 6, notes: "Dropbox. Grace days apply." },
  { id: "3210-a4r", course: "CIS3210", title: "Assignment 4 released", type: "release", due: "2026-11-12", weight: 0 },
  { id: "3210-a4", course: "CIS3210", title: "Assignment 4", type: "assignment", due: "2026-11-23T23:59", weight: 6, notes: "Max ONE grace day on this one." },
  { id: "3210-fx", course: "CIS3210", title: "Final Exam", type: "exam", due: "2026-12-07", window: ["2026-12-07", "2026-12-22"], tbd: true, weight: 45, notes: "Cumulative, closed book. Date comes from the university exam schedule." },

  /* ---------------- CIS*3090 Parallel Programming ---------------- */
  { id: "3090-a1r", course: "CIS3090", title: "Assignment 1 released", type: "release", due: "2026-09-28", window: ["2026-09-28", "2026-10-04"], weight: 0 },
  { id: "3090-m1", course: "CIS3090", title: "Midterm 1", type: "test", due: "2026-10-20T14:30", end: "15:50", weight: 23, notes: "Assumed to be in your Tue lecture slot. Confirm on Moodle." },
  { id: "3090-a1", course: "CIS3090", title: "Assignment 1", type: "assignment", due: "2026-10-23T23:59", weight: 18, notes: "Late: 48 h window at −2%/h." },
  { id: "3090-a2", course: "CIS3090", title: "Assignment 2", type: "assignment", due: "2026-11-16T23:59", weight: 18, notes: "Late: 48 h window at −2%/h." },
  { id: "3090-m2", course: "CIS3090", title: "Midterm 2", type: "test", due: "2026-11-26T14:30", end: "15:50", weight: 23, notes: "Assumed to be in your Thu lecture slot. Confirm on Moodle." },
  { id: "3090-a3", course: "CIS3090", title: "Assignment 3", type: "assignment", due: "2026-12-04T23:59", weight: 18, notes: "Last day of classes. Late: 48 h window at −2%/h." },

  /* ---------------- CIS*3760 Software Engineering ---------------- */
  { id: "3760-s1r", course: "CIS3760", title: "Sprint 1 released", type: "release", due: "2026-09-28", window: ["2026-09-28", "2026-10-04"], weight: 0 },
  ...[
    ["2026-09-28", 1], ["2026-10-05", 1], ["2026-10-19", 2], ["2026-10-26", 2],
    ["2026-11-02", 3], ["2026-11-09", 3], ["2026-11-16", 4], ["2026-11-23", 4],
  ].map(([mon, s], i) => ({
    id: `3760-mtg${i + 1}`, course: "CIS3760", title: `Sprint ${s} planning meeting`, type: "meeting",
    due: mon, window: [mon, addDaysISO(mon, 4)], weight: 0, penalty: 4.5, weightLabel: "−4.5% if missed",
    notes: "Attendance is mandatory. Likely in your Tue/Thu 11:30 lecture or Fri 2:30 lab (confirm in class). If you're sick, email cis3760@ BEFORE the meeting.",
  })),
  { id: "3760-s1", course: "CIS3760", title: "Sprint 1", type: "sprint", due: "2026-10-14T23:59", weight: 25, badge: "15–35%", weightLabel: "ranked: best sprint 35%, worst 15%", notes: "Submit via SoCS GitLab. Late: 12 h at −2%/h." },
  { id: "3760-s2r", course: "CIS3760", title: "Sprint 2 released", type: "release", due: "2026-10-12", window: ["2026-10-12", "2026-10-16"], weight: 0 },
  { id: "3760-s2", course: "CIS3760", title: "Sprint 2", type: "sprint", due: "2026-11-02T23:59", weight: 25, badge: "15–35%", weightLabel: "ranked: best sprint 35%, worst 15%", notes: "Submit via SoCS GitLab. Late: 12 h at −2%/h." },
  { id: "3760-s3r", course: "CIS3760", title: "Sprint 3 released", type: "release", due: "2026-11-02", window: ["2026-11-02", "2026-11-06"], weight: 0 },
  { id: "3760-s3", course: "CIS3760", title: "Sprint 3", type: "sprint", due: "2026-11-16T23:59", weight: 25, badge: "15–35%", weightLabel: "ranked: best sprint 35%, worst 15%", notes: "Submit via SoCS GitLab. Late: 12 h at −2%/h." },
  { id: "3760-s4r", course: "CIS3760", title: "Sprint 4 released", type: "release", due: "2026-11-16", window: ["2026-11-16", "2026-11-20"], weight: 0 },
  { id: "3760-s4", course: "CIS3760", title: "Sprint 4", type: "sprint", due: "2026-11-30T23:59", weight: 25, badge: "15–35%", weightLabel: "ranked: best sprint 35%, worst 15%", notes: "Submit via SoCS GitLab. Late: 12 h at −2%/h." },

  /* ---------------- ECON*3500 Urban Economics (Section 2) ---------------- */
  { id: "3500-part", course: "ECON3500", title: "Class participation (ongoing)", type: "participation", due: "2026-09-14", window: ["2026-09-14", "2026-12-02"], weight: 5, ongoing: true, notes: "Ask or answer questions in class, then see the prof right after so it gets recorded." },
  { id: "3500-a1", course: "ECON3500", title: "Assignment 1", type: "assignment", due: "2026-10-05", window: ["2026-10-05", "2026-10-09"], tentative: true, weight: 10, location: "Gradescope", notes: "Outline says 'week of Oct 5 (tentative)'. Watch CourseLink for the exact date." },
  { id: "3500-q1", course: "ECON3500", title: "Quiz 1", type: "quiz", due: "2026-10-14T14:30", weight: 2.5, location: "In class · MCKN 116", notes: "~30 min, a mock midterm." },
  { id: "3500-m1", course: "ECON3500", title: "Midterm 1", type: "test", due: "2026-10-19T14:30", end: "15:50", weight: 20, location: "In class · MCKN 116" },
  { id: "3500-q2", course: "ECON3500", title: "Quiz 2", type: "quiz", due: "2026-11-09", window: ["2026-11-09", "2026-11-11"], tentative: true, weight: 2.5, location: "In class · MCKN 116", notes: "Week of Nov 9. Probably Mon or Wed class." },
  { id: "3500-a2", course: "ECON3500", title: "Assignment 2", type: "assignment", due: "2026-11-09", window: ["2026-11-09", "2026-11-13"], tentative: true, weight: 10, location: "Gradescope", notes: "Outline says 'week of Nov 9 (tentative)'." },
  { id: "3500-m2", course: "ECON3500", title: "Midterm 2", type: "test", due: "2026-11-16T14:30", end: "15:50", weight: 20, location: "In class · MCKN 116" },
  { id: "3500-pres", course: "ECON3500", title: "Group project presentation", type: "presentation", due: "2026-11-23", window: ["2026-11-23", "2026-12-02"], tentative: true, weight: 0, weightLabel: "part of project", notes: "Presentations run Nov 23 – Dec 2. Your group's slot is TBA." },
  { id: "3500-a3", course: "ECON3500", title: "Assignment 3", type: "assignment", due: "2026-12-07", tentative: true, weight: 10, location: "Gradescope", notes: "Outline says 'around Dec 7 (tentative)'." },
  { id: "3500-proj", course: "ECON3500", title: "Final research project", type: "project", due: "2026-12-10", weight: 20, notes: "Research proposal: theory + real data + empirical analysis + visualization." },
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
