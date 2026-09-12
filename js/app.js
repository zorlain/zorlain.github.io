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

/* ---------- 도구 검색 필터 ---------- */
function initSearch() {
  const input = document.getElementById("tool-search");
  const cards = Array.from(document.querySelectorAll(".tool-card"));
  const emptyMsg = document.getElementById("tool-empty-msg");
  const sectionLabels = Array.from(document.querySelectorAll(".tool-section-label"));

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    let visibleCount = 0;
    cards.forEach((card) => {
      const haystack = `${card.dataset.tags || ""} ${card.querySelector(".tool-card-title").textContent}`.toLowerCase();
      const match = !q || haystack.includes(q);
      card.hidden = !match;
      if (match) visibleCount++;
    });
    sectionLabels.forEach((label) => {
      const grid = label.nextElementSibling;
      const anyVisible = grid && Array.from(grid.querySelectorAll(".tool-card")).some((c) => !c.hidden);
      label.hidden = !anyVisible;
    });
    emptyMsg.hidden = visibleCount !== 0;
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

/* ---------- 퍼센트 계산기 ---------- */
function initPercent() {
  initSegmented("percent-mode");

  const modeWrap = document.getElementById("percent-mode");
  modeWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const mode = btn.dataset.value;
    document.querySelectorAll("[data-percent-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.percentPanel !== mode;
    });
    document.getElementById("percent-result").hidden = true;
    document.getElementById("percent-error").hidden = true;
  });

  document.getElementById("percent-calc-btn").addEventListener("click", () => {
    const mode = getSegmentedValue("percent-mode");
    const errorEl = document.getElementById("percent-error");
    const resultEl = document.getElementById("percent-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    function showResult(label, value) {
      document.getElementById("percent-result-label").textContent = label;
      document.getElementById("percent-result-value").textContent = value;
      resultEl.hidden = false;
    }
    function showError(msg) {
      errorEl.hidden = false;
      errorEl.textContent = msg;
    }

    if (mode === "ratio") {
      const a = Number(document.getElementById("ratio-a").value);
      const b = Number(document.getElementById("ratio-b").value);
      if (!b) return showError("B에 0이 아닌 숫자를 입력해주세요.");
      showResult(`${a}는 ${b}의`, `${((a / b) * 100).toFixed(2)}%`);
    } else if (mode === "portion") {
      const x = Number(document.getElementById("portion-x").value);
      const b = Number(document.getElementById("portion-b").value);
      showResult(`${b}의 ${x}%는`, (b * (x / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 }));
    } else {
      const before = Number(document.getElementById("change-before").value);
      const after = Number(document.getElementById("change-after").value);
      if (!before) return showError("이전 값에 0이 아닌 숫자를 입력해주세요.");
      const rate = ((after - before) / before) * 100;
      const sign = rate > 0 ? "+" : "";
      showResult("증감률", `${sign}${rate.toFixed(2)}%`);
    }
  });
}

/* ---------- 대출이자 계산기 ---------- */
function formatWon(n) {
  return `${Math.round(n).toLocaleString()}원`;
}

function initLoan() {
  initSegmented("loan-method");

  document.getElementById("loan-calc-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("loan-error");
    const resultEl = document.getElementById("loan-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const principal = Number(document.getElementById("loan-principal").value) * 10000;
    const annualRate = Number(document.getElementById("loan-rate").value);
    const months = Number(document.getElementById("loan-months").value);
    const method = getSegmentedValue("loan-method");

    if (!principal || !months || annualRate < 0 || isNaN(annualRate)) {
      errorEl.hidden = false;
      errorEl.textContent = "원금, 이자율, 기간을 정확히 입력해주세요.";
      return;
    }

    const r = annualRate / 100 / 12;
    let totalInterest = 0;
    let paymentLabel = "월 상환액";
    let paymentValue = "";

    if (method === "equal-payment") {
      const monthly = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
      totalInterest = monthly * months - principal;
      paymentValue = formatWon(monthly);
    } else if (method === "equal-principal") {
      const principalPerMonth = principal / months;
      let remaining = principal;
      let firstPayment = 0;
      for (let i = 0; i < months; i++) {
        const interest = remaining * r;
        totalInterest += interest;
        if (i === 0) firstPayment = principalPerMonth + interest;
        remaining -= principalPerMonth;
      }
      paymentLabel = "1회차 상환액 (매월 감소)";
      paymentValue = formatWon(firstPayment);
    } else {
      totalInterest = principal * r * months;
      paymentLabel = "매월 이자만 납부";
      paymentValue = formatWon(principal * r);
    }

    document.getElementById("loan-payment-label").textContent = paymentLabel;
    document.getElementById("loan-payment-value").textContent = paymentValue;
    document.getElementById("loan-interest-value").textContent = formatWon(totalInterest);
    resultEl.hidden = false;
  });
}

