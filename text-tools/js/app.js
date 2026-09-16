/* ---------- 공통: 테마/메뉴/탭 ---------- */
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

/* ---------- itool.co.kr 느낌: 카드 그리드 허브 ↔ 개별 도구 화면 전환 ---------- */
function showTool(target) {
  document.getElementById("tool-hub").hidden = true;
  document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== target;
  });
}

function showHub() {
  document.getElementById("tool-hub").hidden = false;
  document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
    panel.hidden = true;
  });
}

function initTabs() {
  document.getElementById("tool-hub").addEventListener("click", (e) => {
    const card = e.target.closest(".tool-card");
    if (!card) return;
    showTool(card.dataset.tab);
  });

  document.getElementById("tabs").addEventListener("click", (e) => {
    if (e.target.closest("[data-back]")) showHub();
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------- 탭 1: 글자수 세기 ---------- */
function initCharCount() {
  const input = document.getElementById("count-input");

  function render() {
    const text = input.value;
    const withSpace = [...text].length; // 코드포인트 기준 (이모지 등 서로게이트 쌍 안전)
    const noSpace = [...text.replace(/\s/g, "")].length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const bytes = new TextEncoder().encode(text).length;

    document.getElementById("count-with-space").textContent = `${withSpace.toLocaleString("ko-KR")}자`;
    document.getElementById("count-no-space").textContent = `${noSpace.toLocaleString("ko-KR")}자`;
    document.getElementById("count-words").textContent = `${words.toLocaleString("ko-KR")}개`;
    document.getElementById("count-lines").textContent = `${lines.toLocaleString("ko-KR")}줄`;
    document.getElementById("count-bytes").textContent = `${bytes.toLocaleString("ko-KR")}B`;
  }

  input.addEventListener("input", render);
  render();
}

/* ---------- 탭 2: 대소문자·공백 정리 ---------- */
function initCaseTools() {
  const input = document.getElementById("case-input");

  const actions = {
    upper: (t) => t.toUpperCase(),
    lower: (t) => t.toLowerCase(),
    title: (t) =>
      t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
    trim: (t) => t.split("\n").map((l) => l.trim()).join("\n"),
    "dedupe-lines": (t) => {
      const seen = new Set();
      return t
        .split("\n")
        .filter((l) => {
          if (seen.has(l)) return false;
          seen.add(l);
          return true;
        })
        .join("\n");
    },
    "remove-empty": (t) => t.split("\n").filter((l) => l.trim() !== "").join("\n"),
    "collapse-spaces": (t) => t.replace(/[^\S\n]+/g, " "),
    "join-lines": (t) => t.split("\n").map((l) => l.trim()).filter(Boolean).join(" "),
  };

  document.querySelectorAll('[data-tab-panel="case"] .tool-btn-grid button').forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = actions[btn.dataset.action];
      if (!action) return;
      input.value = action(input.value);
    });
  });

  document.getElementById("case-copy-btn").addEventListener("click", async () => {
    const btn = document.getElementById("case-copy-btn");
    const ok = await copyText(input.value);
    if (ok) {
      const original = btn.textContent;
      btn.textContent = "복사됨";
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    }
  });
}

/* ---------- 탭 3: 특수문자 모음 ---------- */
const SYMBOL_GROUPS = [
  { title: "화살표", chars: ["→", "←", "↑", "↓", "↔", "↕", "⇒", "⇐", "⇔", "➜", "➤", "▶"] },
  { title: "도형", chars: ["●", "○", "■", "□", "▲", "▼", "◆", "◇", "★", "☆", "♥", "♦"] },
  { title: "괄호·따옴표", chars: ["「", "」", "『", "』", "〈", "〉", "《", "》", "“", "”", "‘", "’"] },
  { title: "수학·기타 기호", chars: ["±", "×", "÷", "≒", "≠", "≤", "≥", "∞", "√", "%", "℃", "™"] },
  { title: "구두점·기타", chars: ["…", "·", "‥", "※", "◎", "○", "△", "▽", "†", "‡", "§", "¶"] },
];

function initSymbols() {
  const container = document.getElementById("symbol-groups");
  container.innerHTML = SYMBOL_GROUPS.map(
    (group) => `
      <div class="symbol-group">
        <div class="symbol-group-title">${group.title}</div>
        <div class="symbol-chip-grid">
          ${group.chars.map((c) => `<button type="button" class="symbol-chip" data-char="${c}">${c}</button>`).join("")}
        </div>
      </div>
    `
  ).join("");

  container.addEventListener("click", async (e) => {
    const chip = e.target.closest(".symbol-chip");
    if (!chip) return;
    const ok = await copyText(chip.dataset.char);
    if (ok) {
      chip.classList.add("copied");
      setTimeout(() => chip.classList.remove("copied"), 700);
    }
  });
}

/* ---------- 도구 검색 필터 ---------- */
function initSearch() {
  const input = document.getElementById("tool-search");
  const cards = Array.from(document.querySelectorAll(".tool-card"));
  const emptyMsg = document.getElementById("tool-empty-msg");

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    let visibleCount = 0;
    cards.forEach((card) => {
      const haystack = `${card.dataset.tags || ""} ${card.querySelector(".tool-card-title").textContent}`.toLowerCase();
      const match = !q || haystack.includes(q);
      card.hidden = !match;
      if (match) visibleCount++;
    });
    emptyMsg.hidden = visibleCount !== 0;
  });
}

/* ---------- 텍스트 정렬·뒤집기 ---------- */
function initSortTool() {
  const input = document.getElementById("sort-input");

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const actions = {
    asc: (lines) => [...lines].sort((a, b) => a.localeCompare(b, "ko")),
    desc: (lines) => [...lines].sort((a, b) => b.localeCompare(a, "ko")),
    reverse: (lines) => [...lines].reverse(),
    shuffle: (lines) => shuffle(lines),
  };

  document.querySelectorAll('[data-tab-panel="sort"] .tool-btn-grid button').forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = actions[btn.dataset.action];
      if (!action) return;
      const lines = input.value.split("\n");
      input.value = action(lines).join("\n");
    });
  });

  document.getElementById("sort-copy-btn").addEventListener("click", async () => {
    const btn = document.getElementById("sort-copy-btn");
    const ok = await copyText(input.value);
    if (ok) {
      const original = btn.textContent;
      btn.textContent = "복사됨";
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    }
  });
}

/* ---------- URL 인코딩·디코딩 ---------- */
function initUrlTools() {
  const input = document.getElementById("url-input");
  const output = document.getElementById("url-output");
  const errorEl = document.getElementById("url-error");

  document.getElementById("url-encode-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    output.value = encodeURIComponent(input.value);
  });

  document.getElementById("url-decode-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    try {
      output.value = decodeURIComponent(input.value.trim());
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "올바른 인코딩된 URL 문자열이 아닙니다.";
      output.value = "";
    }
  });

  document.getElementById("url-copy-btn").addEventListener("click", async () => {
    if (!output.value) return;
    const btn = document.getElementById("url-copy-btn");
    const ok = await copyText(output.value);
    if (ok) {
      const original = btn.textContent;
      btn.textContent = "복사됨";
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    }
  });
}

function init() {
  initThemeToggle();
  initTabs();
  initSearch();
  initCharCount();
  initCaseTools();
  initSymbols();
  initSortTool();
  initUrlTools();
}

document.addEventListener("DOMContentLoaded", init);
