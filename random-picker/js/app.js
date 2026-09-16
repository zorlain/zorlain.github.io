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

/* ---------- 유틸 ---------- */
function parseLines(text) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PALETTE = ["#494fdf", "#2c9e44", "#c98a1a", "#d8314f", "#0891b2", "#a3468a", "#5f6b1f", "#c2410c"];

/* ---------- 탭 1: 팀 나누기 ---------- */
function initTeamSplit() {
  const countInput = document.getElementById("team-count");
  const countLabel = document.getElementById("team-count-label");
  countInput.addEventListener("input", () => {
    countLabel.textContent = `${countInput.value}팀`;
  });

  document.getElementById("team-run-btn").addEventListener("click", () => {
    const names = parseLines(document.getElementById("team-names").value);
    const resultEl = document.getElementById("team-result");
    const teamCount = Number(countInput.value);

    if (names.length < 2) {
      resultEl.innerHTML = '<p class="result-placeholder">참가자를 2명 이상 입력해주세요.</p>';
      return;
    }
    if (teamCount > names.length) {
      resultEl.innerHTML = '<p class="result-placeholder">팀 개수가 참가자 수보다 많을 수 없습니다.</p>';
      return;
    }

    const shuffled = shuffle(names);
    const teams = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((name, i) => teams[i % teamCount].push(name));

    resultEl.innerHTML = `<div class="team-grid">${teams
      .map(
        (members, i) => `
          <div class="team-card">
            <div class="team-card-title">${i + 1}팀 (${members.length}명)</div>
            <div class="team-card-members">${members.map((m) => `<div>${escapeHtml(m)}</div>`).join("")}</div>
          </div>
        `
      )
      .join("")}</div>`;
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- 탭 2: 사다리타기 ---------- */
function buildLadder(n, rows) {
  // rungs[row][col] === true 이면 col과 col+1 사이에 가로줄이 있다 (col: 0..n-2)
  const rungs = Array.from({ length: rows }, () => new Array(n - 1).fill(false));
  for (let r = 0; r < rows; r++) {
    let col = 0;
    while (col < n - 1) {
      if (Math.random() < 0.42) {
        rungs[r][col] = true;
        col += 2; // 인접한 두 칸이 같은 줄에서 동시에 가로줄을 갖지 않도록 건너뛴다
      } else {
        col += 1;
      }
    }
  }
  return rungs;
}

function traceLadder(rungs, n, startCol) {
  let col = startCol;
  const path = [{ col, row: 0 }];
  for (let r = 0; r < rungs.length; r++) {
    if (col > 0 && rungs[r][col - 1]) {
      col -= 1;
    } else if (col < n - 1 && rungs[r][col]) {
      col += 1;
    }
    path.push({ col, row: r + 1 });
  }
  return { finalCol: col, path };
}

function renderLadderSvg(names, results, rungs) {
  const n = names.length;
  const colWidth = 76;
  const rowHeight = 24;
  const rows = rungs.length;
  const topPad = 34;
  const bottomPad = 34;
  const width = colWidth * (n - 1) + 40;
  const height = topPad + rowHeight * rows + bottomPad;
  const x = (col) => 20 + col * colWidth;

  const paths = names.map((_, i) => traceLadder(rungs, n, i));

  let svg = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // 세로줄
  for (let c = 0; c < n; c++) {
    svg += `<line x1="${x(c)}" y1="${topPad}" x2="${x(c)}" y2="${topPad + rowHeight * rows}" stroke="var(--border)" stroke-width="2" />`;
  }
  // 가로줄
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < n - 1; c++) {
      if (rungs[r][c]) {
        const y = topPad + r * rowHeight + rowHeight / 2;
        svg += `<line x1="${x(c)}" y1="${y}" x2="${x(c + 1)}" y2="${y}" stroke="var(--border)" stroke-width="2" />`;
      }
    }
  }
  // 참가자별 경로 (색상 구분)
  paths.forEach((p, i) => {
    const color = PALETTE[i % PALETTE.length];
    const pts = p.path.map((pt) => `${x(pt.col)},${topPad + pt.row * rowHeight}`).join(" ");
    svg += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" />`;
  });
  // 상단 이름
  names.forEach((name, i) => {
    svg += `<text x="${x(i)}" y="${topPad - 12}" text-anchor="middle" font-size="12" font-weight="700" fill="${PALETTE[i % PALETTE.length]}">${escapeHtml(name)}</text>`;
  });
  // 하단 결과
  results.forEach((r, i) => {
    svg += `<text x="${x(i)}" y="${topPad + rowHeight * rows + 20}" text-anchor="middle" font-size="12" fill="var(--text)">${escapeHtml(r)}</text>`;
  });
  // 노드 점
  for (let c = 0; c < n; c++) {
    svg += `<circle cx="${x(c)}" cy="${topPad}" r="4" fill="${PALETTE[c % PALETTE.length]}" />`;
  }

  svg += "</svg>";
  return { svg, paths };
}

function initLadder() {
  document.getElementById("ladder-run-btn").addEventListener("click", () => {
    const names = parseLines(document.getElementById("ladder-names").value);
    let results = parseLines(document.getElementById("ladder-results").value);
    const resultEl = document.getElementById("ladder-result");

    if (names.length < 2) {
      resultEl.innerHTML = '<p class="result-placeholder">참가자를 2명 이상 입력해주세요.</p>';
      return;
    }
    if (results.length === 0) {
      results = names.map((_, i) => `결과 ${i + 1}`);
    }
    if (results.length !== names.length) {
      resultEl.innerHTML = '<p class="result-placeholder">참가자 수와 결과 수를 동일하게 입력하거나, 결과를 비워두세요.</p>';
      return;
    }

    const n = names.length;
    const rows = Math.max(10, Math.min(28, n * 3));
    const rungs = buildLadder(n, rows);
    const { svg, paths } = renderLadderSvg(names, results, rungs);

    const tableRows = names
      .map((name, i) => {
        const finalCol = paths[i].finalCol;
        return `<div class="ladder-row"><span>${escapeHtml(name)}</span><span class="arrow">&#8594;</span><span class="result-name">${escapeHtml(results[finalCol])}</span></div>`;
      })
      .join("");

    resultEl.innerHTML = `<div class="ladder-svg-wrap">${svg}</div><div class="ladder-table">${tableRows}</div>`;
  });
}

/* ---------- 탭 3: 제비뽑기 ---------- */
function initDraw() {
  const countInput = document.getElementById("draw-count");
  const countLabel = document.getElementById("draw-count-label");
  countInput.addEventListener("input", () => {
    countLabel.textContent = `${countInput.value}명`;
  });

  document.getElementById("draw-run-btn").addEventListener("click", () => {
    const names = parseLines(document.getElementById("draw-names").value);
    const resultEl = document.getElementById("draw-result");
    const count = Number(countInput.value);

    if (names.length === 0) {
      resultEl.innerHTML = '<p class="result-placeholder">참가자를 입력해주세요.</p>';
      return;
    }
    if (count > names.length) {
      resultEl.innerHTML = '<p class="result-placeholder">뽑을 인원수가 참가자 수보다 많을 수 없습니다.</p>';
      return;
    }

    const winners = shuffle(names).slice(0, count);

    const poolHtml = names
      .map((n) => `<span class="draw-chip${winners.includes(n) ? " picked" : ""}">${escapeHtml(n)}</span>`)
      .join("");
    const winnersHtml = winners
      .map((w, i) => `<div class="draw-winner-row"><span class="draw-winner-rank">${i + 1}</span><span>${escapeHtml(w)}</span></div>`)
      .join("");

    resultEl.innerHTML = `<div class="draw-pool">${poolHtml}</div><div class="draw-winners">${winnersHtml}</div>`;
  });
}

/* ---------- 1명 뽑기 (참가자를 한 명씩 추가한 뒤 그중 한 명을 뽑음) ---------- */
function initSinglePick() {
  const input = document.getElementById("single-name-input");
  const addBtn = document.getElementById("single-add-btn");
  const listEl = document.getElementById("single-list");
  const runBtn = document.getElementById("single-run-btn");
  const resultEl = document.getElementById("single-result");
  let names = [];

  function renderList() {
    listEl.innerHTML = names
      .map(
        (name, i) =>
          `<span class="name-chip">${escapeHtml(name)}<button type="button" class="name-chip-remove" data-index="${i}" aria-label="삭제">✕</button></span>`
      )
      .join("");
  }

  function addName() {
    const value = input.value.trim();
    if (!value) return;
    names.push(value);
    input.value = "";
    input.focus();
    renderList();
  }

  addBtn.addEventListener("click", addName);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addName();
    }
  });

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".name-chip-remove");
    if (!btn) return;
    names.splice(Number(btn.dataset.index), 1);
    renderList();
  });

  runBtn.addEventListener("click", () => {
    if (names.length === 0) {
      resultEl.innerHTML = '<p class="result-placeholder">참가자를 먼저 추가해주세요.</p>';
      return;
    }
    const winner = names[Math.floor(Math.random() * names.length)];
    resultEl.innerHTML = `<div class="single-winner">${escapeHtml(winner)}</div>`;
  });
}

function init() {
  initThemeToggle();
  initTabs();
  initTeamSplit();
  initLadder();
  initDraw();
  initSinglePick();
}

document.addEventListener("DOMContentLoaded", init);
