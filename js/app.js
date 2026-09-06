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

function initSegmented(id) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    wrap.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
  });
}

function getSegmentedValue(id) {
  const wrap = document.getElementById(id);
  const active = wrap.querySelector("button.active");
  return active ? active.dataset.value : null;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

function flashCopied(btn, original) {
  btn.textContent = "복사됨";
  btn.classList.add("copied");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("copied");
  }, 1200);
}

/* ---------- itool.co.kr 느낌: 카드 그리드 허브 ↔ 개별 도구 화면 전환 ---------- */
function showTool(target) {
  document.getElementById("tool-hub").hidden = true;
  document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== target;
  });
  window.scrollTo(0, 0);
}

function showHub() {
  document.getElementById("tool-hub").hidden = false;
  document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
    panel.hidden = true;
  });
}

function initTabs() {
  document.getElementById("tool-hub").addEventListener("click", (e) => {
    const card = e.target.closest(".tool-card[data-tab]");
    if (!card) return;
    showTool(card.dataset.tab);
  });

  document.getElementById("tabs").addEventListener("click", (e) => {
    if (e.target.closest("[data-back]")) showHub();
  });
}

/* ---------- JSON 포맷터 ---------- */
function initJsonFormatter() {
  const input = document.getElementById("json-input");
  const output = document.getElementById("json-output");
  const errorEl = document.getElementById("json-error");

  function run(indent) {
    errorEl.hidden = true;
    if (!input.value.trim()) {
      output.value = "";
      return;
    }
    try {
      const parsed = JSON.parse(input.value);
      output.value = JSON.stringify(parsed, null, indent);
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = `JSON 문법 오류: ${e.message}`;
      output.value = "";
    }
  }

  document.getElementById("json-format-btn").addEventListener("click", () => run(2));
  document.getElementById("json-minify-btn").addEventListener("click", () => run(0));

  document.getElementById("json-copy-btn").addEventListener("click", async () => {
    if (!output.value) return;
    const btn = document.getElementById("json-copy-btn");
    const ok = await copyText(output.value);
    if (ok) flashCopied(btn, "결과 복사");
  });
}

/* ---------- Base64 인코더/디코더 ---------- */
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function initBase64() {
  const input = document.getElementById("base64-input");
  const output = document.getElementById("base64-output");
  const errorEl = document.getElementById("base64-error");

  document.getElementById("base64-encode-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    try {
      output.value = utf8ToBase64(input.value);
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "인코딩에 실패했습니다.";
    }
  });

  document.getElementById("base64-decode-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    try {
      output.value = base64ToUtf8(input.value.trim());
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "올바른 Base64 문자열이 아닙니다.";
      output.value = "";
    }
  });

  document.getElementById("base64-copy-btn").addEventListener("click", async () => {
    if (!output.value) return;
    const btn = document.getElementById("base64-copy-btn");
    const ok = await copyText(output.value);
    if (ok) flashCopied(btn, "결과 복사");
  });
}

/* ---------- 더미 텍스트 생성기 ---------- */
const KO_WORDS = [
  "가나다", "라마바", "사아자", "차카타", "파하나", "다람쥐", "구름", "바람", "여름",
  "겨울", "하늘", "바다", "나무", "돌멩이", "강물", "햇살", "그림자", "노을", "새벽",
  "골목", "마을", "언덕", "들판", "숲속", "호수", "안개", "이슬", "별빛", "달빛",
  "우산", "지붕", "창문", "계단", "골목길", "도시", "기차", "여행", "발걸음", "미소",
  "속삭임", "이야기", "책상", "의자", "커피", "음악", "시간", "순간", "기억", "생각",
];

const EN_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
];

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function buildSentence(wordBank, lang) {
  const len = 5 + randomInt(8);
  const words = [];
  for (let i = 0; i < len; i++) words.push(wordBank[randomInt(wordBank.length)]);
  let sentence = words.join(lang === "ko" ? " " : " ");
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return sentence + (lang === "ko" ? "." : ".");
}

function buildParagraph(sentenceCount, wordBank, lang) {
  const sentences = [];
  for (let i = 0; i < sentenceCount; i++) sentences.push(buildSentence(wordBank, lang));
  return sentences.join(" ");
}

function initLorem() {
  initSegmented("lorem-lang");

  const countInput = document.getElementById("lorem-count");
  const countLabel = document.getElementById("lorem-count-label");
  countInput.addEventListener("input", () => {
    countLabel.textContent = `${countInput.value}개`;
  });

  const lengthInput = document.getElementById("lorem-length");
  const lengthLabel = document.getElementById("lorem-length-label");
  lengthInput.addEventListener("input", () => {
    lengthLabel.textContent = `${lengthInput.value}개`;
  });

  document.getElementById("lorem-generate-btn").addEventListener("click", () => {
    const lang = getSegmentedValue("lorem-lang");
    const wordBank = lang === "ko" ? KO_WORDS : EN_WORDS;
    const paraCount = Number(countInput.value);
    const sentenceCount = Number(lengthInput.value);

    const paragraphs = [];
    for (let i = 0; i < paraCount; i++) {
      paragraphs.push(buildParagraph(sentenceCount, wordBank, lang));
    }
    document.getElementById("lorem-output").value = paragraphs.join("\n\n");
  });

  document.getElementById("lorem-copy-btn").addEventListener("click", async () => {
    const text = document.getElementById("lorem-output").value;
    if (!text) return;
    const btn = document.getElementById("lorem-copy-btn");
    const ok = await copyText(text);
    if (ok) flashCopied(btn, "결과 복사");
  });
}

function init() {
  initThemeToggle();
  initMenu();
  initTabs();
  initJsonFormatter();
  initBase64();
  initLorem();
}

document.addEventListener("DOMContentLoaded", init);
