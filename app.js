/* F26 Course Command Center: all rendering & logic. Data lives in data.js. */
(() => {
  "use strict";

  /* =================== helpers =================== */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAY = 864e5;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function parseISO(s) {
    const [d, t] = s.split("T");
    const [y, m, dd] = d.split("-").map(Number);
    const [hh, mm] = t ? t.split(":").map(Number) : [0, 0];
    return new Date(y, m - 1, dd, hh, mm);
  }
  const sod = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const dayDiff = (a, b) => Math.round((sod(b) - sod(a)) / DAY);
  const mondayOf = (d) => addDays(sod(d), -((d.getDay() + 6) % 7));
  const sameDay = (a, b) => sod(a).getTime() === sod(b).getTime();
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const fmtD = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  const fmtDow = (d) => `${DOW[d.getDay()]} ${fmtD(d)}`;
  function fmtT(d) {
    let h = d.getHours(); const m = d.getMinutes(); const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ap}`;
  }
  const fmtW = (w) => (Number.isInteger(w) ? String(w) : w.toFixed(1).replace(/\.0$/, ""));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const NO_CLASS = new Set(TERM.noClass || []);
  const MAKEUP = TERM.makeup || {}; // iso → weekday schedule it runs (1 = Mon … 5 = Fri)
  const DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // weekly classes that actually meet on day d (handles breaks, makeup days and per-row start dates)
  function classesOn(d) {
    const iso = isoDay(d);
    if (NO_CLASS.has(iso) || d < parseISO(TERM.start) || d > parseISO(TERM.lastClass)) return [];
    const dow = MAKEUP[iso] || d.getDay();
    return SCHEDULE.filter((s) => s.days.includes(dow) && (!s.from || iso >= s.from));
  }

  const params = new URLSearchParams(location.search);
  function now() {
    const o = params.get("today");
    if (o) {
      const b = parseISO(o);
      if (!o.includes("T")) { const r = new Date(); b.setHours(r.getHours(), r.getMinutes(), r.getSeconds()); }
      return b;
    }
    return new Date();
  }

  /* =================== storage =================== */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("f26:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("f26:" + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const COURSE_KEYS = Object.keys(COURSES);
  const state = {
    done: store.get("done", {}),
    grades: store.get("grades", {}),
    target: store.get("target", {}),
    filters: Object.assign({ courses: COURSE_KEYS.slice(), type: "all", hidePast: false, showMinor: true }, store.get("filters", {})),
    gcourse: store.get("gcourse", COURSE_KEYS[0]),
    calMonth: null,
    calSel: null,
    weekOffset: 0,
  };
  const saveDone = () => store.set("done", state.done);
  const saveGrades = () => { store.set("grades", state.grades); store.set("target", state.target); };

  /* =================== items =================== */
  const SITDOWN = new Set(["test", "exam", "quiz"]);
  const ITEMS_X = ITEMS.map((it) => {
    const hasTime = it.due.includes("T");
    const start = parseISO(it.due);
    let endAt;
    if (it.window) { endAt = parseISO(it.window[1]); endAt.setHours(23, 59); }
    else if (hasTime && it.end) { const [h, m] = it.end.split(":").map(Number); endAt = new Date(start); endAt.setHours(h, m); }
    else if (hasTime) endAt = new Date(start);
    else { endAt = new Date(start); endAt.setHours(23, 59); }
    // countdown target: timed → start; date-only sit-downs & windows → start of day; date-only deadlines → 11:59 PM
    let target = start;
    if (!hasTime && !it.window && !SITDOWN.has(it.type)) { target = new Date(start); target.setHours(23, 59); }
    const course = COURSES[it.course];
    return Object.assign({}, it, {
      hasTime, start, endAt, target, cc: course, c: course.color,
      graded: it.weight > 0 || !!it.penalty,
      minor: it.type === "release",
    });
  }).sort((a, b) => a.target - b.target || b.weight - a.weight);

  const isPast = (it, ref) => !it.ongoing && !it.tbd && it.endAt < ref;
  const isDone = (it) => !!state.done[it.id];

  /* self-check: weights must sum to 100 per course */
  COURSE_KEYS.forEach((k) => {
    const sum = ITEMS_X.filter((i) => i.course === k).reduce((s, i) => s + i.weight, 0);
    if (Math.abs(sum - 100) > 0.01) console.warn(`[F26] ${COURSES[k].code} weights sum to ${sum}, not 100`);
  });

  const TYPE_LABEL = {
    assignment: "Assignment", quiz: "Quiz", test: "Test / Midterm", exam: "Final exam", project: "Project",
    sprint: "Sprint", participation: "Participation", meeting: "Mandatory meeting", presentation: "Presentation", release: "Released",
  };
  const TYPE_GROUP = {
    assignment: "Assignments", quiz: "Quizzes", test: "Tests / midterms", exam: "Final exam", project: "Final project",
    sprint: "Sprints", participation: "Participation",
  };

  /* =================== small renderers =================== */
  function relLabel(it, ref) {
    if (it.ongoing) return { t: "all term", cls: "" };
    if (it.tbd) return { t: "date TBA", cls: "" };
    const d0 = dayDiff(ref, it.start);
    if (it.window) {
      const d1 = dayDiff(ref, it.endAt);
      if (d0 <= 0 && d1 >= 0) return { t: it.window && dayDiff(it.start, it.endAt) <= 6 ? "this week" : "happening now", cls: "near" };
      if (d1 < 0) return { t: `${-d1} day${d1 === -1 ? "" : "s"} ago`, cls: "" };
    }
    if (d0 === 0) {
      if (it.hasTime && it.endAt < ref) return { t: "earlier today", cls: "" };
      return { t: it.hasTime ? `today ${fmtT(it.start)}` : "today", cls: "soon" };
    }
    if (d0 === 1) return { t: "tomorrow", cls: "soon" };
    if (d0 > 1) return { t: `in ${d0} days`, cls: d0 <= 3 ? "soon" : d0 <= 7 ? "near" : "" };
    return { t: `${-d0} day${d0 === -1 ? "" : "s"} ago`, cls: "" };
  }

  function badgeText(it) {
    if (it.badge) return it.badge;
    if (it.weight > 0) return fmtW(it.weight) + "%";
    if (it.penalty) return `−${fmtW(it.penalty)}%`;
    return it.weightLabel || "—";
  }
  function wBadge(it) {
    let cls = "";
    if (it.penalty && !it.weight) cls = "big";
    else if (it.weight >= 15) cls = "big";
    else if (it.weight >= 5) cls = "mid";
    else if (!it.weight) cls = "zero";
    const tip = it.weightLabel ? ` data-tip="${esc(it.weightLabel)}"` : "";
    return `<span class="w-badge ${cls}"${tip}>${esc(badgeText(it))}</span>`;
  }
  const chip = (k) => `<span class="chip" style="--c:${COURSES[k].color}">${esc(COURSES[k].code)}</span>`;

  function whenText(it) {
    if (it.ongoing) return "All term";
    if (it.tbd) return `TBA · ${fmtD(parseISO(it.window[0]))}–${fmtD(parseISO(it.window[1]))}`;
    if (it.window) {
      const a = parseISO(it.window[0]), b = parseISO(it.window[1]);
      return dayDiff(a, b) <= 6 ? `Week of ${fmtD(a)}` : `${fmtD(a)} – ${fmtD(b)}`;
    }
    let s = fmtDow(it.start);
    if (it.hasTime) {
      s += ` · ${fmtT(it.start)}`;
      if (it.end) s += `–${fmtT(it.endAt)}`;
    } else if (it.type === "release") { /* no time */ }
    else if (!SITDOWN.has(it.type)) s += " · by 11:59 PM";
    else s += " · time TBA";
    return s;
  }

  function dateBlock(it) {
    if (it.ongoing) return `<div class="date"><div class="dow">All</div><div class="d">∞</div><div class="m">term</div></div>`;
    if (it.tbd) return `<div class="date"><div class="dow">Date</div><div class="d">?</div><div class="m">TBA</div></div>`;
    const d = it.start;
    const dow = it.window ? (dayDiff(it.start, it.endAt) <= 6 ? "Wk of" : "From") : DOW[d.getDay()];
    return `<div class="date"><div class="dow">${dow}</div><div class="d">${d.getDate()}</div><div class="m">${MONTHS[d.getMonth()]}</div></div>`;
  }

  function itemRow(it, ref, opts = {}) {
    const r = relLabel(it, ref);
    const past = isPast(it, ref), done = isDone(it);
    const today = !it.window && !it.ongoing && !it.tbd && sameDay(it.start, ref);
    const cls = ["item", opts.compact ? "compact" : "", done ? "is-done" : "", past ? "is-past" : "", it.minor ? "is-minor" : "", today ? "is-today" : ""].join(" ");
    const badges = [
      it.tentative ? `<span class="badge warn">tentative</span>` : "",
      it.tbd ? `<span class="badge accent">date TBA</span>` : "",
      it.type === "meeting" ? `<span class="badge danger">attendance</span>` : "",
    ].join("");
    const meta = [
      `<span>${esc(whenText(it))}</span>`,
      it.location ? `<span>📍 ${esc(it.location)}</span>` : "",
      `<span>${esc(TYPE_LABEL[it.type] || it.type)}</span>`,
      it.weightLabel && !opts.compact ? `<span>${esc(it.weightLabel)}</span>` : "",
    ].join("");
    const check = it.minor ? "" : `<input type="checkbox" class="check" data-id="${esc(it.id)}" ${done ? "checked" : ""} aria-label="Mark ${esc(it.title)} done" title="Mark done">`;
    return `<div class="${cls}" style="--c:${it.c}">
      ${dateBlock(it)}
      <div class="stripe"></div>
      <div class="body">
        <div class="title-row">${chip(it.course)}<span class="title">${esc(it.title)}</span>${badges}</div>
        <div class="meta">${meta}</div>
        ${it.notes && !opts.compact ? `<div class="notes">${esc(it.notes)}</div>` : ""}
      </div>
      <div class="right">${wBadge(it)}<span class="rel ${r.cls}">${esc(r.t)}</span>${check}</div>
    </div>`;
  }

  function heatColor(w) {
    // 0 → calm, 40+ → hot
    const t = clamp(w / 45, 0, 1);
    const hue = 140 - 140 * t;
    return `hsl(${hue} 75% ${48 - t * 6}%)`;
  }

  /* =================== tooltip =================== */
  const tipEl = $("#tooltip");
  function showTip(html, x, y) {
    tipEl.innerHTML = html;
    tipEl.classList.add("show");
    const r = tipEl.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > innerHeight - 8) top = y - r.height - 14;
    tipEl.style.left = Math.max(8, left) + "px";
    tipEl.style.top = Math.max(8, top) + "px";
  }
  const hideTip = () => tipEl.classList.remove("show");
  document.addEventListener("mousemove", (e) => {
    const t = e.target.closest("[data-tip]");
    if (t) showTip(t.getAttribute("data-tip"), e.clientX, e.clientY); else hideTip();
  });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-tip]");
    if (t && matchMedia("(hover: none)").matches) showTip(t.getAttribute("data-tip"), e.clientX, e.clientY);
    else if (!t) hideTip();
  });
  addEventListener("scroll", hideTip, { passive: true });

  /* =================== difficulty =================== */
  function difficulty(k) {
    const c = COURSES[k], f = c.facts;
    const parts = [
      { label: `Biggest single item: ${f.maxItem}%`, v: clamp((f.maxItem - 15) / 35, 0, 1), w: 0.35 },
      { label: `Exam/test share: ${f.examShare}%`, v: f.examShare / 100, w: 0.30 },
      { label: f.gated ? "Must pass separate components" : "No component pass gates", v: f.gated ? 1 : 0, w: 0.15 },
      { label: `Late-policy strictness: ${Math.round(f.lateStrict * 100)}/100`, v: f.lateStrict, w: 0.20 },
    ];
    const outline = 1 + 4 * parts.reduce((s, p) => s + p.v * p.w, 0);
    const r = RMP.profs[c.rmpName];
    let score = outline, rmpW = 0;
    if (r && r.difficulty != null) {
      rmpW = Math.min(0.5, r.count / 20);
      score = outline * (1 - rmpW) + r.difficulty * rmpW;
    }
    return { score, outline, rmpW, rmp: r, parts };
  }
  function diffLabel(s) {
    if (s >= 3.75) return ["Hard", "var(--danger)"];
    if (s >= 3.0) return ["Challenging", "var(--warn)"];
    if (s >= 2.4) return ["Moderate", "var(--accent)"];
    return ["Manageable", "var(--ok)"];
  }

  /* =================== VIEW: dashboard =================== */
  let cdTimer = null;
  function renderDashboard() {
    const ref = now();
    const el = $("#view-dashboard");
    const upcomingGraded = ITEMS_X.filter((i) => i.weight > 0 && !i.ongoing && !i.tbd && !isDone(i) && i.target >= ref);
    const hero = upcomingGraded[0];
    const then = upcomingGraded.slice(1, 5);

    const in7 = ITEMS_X.filter((i) => !i.ongoing && !i.tbd && !isDone(i) && i.endAt >= ref && i.start < addDays(sod(ref), 7));
    const w7 = in7.reduce((s, i) => s + i.weight, 0);
    const g7 = in7.filter((i) => i.graded).length;
    const in14 = ITEMS_X.filter((i) => i.weight > 0 && !i.ongoing && !i.tbd && i.endAt >= ref && i.start < addDays(sod(ref), 14));
    const w14 = in14.reduce((s, i) => s + i.weight, 0);
    const tStart = parseISO(TERM.start), tEnd = parseISO(TERM.lastClass);
    const termPct = clamp((ref - tStart) / (tEnd - tStart), 0, 1) * 100;
    const assessedTotal = ITEMS_X.filter((i) => i.weight > 0 && isPast(i, ref)).reduce((s, i) => s + i.weight, 0);
    const aheadPct = 100 - assessedTotal / COURSE_KEYS.length;
    const heavy = ITEMS_X.filter((i) => i.weight > 0 && !i.ongoing && !i.tbd && i.target >= ref && i.start < addDays(sod(ref), 30)).sort((a, b) => b.weight - a.weight)[0];

    let heroHtml;
    if (hero) {
      heroHtml = `<div class="card hero" style="--c:${hero.c}">
        <div class="hero-top"><span class="hero-label">Next graded thing</span>${chip(hero.course)}${hero.tentative ? '<span class="badge warn">tentative</span>' : ""}</div>
        <div class="hero-title">${esc(hero.title)}</div>
        <div class="hero-meta">${esc(whenText(hero))}${hero.location ? " · " + esc(hero.location) : ""}</div>
        <div class="hero-row">
          <div class="countdown" id="countdown" data-target="${hero.target.getTime()}"></div>
          <div class="hero-weight"><div class="v num">${esc(badgeText(hero))}</div><div class="l">of your ${esc(hero.cc.code)} grade</div></div>
        </div>
        ${hero.notes ? `<div class="small muted" style="margin-top:12px">${esc(hero.notes)}</div>` : ""}
        <div class="then-list">
          ${then.map((i) => `<div class="then-item"><span class="dot" style="--c:${i.c}"></span><span class="t"><b>${esc(i.title)}</b> <span class="muted">· ${esc(i.cc.code)} · ${esc(fmtDow(i.start))}</span></span>${wBadge(i)}<span class="rel ${relLabel(i, ref).cls}">${esc(relLabel(i, ref).t)}</span></div>`).join("")}
        </div>
      </div>`;
    } else {
      heroHtml = `<div class="card hero"><div class="hero-label">Next up</div><div class="hero-title">Nothing left with a date. Check the final exam schedule!</div></div>`;
    }

    el.innerHTML = `
      <div class="grid" style="grid-template-columns:minmax(0,1fr)">
        <div class="grid dash-top">
          ${heroHtml}
          <div class="grid grid-2 kpis">
            <div class="card kpi"><div class="l">Next 7 days</div><div class="v">${g7} <span class="small muted">items</span></div><div class="s">${fmtW(w7)} grade-points on the line</div></div>
            <div class="card kpi"><div class="l">Next 14 days</div><div class="v">${fmtW(w14)}<span class="small muted"> pts</span></div><div class="s">${in14.length} graded items</div></div>
            <div class="card kpi"><div class="l">Term progress</div><div class="v">${Math.round(termPct)}%</div><div class="bar"><span style="width:${termPct}%"></span></div><div class="s">Classes end ${fmtD(tEnd)}</div></div>
            <div class="card kpi"><div class="l">Grades still ahead</div><div class="v">${Math.round(aheadPct)}%</div><div class="bar"><span style="width:${aheadPct}%;background:var(--ok)"></span></div><div class="s">average across 5 courses</div></div>
            ${heavy ? `<div class="card kpi" style="grid-column:1/-1;--c:${heavy.c}"><div class="l">Heaviest in next 30 days</div><div class="v" style="font-size:20px">${esc(heavy.title)} ${chip(heavy.course)}</div><div class="s">${esc(badgeText(heavy))} · ${esc(fmtDow(heavy.start))} · ${esc(relLabel(heavy, ref).t)}</div></div>` : ""}
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h2>Crunch-week heatmap</h2><span class="sub">Grade weight due each week, stacked by course. Hover a bar for details.</span></div>
          <div class="chart-wrap" id="heatChart"></div>
          <div class="legend">${COURSE_KEYS.map((k) => `<span><i class="dot" style="--c:${COURSES[k].color}"></i>${esc(COURSES[k].code)}</span>`).join("")}<span><i class="dot" style="--c:var(--muted);opacity:.5"></i>Final exams (date TBA)</span></div>
        </div>

        <div class="grid grid-2">
          <div class="card">
            <div class="card-h"><h2>Next 7 days</h2><a href="#timeline" class="sub">Full timeline →</a></div>
            <div class="items">${in7.length ? in7.map((i) => itemRow(i, ref, { compact: true })).join("") : `<div class="empty">Nothing due in the next week 🎉</div>`}</div>
          </div>
          <div class="card">
            <div class="card-h"><h2>Course progress</h2><span class="sub">share of each final grade already assessed</span></div>
            <div class="cprog">${COURSE_KEYS.map((k) => courseProgressRow(k, ref)).join("")}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h2>Semester at a glance</h2><span class="sub">Every graded item. Bigger dot = more weight.</span></div>
          <div class="chart-wrap" id="glanceChart"></div>
        </div>

        <div class="grid grid-2">
          <div class="card">
            <div class="card-h"><h2>Key term dates</h2></div>
            <div class="keydates">${TERM.keyDates.map((k) => {
              const d = parseISO(k.date), e = k.end ? parseISO(k.end) : d;
              return `<div class="keydate ${e < sod(ref) ? "past" : ""}"><span class="kd">${fmtD(d)}${k.end ? "–" + fmtD(e) : ""}</span><span>${esc(k.label)}</span></div>`;
            }).join("")}</div>
          </div>
          <div class="card">
            <div class="card-h"><h2>Waiting on dates</h2><span class="sub">TBA or tentative: keep an eye on these</span></div>
            <div class="items">${ITEMS_X.filter((i) => (i.tbd || i.tentative) && !isPast(i, ref)).map((i) => itemRow(i, ref, { compact: true })).join("")}</div>
          </div>
        </div>
      </div>`;

    drawHeatmap($("#heatChart"), ref);
    drawGlance($("#glanceChart"), ref);
    startCountdown();
  }

  function courseProgressRow(k, ref) {
    const c = COURSES[k];
    const its = ITEMS_X.filter((i) => i.course === k && i.weight > 0);
    const assessed = its.filter((i) => isPast(i, ref)).reduce((s, i) => s + i.weight, 0);
    const next = its.find((i) => !i.ongoing && !isPast(i, ref) && !isDone(i));
    return `<div>
      <div class="cprog-row">
        <span class="code"><i class="dot" style="--c:${c.color}"></i>${esc(c.code)}</span>
        <div class="track" data-tip="<b>${esc(c.code)}</b><br>${fmtW(assessed)}% assessed · ${fmtW(100 - assessed)}% still ahead"><span style="width:${assessed}%;background:${c.color}"></span></div>
        <span class="pct num">${fmtW(assessed)}% done</span>
      </div>
      <div class="cprog-row"><span></span><span class="next">${next ? `Next: <b>${esc(next.title)}</b> · ${esc(whenText(next))} · ${esc(badgeText(next))}` : "No dated items left"}</span></div>
    </div>`;
  }

  function startCountdown() {
    clearInterval(cdTimer);
    const el = $("#countdown");
    if (!el) return;
    const target = +el.dataset.target;
    const tick = () => {
      if (!document.body.contains(el)) { clearInterval(cdTimer); return; }
      let ms = Math.max(0, target - now());
      if (ms === 0) { clearInterval(cdTimer); renderDashboard(); return; }
      const d = Math.floor(ms / DAY); ms -= d * DAY;
      const h = Math.floor(ms / 36e5); ms -= h * 36e5;
      const m = Math.floor(ms / 6e4); ms -= m * 6e4;
      const s = Math.floor(ms / 1e3);
      el.innerHTML = [[d, "days"], [h, "hrs"], [m, "min"], [s, "sec"]].map(([v, l]) => `<div class="cd-unit"><div class="v">${String(v).padStart(2, "0")}</div><div class="l">${l}</div></div>`).join("");
    };
    tick();
    cdTimer = setInterval(tick, 1000);
  }

  function drawHeatmap(host, ref) {
    if (!host) return;
    const W = Math.max(300, host.clientWidth), H = W < 560 ? 230 : 270;
    const first = parseISO(TERM.firstWeek);
    const weeks = [];
    for (let i = 0; i < 16; i++) weeks.push(addDays(first, i * 7));
    const data = weeks.map((wk, wi) => {
      const end = addDays(wk, 7);
      const its = ITEMS_X.filter((i) => i.weight > 0 && !i.ongoing && !i.tbd && i.start >= wk && i.start < end);
      const byC = {};
      its.forEach((i) => { byC[i.course] = (byC[i.course] || 0) + i.weight; });
      const tbd = wi === 13 ? ITEMS_X.filter((i) => i.tbd) : [];
      const tbdW = tbd.reduce((s, i) => s + i.weight, 0);
      const meetings = ITEMS_X.filter((i) => i.type === "meeting" && i.start >= wk && i.start < end).length;
      return { wk, wi, its, byC, tbd, tbdW, total: its.reduce((s, i) => s + i.weight, 0), meetings };
    });
    const maxT = Math.max(60, ...data.map((d) => d.total + d.tbdW));
    const padL = 30, padR = 8, padT = 26, padB = 44;
    const cw = (W - padL - padR) / data.length;
    const bw = Math.min(46, cw * 0.66);
    const y = (v) => padT + (H - padT - padB) * (1 - v / maxT);
    const thisWeek = mondayOf(ref).getTime();
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly grade weight heatmap">`;
    s += `<defs><pattern id="hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="var(--surface-3)"/><line x1="0" y1="0" x2="0" y2="6" stroke="var(--muted)" stroke-width="2" opacity=".5"/></pattern></defs>`;
    [0, 20, 40, 60, 80].filter((v) => v <= maxT).forEach((v) => {
      s += `<line class="gridline" x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${padL - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
    });
    data.forEach((d, i) => {
      const cx = padL + cw * i + cw / 2;
      const x = cx - bw / 2;
      if (d.wk.getTime() === thisWeek) s += `<rect x="${padL + cw * i + 1}" y="${padT - 20}" width="${cw - 2}" height="${H - padT - padB + 20}" rx="8" fill="var(--accent-soft)"/>`;
      let acc = 0;
      COURSE_KEYS.forEach((k) => {
        const v = d.byC[k]; if (!v) return;
        const y1 = y(acc + v), y0 = y(acc);
        s += `<rect x="${x}" y="${y1}" width="${bw}" height="${Math.max(0, y0 - y1 - 1)}" fill="${COURSES[k].color}" rx="3"/>`;
        acc += v;
      });
      if (d.tbdW) { const y1 = y(acc + d.tbdW), y0 = y(acc); s += `<rect x="${x}" y="${y1}" width="${bw}" height="${y0 - y1}" fill="url(#hatch)" rx="3"/>`; }
      const tot = d.total + d.tbdW;
      if (tot > 0) s += `<text x="${cx}" y="${y(tot) - 6}" text-anchor="middle" style="font:700 ${W < 560 ? 10 : 12}px var(--font-display);fill:${d.total >= 40 ? "var(--danger)" : "var(--text-2)"}">${fmtW(Math.round(tot * 10) / 10)}</text>`;
      // heat strip
      s += `<rect x="${x}" y="${H - padB + 6}" width="${bw}" height="6" rx="3" fill="${d.total ? heatColor(d.total) : "var(--surface-3)"}"/>`;
      if (W >= 560 || i % 2 === 0) s += `<text class="ax" x="${cx}" y="${H - padB + 26}" text-anchor="middle">${fmtD(d.wk)}</text>`;
      if (W >= 560) s += `<text class="ax" x="${cx}" y="${H - padB + 39}" text-anchor="middle" style="font-size:10px">W${d.wi}</text>`;
      const tip = `<b>Week of ${fmtD(d.wk)}</b> (W${d.wi}) · ${fmtW(Math.round(d.total * 10) / 10)} pts${d.total >= 40 ? " 🔥" : ""}<br>` +
        (d.its.length ? d.its.map((it) => `<span style="color:${it.c}">●</span> ${esc(it.cc.code)} ${esc(it.title)} · ${esc(badgeText(it))} · ${DOW[it.start.getDay()]}`).join("<br>") : "Nothing graded") +
        (d.tbd.length ? `<br><i>+ finals, dates TBA (Dec 7–22): ${d.tbd.map((t) => esc(t.cc.code) + " " + fmtW(t.weight) + "%").join(", ")}</i>` : "") +
        (d.meetings ? `<br>+ CIS*3760 sprint planning meeting (−4.5% if missed)` : "");
      s += `<rect class="hit" x="${padL + cw * i}" y="${padT - 20}" width="${cw}" height="${H - padT + 20}" fill="transparent" data-tip="${esc(tip)}"/>`;
    });
    s += `</svg>`;
    host.innerHTML = s;
  }

  function drawGlance(host, ref) {
    if (!host) return;
    const W = Math.max(300, host.clientWidth);
    const rowH = 38, padL = W < 560 ? 70 : 92, padR = 14, padT = 22, padB = 26;
    const H = padT + rowH * COURSE_KEYS.length + padB;
    const t0 = parseISO(TERM.firstWeek), t1 = parseISO(TERM.examEnd);
    const x = (d) => padL + (W - padL - padR) * clamp((d - t0) / (t1 - t0), 0, 1);
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Semester overview">`;
    // month ticks
    for (let m = 8; m <= 11; m++) {
      const d = new Date(2026, m, 1);
      if (d < t0) continue;
      s += `<line class="gridline" x1="${x(d)}" x2="${x(d)}" y1="${padT - 6}" y2="${H - padB}"/><text class="ax" x="${x(d) + 4}" y="${padT - 8}">${MONTHS[m]}</text>`;
    }
    // exam period & holiday
    s += `<rect x="${x(parseISO(TERM.examStart))}" y="${padT}" width="${x(t1) - x(parseISO(TERM.examStart))}" height="${rowH * COURSE_KEYS.length}" fill="var(--surface-2)"/>`;
    s += `<text class="ax" x="${(x(parseISO(TERM.examStart)) + x(t1)) / 2}" y="${H - 8}" text-anchor="middle">exams</text>`;
    TERM.noClass.forEach((iso) => { const d = parseISO(iso); s += `<rect x="${x(d)}" y="${padT}" width="${Math.max(2, x(addDays(d, 1)) - x(d))}" height="${rowH * COURSE_KEYS.length}" fill="var(--surface-3)"/>`; });
    COURSE_KEYS.forEach((k, r) => {
      const cy = padT + rowH * r + rowH / 2;
      s += `<line class="gridline" x1="${padL}" x2="${W - padR}" y1="${cy}" y2="${cy}"/>`;
      s += `<text x="${padL - 10}" y="${cy + 4}" text-anchor="end" style="font:700 12px var(--font-display);fill:${COURSES[k].color}">${esc(COURSES[k].code)}</text>`;
      ITEMS_X.filter((i) => i.course === k && (i.weight > 0 || i.penalty) && !i.ongoing).forEach((it) => {
        const d = it.tbd ? parseISO(TERM.examStart) : it.start;
        const cx = it.tbd ? (x(parseISO(TERM.examStart)) + x(t1)) / 2 : x(d);
        const rad = it.penalty && !it.weight ? 3 : clamp(3 + Math.sqrt(it.weight) * 2.1, 3.5, 15);
        const past = isPast(it, ref) || isDone(it);
        const tip = `<b>${esc(it.cc.code)} · ${esc(it.title)}</b><br>${esc(whenText(it))}<br>${esc(badgeText(it))}${it.weightLabel ? " · " + esc(it.weightLabel) : ""}`;
        if (it.tbd) s += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${it.c}" stroke-width="2" stroke-dasharray="3 2" class="hit" data-tip="${esc(tip)}"/>`;
        else if (it.penalty && !it.weight) s += `<rect x="${cx - 3}" y="${cy - 3}" width="6" height="6" transform="rotate(45 ${cx} ${cy})" fill="${it.c}" opacity="${past ? .3 : .9}" class="hit" data-tip="${esc(tip)}"/>`;
        else s += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${it.c}" fill-opacity="${past ? .25 : .8}" stroke="var(--surface)" stroke-width="1.5" class="hit" data-tip="${esc(tip)}"/>`;
      });
    });
    const nx = x(ref);
    s += `<line class="now-line" x1="${nx}" x2="${nx}" y1="${padT - 4}" y2="${H - padB + 4}"/><text x="${nx}" y="${H - padB + 16}" text-anchor="middle" style="font:700 11px var(--font);fill:var(--accent)">today</text>`;
    s += `</svg>`;
    host.innerHTML = s;
  }

  /* =================== VIEW: timeline =================== */
  function renderTimeline() {
    const ref = now();
    const f = state.filters;
    const el = $("#view-timeline");
    const types = ["all", "assignment", "quiz", "test", "exam", "sprint", "project", "participation", "meeting", "presentation"];
    let list = ITEMS_X.filter((i) => f.courses.includes(i.course));
    if (f.type !== "all") list = list.filter((i) => i.type === f.type);
    if (!f.showMinor) list = list.filter((i) => !i.minor);
    if (f.hidePast) list = list.filter((i) => !isPast(i, ref) && !isDone(i));

    const ongoing = list.filter((i) => i.ongoing);
    const tbd = list.filter((i) => i.tbd);
    const dated = list.filter((i) => !i.ongoing && !i.tbd);
    const groups = new Map();
    dated.forEach((i) => {
      const k = mondayOf(i.start).getTime();
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(i);
    });
    const first = parseISO(TERM.firstWeek);
    const thisWeek = mondayOf(ref).getTime();
    const totalW = list.filter((i) => !i.ongoing).reduce((s, i) => s + i.weight, 0);

    let html = `<div class="filters">
      ${COURSE_KEYS.map((k) => `<button class="fchip" data-fcourse="${k}" aria-pressed="${f.courses.includes(k)}"><i class="dot" style="--c:${COURSES[k].color}"></i>${esc(COURSES[k].code)}</button>`).join("")}
      <select class="select" id="fType" aria-label="Type">${types.map((t) => `<option value="${t}" ${f.type === t ? "selected" : ""}>${t === "all" ? "All types" : TYPE_LABEL[t]}</option>`).join("")}</select>
      <label class="toggle"><input type="checkbox" id="fPast" ${f.hidePast ? "checked" : ""}> Hide past & done</label>
      <label class="toggle"><input type="checkbox" id="fMinor" ${f.showMinor ? "checked" : ""}> Show release dates</label>
      <span class="spacer"></span>
      <span class="small muted">${list.length} items · ${fmtW(Math.round(totalW * 10) / 10)} grade-pts</span>
    </div>`;

    if (ongoing.length) html += weekGroup("All term", "", ongoing, ref, false);
    [...groups.entries()].sort((a, b) => a[0] - b[0]).forEach(([k, its]) => {
      const mon = new Date(k);
      const wn = Math.round((mon - first) / (7 * DAY));
      const label = `Week ${wn} · ${fmtD(mon)} – ${fmtD(addDays(mon, 6))}`;
      html += weekGroup(label, mondayOf(mon).getTime() === thisWeek ? "current" : "", its, ref, true, k);
    });
    if (tbd.length) html += weekGroup("Final exam period · Dec 7–22 (dates TBA)", "", tbd, ref, true);
    if (!list.length) html += `<div class="card empty">No items match these filters.</div>`;
    el.innerHTML = html;
    const cur = el.querySelector(".week-head.current");
    if (cur && !renderTimeline.scrolled) { renderTimeline.scrolled = true; setTimeout(() => cur.scrollIntoView({ block: "start", behavior: "smooth" }), 60); }
  }
  function weekGroup(label, cls, its, ref, showSum, key) {
    const w = its.reduce((s, i) => s + i.weight, 0);
    const pill = showSum && w > 0 ? `<span class="heat-pill" style="background:${heatColor(w)};color:#fff">${fmtW(Math.round(w * 10) / 10)} pts</span>` : "";
    return `<div class="week-group" ${key ? `id="wk-${key}"` : ""}>
      <div class="week-head ${cls}"><h3>${esc(label)}</h3><span class="wsum">${its.length} item${its.length === 1 ? "" : "s"} ${pill}</span></div>
      <div class="items">${its.map((i) => itemRow(i, ref)).join("")}</div>
    </div>`;
  }

  /* =================== VIEW: calendar =================== */
  function renderCalendar() {
    const ref = now();
    const el = $("#view-calendar");
    if (state.calMonth == null) {
      const m = ref.getFullYear() === 2026 ? clamp(ref.getMonth(), 8, 11) : 8;
      state.calMonth = m;
    }
    const m = state.calMonth;
    const first = new Date(2026, m, 1);
    const gridStart = mondayOf(first);
    const last = new Date(2026, m + 1, 0);
    const gridEnd = addDays(mondayOf(last), 7);
    const holidays = NO_CLASS;
    const examS = parseISO(TERM.examStart), examE = parseISO(TERM.examEnd);
    let cells = "";
    for (let d = gridStart; d < gridEnd; d = addDays(d, 1)) {
      const its = ITEMS_X.filter((i) => !i.ongoing && !i.tbd && sameDay(i.start, d));
      const load = its.reduce((s, i) => s + i.weight, 0);
      const iso = isoDay(d);
      const cls = ["cal-day", d.getMonth() !== m ? "out" : "", sameDay(d, ref) ? "today" : "", state.calSel === iso ? "sel" : "", holidays.has(iso) ? "holiday" : ""].join(" ");
      const exam = d >= examS && d <= examE;
      cells += `<button class="${cls}" data-day="${iso}">
        <div class="dn"><span>${d.getDate()}${exam && d.getMonth() === m ? ' <span class="tiny muted">exams</span>' : ""}${holidays.has(iso) ? ' <span class="tiny muted">no class</span>' : ""}${MAKEUP[iso] ? ` <span class="tiny muted">${DOW[MAKEUP[iso]]} sched</span>` : ""}</span>${load >= 1 ? `<span class="load" style="background:${heatColor(load)};color:#fff">${fmtW(Math.round(load * 10) / 10)}</span>` : ""}</div>
        ${its.map((i) => `<div class="cal-ev ${i.minor ? "minor" : ""} ${isDone(i) ? "done" : ""}" style="--c:${i.c}" title="${esc(i.cc.code + " " + i.title)}">${esc(shortCode(i.course))} ${esc(shortTitle(i))}</div>`).join("")}
        <div class="cal-dots">${its.filter((i) => !i.minor).map((i) => `<i class="dot" style="--c:${i.c}"></i>`).join("")}</div>
      </button>`;
    }
    let detail = "";
    if (state.calSel) {
      const d = parseISO(state.calSel);
      const its = ITEMS_X.filter((i) => !i.ongoing && !i.tbd && (sameDay(i.start, d) || (i.window && i.start <= d && sod(i.endAt) >= d)));
      detail = `<div class="card cal-detail"><div class="card-h"><h2>${esc(fmtDow(d))}</h2><span class="sub">${its.length} item${its.length === 1 ? "" : "s"}</span></div>
        <div class="items">${its.length ? its.map((i) => itemRow(i, ref)).join("") : `<div class="empty">Nothing on this day.</div>`}</div></div>`;
    }
    el.innerHTML = `<div class="card">
      <div class="cal-head">
        <button class="icon-btn" id="calPrev" ${m <= 8 ? "disabled" : ""} aria-label="Previous month">‹</button>
        <h2>${MONTHS_LONG[m]} 2026</h2>
        <button class="icon-btn" id="calNext" ${m >= 11 ? "disabled" : ""} aria-label="Next month">›</button>
        <span class="spacer"></span>
        <button class="btn" id="calToday">Today</button>
      </div>
      <div class="cal-grid">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((x) => `<div class="cal-dow">${x}</div>`).join("")}${cells}</div>
      <div class="legend">${COURSE_KEYS.map((k) => `<span><i class="dot" style="--c:${COURSES[k].color}"></i>${esc(COURSES[k].code)}</span>`).join("")}<span class="muted">Number in corner = grade-pts due that day</span></div>
    </div>${detail}`;
  }
  const shortCode = (k) => COURSES[k].code.replace(/^\w+\*/, "");
  function shortTitle(i) {
    return i.title.replace("Assignment", "A").replace("Participation / Exercise", "Part.").replace("Sprint ", "S").replace(" planning meeting", " planning").replace(" released", " out").replace("Midterm", "Midterm").replace("Final Exam", "Final");
  }

  /* =================== VIEW: courses =================== */
  function renderCourses() {
    const ref = now();
    const el = $("#view-courses");
    const ranked = COURSE_KEYS.map((k) => ({ k, d: difficulty(k) })).sort((a, b) => b.d.score - a.d.score);
    el.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div class="card-h"><h2>Difficulty ranking</h2><span class="sub">A rough indicator built from the outline structure plus Rate My Professors. Hover the bars for the formula.</span></div>
        <div class="cprog wide">${ranked.map(({ k, d }) => {
          const [lbl, col] = diffLabel(d.score);
          return `<div class="cprog-row"><span class="code"><i class="dot" style="--c:${COURSES[k].color}"></i>${esc(COURSES[k].code)}</span>
            <div class="track" data-tip="${esc(diffTip(k, d))}"><span style="width:${(d.score / 5) * 100}%;background:${col}"></span></div>
            <span class="pct num"><b>${d.score.toFixed(1)}</b>/5 · ${lbl}</span></div>`;
        }).join("")}</div>
      </div>
      <div class="grid grid-2">${COURSE_KEYS.map((k) => courseCard(k, ref)).join("")}</div>`;
  }
  function diffTip(k, d) {
    return `<b>${esc(COURSES[k].code)} difficulty ${d.score.toFixed(2)}/5</b><br>Outline score ${d.outline.toFixed(2)} = 1 + 4 × (` +
      d.parts.map((p) => `${p.w}×${p.v.toFixed(2)}`).join(" + ") + `)<br>` +
      d.parts.map((p) => "• " + esc(p.label)).join("<br>") +
      (d.rmp ? `<br>Blended ${Math.round(d.rmpW * 100)}% with RMP difficulty ${d.rmp.difficulty} (${d.rmp.count} ratings; fewer ratings = less trust)` : "<br>No RMP data");
  }
  function donut(parts, size = 140) {
    const r = size / 2 - 12, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
    let off = 0;
    const total = parts.reduce((s, p) => s + p.v, 0) || 1;
    let s = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block">`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="18"/>`;
    parts.forEach((p) => {
      const len = (p.v / total) * C;
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.c}" stroke-width="18" stroke-dasharray="${Math.max(0, len - 2)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})" class="hit" data-tip="<b>${esc(p.l)}</b>: ${fmtW(p.v)}%"/>`;
      off += len;
    });
    s += `<text x="${cx}" y="${cy + 2}" text-anchor="middle" style="font:700 20px var(--font-display);fill:var(--text)">100%</text><text x="${cx}" y="${cy + 18}" text-anchor="middle" style="font-size:10.5px">of grade</text></svg>`;
    return s;
  }
  function courseCard(k, ref) {
    const c = COURSES[k];
    const its = ITEMS_X.filter((i) => i.course === k && i.weight > 0);
    const groups = {};
    its.forEach((i) => {
      const g = i.type === "test" ? (/midterm/i.test(i.title) ? "Midterms" : "Tests") : TYPE_GROUP[i.type] || i.type;
      groups[g] = (groups[g] || 0) + i.weight;
    });
    const shades = [0, 18, 34, 48, 60, 70];
    const parts = Object.entries(groups).sort((a, b) => b[1] - a[1]).map(([l, v], idx) => ({ l, v, c: `color-mix(in srgb, ${c.color} ${100 - shades[idx]}%, var(--surface))` }));
    const r = RMP.profs[c.rmpName];
    const d = difficulty(k);
    const [dl, dcol] = diffLabel(d.score);
    const next = its.find((i) => !i.ongoing && !isPast(i, ref) && !isDone(i));
    const filled = Math.round(d.score);
    return `<div class="card course-card" style="--c:${c.color}">
      <div class="cc-head">
        <div class="cc-code">${esc(c.code)}</div>
        <h3>${esc(c.name)}</h3>
        <div class="small muted" style="margin-top:4px">${next ? `Next: <b style="color:var(--text)">${esc(next.title)}</b> · ${esc(whenText(next))} · ${esc(badgeText(next))}` : "No dated items left"}</div>
      </div>
      <div class="cc-body">
        <dl class="info-list">
          <dt>Instructor</dt><dd>${esc(c.instructor)}</dd>
          <dt>Email</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd>
          <dt>Office</dt><dd>${esc(c.office)}</dd>
          <dt>Office hours</dt><dd>${esc(c.officeHours)}</dd>
          <dt>Lectures</dt><dd>${esc(c.lectures)}</dd>
          <dt>Platform</dt><dd>${esc(c.platform)}</dd>
          <dt>Textbook</dt><dd>${esc(c.textbook)}</dd>
        </dl>
        <div>
          <div class="subhead">Grade breakdown</div>
          <div class="cc-split">
            ${donut(parts)}
            <div class="breakdown">${parts.map((p) => `<div><i class="dot" style="--c:${p.c}"></i><span class="lbl">${esc(p.l)}</span><b class="num">${fmtW(p.v)}%</b></div>`).join("")}
              ${k === "CIS3760" ? `<div class="small muted">Sprints are ranked: your best gets 35%, then 25/25, and your worst 15%.</div>` : ""}
              ${k === "CIS3210" ? `<div class="small muted">+ up to 3 bonus points (quiz average × 3), counted in the test component. Final grade capped at 100%.</div>` : ""}
            </div>
          </div>
        </div>
        <div>
          <div class="subhead">Rules that can sink you</div>
          <ul class="rules">${c.passRules.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>
        <details class="policies"><summary>Policies & fine print (${c.policies.length})</summary><ul>${c.policies.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>
        ${c.topics ? `<details class="policies"><summary>Topic schedule</summary><ul>${c.topics.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>` : ""}
        <div class="rmp">
          <div class="diff-head"><span class="subhead" style="margin:0">Rate My Professors · ${esc(c.rmpName)}</span>${r ? `<a class="small" href="${esc(r.url)}" target="_blank" rel="noopener">Open ↗</a>` : ""}</div>
          ${r ? `<div class="rmp-stats">
              <div class="rmp-stat"><div class="v" style="color:${r.quality >= 4 ? "var(--ok)" : r.quality >= 3 ? "var(--warn)" : "var(--danger)"}">${r.quality.toFixed(1)}</div><div class="l">quality /5</div></div>
              <div class="rmp-stat"><div class="v">${r.difficulty.toFixed(1)}</div><div class="l">difficulty /5</div></div>
              <div class="rmp-stat"><div class="v">${fmtW(r.wouldTakeAgain)}%</div><div class="l">would take again</div></div>
            </div>
            <div class="tags">${r.tags.map((t) => `<span class="badge">${esc(t)}</span>`).join("")}<span class="badge ${r.count < 5 ? "warn" : ""}">${r.count} rating${r.count === 1 ? "" : "s"}${r.count < 5 ? " (small sample)" : ""}</span></div>
            <div class="small">${esc(r.summary)}</div>
            <div class="small" style="margin-top:6px"><b>For this course:</b> ${esc(r.courseNote)}</div>
            <div class="tiny muted" style="margin-top:6px">Snapshot as of ${esc(RMP.asOf)}. Not live.</div>`
          : `<div class="small muted">No profile found. <a href="https://www.ratemyprofessors.com/search/professors?q=${encodeURIComponent(c.rmpName)}" target="_blank" rel="noopener">Search RMP ↗</a></div>`}
        </div>
        <div data-tip="${esc(diffTip(k, d))}">
          <div class="diff-head"><span class="subhead" style="margin:0">Difficulty indicator</span><span><span class="v num" style="color:${dcol}">${d.score.toFixed(1)}</span><span class="muted small">/5 · ${dl}</span></span></div>
          <div class="diff-meter">${[1, 2, 3, 4, 5].map((n) => `<span style="${n <= filled ? `background:${dcol}` : ""}"></span>`).join("")}</div>
          <div class="diff-why">${d.parts.map((p) => `<span>• ${esc(p.label)}</span>`).join("")}${d.rmp ? `<span>• RMP difficulty ${d.rmp.difficulty}/5 (weight ${Math.round(d.rmpW * 100)}%)</span>` : ""}</div>
        </div>
      </div>
    </div>`;
  }

  /* =================== grades =================== */
  const gradeInputs = (k) => ITEMS_X.filter((i) => i.course === k && i.weight > 0);
  const g = (id) => { const v = state.grades[id]; return v === "" || v == null || isNaN(v) ? null : Number(v); };
  const gradeText = (r) => r.label || r.grade.toFixed(1) + "%";

  function computeFinal(k, s) {
    // s: id → score (0..100), all filled
    const ids = gradeInputs(k).map((i) => i.id);
    const W = Object.fromEntries(gradeInputs(k).map((i) => [i.id, i.weight]));
    const checks = [];
    if (k === "CIS3210") {
      const aIds = ids.filter((i) => /-a\d$/.test(i)), qIds = ids.filter((i) => /-q\d+$/.test(i));
      const A = aIds.reduce((t, i) => t + s[i] * 0.06, 0);
      const qs = qIds.map((i) => s[i]).sort((a, b) => b - a);
      const quizPts = (qs.slice(0, 15).reduce((a, b) => a + b, 0) / 15) * 0.06;
      const bonus = Math.min(3, (qs.reduce((a, b) => a + b, 0) / qs.length / 100) * 3); // outline: "up to 3 bonus points"
      const T = quizPts + s["3210-mt"] * 0.25 + s["3210-fx"] * 0.45 + bonus;
      const passA = A >= 12, passT = T >= 38;
      const aPct = (A / 24) * 100, tPct = Math.min(100, (T / 76) * 100);
      const grade = passA && passT ? Math.min(100, A + T) : !passA && !passT ? Math.min(aPct, tPct) : !passA ? aPct : tPct;
      checks.push({ ok: passA, t: `Assignment component ${A.toFixed(1)}/24 (need 12)` });
      checks.push({ ok: passT, t: `Test component ${T.toFixed(1)}/76 incl. +${bonus.toFixed(2)} quiz bonus (need 38)` });
      return { grade, checks };
    }
    if (k === "CIS3760") {
      const sp = ids.map((i) => s[i]).sort((a, b) => b - a);
      const missed = Number(state.grades["3760-missed"] || 0);
      const raw = sp[0] * 0.35 + sp[1] * 0.25 + sp[2] * 0.25 + sp[3] * 0.15;
      checks.push({ ok: missed === 0, t: `Missed planning meetings: ${missed} (−${fmtW(missed * 4.5)})` });
      return { grade: Math.max(0, raw - missed * 4.5), checks };
    }
    const total = ids.reduce((t, i) => t + (s[i] * W[i]) / 100, 0);
    if (k === "CIS3150") {
      const cwPts = ids.filter((i) => /-(a|p)\d$/.test(i)).reduce((t, i) => t + (s[i] * W[i]) / 100, 0); // out of 30
      const exPts = ids.filter((i) => /-(t\d|fx)$/.test(i)).reduce((t, i) => t + (s[i] * W[i]) / 100, 0); // out of 70
      const cw = (cwPts / 30) * 100, ex = (exPts / 70) * 100;
      checks.push({ ok: cw >= 50, t: `Course work (A + participation) ${cw.toFixed(1)}% (need 50%)` });
      checks.push({ ok: ex >= 50, t: `Tests + final ${ex.toFixed(1)}% (need 50%)` });
      if (cw < 50 || ex < 50) {
        // outline §4.2: INC if (30% of course work + remaining marks) > 50, else that number
        const alt = 0.3 * cwPts + exPts;
        checks.push({ ok: false, t: alt > 50
          ? `Bar missed → INC (30% of course work + tests/final = ${alt.toFixed(1)} > 50). Cleared by an extra assignment.`
          : `Bar missed → grade = 30% of course work + tests/final = ${alt.toFixed(1)}%` });
        return alt > 50 ? { grade: 49.9, label: "INC", checks } : { grade: alt, checks }; // INC isn't a pass
      }
    }
    return { grade: total, checks };
  }

  function gradeSummary(k) {
    const inputs = gradeInputs(k);
    const entered = inputs.filter((i) => g(i.id) != null);
    const missing = inputs.filter((i) => g(i.id) == null);
    const wEntered = entered.reduce((t, i) => t + i.weight, 0);
    const fill = (x) => Object.fromEntries(inputs.map((i) => [i.id, g(i.id) ?? x]));
    let current = wEntered ? entered.reduce((t, i) => t + g(i.id) * i.weight, 0) / wEntered : null, currentLabel = null;
    if (!missing.length) { const r = computeFinal(k, fill(0)); current = r.grade; currentLabel = r.label || null; } // all in: apply the course's real rules
    const target = Number(state.target[k] ?? 80);
    let need = null, needState = "";
    if (missing.length === 0) needState = "complete";
    else {
      const lo = computeFinal(k, fill(0)).grade, hi = computeFinal(k, fill(100)).grade;
      if (lo >= target) needState = "locked";
      else if (hi < target) needState = "impossible";
      else {
        let a = 0, b = 100;
        for (let n = 0; n < 40; n++) { const mid = (a + b) / 2; if (computeFinal(k, fill(mid)).grade >= target) b = mid; else a = mid; }
        need = b;
      }
    }
    const projected = current != null ? computeFinal(k, fill(current)) : null;
    const floorR = computeFinal(k, fill(0)), ceilR = computeFinal(k, fill(100));
    const floor = floorR.grade, ceil = ceilR.grade;
    return { inputs, entered, missing, wEntered, current, currentLabel, target, need, needState, projected, floor, ceil, floorR, ceilR };
  }

  function renderGrades() {
    const el = $("#view-grades");
    const k = state.gcourse;
    const c = COURSES[k];
    const inputs = gradeInputs(k);
    let rows = "", lastGroup = "";
    inputs.forEach((i) => {
      const grp = k === "CIS3210" && i.type === "quiz" ? "Quizzes (best 15 of 20 count, all 20 feed the bonus)" : "";
      if (grp && grp !== lastGroup) { rows += `<tr class="group"><td colspan="3">${esc(grp)}</td></tr>`; lastGroup = grp; }
      const v = state.grades[i.id];
      rows += `<tr><td>${esc(i.title)} <span class="tiny muted">${esc(i.ongoing ? "" : fmtD(i.start))}</span></td>
        <td class="w">${esc(i.badge || fmtW(i.weight) + "%")}</td>
        <td style="text-align:right"><input class="g-input" type="number" inputmode="decimal" min="0" max="110" step="0.1" placeholder="—" data-gid="${esc(i.id)}" value="${v ?? ""}" aria-label="${esc(i.title)} score"></td></tr>`;
    });
    if (k === "CIS3760") {
      rows += `<tr class="group"><td colspan="3">Attendance</td></tr><tr><td>Missed sprint planning meetings</td><td class="w">−4.5 each</td><td style="text-align:right"><input class="g-input" type="number" min="0" max="8" step="1" data-gid="3760-missed" value="${state.grades["3760-missed"] ?? 0}"></td></tr>`;
    }
    el.innerHTML = `
      <div class="gtabs">${COURSE_KEYS.map((x) => `<button class="gtab" style="--c:${COURSES[x].color}" data-gc="${x}" aria-selected="${x === k}"><i class="dot" style="--c:${COURSES[x].color}"></i>${esc(COURSES[x].code)}</button>`).join("")}</div>
      <div class="g-layout">
        <div class="card">
          <div class="card-h"><h2>${esc(c.code)} · enter your marks (%)</h2><span class="sub">Leave blank until it's graded</span></div>
          <table class="g-table"><thead><tr><th>Item</th><th>Weight</th><th style="text-align:right">Score %</th></tr></thead><tbody>${rows}</tbody></table>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            <button class="btn" id="gExport">Export all data</button>
            <label class="btn" style="display:inline-flex;align-items:center">Import<input type="file" id="gImport" accept="application/json" hidden></label>
            <button class="btn" id="gClear">Clear ${esc(c.code)} marks</button>
          </div>
        </div>
        <div class="g-sticky" id="gResults"></div>
      </div>`;
    renderGradeResults();
  }

  function renderGradeResults() {
    const k = state.gcourse;
    const s = gradeSummary(k);
    const box = $("#gResults");
    if (!box) return;
    let needHtml;
    if (s.needState === "complete") needHtml = `<div class="need-box"><div class="small">All marks entered</div><div class="v">${esc(gradeText(computeFinal(k, Object.fromEntries(s.inputs.map((i) => [i.id, g(i.id)])))))}</div><div class="small">final grade</div></div>`;
    else if (s.needState === "locked") needHtml = `<div class="need-box"><div class="v">Locked in ✓</div><div class="small">You'd reach ${s.target}% even with zeros on everything left.</div></div>`;
    else if (s.needState === "impossible") needHtml = `<div class="need-box" style="background:var(--danger-soft)"><div class="v" style="color:var(--danger)">Out of reach</div><div class="small">Max possible now is ${s.ceil.toFixed(1)}%. Try a lower target.</div></div>`;
    else needHtml = `<div class="need-box"><div class="small">To finish with <b>${s.target}%</b> you need to average</div><div class="v">${s.need.toFixed(1)}%</div><div class="small">on the remaining ${s.missing.length} item${s.missing.length === 1 ? "" : "s"} (${fmtW(Math.round((100 - s.wEntered) * 10) / 10)}% of the grade)</div></div>`;
    const proj = s.projected;
    box.innerHTML = `
      <div class="card">
        <div class="card-h"><h2>Where you stand</h2><span class="sub">${esc(COURSES[k].code)}</span></div>
        <div class="g-stat-row">
          <div class="g-stat"><div class="l">Current average</div><div class="big-num">${s.current != null ? esc(s.currentLabel || s.current.toFixed(1) + "%") : "—"}</div><div class="tiny muted">weighted over what's graded</div></div>
          <div class="g-stat"><div class="l">Graded so far</div><div class="v">${fmtW(Math.round(s.wEntered * 10) / 10)}%</div><div class="bar"><span style="width:${s.wEntered}%;background:${COURSES[k].color}"></span></div></div>
        </div>
        <div class="g-stat-row" style="margin-top:14px">
          <div class="g-stat"><div class="l">Projected final</div><div class="v">${proj ? esc(gradeText(proj)) : "—"}</div><div class="tiny muted">if you keep this average</div></div>
          <div class="g-stat"><div class="l">Guaranteed / max</div><div class="v">${[s.floorR, s.ceilR].map((r) => esc(r.label || r.grade.toFixed(0) + "%")).join("–")}</div><div class="tiny muted">zeros vs perfect on the rest</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h2>What do I need?</h2>
          <label class="small">Target <input class="g-input" id="gTarget" type="number" min="0" max="100" step="1" value="${s.target}" style="width:64px">%</label></div>
        ${needHtml}
      </div>
      ${proj && proj.checks.length ? `<div class="card"><div class="card-h"><h2>Pass requirements</h2><span class="sub">at your current pace</span></div><div class="checks">${proj.checks.map((x) => `<div class="checkline"><span class="badge ${x.ok ? "ok" : "danger"}">${x.ok ? "OK" : "AT RISK"}</span>${esc(x.t)}</div>`).join("")}</div></div>` : ""}
      ${k === "CIS3760" ? `<div class="card small muted">Enter your individual sprint mark (the team mark after peer-evaluation scaling). Sprint ranking only kicks in with all 4 marks. Until then the average is a simple mean. Ranking can only raise it.</div>` : ""}`;
  }

  /* =================== VIEW: week =================== */
  function renderWeek() {
    const ref = now();
    const el = $("#view-week");
    const mon = addDays(mondayOf(ref), state.weekOffset * 7);
    const days = [0, 1, 2, 3, 4].map((i) => addDays(mon, i));
    const H0 = 8, H1 = 18, PX = 48;
    const holidays = NO_CLASS;
    const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const top = (t) => ((toMin(t) - H0 * 60) / 60) * PX;
    const dayItems = (d) => ITEMS_X.filter((i) => !i.ongoing && !i.tbd && !i.minor && (sameDay(i.start, d) || (i.window && i.type === "meeting" && sameDay(i.start, d))));

    const cols = days.map((d) => {
      const iso = isoDay(d);
      const blocks = classesOn(d).map((b) => ({ ...b }));
      // side-by-side lanes for overlapping blocks
      blocks.forEach((b) => {
        const ov = blocks.filter((o) => toMin(o.start) < toMin(b.end) && toMin(b.start) < toMin(o.end));
        b._n = ov.length; b._i = ov.indexOf(b);
      });
      return `<div class="wk-col" style="height:${(H1 - H0) * PX}px">
          ${holidays.has(iso) ? `<div class="empty small" style="padding-top:40px">No classes</div>` : ""}
          ${MAKEUP[iso] ? `<div class="tiny muted" style="position:absolute;bottom:4px;left:6px;right:6px">Makeup day: ${DOW_LONG[MAKEUP[iso]]} schedule</div>` : ""}
          ${blocks.map((b) => { const c = COURSES[b.course]; return `<div class="wk-block ${b.kind}" style="--c:${c.color};top:${top(b.start)}px;height:${top(b.end) - top(b.start) - 2}px${b._n > 1 ? `;left:calc(${(b._i / b._n) * 100}% + 3px);right:auto;width:calc(${100 / b._n}% - 6px)` : ""}" data-tip="${esc(`<b>${c.code} ${b.kind === "office" ? "office hours" : b.kind}</b><br>${b.start}–${b.end}${b.where ? " · " + b.where : ""}`)}"><b>${esc(c.code)}</b>${b.kind === "office" ? "Office hrs" : b.kind === "lab" ? "Lab" + (b.where ? " · " + esc(b.where) : "") : esc(b.where || "Lecture")}</div>`; }).join("")}
          ${dayItems(d).filter((i) => i.hasTime && i.start.getHours() >= H0 && i.start.getHours() < H1).map((i) => `<div class="wk-block deadline" style="--c:${i.c};top:${top(`${i.start.getHours()}:${i.start.getMinutes()}`)}px;height:${Math.max(20, i.end ? top(i.end) - top(`${i.start.getHours()}:${i.start.getMinutes()}`) - 2 : 20)}px"><b>${esc(shortCode(i.course))} ${esc(shortTitle(i))}</b></div>`).join("")}
        </div>`;
    }).join("");
    const strips = days.map((d) => `<div class="wk-dl">${dayItems(d).map((i) => `<div class="cal-ev" style="--c:${i.c}" data-tip="${esc(`<b>${i.cc.code} · ${i.title}</b><br>${whenText(i)}<br>${badgeText(i)}`)}">${esc(shortCode(i.course))} ${esc(shortTitle(i))} · ${esc(badgeText(i))}</div>`).join("")}</div>`).join("");
    const heads = days.map((d) => `<div class="wk-dh ${sameDay(d, ref) ? "today" : ""}">${DOW[d.getDay()]}<span class="dd">${fmtD(d)}</span></div>`).join("");
    const times = Array.from({ length: H1 - H0 }, (_, i) => `<div>${((H0 + i) % 12) || 12}${H0 + i < 12 ? "a" : "p"}</div>`).join("");
    const wkend = ITEMS_X.filter((i) => !i.ongoing && !i.tbd && !i.minor && i.start >= addDays(mon, 5) && i.start < addDays(mon, 7));
    const weekItems = ITEMS_X.filter((i) => !i.ongoing && !i.tbd && ((i.start >= mon && i.start < addDays(mon, 7))));

    const mobile = days.map((d) => {
      const iso = isoDay(d);
      const blocks = classesOn(d).sort((a, b) => toMin(a.start) - toMin(b.start));
      const its = dayItems(d);
      return `<div class="card day-list"><h4 class="${sameDay(d, ref) ? "" : ""}">${esc(fmtDow(d))}${sameDay(d, ref) ? ' <span class="badge accent">today</span>' : ""}${holidays.has(iso) ? ' <span class="badge">no classes</span>' : ""}${MAKEUP[iso] ? ` <span class="badge">${DOW_LONG[MAKEUP[iso]]} schedule</span>` : ""}</h4>
        ${its.map((i) => `<div class="slot" style="background:var(--danger-soft)"><span class="tm">${i.hasTime ? fmtT(i.start) : i.window ? "this week" : "by 11:59 PM"}</span><span class="dot" style="--c:${i.c}"></span><b>${esc(i.cc.code)} ${esc(i.title)}</b><span class="spacer"></span>${wBadge(i)}</div>`).join("")}
        ${blocks.map((b) => `<div class="slot"><span class="tm">${b.start}–${b.end}</span><span class="dot" style="--c:${COURSES[b.course].color}"></span>${esc(COURSES[b.course].code)} ${b.kind === "office" ? '<span class="muted">office hrs</span>' : b.kind}<span class="spacer"></span><span class="tiny muted">${esc(b.where)}</span></div>`).join("")}
        ${!its.length && !blocks.length ? `<div class="small muted">Nothing scheduled</div>` : ""}
      </div>`;
    }).join("");

    const w = weekItems.reduce((s, i) => s + i.weight, 0);
    el.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div class="cal-head" style="margin:0;flex-wrap:wrap">
          <button class="icon-btn" id="wkPrev" aria-label="Previous week">‹</button>
          <h2 style="min-width:0">Week of ${fmtD(mon)}</h2>
          <button class="icon-btn" id="wkNext" aria-label="Next week">›</button>
          <button class="btn" id="wkToday">This week</button>
          <span class="spacer"></span>
          <span class="small muted">${weekItems.filter((i) => i.graded).length} graded items · <span class="heat-pill" style="background:${w ? heatColor(w) : "var(--surface-3)"};color:${w ? "#fff" : "var(--muted)"}">${fmtW(Math.round(w * 10) / 10)} pts</span></span>
        </div>
      </div>
      <div class="card wk-desktop">
        <div class="wk"><div></div>${heads}</div>
        <div class="wk"><div class="tiny muted" style="padding-top:3px">Due</div>${strips}</div>
        <div class="wk" style="margin-top:8px"><div class="wk-times">${times}</div>${cols}</div>
        <div class="legend"><span><i class="dot" style="--c:var(--muted)"></i>Solid = lecture</span><span>Dotted = lab</span><span>Striped = office hours</span><span style="color:var(--danger)">Red = graded thing (top strip = due that day)</span></div>
      </div>
      <div class="wk-mobile">${mobile}</div>
      ${wkend.length ? `<div class="card section-gap"><div class="card-h"><h2>This weekend</h2></div><div class="items">${wkend.map((i) => itemRow(i, ref, { compact: true })).join("")}</div></div>` : ""}`;
  }

  /* =================== ICS export =================== */
  function exportICS() {
    const pad = (n) => String(n).padStart(2, "0");
    const dt = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const dd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const escI = (s) => String(s).replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
    const stamp = dt(new Date());
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//F26 Command Center//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:F26 Deadlines"];
    ITEMS_X.filter((i) => !i.minor && !i.ongoing && !i.tbd && (i.graded || i.type === "presentation")).forEach((i) => {
      const summary = `[${i.cc.code}] ${i.title} (${badgeText(i)})${i.tentative ? " – tentative" : ""}`;
      lines.push("BEGIN:VEVENT", `UID:${i.id}@f26-command-center`, `DTSTAMP:${stamp}`);
      if (i.window) {
        lines.push(`DTSTART;VALUE=DATE:${dd(i.start)}`, `DTEND;VALUE=DATE:${dd(addDays(sod(i.endAt), 1))}`);
      } else if (!i.hasTime) {
        lines.push(`DTSTART;VALUE=DATE:${dd(i.start)}`, `DTEND;VALUE=DATE:${dd(addDays(i.start, 1))}`);
      } else {
        let s = i.start, e = i.endAt;
        if (+s === +e) { if (s.getHours() === 23 && s.getMinutes() === 59) s = new Date(+s - 59 * 6e4); else e = new Date(+s + 30 * 6e4); }
        lines.push(`DTSTART:${dt(s)}`, `DTEND:${dt(e)}`);
      }
      lines.push(`SUMMARY:${escI(summary)}`);
      const desc = [i.weightLabel, i.notes].filter(Boolean).join(" · ");
      if (desc) lines.push(`DESCRIPTION:${escI(desc)}`);
      if (i.location) lines.push(`LOCATION:${escI(i.location)}`);
      if (i.weight >= 5 || i.penalty) lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escI(summary)}`, "TRIGGER:-P1D", "END:VALARM");
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    download(lines.join("\r\n"), "f26-deadlines.ics", "text/calendar");
  }
  function download(text, name, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* =================== routing & events =================== */
  const VIEWS = { dashboard: renderDashboard, timeline: renderTimeline, calendar: renderCalendar, courses: renderCourses, grades: renderGrades, week: renderWeek };
  let current = null;
  function route() {
    const v = (location.hash || "#dashboard").slice(1);
    const name = VIEWS[v] ? v : "dashboard";
    current = name;
    $$(".tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.view === name));
    $$(".view").forEach((s) => s.classList.toggle("active", s.id === "view-" + name));
    if (name !== "dashboard") clearInterval(cdTimer);
    VIEWS[name]();
    hideTip();
  }
  const rerender = () => VIEWS[current] && VIEWS[current]();

  $$(".tab").forEach((t) => t.addEventListener("click", () => {
    if (location.hash === "#" + t.dataset.view) route(); else location.hash = t.dataset.view;
    scrollTo({ top: 0 });
  }));
  addEventListener("hashchange", route);

  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches(".check")) {
      if (t.checked) state.done[t.dataset.id] = Date.now(); else delete state.done[t.dataset.id];
      saveDone();
      const row = t.closest(".item"); if (row) row.classList.toggle("is-done", t.checked);
      if (current === "dashboard") setTimeout(rerender, 250);
    }
    if (t.id === "fType") { state.filters.type = t.value; store.set("filters", state.filters); renderTimeline(); }
    if (t.id === "fPast") { state.filters.hidePast = t.checked; store.set("filters", state.filters); renderTimeline(); }
    if (t.id === "fMinor") { state.filters.showMinor = t.checked; store.set("filters", state.filters); renderTimeline(); }
    if (t.id === "gImport" && t.files[0]) {
      t.files[0].text().then((txt) => {
        try {
          const d = JSON.parse(txt);
          if (d.done) state.done = d.done;
          if (d.grades) state.grades = d.grades;
          if (d.target) state.target = d.target;
          saveDone(); saveGrades(); renderGrades();
        } catch { alert("That file isn't a valid export."); }
      });
    }
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.matches(".g-input[data-gid]")) {
      if (t.value === "") delete state.grades[t.dataset.gid]; else state.grades[t.dataset.gid] = Number(t.value);
      saveGrades(); renderGradeResults();
    }
    if (t.id === "gTarget") { state.target[state.gcourse] = clamp(Number(t.value) || 0, 0, 100); saveGrades(); renderGradeResultsKeepFocus(); }
  });
  function renderGradeResultsKeepFocus() {
    const pos = $("#gTarget")?.selectionStart;
    renderGradeResults();
    const n = $("#gTarget"); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch { /* number inputs */ } }
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button, [data-day]");
    if (!t) return;
    if (t.dataset.fcourse) {
      const k = t.dataset.fcourse, f = state.filters;
      if (f.courses.length === COURSE_KEYS.length) f.courses = [k];
      else if (f.courses.includes(k)) { f.courses = f.courses.filter((x) => x !== k); if (!f.courses.length) f.courses = COURSE_KEYS.slice(); }
      else f.courses.push(k);
      store.set("filters", f); renderTimeline();
    }
    if (t.dataset.day) { state.calSel = state.calSel === t.dataset.day ? null : t.dataset.day; renderCalendar(); if (state.calSel) $(".cal-detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
    if (t.id === "calPrev") { state.calMonth = Math.max(8, state.calMonth - 1); renderCalendar(); }
    if (t.id === "calNext") { state.calMonth = Math.min(11, state.calMonth + 1); renderCalendar(); }
    if (t.id === "calToday") { state.calMonth = null; state.calSel = isoDay(now()); renderCalendar(); }
    if (t.dataset.gc) { state.gcourse = t.dataset.gc; store.set("gcourse", state.gcourse); renderGrades(); }
    if (t.id === "gExport") download(JSON.stringify({ exported: new Date().toISOString(), done: state.done, grades: state.grades, target: state.target }, null, 2), "f26-my-data.json", "application/json");
    if (t.id === "gClear") {
      if (confirm(`Clear all entered marks for ${COURSES[state.gcourse].code}?`)) {
        gradeInputs(state.gcourse).forEach((i) => delete state.grades[i.id]);
        if (state.gcourse === "CIS3760") delete state.grades["3760-missed"];
        saveGrades(); renderGrades();
      }
    }
    if (t.id === "wkPrev") { state.weekOffset--; renderWeek(); }
    if (t.id === "wkNext") { state.weekOffset++; renderWeek(); }
    if (t.id === "wkToday") { state.weekOffset = 0; renderWeek(); }
  });

  $("#icsBtn").addEventListener("click", exportICS);

  /* theme */
  const savedTheme = store.get("theme", null);
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  $("#themeBtn").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store.set("theme", next);
    rerender();
  });

  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (current === "dashboard") { drawHeatmap($("#heatChart"), now()); drawGlance($("#glanceChart"), now()); } }, 150); });

  const t = now();
  $("#todayLabel").textContent = `${DOW_LONG[t.getDay()]}, ${MONTHS_LONG[t.getMonth()]} ${t.getDate()} · Fall 2026${params.get("today") ? " (preview date)" : ""}`;
  route();
})();
