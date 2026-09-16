/* ---------- 공통: 테마/메뉴/탭/툴팁 (다른 도구 사이트와 동일한 프레임) ---------- */
const ICON_SUN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 12H2M22 12h-2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"/></svg>';
const ICON_MOON =
  '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 1 0 10.5 10.5Z"/></svg>';

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const getTheme = () => document.documentElement.getAttribute("data-theme") || "light";
  const applyIcon = () => {
    btn.innerHTML = getTheme() === "dark" ? ICON_SUN : ICON_MOON;
  };

  applyIcon();
  btn.addEventListener("click", () => {
    const next = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    applyIcon();
  });
}

function initInfoTooltips() {
  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = btn.classList.contains("open");
      document.querySelectorAll(".info-btn.open").forEach((b) => b.classList.remove("open"));
      if (!wasOpen) btn.classList.add("open");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".info-btn.open").forEach((b) => b.classList.remove("open"));
  });
}

function initTabs() {
  const tabs = document.getElementById("tabs");
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    const target = btn.dataset.tab;
    tabs.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== target;
    });
  });
}

/* ---------- 공통: 알림음 (Web Audio API, 외부 파일 없이 생성) ---------- */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playBeeps(times) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  let t = ctx.currentTime;
  for (let i = 0; i < times; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
    t += 0.4;
  }
}

function pad2(n) {
  return String(Math.trunc(n)).padStart(2, "0");
}

const DEFAULT_TITLE = document.title;

/* ---------- 타이머 ---------- */
function initTimer() {
  const ringProgress = document.getElementById("timer-ring-progress");
  const display = document.getElementById("timer-display");
  const presetsEl = document.getElementById("timer-presets");
  const startBtn = document.getElementById("timer-start-btn");
  const resetBtn = document.getElementById("timer-reset-btn");
  const hInput = document.getElementById("timer-h");
  const mInput = document.getElementById("timer-m");
  const sInput = document.getElementById("timer-s");
  if (!display) return;

  const CIRCUMFERENCE = 2 * Math.PI * 90;
  ringProgress.style.strokeDasharray = String(CIRCUMFERENCE);

  let totalMs = 5 * 60 * 1000;
  let remainingMs = totalMs;
  let running = false;
  let endTimestamp = null;
  let intervalId = null;
  let showHours = false;

  function readCustomSeconds() {
    const h = Math.max(0, Math.min(23, Number(hInput.value) || 0));
    const m = Math.max(0, Math.min(59, Number(mInput.value) || 0));
    const s = Math.max(0, Math.min(59, Number(sInput.value) || 0));
    return h * 3600 + m * 60 + s;
  }

  function syncCustomFields(totalSec) {
    hInput.value = Math.floor(totalSec / 3600);
    mInput.value = Math.floor((totalSec % 3600) / 60);
    sInput.value = totalSec % 60;
  }

  function formatMs(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return showHours ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
  }

  function render() {
    display.textContent = formatMs(remainingMs);
    const fraction = totalMs > 0 ? remainingMs / totalMs : 0;
    ringProgress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction));
  }

  function setDone() {
    running = false;
    clearInterval(intervalId);
    remainingMs = 0;
    render();
    display.classList.add("done");
    ringProgress.classList.add("done");
    document.title = "시간 종료! - " + DEFAULT_TITLE;
    playBeeps(5);
    startBtn.textContent = "▶ 시작";
  }

  function tick() {
    remainingMs = endTimestamp - Date.now();
    if (remainingMs <= 0) {
      setDone();
      return;
    }
    render();
    document.title = `${formatMs(remainingMs)} - 타이머`;
  }

  function stopRunning() {
    running = false;
    clearInterval(intervalId);
    intervalId = null;
  }

  presetsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".preset-btn");
    if (!btn) return;
    stopRunning();
    presetsEl.querySelectorAll(".preset-btn").forEach((b) => b.classList.toggle("active", b === btn));
    const sec = Number(btn.dataset.sec);
    syncCustomFields(sec);
    totalMs = sec * 1000;
    remainingMs = totalMs;
    showHours = sec >= 3600;
    display.classList.remove("done");
    ringProgress.classList.remove("done");
    document.title = DEFAULT_TITLE;
    startBtn.textContent = "▶ 시작";
    render();
  });

  [hInput, mInput, sInput].forEach((input) => {
    input.addEventListener("input", () => {
      if (running) return;
      presetsEl.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
      const sec = readCustomSeconds();
      totalMs = sec * 1000;
      remainingMs = totalMs;
      showHours = sec >= 3600;
      display.classList.remove("done");
      ringProgress.classList.remove("done");
      render();
    });
  });

  startBtn.addEventListener("click", () => {
    getAudioCtx(); // 사용자 클릭 시점에 오디오 컨텍스트를 준비해 둔다 (자동재생 정책 대응)

    if (running) {
      // 일시정지
      remainingMs = endTimestamp - Date.now();
      stopRunning();
      startBtn.textContent = "▶ 재개";
      document.title = DEFAULT_TITLE;
      return;
    }

    if (remainingMs <= 0) {
      remainingMs = totalMs;
      display.classList.remove("done");
      ringProgress.classList.remove("done");
    }
    if (remainingMs <= 0) return; // 0초 타이머는 시작하지 않음

    endTimestamp = Date.now() + remainingMs;
    running = true;
    startBtn.textContent = "⏸ 일시정지";
    intervalId = setInterval(tick, 200);
    tick();
  });

  resetBtn.addEventListener("click", () => {
    stopRunning();
    remainingMs = totalMs;
    display.classList.remove("done");
    ringProgress.classList.remove("done");
    document.title = DEFAULT_TITLE;
    startBtn.textContent = "▶ 시작";
    render();
  });

  syncCustomFields(5 * 60);
  render();
}