/* ---------- 만나이 계산기 ---------- */
function initAge() {
  document.getElementById("age-calc-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("age-error");
    const resultEl = document.getElementById("age-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const birthStr = document.getElementById("age-birth").value;
    if (!birthStr) {
      errorEl.hidden = false;
      errorEl.textContent = "생년월일을 입력해주세요.";
      return;
    }
    const baseStr = document.getElementById("age-base").value;
    const birth = new Date(birthStr);
    const base = baseStr ? new Date(baseStr) : new Date();

    let manAge = base.getFullYear() - birth.getFullYear();
    const hasHadBirthdayThisYear =
      base.getMonth() > birth.getMonth() ||
      (base.getMonth() === birth.getMonth() && base.getDate() >= birth.getDate());
    if (!hasHadBirthdayThisYear) manAge -= 1;

    const yearAge = base.getFullYear() - birth.getFullYear() + 1;

    document.getElementById("age-man-value").textContent = `${manAge}세`;
    document.getElementById("age-year-value").textContent = `${yearAge}세`;
    resultEl.hidden = false;
  });
}

/* ---------- 부가세 계산기 ---------- */
function initVat() {
  initSegmented("vat-mode");

  document.getElementById("vat-calc-btn").addEventListener("click", () => {
    const mode = getSegmentedValue("vat-mode");
    const amount = Number(document.getElementById("vat-amount").value);
    const resultEl = document.getElementById("vat-result");
    if (!amount) {
      resultEl.hidden = true;
      return;
    }

    let supply, tax, total;
    if (mode === "supply") {
      supply = amount;
      tax = amount * 0.1;
      total = supply + tax;
    } else {
      total = amount;
      supply = amount / 1.1;
      tax = total - supply;
    }

    document.getElementById("vat-supply-value").textContent = formatWon(supply);
    document.getElementById("vat-tax-value").textContent = formatWon(tax);
    document.getElementById("vat-total-value").textContent = formatWon(total);
    resultEl.hidden = false;
  });
}

/* ---------- 주휴수당 계산기 ---------- */
function initWeeklyPay() {
  document.getElementById("wp-calc-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("wp-error");
    const resultEl = document.getElementById("wp-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const wage = Number(document.getElementById("wp-wage").value);
    const hours = Number(document.getElementById("wp-hours").value);
    if (!wage || !hours) {
      errorEl.hidden = false;
      errorEl.textContent = "시급과 근무시간을 입력해주세요.";
      return;
    }
    if (hours < 15) {
      errorEl.hidden = false;
      errorEl.textContent = "주 15시간 미만은 주휴수당 지급 대상이 아닙니다.";
      return;
    }

    const cappedHours = Math.min(hours, 40);
    const pay = (cappedHours / 40) * 8 * wage;

    document.getElementById("wp-value").textContent = formatWon(pay);
    resultEl.hidden = false;
  });
}

/* ---------- 3.3% 계산기 ---------- */
function initFreelanceTax() {
  initSegmented("ft-mode");

  document.getElementById("ft-calc-btn").addEventListener("click", () => {
    const mode = getSegmentedValue("ft-mode");
    const amount = Number(document.getElementById("ft-amount").value);
    const resultEl = document.getElementById("ft-result");
    if (!amount) {
      resultEl.hidden = true;
      return;
    }

    let contract, tax, net;
    if (mode === "contract") {
      contract = amount;
      tax = amount * 0.033;
      net = contract - tax;
      document.getElementById("ft-other-label").textContent = "실수령액";
      document.getElementById("ft-other-value").textContent = formatWon(net);
    } else {
      net = amount;
      contract = amount / 0.967;
      tax = contract - net;
      document.getElementById("ft-other-label").textContent = "지급액 (세전)";
      document.getElementById("ft-other-value").textContent = formatWon(contract);
    }

    document.getElementById("ft-tax-value").textContent = formatWon(tax);
    resultEl.hidden = false;
  });
}

