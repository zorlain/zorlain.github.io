/* ---------- 공통: 테마/메뉴 ---------- */
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

function initMenu() {
  const menu = document.getElementById("menu");
  const toggle = document.getElementById("menu-toggle");
  if (!menu || !toggle) return;
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });
  document.addEventListener("click", () => menu.classList.remove("open"));
}

/* ---------- 비밀번호 생성 ---------- */
const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};
const AMBIGUOUS = /[0O1lI]/g;

function getOptions() {
  return {
    length: Number(document.getElementById("opt-length").value),
    upper: document.getElementById("opt-upper").checked,
    lower: document.getElementById("opt-lower").checked,
    digits: document.getElementById("opt-digits").checked,
    symbols: document.getElementById("opt-symbols").checked,
    excludeAmbiguous: document.getElementById("opt-exclude-ambiguous").checked,
  };
}

function buildCharPool(opts) {
  let pool = "";
  const groups = [];
  if (opts.upper) { pool += CHARSETS.upper; groups.push(CHARSETS.upper); }
  if (opts.lower) { pool += CHARSETS.lower; groups.push(CHARSETS.lower); }
  if (opts.digits) { pool += CHARSETS.digits; groups.push(CHARSETS.digits); }
  if (opts.symbols) { pool += CHARSETS.symbols; groups.push(CHARSETS.symbols); }
  if (opts.excludeAmbiguous) {
    pool = pool.replace(AMBIGUOUS, "");
  }
  return { pool, groups };
}

function randomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function generatePassword(opts) {
  const { pool, groups } = buildCharPool(opts);
  if (!pool) return null;

  const chars = [];
  for (let i = 0; i < opts.length; i++) {
    chars.push(pool[randomInt(pool.length)]);
  }

  // 선택한 각 문자 종류가 최소 1개는 포함되도록 보정한다.
  groups.forEach((group, i) => {
    const filteredGroup = opts.excludeAmbiguous ? group.replace(AMBIGUOUS, "") : group;
    if (!filteredGroup) return;
    const hasAny = chars.some((c) => filteredGroup.includes(c));
    if (!hasAny && chars.length > i) {
      chars[i] = filteredGroup[randomInt(filteredGroup.length)];
    }
  });

  // 순서를 한 번 더 섞는다.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function estimateStrength(password, poolSize) {
  if (!password) return { score: 0, label: "-", color: "var(--negative)" };
  const entropy = password.length * Math.log2(Math.max(poolSize, 2));
  let score, label, color;
  if (entropy < 40) { score = 25; label = "약함"; color = "var(--negative)"; }
  else if (entropy < 60) { score = 50; label = "보통"; color = "var(--warning)"; }
  else if (entropy < 80) { score = 75; label = "강함"; color = "var(--accent)"; }
  else { score = 100; label = "매우 강함"; color = "var(--positive)"; }
  return { score, label, color };
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------- 비밀번호 표시 (avast처럼 옵션을 바꾸는 즉시, 그리고 첫 진입 시 바로 하나 보여줌) ---------- */
function regeneratePassword() {
  const opts = getOptions();
  const pwTextEl = document.getElementById("pw-text");
  const badgeEl = document.getElementById("pw-strength-badge");

  const password = generatePassword(opts);
  if (!password) {
    pwTextEl.textContent = "문자 종류를 하나 이상 선택해주세요.";
    badgeEl.hidden = true;
    return;
  }

  pwTextEl.textContent = password;
  const { pool } = buildCharPool(opts);
  const s = estimateStrength(password, pool.length);
  badgeEl.hidden = false;
  badgeEl.textContent = s.label;
  badgeEl.style.color = s.color;
  badgeEl.style.background = `color-mix(in srgb, ${s.color} 16%, transparent)`;
}

function initGenerate() {
  const lengthInput = document.getElementById("opt-length");
  const lengthLabel = document.getElementById("opt-length-label");
  const updateLength = () => {
    lengthLabel.textContent = `${lengthInput.value}자`;
    regeneratePassword();
  };
  lengthInput.addEventListener("input", updateLength);

  document.getElementById("len-minus").addEventListener("click", () => {
    lengthInput.value = Math.max(Number(lengthInput.min), Number(lengthInput.value) - 1);
    updateLength();
  });
  document.getElementById("len-plus").addEventListener("click", () => {
    lengthInput.value = Math.min(Number(lengthInput.max), Number(lengthInput.value) + 1);
    updateLength();
  });

  ["opt-upper", "opt-lower", "opt-digits", "opt-symbols", "opt-exclude-ambiguous"].forEach((id) => {
    document.getElementById(id).addEventListener("change", regeneratePassword);
  });

  document.getElementById("pw-refresh-btn").addEventListener("click", regeneratePassword);

  document.getElementById("pw-copy-btn").addEventListener("click", async () => {
    const text = document.getElementById("pw-text").textContent;
    if (!text || text.includes("선택해주세요")) return;
    const btn = document.getElementById("pw-copy-btn");
    const ok = await copyText(text);
    if (ok) {
      btn.textContent = "복사됨";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = "복사";
        btn.classList.remove("copied");
      }, 1500);
    }
  });

  regeneratePassword();
}

function initGenerateMany() {
  const countInput = document.getElementById("opt-count");
  const countLabel = document.getElementById("opt-count-label");
  countInput.addEventListener("input", () => {
    countLabel.textContent = `${countInput.value}개`;
  });

  document.getElementById("pw-generate-many-btn").addEventListener("click", () => {
    const opts = getOptions();
    const count = Number(countInput.value);
    const listEl = document.getElementById("pw-list");

    const passwords = [];
    for (let i = 0; i < count; i++) {
      const p = generatePassword(opts);
      if (p) passwords.push(p);
    }
    if (passwords.length === 0) {
      listEl.innerHTML = '<p class="result-placeholder">문자 종류를 하나 이상 선택해주세요.</p>';
      return;
    }

    listEl.innerHTML = passwords
      .map((p, i) => `<div class="pw-list-item"><span>${p}</span><button type="button" data-index="${i}">복사</button></div>`)
      .join("");

    listEl.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const p = passwords[Number(btn.dataset.index)];
        const ok = await copyText(p);
        if (ok) {
          btn.textContent = "복사됨";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "복사";
            btn.classList.remove("copied");
          }, 1500);
        }
      });
    });
  });
}

function init() {
  initThemeToggle();
  initMenu();
  initGenerate();
  initGenerateMany();
}

document.addEventListener("DOMContentLoaded", init);