/* ---------- 스톱워치 ---------- */
function initStopwatch() {
  const display = document.getElementById("stopwatch-display");
  const startBtn = document.getElementById("stopwatch-start-btn");
  const lapBtn = document.getElementById("stopwatch-lap-btn");
  const resetBtn = document.getElementById("stopwatch-reset-btn");
  const lapList = document.getElementById("lap-list");
  const lapEmpty = document.getElementById("lap-empty");
  if (!display) return;

  let running = false;
  let startTimestamp = 0;
  let elapsedBeforePauseMs = 0;
  let intervalId = null;
  let laps = []; // { index, splitMs, totalMs }

  function formatElapsed(ms) {
    const totalCs = Math.floor(ms / 10);
    const cs = totalCs % 100;
    const totalSec = Math.floor(totalCs / 100);
    const s = totalSec % 60;
    const totalMin = Math.floor(totalSec / 60);
    const m = totalMin % 60;
    const h = Math.floor(totalMin / 60);
    const base = h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
    return `${base}.${pad2(cs)}`;
  }

  function currentElapsedMs() {
    return running ? Date.now() - startTimestamp : elapsedBeforePauseMs;
  }

  function render() {
    display.textContent = formatElapsed(currentElapsedMs());
  }

  function renderLaps() {
    if (laps.length === 0) {
      lapList.innerHTML = '<p class="result-placeholder lap-empty" id="lap-empty">시작 후 랩을 누르면 기록이 여기에 쌓입니다.</p>';
      return;
    }
    let fastestIdx = 0;
    let slowestIdx = 0;
    if (laps.length > 1) {
      laps.forEach((lap, i) => {
        if (lap.splitMs < laps[fastestIdx].splitMs) fastestIdx = i;
        if (lap.splitMs > laps[slowestIdx].splitMs) slowestIdx = i;
      });
    }
    const rows = laps
      .map((lap, i) => {
        let cls = "lap-item";
        if (laps.length > 1 && i === fastestIdx) cls += " fastest";
        if (laps.length > 1 && i === slowestIdx) cls += " slowest";
        return `
          <div class="${cls}">
            <div class="lap-item-index">#${lap.index}</div>
            <div class="lap-item-split">${formatElapsed(lap.splitMs)}</div>
            <div class="lap-item-total">${formatElapsed(lap.totalMs)}</div>
          </div>
        `;
      })
      .reverse()
      .join("");
    lapList.innerHTML = rows;
  }

  function tick() {
    render();
  }

  startBtn.addEventListener("click", () => {
    getAudioCtx();
    if (running) {
      elapsedBeforePauseMs = Date.now() - startTimestamp;
      running = false;
      clearInterval(intervalId);
      startBtn.textContent = "▶ 재개";
      lapBtn.disabled = true;
      return;
    }
    startTimestamp = Date.now() - elapsedBeforePauseMs;
    running = true;
    startBtn.textContent = "⏸ 일시정지";
    lapBtn.disabled = false;
    intervalId = setInterval(tick, 47);
  });

  lapBtn.addEventListener("click", () => {
    if (!running) return;
    const totalMs = currentElapsedMs();
    const lastTotal = laps.length ? laps[laps.length - 1].totalMs : 0;
    laps.push({ index: laps.length + 1, splitMs: totalMs - lastTotal, totalMs });
    renderLaps();
  });

  resetBtn.addEventListener("click", () => {
    running = false;
    clearInterval(intervalId);
    elapsedBeforePauseMs = 0;
    laps = [];
    startBtn.textContent = "▶ 시작";
    lapBtn.disabled = true;
    render();
    renderLaps();
  });

  render();
}