/* ---------- 퇴직금 계산기 ---------- */
function initSeverance() {
  document.getElementById("sv-calc-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("sv-error");
    const resultEl = document.getElementById("sv-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const startStr = document.getElementById("sv-start").value;
    const endStr = document.getElementById("sv-end").value;
    const wage3 = Number(document.getElementById("sv-wage3").value);

    if (!startStr || !endStr || !wage3) {
      errorEl.hidden = false;
      errorEl.textContent = "입사일, 퇴사일, 최근 3개월 총 급여를 모두 입력해주세요.";
      return;
    }

    const start = new Date(startStr);
    const end = new Date(endStr);
    if (end <= start) {
      errorEl.hidden = false;
      errorEl.textContent = "퇴사일은 입사일보다 이후여야 합니다.";
      return;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysEmployed = Math.round((end - start) / msPerDay);

    if (daysEmployed < 365) {
      errorEl.hidden = false;
      errorEl.textContent = "계속근로기간이 1년 미만이면 퇴직금 지급 대상이 아닙니다.";
      return;
    }

    const p3Start = new Date(end);
    p3Start.setMonth(p3Start.getMonth() - 3);
    const p3Days = Math.round((end - p3Start) / msPerDay);
    const dailyWage = wage3 / p3Days;
    const severance = dailyWage * 30 * (daysEmployed / 365);

    document.getElementById("sv-days-value").textContent = `${daysEmployed.toLocaleString()}일`;
    document.getElementById("sv-daily-value").textContent = formatWon(dailyWage);
    document.getElementById("sv-total-value").textContent = formatWon(severance);
    resultEl.hidden = false;
  });
}

/* ---------- 실업급여 계산기 ---------- */
function initUnemployment() {
  document.getElementById("ub-calc-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("ub-error");
    const resultEl = document.getElementById("ub-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const wage = Number(document.getElementById("ub-wage").value);
    const months = Number(document.getElementById("ub-months").value);
    const senior = document.getElementById("ub-senior").checked;

    if (!wage || !months) {
      errorEl.hidden = false;
      errorEl.textContent = "월평균임금과 가입기간을 입력해주세요.";
      return;
    }
    if (months < 6) {
      errorEl.hidden = false;
      errorEl.textContent = "고용보험 가입기간이 180일(약 6개월) 미만이면 수급 대상이 아닙니다.";
      return;
    }

    const dailyWage = wage / 30;
    const UPPER = 66000;
    const LOWER = 63104;
    let dailyBenefit = Math.min(Math.max(dailyWage * 0.6, LOWER), UPPER);

    let days;
    if (months < 36) days = senior ? 180 : 150;
    else if (months < 60) days = senior ? 210 : 180;
    else if (months < 120) days = senior ? 240 : 210;
    else days = senior ? 270 : 240;
    if (months < 12) days = 120;

    const total = dailyBenefit * days;

    document.getElementById("ub-daily-value").textContent = formatWon(dailyBenefit);
    document.getElementById("ub-days-value").textContent = `${days}일`;
    document.getElementById("ub-total-value").textContent = formatWon(total);
    resultEl.hidden = false;
  });
}

/* ---------- 전월세 전환 계산기 ---------- */
function initJeonse() {
  initSegmented("jc-mode");

  const modeWrap = document.getElementById("jc-mode");
  const monthlyField = document.querySelector("[data-jc-monthly-field]");
  modeWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    monthlyField.hidden = btn.dataset.value !== "to-jeonse";
    document.getElementById("jc-result").hidden = true;
  });

  document.getElementById("jc-calc-btn").addEventListener("click", () => {
    const mode = getSegmentedValue("jc-mode");
    const errorEl = document.getElementById("jc-error");
    const resultEl = document.getElementById("jc-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const jeonse = Number(document.getElementById("jc-jeonse").value);
    const deposit = Number(document.getElementById("jc-deposit").value);
    const rate = Number(document.getElementById("jc-rate").value);

    if (!jeonse || deposit < 0 || isNaN(deposit) || !rate) {
      errorEl.hidden = false;
      errorEl.textContent = "전세보증금, 월세 보증금, 전환율을 정확히 입력해주세요.";
      return;
    }
    if (deposit > jeonse) {
      errorEl.hidden = false;
      errorEl.textContent = "월세 보증금은 전세보증금보다 작아야 합니다.";
      return;
    }

    if (mode === "to-monthly") {
      const monthly = ((jeonse - deposit) * (rate / 100)) / 12;
      document.getElementById("jc-result-label").textContent = "환산 월세";
      document.getElementById("jc-result-value").textContent = formatWon(monthly);
    } else {
      const monthly = Number(document.getElementById("jc-monthly").value);
      if (!monthly) {
        errorEl.hidden = false;
        errorEl.textContent = "월세 금액을 입력해주세요.";
        return;
      }
      const convertedJeonse = deposit + (monthly * 12) / (rate / 100);
      document.getElementById("jc-result-label").textContent = "환산 전세보증금";
      document.getElementById("jc-result-value").textContent = formatWon(convertedJeonse);
    }
    resultEl.hidden = false;
  });
}