/* ---------- 시계 + 세계시계 ---------- */
const WORLD_CLOCKS = [
  { label: "서울", tz: "Asia/Seoul" },
  { label: "도쿄", tz: "Asia/Tokyo" },
  { label: "런던", tz: "Europe/London" },
  { label: "뉴욕", tz: "America/New_York" },
  { label: "로스앤젤레스", tz: "America/Los_Angeles" },
];

const WEEKDAY_KR = ["일", "월", "화", "수", "목", "금", "토"];

function getTzOffsetMinutes(tz, date) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(date);
    const name = parts.find((p) => p.type === "timeZoneName");
    const m = name && name.value.match(/GMT([+-]\d+)(?::(\d+))?/);
    if (!m) return 0;
    const h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    return h * 60 + (h < 0 ? -min : min);
  } catch (e) {
    return 0;
  }
}

function getDayKey(tz, date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day));
}

function worldClockMeta(tz, date) {
  const offsetDiffMin = getTzOffsetMinutes(tz, date) - getTzOffsetMinutes("Asia/Seoul", date);
  const dayDiff = Math.round((getDayKey(tz, date) - getDayKey("Asia/Seoul", date)) / 86400000);
  const dayLabel = dayDiff === 0 ? "오늘" : dayDiff === 1 ? "내일" : dayDiff === -1 ? "어제" : `${dayDiff > 0 ? "+" : ""}${dayDiff}일`;
  const offsetHours = offsetDiffMin / 60;
  const offsetLabel = offsetHours === 0 ? "서울과 동일" : `서울보다 ${offsetHours > 0 ? "+" : ""}${offsetHours}시간`;
  return `${dayLabel} · ${offsetLabel}`;
}

function initClock() {
  const timeEl = document.getElementById("clock-time");
  const dateEl = document.getElementById("clock-date");
  const gridEl = document.getElementById("world-clock-grid");
  const fsBtn = document.getElementById("clock-fullscreen-btn");
  const clockCard = document.getElementById("clock-card");
  if (!timeEl) return;

  gridEl.innerHTML = WORLD_CLOCKS.map(
    (c, i) => `
      <div class="world-clock-item">
        <div class="world-clock-label">${c.label}</div>
        <div class="world-clock-time led" id="world-clock-${i}">--:--:--</div>
        <div class="world-clock-meta" id="world-clock-meta-${i}">-</div>
      </div>
    `
  ).join("");

  function render() {
    const now = new Date();
    timeEl.textContent = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    dateEl.textContent = `${now.getFullYear()}.${pad2(now.getMonth() + 1)}.${pad2(now.getDate())} (${WEEKDAY_KR[now.getDay()]})`;

    WORLD_CLOCKS.forEach((c, i) => {
      const el = document.getElementById(`world-clock-${i}`);
      const metaEl = document.getElementById(`world-clock-meta-${i}`);
      if (!el) return;
      try {
        el.textContent = new Intl.DateTimeFormat("ko-KR", {
          timeZone: c.tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now);
        if (metaEl) metaEl.textContent = worldClockMeta(c.tz, now);
      } catch (e) {
        el.textContent = "-";
      }
    });
  }

  render();
  setInterval(render, 1000);

  if (fsBtn) {
    if (!document.fullscreenEnabled) {
      fsBtn.style.display = "none";
    } else {
      fsBtn.addEventListener("click", () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          clockCard.requestFullscreen().catch(() => {});
        }
      });
      document.addEventListener("fullscreenchange", () => {
        fsBtn.textContent = document.fullscreenElement ? "⛶ 전체화면 종료" : "⛶ 전체화면";
      });
    }
  }
}

/* ---------- 초기화 ---------- */
function init() {
  initThemeToggle();
  initTabs();
  initInfoTooltips();
  initTimer();
  initStopwatch();
  initClock();
}

document.addEventListener("DOMContentLoaded", init);