/* ---------- 적금·예금 계산기 ---------- */
function initSavings() {
  initSegmented("sc-mode");

  const modeWrap = document.getElementById("sc-mode");
  const amountLabel = document.getElementById("sc-amount-label");
  modeWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    amountLabel.textContent = btn.dataset.value === "installment" ? "월 납입액 (원)" : "예치 금액 (원)";
    document.getElementById("sc-result").hidden = true;
  });

  document.getElementById("sc-calc-btn").addEventListener("click", () => {
    const mode = getSegmentedValue("sc-mode");
    const errorEl = document.getElementById("sc-error");
    const resultEl = document.getElementById("sc-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const amount = Number(document.getElementById("sc-amount").value);
    const annualRate = Number(document.getElementById("sc-rate").value);
    const months = Number(document.getElementById("sc-months").value);

    if (!amount || !months || annualRate < 0 || isNaN(annualRate)) {
      errorEl.hidden = false;
      errorEl.textContent = "금액, 이자율, 기간을 정확히 입력해주세요.";
      return;
    }

    let principal, interest;
    if (mode === "installment") {
      principal = amount * months;
      interest = amount * ((months * (months + 1)) / 2) * (annualRate / 100 / 12);
    } else {
      principal = amount;
      interest = amount * (annualRate / 100) * (months / 12);
    }
    const afterTaxInterest = interest * (1 - 0.154);
    const total = principal + afterTaxInterest;

    document.getElementById("sc-principal-value").textContent = formatWon(principal);
    document.getElementById("sc-interest-value").textContent = formatWon(afterTaxInterest);
    document.getElementById("sc-total-value").textContent = formatWon(total);
    resultEl.hidden = false;
  });
}

/* ---------- 애드센스 현실 계산기 ---------- */
function initAdsense() {
  document.getElementById("ad-calc-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("ad-error");
    const resultEl = document.getElementById("ad-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const visitors = Number(document.getElementById("ad-visitors").value);
    const ctr = Number(document.getElementById("ad-ctr").value);
    const cpc = Number(document.getElementById("ad-cpc").value);

    if (!visitors || !ctr || !cpc) {
      errorEl.hidden = false;
      errorEl.textContent = "방문자 수, CTR, CPC를 모두 입력해주세요.";
      return;
    }

    const dailyClicks = visitors * (ctr / 100);
    const dailyRevenue = dailyClicks * cpc;
    const monthlyRevenue = dailyRevenue * 30;

    document.getElementById("ad-daily-value").textContent = formatWon(dailyRevenue);
    document.getElementById("ad-monthly-value").textContent = formatWon(monthlyRevenue);
    resultEl.hidden = false;
  });
}

function init() {
  initThemeToggle();
  initMenu();
  initTabs();
  initSearch();
  initJsonFormatter();
  initBase64();
  initLorem();
  initPercent();
  initLoan();
  initAge();
  initVat();
  initWeeklyPay();
  initFreelanceTax();
  initSeverance();
  initUnemployment();
  initJeonse();
  initSavings();
  initAdsense();
}

document.addEventListener("DOMContentLoaded", init);
