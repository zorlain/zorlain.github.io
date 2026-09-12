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

/* ---------- JSON <-> CSV 변환기 ---------- */
function jsonArrayToCsv(arr) {
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("빈 배열이거나 배열이 아닙니다.");
  const headers = Object.keys(arr[0]);
  const escape = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escape).join(",")];
  arr.forEach((row) => lines.push(headers.map((h) => escape(row[h])).join(",")));
  return lines.join("\n");
}

function csvToJsonArray(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length === 0 || !lines[0]) throw new Error("빈 CSV입니다.");
  function parseLine(line) {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
        } else cur += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ",") { result.push(cur); cur = ""; }
      else cur += ch;
    }
    result.push(cur);
    return result;
  }
  const headers = parseLine(lines[0]);
  return lines.slice(1).filter((l) => l.trim() !== "").map((line) => {
    const values = parseLine(line);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i] ?? ""));
    return obj;
  });
}

function initJsonToCsv() {
  const input = document.getElementById("j2c-input");
  const output = document.getElementById("j2c-output");
  const errorEl = document.getElementById("j2c-error");

  document.getElementById("j2c-to-csv-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    try {
      output.value = jsonArrayToCsv(JSON.parse(input.value));
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = `오류: ${e.message}`;
    }
  });

  document.getElementById("j2c-to-json-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    try {
      output.value = JSON.stringify(csvToJsonArray(input.value), null, 2);
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = `오류: ${e.message}`;
    }
  });

  document.getElementById("j2c-copy-btn").addEventListener("click", async (e) => {
    if (!output.value) return;
    if (await copyText(output.value)) flashCopied(e.target, "결과 복사");
  });
}

/* ---------- Unix 타임스탬프 변환기 ---------- */
function initUnixTimestamp() {
  const input = document.getElementById("uts-input");
  const errorEl = document.getElementById("uts-error");
  const resultEl = document.getElementById("uts-result");

  document.getElementById("uts-now-btn").addEventListener("click", () => {
    input.value = Math.floor(Date.now() / 1000);
  });

  document.getElementById("uts-calc-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    resultEl.hidden = true;
    const raw = input.value.trim();
    if (!raw) {
      errorEl.hidden = false;
      errorEl.textContent = "타임스탬프 또는 날짜를 입력해주세요.";
      return;
    }

    let date;
    if (/^\d+$/.test(raw)) {
      const num = Number(raw);
      date = new Date(raw.length >= 13 ? num : num * 1000);
    } else {
      date = new Date(raw.replace(" ", "T"));
    }

    if (isNaN(date.getTime())) {
      errorEl.hidden = false;
      errorEl.textContent = "인식할 수 없는 형식입니다.";
      return;
    }

    document.getElementById("uts-ts-value").textContent = Math.floor(date.getTime() / 1000).toLocaleString();
    document.getElementById("uts-iso-value").textContent = date.toISOString();
    document.getElementById("uts-local-value").textContent = date.toLocaleString("ko-KR", { timeZoneName: "short" });
    resultEl.hidden = false;
  });
}

/* ---------- 진법 변환기 ---------- */
function initBaseConverter() {
  initSegmented("bc-base-mode");
  document.getElementById("bc-calc-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("bc-error");
    const resultEl = document.getElementById("bc-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const base = Number(getSegmentedValue("bc-base-mode"));
    const raw = document.getElementById("bc-input").value.trim();
    if (!raw) {
      errorEl.hidden = false;
      errorEl.textContent = "숫자를 입력해주세요.";
      return;
    }

    const validPattern = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^[0-9]+$/, 16: /^[0-9a-fA-F]+$/ }[base];
    if (!validPattern.test(raw)) {
      errorEl.hidden = false;
      errorEl.textContent = `${base}진수 형식에 맞지 않는 숫자입니다.`;
      return;
    }

    const decimal = parseInt(raw, base);
    if (!Number.isSafeInteger(decimal)) {
      errorEl.hidden = false;
      errorEl.textContent = "숫자가 너무 큽니다.";
      return;
    }

    document.getElementById("bc-bin-value").textContent = decimal.toString(2);
    document.getElementById("bc-oct-value").textContent = decimal.toString(8);
    document.getElementById("bc-dec-value").textContent = decimal.toString(10);
    document.getElementById("bc-hex-value").textContent = decimal.toString(16).toUpperCase();
    resultEl.hidden = false;
  });
}

/* ---------- 정규식 테스터 ---------- */
function initRegexTester() {
  document.getElementById("rgx-test-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("rgx-error");
    const countStat = document.getElementById("rgx-count-stat");
    const outputGroup = document.getElementById("rgx-output-group");
    errorEl.hidden = true;
    countStat.hidden = true;
    outputGroup.hidden = true;

    const pattern = document.getElementById("rgx-pattern").value;
    const flags = document.getElementById("rgx-flags").value.trim();
    const text = document.getElementById("rgx-text").value;

    if (!pattern) {
      errorEl.hidden = false;
      errorEl.textContent = "정규표현식을 입력해주세요.";
      return;
    }

    let re;
    try {
      re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = `정규식 오류: ${e.message}`;
      return;
    }

    const matches = [...text.matchAll(re)].map((m) => m[0]);
    document.getElementById("rgx-count-value").textContent = `${matches.length}개`;
    countStat.hidden = false;
    document.getElementById("rgx-output").value = matches.length ? matches.join("\n") : "(매치 없음)";
    outputGroup.hidden = false;
  });
}

/* ---------- ASCII 변환기 ---------- */
function initAsciiConverter() {
  const input = document.getElementById("asc-input");
  const output = document.getElementById("asc-output");
  const errorEl = document.getElementById("asc-error");

  document.getElementById("asc-encode-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    output.value = Array.from(input.value).map((ch) => ch.charCodeAt(0)).join(" ");
  });

  document.getElementById("asc-decode-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    const parts = input.value.trim().split(/\s+/).filter(Boolean);
    if (!parts.length || !parts.every((p) => /^\d+$/.test(p))) {
      errorEl.hidden = false;
      errorEl.textContent = "공백으로 구분된 숫자 코드를 입력해주세요.";
      return;
    }
    output.value = parts.map((p) => String.fromCharCode(Number(p))).join("");
  });

  document.getElementById("asc-copy-btn").addEventListener("click", async (e) => {
    if (!output.value) return;
    if (await copyText(output.value)) flashCopied(e.target, "결과 복사");
  });
}

/* ---------- 키보드 키코드 확인기 ---------- */
function initKeycodeChecker() {
  const zone = document.getElementById("kc-zone");
  const hint = document.getElementById("kc-hint");
  zone.addEventListener("keydown", (e) => {
    e.preventDefault();
    document.getElementById("kc-key-value").textContent = e.key === " " ? "Space" : e.key;
    document.getElementById("kc-code-value").textContent = e.code;
    document.getElementById("kc-keycode-value").textContent = e.keyCode;
    hint.textContent = "다른 키도 눌러보세요";
  });
  zone.addEventListener("click", () => zone.focus());
}

/* ---------- HTTP 상태코드 조회 ---------- */
const HTTP_STATUS_MAP = {
  100: "Continue - 요청을 계속 진행해도 됨",
  101: "Switching Protocols - 프로토콜 전환",
  200: "OK - 요청 성공",
  201: "Created - 리소스 생성 성공",
  202: "Accepted - 요청 접수(처리 미완료)",
  204: "No Content - 성공했지만 응답 본문 없음",
  206: "Partial Content - 일부 콘텐츠 응답",
  301: "Moved Permanently - 영구 이동",
  302: "Found - 임시 이동",
  303: "See Other - 다른 URI로 조회",
  304: "Not Modified - 캐시된 리소스 사용 가능",
  307: "Temporary Redirect - 임시 리다이렉트(메서드 유지)",
  308: "Permanent Redirect - 영구 리다이렉트(메서드 유지)",
  400: "Bad Request - 잘못된 요청",
  401: "Unauthorized - 인증 필요",
  402: "Payment Required - 결제 필요",
  403: "Forbidden - 접근 권한 없음",
  404: "Not Found - 리소스를 찾을 수 없음",
  405: "Method Not Allowed - 허용되지 않은 메서드",
  406: "Not Acceptable - 허용되지 않는 콘텐츠 형식",
  408: "Request Timeout - 요청 시간 초과",
  409: "Conflict - 리소스 상태 충돌",
  410: "Gone - 더 이상 사용할 수 없는 리소스",
  411: "Length Required - Content-Length 필요",
  412: "Precondition Failed - 사전조건 실패",
  413: "Payload Too Large - 요청 본문이 너무 큼",
  414: "URI Too Long - URI가 너무 김",
  415: "Unsupported Media Type - 지원하지 않는 미디어 타입",
  416: "Range Not Satisfiable - 요청 범위가 유효하지 않음",
  417: "Expectation Failed - Expect 헤더 조건 실패",
  418: "I'm a teapot - 농담성 상태 코드",
  422: "Unprocessable Entity - 처리할 수 없는 요청",
  425: "Too Early - 요청이 너무 이름",
  426: "Upgrade Required - 프로토콜 업그레이드 필요",
  428: "Precondition Required - 사전조건 필요",
  429: "Too Many Requests - 너무 많은 요청(속도 제한)",
  431: "Request Header Fields Too Large - 헤더가 너무 큼",
  451: "Unavailable For Legal Reasons - 법적 사유로 이용 불가",
  500: "Internal Server Error - 서버 내부 오류",
  501: "Not Implemented - 구현되지 않은 기능",
  502: "Bad Gateway - 게이트웨이 오류",
  503: "Service Unavailable - 서비스 이용 불가",
  504: "Gateway Timeout - 게이트웨이 시간 초과",
  505: "HTTP Version Not Supported - 지원하지 않는 HTTP 버전",
  507: "Insufficient Storage - 저장 공간 부족",
  511: "Network Authentication Required - 네트워크 인증 필요",
};

function initHttpStatus() {
  document.getElementById("hs-lookup-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("hs-error");
    const resultEl = document.getElementById("hs-result");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const code = document.getElementById("hs-input").value.trim();
    const desc = HTTP_STATUS_MAP[code];
    if (!desc) {
      errorEl.hidden = false;
      errorEl.textContent = "등록되지 않은 상태 코드이거나 잘못된 입력입니다.";
      return;
    }
    document.getElementById("hs-result-label").textContent = `${code} 상태코드`;
    document.getElementById("hs-result-value").textContent = desc;
    resultEl.hidden = false;
  });
}

/* ---------- JWT 디코더 ---------- */
function base64UrlDecode(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const decoded = atob(s);
  try {
    return decodeURIComponent(
      decoded.split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
  } catch (e) {
    return decoded;
  }
}

function initJwtDecoder() {
  document.getElementById("jwt-decode-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("jwt-error");
    const resultGroup = document.getElementById("jwt-result-group");
    errorEl.hidden = true;
    resultGroup.hidden = true;

    const token = document.getElementById("jwt-input").value.trim();
    const parts = token.split(".");
    if (parts.length < 2) {
      errorEl.hidden = false;
      errorEl.textContent = "올바른 JWT 형식이 아닙니다. (header.payload.signature)";
      return;
    }

    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      document.getElementById("jwt-output").value =
        `헤더:\n${JSON.stringify(header, null, 2)}\n\n페이로드:\n${JSON.stringify(payload, null, 2)}`;
      resultGroup.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "토큰을 디코딩할 수 없습니다. 형식을 확인해주세요.";
    }
  });
}

/* ---------- 해시 생성기 (MD5 순수 JS 구현 + SHA-1/256 Web Crypto) ---------- */
function md5(input) {
  function rotl(x, c) { return (x << c) | (x >>> (32 - c)); }
  const s = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
             5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
             4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
             6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const K = new Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  const bytes = Array.from(new TextEncoder().encode(input));
  const origLenBits = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 0; i < 8; i++) bytes.push(Math.floor(origLenBits / Math.pow(2, 8 * i)) & 0xff);

  for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += 64) {
    const M = new Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = bytes[chunkStart + j * 4] |
             (bytes[chunkStart + j * 4 + 1] << 8) |
             (bytes[chunkStart + j * 4 + 2] << 16) |
             (bytes[chunkStart + j * 4 + 3] << 24);
    }
    let [A, B, C, D] = [a0, b0, c0, d0];
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + rotl(F, s[i])) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }

  function toHexLE(n) {
    let hex = "";
    for (let i = 0; i < 4; i++) hex += ((n >>> (8 * i)) & 0xff).toString(16).padStart(2, "0");
    return hex;
  }
  return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0);
}

async function sha(algo, text) {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function initHashGenerator() {
  document.getElementById("hg-generate-btn").addEventListener("click", async () => {
    const text = document.getElementById("hg-input").value;
    document.getElementById("hg-md5-value").textContent = md5(text);
    document.getElementById("hg-sha1-value").textContent = await sha("SHA-1", text);
    document.getElementById("hg-sha256-value").textContent = await sha("SHA-256", text);
    document.getElementById("hg-result").hidden = false;
  });
}

/* ---------- UUID 생성기 ---------- */
function generateUuidV4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function initUuidGenerator() {
  const valueEl = document.getElementById("uuid-value");
  document.getElementById("uuid-generate-btn").addEventListener("click", () => {
    valueEl.textContent = generateUuidV4();
  });
  document.getElementById("uuid-copy-btn").addEventListener("click", async (e) => {
    if (valueEl.textContent === "-") return;
    if (await copyText(valueEl.textContent)) flashCopied(e.target, "복사하기");
  });
  valueEl.textContent = generateUuidV4();
}

/* ---------- 색상 변환 공용 유틸 (컬러 코드 변환기 + WCAG 대비 검사기 공용) ---------- */
function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function parseColorInput(raw) {
  const s = (raw || "").trim();
  let m;
  if ((m = s.match(/^#?([0-9a-fA-F]{3})$/))) {
    const [r, g, b] = m[1].split("").map((c) => parseInt(c + c, 16));
    return { r, g, b };
  }
  if ((m = s.match(/^#?([0-9a-fA-F]{6})$/))) {
    return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16) };
  }
  if ((m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i))) {
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  }
  if ((m = s.match(/^hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%/i))) {
    return hslToRgb(Number(m[1]), Number(m[2]), Number(m[3]));
  }
  return null;
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/* ---------- 컬러 코드 변환기 ---------- */
function initColorConverter() {
  document.getElementById("cc-convert-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("cc-error");
    const resultEl = document.getElementById("cc-result");
    const preview = document.getElementById("cc-preview");
    errorEl.hidden = true;
    resultEl.hidden = true;
    preview.style.display = "none";

    const rgb = parseColorInput(document.getElementById("cc-input").value);
    if (!rgb) {
      errorEl.hidden = false;
      errorEl.textContent = "인식할 수 없는 색상 형식입니다. HEX, RGB, HSL 형식으로 입력해주세요.";
      return;
    }

    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    document.getElementById("cc-hex-value").textContent = hex;
    document.getElementById("cc-rgb-value").textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById("cc-hsl-value").textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    preview.style.display = "block";
    preview.style.background = hex;
    const p = preview.querySelector("p");
    p.textContent = hex;
    p.style.color = relativeLuminance(rgb) > 0.5 ? "#000" : "#fff";
    resultEl.hidden = false;
  });
}

/* ---------- CSS 그라디언트 생성기 ---------- */
function initCssGradient() {
  const c1 = document.getElementById("cg-color1");
  const c2 = document.getElementById("cg-color2");
  const angle = document.getElementById("cg-angle");
  const angleLabel = document.getElementById("cg-angle-label");
  const preview = document.getElementById("cg-preview");
  const output = document.getElementById("cg-output");

  function update() {
    angleLabel.textContent = `${angle.value}deg`;
    const css = `linear-gradient(${angle.value}deg, ${c1.value}, ${c2.value})`;
    preview.style.background = css;
    output.value = `background: ${css};`;
  }
  [c1, c2, angle].forEach((el) => el.addEventListener("input", update));
  update();

  document.getElementById("cg-copy-btn").addEventListener("click", async (e) => {
    if (await copyText(output.value)) flashCopied(e.target, "CSS 복사");
  });
}

/* ---------- CSS Box Shadow 생성기 ---------- */
function initCssBoxShadow() {
  const x = document.getElementById("bs-x");
  const y = document.getElementById("bs-y");
  const blur = document.getElementById("bs-blur");
  const spread = document.getElementById("bs-spread");
  const color = document.getElementById("bs-color");
  const preview = document.getElementById("bs-preview");
  const output = document.getElementById("bs-output");
  initSegmented("bs-inset");
  const insetWrap = document.getElementById("bs-inset");

  function update() {
    document.getElementById("bs-x-label").textContent = `${x.value}px`;
    document.getElementById("bs-y-label").textContent = `${y.value}px`;
    document.getElementById("bs-blur-label").textContent = `${blur.value}px`;
    document.getElementById("bs-spread-label").textContent = `${spread.value}px`;
    const insetVal = getSegmentedValue("bs-inset") === "inset" ? "inset " : "";
    const shadow = `${insetVal}${x.value}px ${y.value}px ${blur.value}px ${spread.value}px ${color.value}`;
    preview.style.boxShadow = shadow;
    output.value = `box-shadow: ${shadow};`;
  }

  [x, y, blur, spread, color].forEach((el) => el.addEventListener("input", update));
  insetWrap.addEventListener("click", update);
  update();

  document.getElementById("bs-copy-btn").addEventListener("click", async (e) => {
    if (await copyText(output.value)) flashCopied(e.target, "CSS 복사");
  });
}

/* ---------- WCAG 색상 대비 검사기 ---------- */
function initWcagContrast() {
  document.getElementById("wc-check-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("wc-error");
    const resultEl = document.getElementById("wc-result");
    const preview = document.getElementById("wc-preview");
    errorEl.hidden = true;
    resultEl.hidden = true;

    const bgRgb = parseColorInput(document.getElementById("wc-bg").value);
    const textRgb = parseColorInput(document.getElementById("wc-text").value);
    if (!bgRgb || !textRgb) {
      errorEl.hidden = false;
      errorEl.textContent = "색상 형식을 확인해주세요. (예: #ffffff)";
      return;
    }

    const l1 = relativeLuminance(bgRgb);
    const l2 = relativeLuminance(textRgb);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    preview.style.background = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);
    preview.style.color = rgbToHex(textRgb.r, textRgb.g, textRgb.b);
    preview.textContent = "미리보기 텍스트 Aa 123";

    document.getElementById("wc-ratio-value").textContent = `${ratio.toFixed(2)} : 1`;
    document.getElementById("wc-aa-value").textContent = ratio >= 4.5 ? "통과" : "미달";
    document.getElementById("wc-aa-large-value").textContent = ratio >= 3 ? "통과" : "미달";
    resultEl.hidden = false;
  });
}

/* ---------- cubic-bezier 이징 생성기 ---------- */
function initCubicBezier() {
  const x1 = document.getElementById("cb-x1");
  const y1 = document.getElementById("cb-y1");
  const x2 = document.getElementById("cb-x2");
  const y2 = document.getElementById("cb-y2");
  const output = document.getElementById("cb-output");
  const curve = document.getElementById("cb-curve");
  const h1 = document.getElementById("cb-handle1");
  const h2 = document.getElementById("cb-handle2");

  function update() {
    document.getElementById("cb-x1-label").textContent = Number(x1.value).toFixed(2);
    document.getElementById("cb-y1-label").textContent = Number(y1.value).toFixed(2);
    document.getElementById("cb-x2-label").textContent = Number(x2.value).toFixed(2);
    document.getElementById("cb-y2-label").textContent = Number(y2.value).toFixed(2);

    const px1 = Number(x1.value) * 100;
    const py1 = 100 - Number(y1.value) * 100;
    const px2 = Number(x2.value) * 100;
    const py2 = 100 - Number(y2.value) * 100;

    curve.setAttribute("d", `M0,100 C${px1},${py1} ${px2},${py2} 100,0`);
    h1.setAttribute("cx", px1); h1.setAttribute("cy", py1);
    h2.setAttribute("cx", px2); h2.setAttribute("cy", py2);

    output.value = `cubic-bezier(${Number(x1.value).toFixed(2)}, ${Number(y1.value).toFixed(2)}, ${Number(x2.value).toFixed(2)}, ${Number(y2.value).toFixed(2)})`;
  }

  [x1, y1, x2, y2].forEach((el) => el.addEventListener("input", update));
  update();

  document.getElementById("cb-copy-btn").addEventListener("click", async (e) => {
    if (await copyText(output.value)) flashCopied(e.target, "값 복사");
  });
}

/* ---------- SQL 포매터 ---------- */
const SQL_MAIN_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT",
  "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
  "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN", "JOIN", "ON",
  "UNION ALL", "UNION",
];

function formatSql(sql) {
  let s = sql.replace(/\s+/g, " ").trim();
  [...SQL_MAIN_KEYWORDS].sort((a, b) => b.length - a.length).forEach((kw) => {
    const re = new RegExp(`\\b${kw.replace(" ", "\\s+")}\\b`, "gi");
    s = s.replace(re, `\n${kw.toUpperCase()}`);
  });
  s = s.replace(/\s+(AND|OR)\s+/gi, "\n  $1 ");
  return s.split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
}

function initSqlFormatter() {
  const outputGroup = document.getElementById("sql-output-group");
  const output = document.getElementById("sql-output");

  document.getElementById("sql-format-btn").addEventListener("click", () => {
    const input = document.getElementById("sql-input").value.trim();
    if (!input) return;
    output.value = formatSql(input);
    outputGroup.hidden = false;
  });

  document.getElementById("sql-copy-btn").addEventListener("click", async (e) => {
    if (!output.value) return;
    if (await copyText(output.value)) flashCopied(e.target, "결과 복사");
  });
}

/* ---------- 코드 압축기 ---------- */
function stripCodeComments(code, lang) {
  let out = "";
  let i = 0;
  const n = code.length;
  let inStr = null;
  while (i < n) {
    const c = code[i];
    const next = code[i + 1];
    if (inStr) {
      out += c;
      if (c === "\\") { out += next || ""; i += 2; continue; }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || (lang === "js" && c === "`")) {
      inStr = c;
      out += c;
      i++;
      continue;
    }
    if (lang === "js" && c === "/" && next === "/") {
      while (i < n && code[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < n && !(code[i] === "*" && code[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function minifyCode(code, lang) {
  const stripped = stripCodeComments(code, lang);
  if (lang === "css") {
    return stripped.replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").replace(/;}/g, "}").trim();
  }
  return stripped.split("\n").map((line) => line.trim()).filter((line) => line.length > 0).join("\n");
}

function initCodeMinifier() {
  initSegmented("min-lang");
  const jsNote = document.getElementById("min-js-note");
  document.getElementById("min-lang").addEventListener("click", () => {
    jsNote.hidden = getSegmentedValue("min-lang") !== "js";
  });

  document.getElementById("min-run-btn").addEventListener("click", () => {
    const lang = getSegmentedValue("min-lang");
    const input = document.getElementById("min-input").value;
    const output = minifyCode(input, lang);
    document.getElementById("min-output").value = output;

    if (input.length > 0) {
      const reduction = Math.round((1 - output.length / input.length) * 100);
      document.getElementById("min-stat-value").textContent =
        `${input.length.toLocaleString()}자 → ${output.length.toLocaleString()}자 (${reduction}% 감소)`;
      document.getElementById("min-stat").hidden = false;
    }
  });

  document.getElementById("min-copy-btn").addEventListener("click", async (e) => {
    const output = document.getElementById("min-output").value;
    if (!output) return;
    if (await copyText(output)) flashCopied(e.target, "결과 복사");
  });
}

/* ---------- Cron 표현식 생성기 ---------- */
function parseCronField(field, min, max) {
  const values = new Set();
  field.split(",").forEach((part) => {
    let step = 1;
    let range = part;
    if (part.includes("/")) {
      const [r, s] = part.split("/");
      range = r;
      step = Number(s);
    }
    let start = min, end = max;
    if (range !== "*") {
      if (range.includes("-")) {
        const [a, b] = range.split("-").map(Number);
        start = a; end = b;
      } else {
        start = end = Number(range);
      }
    }
    for (let v = start; v <= end; v += step) values.add(v);
  });
  return values;
}

function nextCronRuns(expr, count) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error("cron 표현식은 5개 필드(분 시 일 월 요일)로 이루어져야 합니다.");
  const [minF, hourF, domF, monF, dowF] = parts;
  const minutes = parseCronField(minF, 0, 59);
  const hours = parseCronField(hourF, 0, 23);
  const doms = parseCronField(domF, 1, 31);
  const months = parseCronField(monF, 1, 12);
  const dows = parseCronField(dowF, 0, 6);

  let date = new Date();
  date.setSeconds(0, 0);
  date.setMinutes(date.getMinutes() + 1);

  const results = [];
  const maxIterations = 60 * 24 * 366;
  for (let i = 0; i < maxIterations && results.length < count; i++) {
    if (
      minutes.has(date.getMinutes()) &&
      hours.has(date.getHours()) &&
      doms.has(date.getDate()) &&
      months.has(date.getMonth() + 1) &&
      dows.has(date.getDay())
    ) {
      results.push(new Date(date));
    }
    date.setMinutes(date.getMinutes() + 1);
  }
  return results;
}

function initCronGenerator() {
  document.getElementById("cron-calc-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("cron-error");
    const resultGroup = document.getElementById("cron-result-group");
    errorEl.hidden = true;
    resultGroup.hidden = true;

    try {
      const runs = nextCronRuns(document.getElementById("cron-input").value, 5);
      if (runs.length === 0) {
        errorEl.hidden = false;
        errorEl.textContent = "앞으로 1년 안에 실행될 시각을 찾지 못했습니다. 표현식을 확인해주세요.";
        return;
      }
      document.getElementById("cron-result").value = runs
        .map((d) => d.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }))
        .join("\n");
      resultGroup.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = e.message;
    }
  });
}

/* ---------- cURL 변환기 ---------- */
function tokenizeShellCommand(cmd) {
  const tokens = [];
  let cur = "";
  let quote = null;
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    if (quote) {
      if (c === quote) { quote = null; }
      else if (c === "\\" && quote === '"') { cur += cmd[++i]; }
      else cur += c;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === "\\" && cmd[i + 1] === "\n") {
      i++;
    } else if (/\s/.test(c)) {
      if (cur) { tokens.push(cur); cur = ""; }
    } else {
      cur += c;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function curlToFetch(curlCmd) {
  const tokens = tokenizeShellCommand(curlCmd.trim());
  if (tokens[0] !== "curl") throw new Error("curl 명령어로 시작해야 합니다.");

  let url = null;
  let method = null;
  const headers = {};
  let data = null;

  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "-X" || t === "--request") { method = tokens[++i]; }
    else if (t === "-H" || t === "--header") {
      const h = tokens[++i] || "";
      const idx = h.indexOf(":");
      if (idx > -1) headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim();
    }
    else if (t === "-d" || t === "--data" || t === "--data-raw" || t === "--data-binary") { data = tokens[++i]; }
    else if (t === "-u" || t === "--user") { i++; }
    else if (t.startsWith("-")) { /* 그 외 플래그는 무시 */ }
    else if (!url) { url = t; }
  }

  if (!url) throw new Error("URL을 찾을 수 없습니다.");
  if (!method) method = data ? "POST" : "GET";

  let bodyLine = "";
  if (data !== null) {
    let looksJson = false;
    try { JSON.parse(data); looksJson = true; } catch (e) {}
    bodyLine = looksJson ? `JSON.stringify(${data})` : JSON.stringify(data);
  }

  const lines = [`fetch(${JSON.stringify(url)}, {`, `  method: ${JSON.stringify(method)},`];
  if (Object.keys(headers).length) {
    lines.push(`  headers: ${JSON.stringify(headers, null, 2).split("\n").join("\n  ")},`);
  }
  if (data !== null) lines.push(`  body: ${bodyLine},`);
  lines.push("})", "  .then((res) => res.json())", "  .then((data) => console.log(data));");
  return lines.join("\n");
}

function initCurlConverter() {
  document.getElementById("curl-convert-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("curl-error");
    errorEl.hidden = true;
    try {
      document.getElementById("curl-output").value = curlToFetch(document.getElementById("curl-input").value);
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = e.message;
    }
  });

  document.getElementById("curl-copy-btn").addEventListener("click", async (e) => {
    const output = document.getElementById("curl-output").value;
    if (!output) return;
    if (await copyText(output)) flashCopied(e.target, "결과 복사");
  });
}

/* ---------- 파비콘 생성기 ---------- */
function initFaviconGenerator() {
  const input = document.getElementById("fav-input");
  const hint = document.getElementById("fav-hint");
  const errorEl = document.getElementById("fav-error");
  const resultEl = document.getElementById("fav-result");
  const downloadsEl = document.getElementById("fav-downloads");

  document.getElementById("fav-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    errorEl.hidden = true;
    resultEl.hidden = true;
    downloadsEl.hidden = true;

    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      errorEl.hidden = false;
      errorEl.textContent = "이미지 파일만 업로드할 수 있습니다.";
      return;
    }

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        [16, 32, 48].forEach((size) => {
          const canvas = document.getElementById(`fav-${size}`);
          canvas.getContext("2d").drawImage(img, 0, 0, size, size);
        });
        const canvas180 = document.getElementById("fav-180");
        canvas180.getContext("2d").drawImage(img, 0, 0, 60, 60);

        const dl32 = document.createElement("canvas");
        dl32.width = 32; dl32.height = 32;
        dl32.getContext("2d").drawImage(img, 0, 0, 32, 32);
        document.getElementById("fav-dl-32").href = dl32.toDataURL("image/png");

        const dl180 = document.createElement("canvas");
        dl180.width = 180; dl180.height = 180;
        dl180.getContext("2d").drawImage(img, 0, 0, 180, 180);
        document.getElementById("fav-dl-180").href = dl180.toDataURL("image/png");

        hint.textContent = file.name;
        resultEl.hidden = false;
        downloadsEl.hidden = false;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- .gitignore 생성기 ---------- */
const GITIGNORE_TEMPLATES = {
  node: "# Node\nnode_modules/\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\ndist/\nbuild/\n.env\n.env.local",
  python: "# Python\n__pycache__/\n*.py[cod]\n*$py.class\n.venv/\nvenv/\n.env\n*.egg-info/\ndist/\nbuild/",
  react: "# React\nbuild/\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local",
  java: "# Java\n*.class\n*.jar\n*.war\ntarget/\n.mvn/\nhs_err_pid*",
  go: "# Go\n*.exe\n*.exe~\n*.dll\n*.so\n*.dylib\n*.test\n*.out\nvendor/",
  macos: "# macOS\n.DS_Store\n.AppleDouble\n.LSOverride\n._*",
  windows: "# Windows\nThumbs.db\nDesktop.ini\n$RECYCLE.BIN/",
  vscode: "# VSCode\n.vscode/*\n!.vscode/extensions.json",
  intellij: "# IntelliJ\n.idea/\n*.iml\n*.iws",
};

function initGitignoreGenerator() {
  document.getElementById("gi-generate-btn").addEventListener("click", () => {
    const checked = Array.from(document.querySelectorAll("#gi-options input:checked")).map((cb) => cb.value);
    document.getElementById("gi-output").value = checked.length
      ? checked.map((key) => GITIGNORE_TEMPLATES[key]).join("\n\n")
      : "";
  });

  document.getElementById("gi-copy-btn").addEventListener("click", async (e) => {
    const output = document.getElementById("gi-output").value;
    if (!output) return;
    if (await copyText(output)) flashCopied(e.target, "결과 복사");
  });
}

/* ---------- 한영타 변환기 (2벌식 자판 매핑) ---------- */
const CHO_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG_LIST = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG_LIST = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const VOWEL_COMBOS = { 'ㅗㅏ':'ㅘ', 'ㅗㅐ':'ㅙ', 'ㅗㅣ':'ㅚ', 'ㅜㅓ':'ㅝ', 'ㅜㅔ':'ㅞ', 'ㅜㅣ':'ㅟ', 'ㅡㅣ':'ㅢ' };
const JONG_COMBOS = { 'ㄱㅅ':'ㄳ', 'ㄴㅈ':'ㄵ', 'ㄴㅎ':'ㄶ', 'ㄹㄱ':'ㄺ', 'ㄹㅁ':'ㄻ', 'ㄹㅂ':'ㄼ', 'ㄹㅅ':'ㄽ', 'ㄹㅌ':'ㄾ', 'ㄹㅍ':'ㄿ', 'ㄹㅎ':'ㅀ', 'ㅂㅅ':'ㅄ' };
const VOWEL_SPLIT = Object.fromEntries(Object.entries(VOWEL_COMBOS).map(([pair, combo]) => [combo, pair]));
const JONG_SPLIT = Object.fromEntries(Object.entries(JONG_COMBOS).map(([pair, combo]) => [combo, pair]));
const KEY_TO_JAMO = {
  q:'ㅂ', Q:'ㅃ', w:'ㅈ', W:'ㅉ', e:'ㄷ', E:'ㄸ', r:'ㄱ', R:'ㄲ', t:'ㅅ', T:'ㅆ',
  y:'ㅛ', u:'ㅕ', i:'ㅑ', o:'ㅐ', O:'ㅒ', p:'ㅔ', P:'ㅖ',
  a:'ㅁ', s:'ㄴ', d:'ㅇ', f:'ㄹ', g:'ㅎ', h:'ㅗ', j:'ㅓ', k:'ㅏ', l:'ㅣ',
  z:'ㅋ', x:'ㅌ', c:'ㅊ', v:'ㅍ', b:'ㅠ', n:'ㅜ', m:'ㅡ',
};
const JAMO_TO_KEY = Object.fromEntries(Object.entries(KEY_TO_JAMO).map(([k, v]) => [v, k]));

function keysToJamoArray(str) {
  return Array.from(str).map((ch) => KEY_TO_JAMO[ch] || ch);
}

function jamoArrayToHangul(jamoArr) {
  let result = "";
  let cho = null, jung = null, jong = null;

  function flush() {
    if (cho !== null && jung !== null) {
      const choIdx = CHO_LIST.indexOf(cho);
      const jungIdx = JUNG_LIST.indexOf(jung);
      const jongIdx = jong ? JONG_LIST.indexOf(jong) : 0;
      if (choIdx >= 0 && jungIdx >= 0 && jongIdx >= 0) {
        result += String.fromCharCode(0xac00 + (choIdx * 21 + jungIdx) * 28 + jongIdx);
      } else {
        result += cho + jung + (jong || "");
      }
    } else if (cho !== null) result += cho;
    else if (jung !== null) result += jung;
    cho = null; jung = null; jong = null;
  }

  for (let i = 0; i < jamoArr.length; i++) {
    const ch = jamoArr[i];
    const isCho = CHO_LIST.includes(ch);
    const isJung = JUNG_LIST.includes(ch);

    if (!isCho && !isJung) { flush(); result += ch; continue; }

    if (isJung) {
      if (jung === null) { jung = ch; continue; }
      const combo = VOWEL_COMBOS[jung + ch];
      if (combo && jong === null) { jung = combo; continue; }
      flush();
      jung = ch;
      continue;
    }

    // isCho
    if (cho === null) { cho = ch; continue; }
    if (jung === null) { flush(); cho = ch; continue; }
    const nextCh = jamoArr[i + 1];
    const nextIsJung = nextCh !== undefined && JUNG_LIST.includes(nextCh);
    if (jong === null) {
      if (nextIsJung) { flush(); cho = ch; }
      else jong = ch;
      continue;
    }
    const combo = JONG_COMBOS[jong + ch];
    if (combo && !nextIsJung) { jong = combo; continue; }
    flush();
    cho = ch;
  }
  flush();
  return result;
}

function hangulToJamoArray(str) {
  const jamoArr = [];
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const cho = CHO_LIST[Math.floor(offset / (21 * 28))];
      const jung = JUNG_LIST[Math.floor((offset % (21 * 28)) / 28)];
      const jong = JONG_LIST[offset % 28];
      jamoArr.push(cho);
      jamoArr.push(...(VOWEL_SPLIT[jung] ? VOWEL_SPLIT[jung].split("") : [jung]));
      if (jong) jamoArr.push(...(JONG_SPLIT[jong] ? JONG_SPLIT[jong].split("") : [jong]));
    } else jamoArr.push(ch);
  }
  return jamoArr;
}

function initHangulTypoFix() {
  const input = document.getElementById("hgt-input");
  const output = document.getElementById("hgt-output");

  document.getElementById("hgt-to-korean-btn").addEventListener("click", () => {
    output.value = jamoArrayToHangul(keysToJamoArray(input.value));
  });
  document.getElementById("hgt-to-english-btn").addEventListener("click", () => {
    output.value = hangulToJamoArray(input.value).map((j) => JAMO_TO_KEY[j] || j).join("");
  });
  document.getElementById("hgt-copy-btn").addEventListener("click", async (e) => {
    if (!output.value) return;
    if (await copyText(output.value)) flashCopied(e.target, "결과 복사");
  });
}

/* ---------- 아이피 조회 ---------- */
function initIpLookup() {
  document.getElementById("ip-lookup-btn").addEventListener("click", async () => {
    const errorEl = document.getElementById("ip-error");
    const resultEl = document.getElementById("ip-result");
    errorEl.hidden = true;
    resultEl.hidden = true;
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      if (!res.ok) throw new Error("조회 실패");
      const data = await res.json();
      document.getElementById("ip-value").textContent = data.ip;
      resultEl.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "IP 조회에 실패했습니다. 네트워크 상태를 확인해주세요.";
    }
  });
}

/* ---------- 바코드 생성기 (Code 39) ---------- */
const CODE39_PATTERNS = {
  '0':'NNNWWNWNN','1':'WNNWNNNNW','2':'NNWWNNNNW','3':'WNWWNNNNN','4':'NNNWWNNNW',
  '5':'WNNWWNNNN','6':'NNWWWNNNN','7':'NNNWNNWNW','8':'WNNWNNWNN','9':'NNWWNNWNN',
  'A':'WNNNNWNNW','B':'NNWNNWNNW','C':'WNWNNWNNN','D':'NNNNWWNNW','E':'WNNNWWNNN',
  'F':'NNWNWWNNN','G':'NNNNNWWNW','H':'WNNNNWWNN','I':'NNWNNWWNN','J':'NNNNWWWNN',
  'K':'WNNNNNNWW','L':'NNWNNNNWW','M':'WNWNNNNWN','N':'NNNNWNNWW','O':'WNNNWNNWN',
  'P':'NNWNWNNWN','Q':'NNNNNNWWW','R':'WNNNNNWWN','S':'NNWNNNWWN','T':'NNNNWNWWN',
  'U':'WWNNNNNNW','V':'NWWNNNNNW','W':'WWWNNNNNN','X':'NWNNWNNNW','Y':'WWNNWNNNN',
  'Z':'NWWNWNNNN','-':'NWNNNNWNW','.':'WWNNNNWNN',' ':'NWWNNNWNN','$':'NWNWNWNNN',
  '/':'NWNWNNNWN','+':'NWNNNWNWN','%':'NNNWNWNWN','*':'NWNNWNWNN',
};

function drawCode39(canvas, text) {
  const upper = text.toUpperCase();
  const chars = ['*', ...upper.split(""), '*'];
  chars.forEach((c) => {
    if (!CODE39_PATTERNS[c]) throw new Error(`'${c}'는 지원하지 않는 문자입니다.`);
  });

  const narrow = 2, wide = 6, height = 80, quiet = 10;
  let totalWidth = quiet * 2;
  chars.forEach((c) => {
    const pattern = CODE39_PATTERNS[c];
    for (const p of pattern) totalWidth += p === "W" ? wide : narrow;
    totalWidth += narrow;
  });

  canvas.width = totalWidth;
  canvas.height = height + 30;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";

  let x = quiet;
  chars.forEach((c) => {
    const pattern = CODE39_PATTERNS[c];
    for (let i = 0; i < pattern.length; i++) {
      const w = pattern[i] === "W" ? wide : narrow;
      if (i % 2 === 0) ctx.fillRect(x, 0, w, height);
      x += w;
    }
    x += narrow;
  });

  ctx.font = "14px monospace";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, height + 20);
}

function initBarcodeGenerator() {
  const canvas = document.getElementById("bar-canvas");
  const downloadLink = document.getElementById("bar-download");

  document.getElementById("bar-generate-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("bar-error");
    errorEl.hidden = true;
    downloadLink.hidden = true;
    const value = document.getElementById("bar-input").value.trim();
    if (!value) return;
    try {
      drawCode39(canvas, value);
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = e.message;
    }
  });
}

/* ---------- SMI→SRT 자막 변환기 ---------- */
function parseSmiToSrt(smiText) {
  const syncRegex = /<sync\s+start\s*=\s*["']?(\d+)["']?[^>]*>/gi;
  const matches = [...smiText.matchAll(syncRegex)];
  if (matches.length === 0) throw new Error("SYNC 태그를 찾을 수 없습니다. 올바른 SMI 파일인지 확인해주세요.");

  const blocks = matches.map((m, i) => ({
    start: Number(m[1]),
    raw: smiText.slice(m.index + m[0].length, i + 1 < matches.length ? matches[i + 1].index : smiText.length),
  }));

  function cleanText(raw) {
    let t = raw.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
    t = t.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"');
    return t.split("\n").map((l) => l.trim()).filter(Boolean).join("\n").trim();
  }

  function formatSrtTime(ms) {
    const pad = (n, l) => String(n).padStart(l, "0");
    return `${pad(Math.floor(ms / 3600000), 2)}:${pad(Math.floor((ms % 3600000) / 60000), 2)}:${pad(Math.floor((ms % 60000) / 1000), 2)},${pad(ms % 1000, 3)}`;
  }

  const entries = [];
  for (let i = 0; i < blocks.length; i++) {
    const text = cleanText(blocks[i].raw);
    if (!text) continue;
    entries.push({
      start: blocks[i].start,
      end: i + 1 < blocks.length ? blocks[i + 1].start : blocks[i].start + 3000,
      text,
    });
  }
  if (entries.length === 0) throw new Error("변환할 자막 텍스트를 찾지 못했습니다.");

  return entries.map((e, idx) => `${idx + 1}\n${formatSrtTime(e.start)} --> ${formatSrtTime(e.end)}\n${e.text}\n`).join("\n");
}

function initSmiToSrt() {
  const input = document.getElementById("smi-input");
  const hint = document.getElementById("smi-hint");
  const errorEl = document.getElementById("smi-error");
  const resultGroup = document.getElementById("smi-result-group");
  const output = document.getElementById("smi-output");
  const downloadLink = document.getElementById("smi-download");

  document.getElementById("smi-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    errorEl.hidden = true;
    resultGroup.hidden = true;
    downloadLink.hidden = true;

    const file = input.files[0];
    if (!file) return;
    hint.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const srt = parseSmiToSrt(e.target.result);
        output.value = srt;
        resultGroup.hidden = false;
        const blob = new Blob([srt], { type: "text/plain" });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.hidden = false;
      } catch (err) {
        errorEl.hidden = false;
        errorEl.textContent = err.message;
      }
    };
    reader.readAsText(file, "utf-8");
  });
}

/* ---------- 타자 속도 테스트 ---------- */
const TYPING_SAMPLES = [
  "오늘도 좋은 하루 되세요.",
  "빠르고 정확하게 타이핑 연습을 해봅시다.",
  "지금 이 순간에 집중하는 것이 가장 중요합니다.",
  "꾸준한 연습이 실력을 만듭니다.",
  "새로운 것을 배우는 즐거움을 느껴보세요.",
];

function initTypingSpeedTest() {
  const sampleEl = document.getElementById("tst-sample");
  const input = document.getElementById("tst-input");
  const resultEl = document.getElementById("tst-result");
  let sample = "";
  let startTime = null;
  let started = false;

  function finish() {
    const elapsedMin = (Date.now() - startTime) / 60000;
    const typed = input.value;
    let correct = 0;
    for (let i = 0; i < typed.length && i < sample.length; i++) {
      if (typed[i] === sample[i]) correct++;
    }
    const cpm = Math.round(typed.length / Math.max(elapsedMin, 0.001));
    const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 0;
    document.getElementById("tst-cpm-value").textContent = `${cpm}타`;
    document.getElementById("tst-accuracy-value").textContent = `${accuracy}%`;
    resultEl.hidden = false;
    input.disabled = true;
    started = false;
  }

  input.addEventListener("input", () => {
    if (!started) return;
    if (!startTime) startTime = Date.now();
    if (input.value.length >= sample.length) finish();
  });

  document.getElementById("tst-start-btn").addEventListener("click", () => {
    sample = TYPING_SAMPLES[Math.floor(Math.random() * TYPING_SAMPLES.length)];
    sampleEl.textContent = sample;
    input.value = "";
    input.disabled = false;
    input.focus();
    startTime = null;
    started = true;
    resultEl.hidden = true;
  });
}

/* ---------- 반응속도 테스트 ---------- */
function initReactionSpeedTest() {
  const box = document.getElementById("rst-box");
  const resultEl = document.getElementById("rst-result");
  const valueEl = document.getElementById("rst-value");
  let state = "idle";
  let timeoutId = null;
  let goTime = 0;

  function setBox(text, bg, color) {
    box.textContent = text;
    box.style.background = bg;
    box.style.color = color;
  }

  box.addEventListener("click", () => {
    if (state === "idle" || state === "result") {
      state = "waiting";
      resultEl.hidden = true;
      setBox("초록색이 되면 클릭하세요...", "var(--card-elevated)", "var(--text-muted)");
      timeoutId = setTimeout(() => {
        state = "go";
        goTime = Date.now();
        setBox("지금 클릭!", "#2c9e44", "#fff");
      }, 1000 + Math.random() * 3000);
    } else if (state === "waiting") {
      clearTimeout(timeoutId);
      state = "idle";
      setBox("너무 빨랐습니다! 다시 클릭해서 시작하세요", "var(--card-elevated)", "var(--negative)");
    } else if (state === "go") {
      valueEl.textContent = `${Date.now() - goTime} ms`;
      resultEl.hidden = false;
      state = "result";
      setBox("다시 시도하려면 클릭하세요", "var(--card-elevated)", "var(--text-muted)");
    }
  });
}

/* ---------- CPS 테스트 ---------- */
function initCpsTest() {
  const box = document.getElementById("cps-box");
  const countEl = document.getElementById("cps-count");
  const timerEl = document.getElementById("cps-timer");
  const resultEl = document.getElementById("cps-result");
  const DURATION = 5000;
  let clicks = 0;
  let startTime = null;
  let running = false;
  let intervalId = null;

  function finish() {
    clearInterval(intervalId);
    running = false;
    document.getElementById("cps-value").textContent = `${(clicks / (DURATION / 1000)).toFixed(2)} 클릭/초`;
    resultEl.hidden = false;
    timerEl.textContent = "클릭해서 다시 시작";
  }

  box.addEventListener("click", () => {
    if (!running) {
      running = true;
      clicks = 1;
      startTime = Date.now();
      countEl.textContent = clicks;
      resultEl.hidden = true;
      intervalId = setInterval(() => {
        const remain = Math.max(0, DURATION - (Date.now() - startTime));
        timerEl.textContent = `${(remain / 1000).toFixed(1)}초 남음`;
        if (remain <= 0) finish();
      }, 100);
      return;
    }
    clicks++;
    countEl.textContent = clicks;
  });
}

/* ---------- 이미지 형식 변환기 (Image to JPG/PNG/WebP 공용) ---------- */
function initImageFormatConverter(prefix, mimeType, ext) {
  const input = document.getElementById(`${prefix}-input`);
  const hint = document.getElementById(`${prefix}-hint`);
  const errorEl = document.getElementById(`${prefix}-error`);
  const previewWrap = document.getElementById(`${prefix}-preview-wrap`);
  const preview = document.getElementById(`${prefix}-preview`);
  const downloadLink = document.getElementById(`${prefix}-download`);

  document.getElementById(`${prefix}-select-btn`).addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    errorEl.hidden = true;
    previewWrap.hidden = true;
    downloadLink.hidden = true;
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      errorEl.hidden = false;
      errorEl.textContent = "이미지 파일만 업로드할 수 있습니다.";
      return;
    }
    hint.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (mimeType === "image/jpeg") {
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(mimeType, 0.92);
        preview.src = dataUrl;
        previewWrap.hidden = false;
        downloadLink.href = dataUrl;
        downloadLink.download = file.name.replace(/\.[^.]+$/, "") + "." + ext;
        downloadLink.hidden = false;
      };
      img.onerror = () => {
        errorEl.hidden = false;
        errorEl.textContent = "이미지를 불러올 수 없습니다.";
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- 사진 합치기 ---------- */
function initImageMerge() {
  const input = document.getElementById("merge-input");
  const hint = document.getElementById("merge-hint");
  const errorEl = document.getElementById("merge-error");
  const previewWrap = document.getElementById("merge-preview-wrap");
  const preview = document.getElementById("merge-preview");
  const downloadLink = document.getElementById("merge-download");
  initSegmented("merge-direction");

  document.getElementById("merge-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    errorEl.hidden = true;
    previewWrap.hidden = true;
    downloadLink.hidden = true;
    const files = Array.from(input.files);
    if (files.length < 2) {
      errorEl.hidden = false;
      errorEl.textContent = "사진을 2장 이상 선택해주세요.";
      return;
    }
    hint.textContent = `${files.length}장 선택됨`;

    const loadImg = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    try {
      const imgs = await Promise.all(files.map(loadImg));
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (getSegmentedValue("merge-direction") === "vertical") {
        const width = Math.max(...imgs.map((i) => i.naturalWidth));
        canvas.width = width;
        canvas.height = imgs.reduce((sum, i) => sum + i.naturalHeight * (width / i.naturalWidth), 0);
        let y = 0;
        imgs.forEach((img) => {
          const h = img.naturalHeight * (width / img.naturalWidth);
          ctx.drawImage(img, 0, y, width, h);
          y += h;
        });
      } else {
        const height = Math.max(...imgs.map((i) => i.naturalHeight));
        canvas.height = height;
        canvas.width = imgs.reduce((sum, i) => sum + i.naturalWidth * (height / i.naturalHeight), 0);
        let x = 0;
        imgs.forEach((img) => {
          const w = img.naturalWidth * (height / img.naturalHeight);
          ctx.drawImage(img, x, 0, w, height);
          x += w;
        });
      }
      const dataUrl = canvas.toDataURL("image/png");
      preview.src = dataUrl;
      previewWrap.hidden = false;
      downloadLink.href = dataUrl;
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "이미지를 불러오는 중 오류가 발생했습니다.";
    }
  });
}

/* ---------- 이미지 Base64 변환 ---------- */
function initImageBase64() {
  const input = document.getElementById("ib64-input");
  const hint = document.getElementById("ib64-hint");
  const output = document.getElementById("ib64-output");
  const previewWrap = document.getElementById("ib64-preview-wrap");
  const preview = document.getElementById("ib64-preview");

  document.getElementById("ib64-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    hint.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      output.value = e.target.result;
      preview.src = e.target.result;
      previewWrap.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("ib64-copy-btn").addEventListener("click", async (e) => {
    if (!output.value) return;
    if (await copyText(output.value)) flashCopied(e.target, "Base64 복사");
  });

  document.getElementById("ib64-restore-btn").addEventListener("click", () => {
    const val = output.value.trim();
    if (!val) return;
    preview.src = val.startsWith("data:") ? val : `data:image/png;base64,${val}`;
    previewWrap.hidden = false;
  });
}

/* ---------- 사진 날짜 표시 ---------- */
function initPhotoDateStamp() {
  const input = document.getElementById("pds-input");
  const hint = document.getElementById("pds-hint");
  const dateInput = document.getElementById("pds-date");
  const errorEl = document.getElementById("pds-error");
  const previewWrap = document.getElementById("pds-preview-wrap");
  const canvas = document.getElementById("pds-canvas");
  const downloadLink = document.getElementById("pds-download");
  let loadedImg = null;

  const today = new Date();
  dateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  document.getElementById("pds-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    hint.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { loadedImg = img; };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("pds-apply-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    if (!loadedImg) {
      errorEl.hidden = false;
      errorEl.textContent = "사진을 먼저 선택해주세요.";
      return;
    }
    canvas.width = loadedImg.naturalWidth;
    canvas.height = loadedImg.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(loadedImg, 0, 0);

    const dateVal = dateInput.value ? new Date(dateInput.value) : new Date();
    const text = `${dateVal.getFullYear()}. ${dateVal.getMonth() + 1}. ${dateVal.getDate()}`;
    const fontSize = Math.round(canvas.width * 0.045);
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    const pad = fontSize * 0.6;
    ctx.shadowColor = "rgba(255,140,0,0.7)";
    ctx.shadowBlur = fontSize * 0.3;
    ctx.fillStyle = "#ff9100";
    ctx.fillText(text, canvas.width - pad, canvas.height - pad);
    ctx.shadowBlur = 0;

    previewWrap.hidden = false;
    downloadLink.href = canvas.toDataURL("image/jpeg", 0.92);
    downloadLink.hidden = false;
  });
}

/* ---------- SVG 여백 제거 ---------- */
function initSvgTrim() {
  const input = document.getElementById("svgtrim-input");
  const hint = document.getElementById("svgtrim-hint");
  const errorEl = document.getElementById("svgtrim-error");
  const previewWrap = document.getElementById("svgtrim-preview-wrap");
  const preview = document.getElementById("svgtrim-preview");
  const downloadLink = document.getElementById("svgtrim-download");

  document.getElementById("svgtrim-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    errorEl.hidden = true;
    previewWrap.hidden = true;
    downloadLink.hidden = true;
    const file = input.files[0];
    if (!file) return;
    hint.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      const doc = new DOMParser().parseFromString(e.target.result, "image/svg+xml");
      const svgEl = doc.documentElement;
      if (svgEl.tagName !== "svg" || doc.getElementsByTagName("parsererror").length) {
        errorEl.hidden = false;
        errorEl.textContent = "올바른 SVG 파일이 아닙니다.";
        return;
      }

      const measureEl = svgEl.cloneNode(true);
      measureEl.style.position = "absolute";
      measureEl.style.left = "-99999px";
      measureEl.style.top = "0";
      document.body.appendChild(measureEl);

      let bbox;
      try {
        bbox = measureEl.getBBox();
      } catch (err) {
        bbox = null;
      }
      document.body.removeChild(measureEl);

      if (!bbox || bbox.width === 0 || bbox.height === 0) {
        errorEl.hidden = false;
        errorEl.textContent = "SVG 안에서 그려진 도형을 찾지 못했습니다.";
        return;
      }

      svgEl.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
      svgEl.removeAttribute("width");
      svgEl.removeAttribute("height");

      const svgString = new XMLSerializer().serializeToString(svgEl);

      preview.innerHTML = "";
      const previewSvg = svgEl.cloneNode(true);
      previewSvg.style.maxWidth = "200px";
      previewSvg.style.maxHeight = "200px";
      previewSvg.setAttribute("width", "200");
      previewSvg.setAttribute("height", "200");
      preview.appendChild(previewSvg);

      document.getElementById("svgtrim-size-value").textContent = `${Math.round(bbox.width)} × ${Math.round(bbox.height)}`;
      previewWrap.hidden = false;

      downloadLink.href = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml" }));
      downloadLink.hidden = false;
    };
    reader.readAsText(file);
  });
}

/* ---------- HEIC 뷰어 (heic2any CDN 지연 로딩) ---------- */
let heic2anyLoadPromise = null;
function loadHeic2Any() {
  if (heic2anyLoadPromise) return heic2anyLoadPromise;
  heic2anyLoadPromise = new Promise((resolve, reject) => {
    if (window.heic2any) return resolve(window.heic2any);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
    script.onload = () => resolve(window.heic2any);
    script.onerror = () => reject(new Error("변환 라이브러리를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
  return heic2anyLoadPromise;
}

function initHeicViewer() {
  const input = document.getElementById("heic-input");
  const hint = document.getElementById("heic-hint");
  const errorEl = document.getElementById("heic-error");
  const loadingEl = document.getElementById("heic-loading");
  const previewWrap = document.getElementById("heic-preview-wrap");
  const preview = document.getElementById("heic-preview");
  const downloadLink = document.getElementById("heic-download");

  document.getElementById("heic-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    errorEl.hidden = true;
    previewWrap.hidden = true;
    downloadLink.hidden = true;
    const file = input.files[0];
    if (!file) return;
    hint.textContent = file.name;
    loadingEl.hidden = false;
    try {
      const heic2any = await loadHeic2Any();
      const resultBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
      const url = URL.createObjectURL(Array.isArray(resultBlob) ? resultBlob[0] : resultBlob);
      preview.src = url;
      previewWrap.hidden = false;
      downloadLink.href = url;
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "HEIC 변환에 실패했습니다. 올바른 HEIC 파일인지 확인해주세요.";
    } finally {
      loadingEl.hidden = true;
    }
  });
}

/* ---------- 외부 라이브러리 지연 로딩 공용 헬퍼 ---------- */
const _scriptLoadCache = {};
function loadExternalScript(src, getGlobal) {
  if (getGlobal()) return Promise.resolve(getGlobal());
  if (_scriptLoadCache[src]) return _scriptLoadCache[src];
  _scriptLoadCache[src] = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(getGlobal());
    script.onerror = () => reject(new Error("외부 라이브러리를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
  return _scriptLoadCache[src];
}
function loadJsYaml() { return loadExternalScript("https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js", () => window.jsyaml); }
function loadMarked() { return loadExternalScript("https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js", () => window.marked); }
function loadDompurify() { return loadExternalScript("https://cdn.jsdelivr.net/npm/dompurify@3.0.9/dist/purify.min.js", () => window.DOMPurify); }
function loadJsZipLib() { return loadExternalScript("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js", () => window.JSZip); }
function loadXlsxLib() { return loadExternalScript("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js", () => window.XLSX); }

/* ---------- 텍스트 읽어주기(TTS) ---------- */
function initTts() {
  const input = document.getElementById("tts-input");
  const voiceSelect = document.getElementById("tts-voice");
  const rateInput = document.getElementById("tts-rate");
  const rateLabel = document.getElementById("tts-rate-label");
  const errorEl = document.getElementById("tts-error");

  if (!("speechSynthesis" in window)) {
    errorEl.hidden = false;
    errorEl.textContent = "이 브라우저는 음성 합성을 지원하지 않습니다.";
    document.getElementById("tts-play-btn").disabled = true;
    return;
  }

  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = "";
    voices.forEach((v, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });
    const koIdx = voices.findIndex((v) => v.lang.startsWith("ko"));
    if (koIdx >= 0) voiceSelect.value = koIdx;
  }
  populateVoices();
  speechSynthesis.onvoiceschanged = populateVoices;

  rateInput.addEventListener("input", () => {
    rateLabel.textContent = `${Number(rateInput.value).toFixed(1)}x`;
  });

  document.getElementById("tts-play-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    if (!input.value.trim()) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(input.value);
    const voices = speechSynthesis.getVoices();
    const selected = voices[Number(voiceSelect.value)];
    if (selected) utter.voice = selected;
    utter.rate = Number(rateInput.value);
    speechSynthesis.speak(utter);
  });

  document.getElementById("tts-stop-btn").addEventListener("click", () => speechSynthesis.cancel());
}

/* ---------- 엑셀 파일 합치기 ---------- */
function initExcelMerge() {
  const input = document.getElementById("xlm-input");
  const hint = document.getElementById("xlm-hint");
  const errorEl = document.getElementById("xlm-error");
  const loadingEl = document.getElementById("xlm-loading");
  const downloadLink = document.getElementById("xlm-download");

  document.getElementById("xlm-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    errorEl.hidden = true;
    downloadLink.hidden = true;
    const files = Array.from(input.files);
    if (files.length < 2) {
      errorEl.hidden = false;
      errorEl.textContent = "파일을 2개 이상 선택해주세요.";
      return;
    }
    hint.textContent = `${files.length}개 파일 선택됨`;
    loadingEl.hidden = false;
    try {
      const XLSX = await loadXlsxLib();
      const outWb = XLSX.utils.book_new();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        let sheetName = (file.name.replace(/\.[^.]+$/, "") || `Sheet${i + 1}`).slice(0, 28);
        let uniqueName = sheetName, n = 1;
        while (outWb.SheetNames.includes(uniqueName)) uniqueName = `${sheetName}_${n++}`;
        XLSX.utils.book_append_sheet(outWb, sheet, uniqueName);
      }
      const wbout = XLSX.write(outWb, { type: "array", bookType: "xlsx" });
      downloadLink.href = URL.createObjectURL(new Blob([wbout], { type: "application/octet-stream" }));
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "파일을 합치는 중 오류가 발생했습니다: " + e.message;
    } finally {
      loadingEl.hidden = true;
    }
  });
}

/* ---------- YAML/JSON/TOML 변환기 ---------- */
function parseToml(text) {
  const root = {};
  let current = root;
  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) return;
    const sectionMatch = line.match(/^\[([^\[\]]+)\]$/);
    if (sectionMatch) {
      current = root;
      sectionMatch[1].split(".").map((s) => s.trim()).forEach((key) => {
        if (!current[key] || typeof current[key] !== "object") current[key] = {};
        current = current[key];
      });
      return;
    }
    const kvMatch = line.match(/^([^=]+)=(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim().replace(/^["']|["']$/g, "");
      current[key] = parseTomlValue(kvMatch[2].trim());
    }
  });
  return root;
}
function parseTomlValue(raw) {
  if (/^".*"$/.test(raw) || /^'.*'$/.test(raw)) return raw.slice(1, -1);
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
  if (/^-?\d+\.\d+$/.test(raw)) return parseFloat(raw);
  if (raw.startsWith("[") && raw.endsWith("]")) {
    const inner = raw.slice(1, -1).trim();
    return inner ? inner.split(",").map((v) => parseTomlValue(v.trim())) : [];
  }
  return raw;
}
function tomlValueToString(v) {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return `[${v.map(tomlValueToString).join(", ")}]`;
  return JSON.stringify(v);
}
function stringifyToml(obj, prefix) {
  prefix = prefix || "";
  const lines = [];
  const scalarEntries = [], tableEntries = [];
  Object.entries(obj).forEach(([k, v]) => {
    (v !== null && typeof v === "object" && !Array.isArray(v) ? tableEntries : scalarEntries).push([k, v]);
  });
  scalarEntries.forEach(([k, v]) => lines.push(`${k} = ${tomlValueToString(v)}`));
  tableEntries.forEach(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    lines.push("", `[${path}]`, stringifyToml(v, path));
  });
  return lines.join("\n").trim();
}

async function parseByFormat(format, text) {
  if (format === "json") return JSON.parse(text);
  if (format === "yaml") return (await loadJsYaml()).load(text);
  if (format === "toml") return parseToml(text);
  throw new Error("지원하지 않는 형식입니다.");
}
async function stringifyByFormat(format, obj) {
  if (format === "json") return JSON.stringify(obj, null, 2);
  if (format === "yaml") return (await loadJsYaml()).dump(obj);
  if (format === "toml") return stringifyToml(obj);
  throw new Error("지원하지 않는 형식입니다.");
}

function initYamlJsonToml() {
  initSegmented("yjt-from");
  initSegmented("yjt-to");
  document.getElementById("yjt-convert-btn").addEventListener("click", async () => {
    const errorEl = document.getElementById("yjt-error");
    errorEl.hidden = true;
    const input = document.getElementById("yjt-input").value;
    if (!input.trim()) return;
    try {
      const obj = await parseByFormat(getSegmentedValue("yjt-from"), input);
      document.getElementById("yjt-output").value = await stringifyByFormat(getSegmentedValue("yjt-to"), obj);
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = `변환 오류: ${e.message}`;
    }
  });
}

/* ---------- XML 파서·포맷터 ---------- */
function prettyPrintXml(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("올바른 XML 형식이 아닙니다.");

  function serialize(node, depth) {
    const indent = "  ".repeat(depth);
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      return text ? indent + text + "\n" : "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const attrs = Array.from(node.attributes || []).map((a) => ` ${a.name}="${a.value}"`).join("");
    const children = Array.from(node.childNodes);
    const hasElementChildren = children.some((c) => c.nodeType === Node.ELEMENT_NODE);
    const textContent = children.filter((c) => c.nodeType === Node.TEXT_NODE).map((c) => c.textContent.trim()).join("");

    if (!hasElementChildren && textContent) return `${indent}<${node.tagName}${attrs}>${textContent}</${node.tagName}>\n`;
    if (children.length === 0) return `${indent}<${node.tagName}${attrs} />\n`;
    let result = `${indent}<${node.tagName}${attrs}>\n`;
    children.forEach((child) => { result += serialize(child, depth + 1); });
    result += `${indent}</${node.tagName}>\n`;
    return result;
  }
  return serialize(doc.documentElement, 0).trim();
}

function initXmlParser() {
  document.getElementById("xml-format-btn").addEventListener("click", () => {
    const errorEl = document.getElementById("xml-error");
    errorEl.hidden = true;
    const input = document.getElementById("xml-input").value;
    if (!input.trim()) return;
    try {
      document.getElementById("xml-output").value = prettyPrintXml(input);
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = e.message;
    }
  });
}

/* ---------- JSON↔XML 변환기 ---------- */
function jsonToXml(obj, rootName) {
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function buildNode(key, value) {
    if (Array.isArray(value)) return value.map((v) => buildNode(key, v)).join("");
    if (value !== null && typeof value === "object") {
      return `<${key}>${Object.entries(value).map(([k, v]) => buildNode(k, v)).join("")}</${key}>`;
    }
    return `<${key}>${esc(value)}</${key}>`;
  }
  return `<${rootName}>${Object.entries(obj).map(([k, v]) => buildNode(k, v)).join("")}</${rootName}>`;
}

function xmlToJson(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("올바른 XML 형식이 아닙니다.");
  function nodeToObj(node) {
    const children = Array.from(node.children);
    if (children.length === 0) return node.textContent;
    const obj = {};
    children.forEach((child) => {
      const value = nodeToObj(child);
      if (obj[child.tagName] !== undefined) {
        if (!Array.isArray(obj[child.tagName])) obj[child.tagName] = [obj[child.tagName]];
        obj[child.tagName].push(value);
      } else obj[child.tagName] = value;
    });
    return obj;
  }
  return { [doc.documentElement.tagName]: nodeToObj(doc.documentElement) };
}

function initJsonXml() {
  const errorEl = document.getElementById("jx-error");
  document.getElementById("jx-to-xml-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    try {
      const obj = JSON.parse(document.getElementById("jx-input").value);
      const keys = Object.keys(obj);
      const rootName = keys.length === 1 ? keys[0] : "root";
      const body = keys.length === 1 ? obj[rootName] : obj;
      document.getElementById("jx-output").value = prettyPrintXml(jsonToXml(body, rootName));
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = `변환 오류: ${e.message}`;
    }
  });
  document.getElementById("jx-to-json-btn").addEventListener("click", () => {
    errorEl.hidden = true;
    try {
      document.getElementById("jx-output").value = JSON.stringify(xmlToJson(document.getElementById("jx-input").value), null, 2);
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = `변환 오류: ${e.message}`;
    }
  });
}

/* ---------- EPUB→TXT 변환 ---------- */
function stripHtmlToText(html) {
  const withBreaks = html
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "$&\n")
    .replace(/<br\s*\/?>/gi, "\n");
  const doc = new DOMParser().parseFromString(withBreaks, "text/html");
  return doc.body.textContent.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function epubToText(file) {
  const JSZip = await loadJsZipLib();
  const zip = await JSZip.loadAsync(file);

  const containerEntry = zip.file("META-INF/container.xml");
  if (!containerEntry) throw new Error("올바른 EPUB 파일이 아닙니다.");
  const containerDoc = new DOMParser().parseFromString(await containerEntry.async("string"), "application/xml");
  const opfPath = containerDoc.querySelector("rootfile").getAttribute("full-path");
  const opfDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";

  const opfDoc = new DOMParser().parseFromString(await zip.file(opfPath).async("string"), "application/xml");
  const manifest = {};
  opfDoc.querySelectorAll("manifest > item").forEach((item) => {
    manifest[item.getAttribute("id")] = item.getAttribute("href");
  });
  const spineIds = Array.from(opfDoc.querySelectorAll("spine > itemref")).map((el) => el.getAttribute("idref"));

  let fullText = "";
  for (const id of spineIds) {
    const href = manifest[id];
    if (!href) continue;
    const entry = zip.file(opfDir + href);
    if (!entry) continue;
    const text = stripHtmlToText(await entry.async("string"));
    if (text) fullText += text + "\n\n";
  }
  return fullText.trim();
}

function initEpubToTxt() {
  const input = document.getElementById("epub-input");
  const hint = document.getElementById("epub-hint");
  const errorEl = document.getElementById("epub-error");
  const loadingEl = document.getElementById("epub-loading");
  const resultGroup = document.getElementById("epub-result-group");
  const output = document.getElementById("epub-output");
  const downloadLink = document.getElementById("epub-download");

  document.getElementById("epub-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    errorEl.hidden = true;
    resultGroup.hidden = true;
    downloadLink.hidden = true;
    const file = input.files[0];
    if (!file) return;
    hint.textContent = file.name;
    loadingEl.hidden = false;
    try {
      const text = await epubToText(file);
      if (!text) throw new Error("텍스트를 추출하지 못했습니다.");
      output.value = text;
      resultGroup.hidden = false;
      downloadLink.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
      downloadLink.download = file.name.replace(/\.[^.]+$/, "") + ".txt";
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "EPUB 변환에 실패했습니다: " + e.message;
    } finally {
      loadingEl.hidden = true;
    }
  });
}

/* ---------- MD 파일 뷰어 ---------- */
function initMdViewer() {
  const input = document.getElementById("mdv-input");
  const hint = document.getElementById("mdv-hint");
  const source = document.getElementById("mdv-source");
  const errorEl = document.getElementById("mdv-error");
  const previewWrap = document.getElementById("mdv-preview-wrap");
  const preview = document.getElementById("mdv-preview");

  document.getElementById("mdv-select-btn").addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    hint.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => { source.value = e.target.result; };
    reader.readAsText(file, "utf-8");
  });

  document.getElementById("mdv-render-btn").addEventListener("click", async () => {
    errorEl.hidden = true;
    previewWrap.hidden = true;
    if (!source.value.trim()) return;
    try {
      const marked = await loadMarked();
      const DOMPurify = await loadDompurify();
      preview.innerHTML = DOMPurify.sanitize(marked.parse(source.value));
      previewWrap.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "미리보기 렌더링에 실패했습니다: " + e.message;
    }
  });
}

/* ---------- 텍스트 비교 ---------- */
function diffLines(a, b) {
  const linesA = a.split("\n"), linesB = b.split("\n");
  const n = linesA.length, m = linesB.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = linesA[i] === linesB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (linesA[i] === linesB[j]) { result.push({ type: "same", text: linesA[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { result.push({ type: "removed", text: linesA[i] }); i++; }
    else { result.push({ type: "added", text: linesB[j] }); j++; }
  }
  while (i < n) { result.push({ type: "removed", text: linesA[i] }); i++; }
  while (j < m) { result.push({ type: "added", text: linesB[j] }); j++; }
  return result;
}

function initTextCompare() {
  document.getElementById("tc-compare-btn").addEventListener("click", () => {
    const diff = diffLines(document.getElementById("tc-input-a").value, document.getElementById("tc-input-b").value);
    const container = document.getElementById("tc-result");
    container.innerHTML = "";
    let added = 0, removed = 0;
    diff.forEach((d) => {
      const div = document.createElement("div");
      div.style.whiteSpace = "pre-wrap";
      div.style.padding = "2px 8px";
      div.style.fontFamily = "monospace";
      div.style.fontSize = "13px";
      if (d.type === "added") { div.style.background = "rgba(44,158,68,0.18)"; div.textContent = "+ " + d.text; added++; }
      else if (d.type === "removed") { div.style.background = "rgba(216,49,79,0.18)"; div.textContent = "- " + d.text; removed++; }
      else { div.style.color = "var(--text-muted)"; div.textContent = "  " + d.text; }
      container.appendChild(div);
    });
    document.getElementById("tc-stat").textContent = `추가 ${added}줄 · 삭제 ${removed}줄`;
    document.getElementById("tc-result-wrap").hidden = false;
  });
}

/* ---------- PDF 도구 공용 헬퍼 (pdf-lib + pdf.js 지연 로딩) ---------- */
function loadPdfLibExt() { return loadExternalScript("https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js", () => window.PDFLib); }
function loadFontkitExt() { return loadExternalScript("https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js", () => window.fontkit); }
let _koreanFontBytesPromise = null;
function loadKoreanFontBytes() {
  if (!_koreanFontBytesPromise) {
    _koreanFontBytesPromise = fetch("https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.0.18/files/noto-sans-kr-korean-400-normal.woff").then((r) => r.arrayBuffer());
  }
  return _koreanFontBytesPromise;
}
// 한글 등 비-WinAnsi 문자를 PDF에 그릴 때 쓰는 임베드 폰트(fontkit 등록 + Noto Sans KR 서브셋 임베드)
async function embedTextFont(pdfDoc) {
  const fontkit = await loadFontkitExt();
  pdfDoc.registerFontkit(fontkit);
  const fontBytes = await loadKoreanFontBytes();
  return pdfDoc.embedFont(fontBytes, { subset: true });
}
let _pdfjsWorkerConfigured = false;
async function loadPdfJsExt() {
  const lib = await loadExternalScript("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js", () => window.pdfjsLib);
  if (!_pdfjsWorkerConfigured) {
    lib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
    _pdfjsWorkerConfigured = true;
  }
  return lib;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function parsePageRanges(str, maxPage) {
  const set = new Set();
  str.split(",").forEach((part) => {
    part = part.trim();
    if (!part) return;
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((s) => parseInt(s.trim(), 10));
      for (let i = a; i <= b; i++) if (i >= 1 && i <= maxPage) set.add(i);
    } else {
      const n = parseInt(part, 10);
      if (n >= 1 && n <= maxPage) set.add(n);
    }
  });
  return set;
}

async function renderPdfPageToCanvas(page, scale) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  return canvas;
}

async function extractPdfFullText(pdfjsDoc) {
  let text = "";
  for (let i = 1; i <= pdfjsDoc.numPages; i++) {
    const page = await pdfjsDoc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n\n";
  }
  return text.trim();
}

/* ---------- PDF 합치기 ---------- */
function initPdfMerge() {
  const input = document.getElementById("pm-input");
  const hint = document.getElementById("pm-hint");
  const errorEl = document.getElementById("pm-error");
  const loadingEl = document.getElementById("pm-loading");
  const downloadLink = document.getElementById("pm-download");

  document.getElementById("pm-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    errorEl.hidden = true;
    downloadLink.hidden = true;
    const files = Array.from(input.files);
    if (files.length < 2) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF 파일을 2개 이상 선택해주세요.";
      return;
    }
    hint.textContent = `${files.length}개 파일 선택됨`;
    loadingEl.hidden = false;
    try {
      const { PDFDocument } = await loadPdfLibExt();
      const outDoc = await PDFDocument.create();
      for (const file of files) {
        const srcDoc = await PDFDocument.load(await file.arrayBuffer());
        const pages = await outDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        pages.forEach((p) => outDoc.addPage(p));
      }
      const outBytes = await outDoc.save();
      downloadLink.href = URL.createObjectURL(new Blob([outBytes], { type: "application/pdf" }));
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF를 합치는 중 오류가 발생했습니다: " + e.message;
    } finally {
      loadingEl.hidden = true;
    }
  });
}

/* ---------- PDF 용량 줄이기 ---------- */
function initPdfCompress() {
  const input = document.getElementById("pcps-input");
  const hint = document.getElementById("pcps-hint");
  const qualityInput = document.getElementById("pcps-quality");
  const qualityLabel = document.getElementById("pcps-quality-label");
  const errorEl = document.getElementById("pcps-error");
  const loadingEl = document.getElementById("pcps-loading");
  const resultEl = document.getElementById("pcps-result");
  const downloadLink = document.getElementById("pcps-download");
  let selectedFile = null;

  const Q_LABEL = { 1: "낮음(용량 최소)", 2: "보통", 3: "높음(화질 우선)" };
  const Q_SCALE = { 1: 0.8, 2: 1.2, 3: 1.8 };
  const Q_JPEG = { 1: 0.5, 2: 0.7, 3: 0.85 };

  qualityInput.addEventListener("input", () => { qualityLabel.textContent = Q_LABEL[qualityInput.value]; });

  document.getElementById("pcps-select-btn").addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    selectedFile = input.files[0];
    if (selectedFile) hint.textContent = selectedFile.name;
  });

  document.getElementById("pcps-run-btn").addEventListener("click", async () => {
    errorEl.hidden = true;
    resultEl.hidden = true;
    downloadLink.hidden = true;
    if (!selectedFile) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF 파일을 먼저 선택해주세요.";
      return;
    }
    loadingEl.hidden = false;
    try {
      const q = Number(qualityInput.value);
      const originalBytes = await selectedFile.arrayBuffer();
      const pdfjsLib = await loadPdfJsExt();
      const pdfjsDoc = await pdfjsLib.getDocument({ data: originalBytes.slice(0) }).promise;
      const { PDFDocument } = await loadPdfLibExt();
      const outDoc = await PDFDocument.create();

      for (let i = 1; i <= pdfjsDoc.numPages; i++) {
        const page = await pdfjsDoc.getPage(i);
        const baseViewport = page.getViewport({ scale: 1 });
        const canvas = await renderPdfPageToCanvas(page, Q_SCALE[q]);
        const jpegDataUrl = canvas.toDataURL("image/jpeg", Q_JPEG[q]);
        const jpegBytes = await (await fetch(jpegDataUrl)).arrayBuffer();
        const jpegImage = await outDoc.embedJpg(jpegBytes);
        const outPage = outDoc.addPage([baseViewport.width, baseViewport.height]);
        outPage.drawImage(jpegImage, { x: 0, y: 0, width: baseViewport.width, height: baseViewport.height });
      }

      const outBytes = await outDoc.save();
      document.getElementById("pcps-before-value").textContent = formatBytes(originalBytes.byteLength);
      document.getElementById("pcps-after-value").textContent = formatBytes(outBytes.byteLength);
      resultEl.hidden = false;
      document.getElementById("pcps-warn").hidden = outBytes.byteLength <= originalBytes.byteLength;
      downloadLink.href = URL.createObjectURL(new Blob([outBytes], { type: "application/pdf" }));
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "압축 중 오류가 발생했습니다: " + e.message;
    } finally {
      loadingEl.hidden = true;
    }
  });
}

/* ---------- PDF to JPG/PNG (공용) ---------- */
function initPdfToImageConverter(prefix, mimeType, ext) {
  const input = document.getElementById(`${prefix}-input`);
  const hint = document.getElementById(`${prefix}-hint`);
  const errorEl = document.getElementById(`${prefix}-error`);
  const loadingEl = document.getElementById(`${prefix}-loading`);
  const previewEl = document.getElementById(`${prefix}-preview`);
  const downloadLink = document.getElementById(`${prefix}-download`);

  document.getElementById(`${prefix}-select-btn`).addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    errorEl.hidden = true;
    downloadLink.hidden = true;
    previewEl.innerHTML = "";
    const file = input.files[0];
    if (!file) return;
    hint.textContent = file.name;
    loadingEl.hidden = false;
    try {
      const pdfjsLib = await loadPdfJsExt();
      const pdfDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const JSZip = await loadJsZipLib();
      const zip = new JSZip();
      const dataUrls = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const canvas = await renderPdfPageToCanvas(page, 1.5);
        const dataUrl = canvas.toDataURL(mimeType, 0.92);
        dataUrls.push(dataUrl);
        zip.file(`page-${i}.${ext}`, dataUrl.split(",")[1], { base64: true });

        const thumb = document.createElement("img");
        thumb.src = dataUrl;
        thumb.style.width = "80px";
        thumb.style.height = "auto";
        thumb.style.borderRadius = "6px";
        thumb.style.border = "1px solid var(--border)";
        previewEl.appendChild(thumb);
      }

      if (dataUrls.length === 1) {
        downloadLink.href = dataUrls[0];
        downloadLink.download = file.name.replace(/\.[^.]+$/, "") + "." + ext;
      } else {
        downloadLink.href = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
        downloadLink.download = file.name.replace(/\.[^.]+$/, "") + ".zip";
      }
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "변환 중 오류가 발생했습니다: " + e.message;
    } finally {
      loadingEl.hidden = true;
    }
  });
}
function initPdfToJpg() { initPdfToImageConverter("p2j", "image/jpeg", "jpg"); }
function initPdfToPng() { initPdfToImageConverter("p2p", "image/png", "png"); }

/* ---------- PDF 페이지 삭제 ---------- */
function initPdfDeletePage() {
  const input = document.getElementById("pdp-input");
  const hint = document.getElementById("pdp-hint");
  const errorEl = document.getElementById("pdp-error");
  const downloadLink = document.getElementById("pdp-download");
  let selectedFile = null;
  let totalPages = 0;

  document.getElementById("pdp-select-btn").addEventListener("click", () => input.click());
  input.addEventListener("change", async () => {
    selectedFile = input.files[0];
    downloadLink.hidden = true;
    errorEl.hidden = true;
    if (!selectedFile) return;
    try {
      const { PDFDocument } = await loadPdfLibExt();
      const doc = await PDFDocument.load(await selectedFile.arrayBuffer());
      totalPages = doc.getPageCount();
      hint.textContent = `${selectedFile.name} (총 ${totalPages}페이지)`;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF를 읽을 수 없습니다.";
    }
  });

  document.getElementById("pdp-run-btn").addEventListener("click", async () => {
    errorEl.hidden = true;
    downloadLink.hidden = true;
    if (!selectedFile) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF 파일을 먼저 선택해주세요.";
      return;
    }
    const toDelete = parsePageRanges(document.getElementById("pdp-pages").value, totalPages);
    if (toDelete.size === 0) {
      errorEl.hidden = false;
      errorEl.textContent = "삭제할 페이지 번호를 입력해주세요.";
      return;
    }
    if (toDelete.size >= totalPages) {
      errorEl.hidden = false;
      errorEl.textContent = "모든 페이지를 삭제할 수는 없습니다.";
      return;
    }
    try {
      const { PDFDocument } = await loadPdfLibExt();
      const doc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const keepIndices = [];
      for (let i = 0; i < totalPages; i++) if (!toDelete.has(i + 1)) keepIndices.push(i);
      const outDoc = await PDFDocument.create();
      const pages = await outDoc.copyPages(doc, keepIndices);
      pages.forEach((p) => outDoc.addPage(p));
      const outBytes = await outDoc.save();
      downloadLink.href = URL.createObjectURL(new Blob([outBytes], { type: "application/pdf" }));
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "처리 중 오류가 발생했습니다: " + e.message;
    }
  });
}

/* ---------- PDF 나누기 ---------- */
function initPdfSplit() {
  const input = document.getElementById("psp-input");
  const hint = document.getElementById("psp-hint");
  const errorEl = document.getElementById("psp-error");
  const loadingEl = document.getElementById("psp-loading");
  const downloadLink = document.getElementById("psp-download");
  let selectedFile = null;

  document.getElementById("psp-select-btn").addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    selectedFile = input.files[0];
    if (selectedFile) hint.textContent = selectedFile.name;
    downloadLink.hidden = true;
  });

  document.getElementById("psp-run-btn").addEventListener("click", async () => {
    errorEl.hidden = true;
    downloadLink.hidden = true;
    if (!selectedFile) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF 파일을 먼저 선택해주세요.";
      return;
    }
    const chunkSize = Math.max(1, parseInt(document.getElementById("psp-chunk").value, 10) || 1);
    loadingEl.hidden = false;
    try {
      const { PDFDocument } = await loadPdfLibExt();
      const srcDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const totalPages = srcDoc.getPageCount();
      const JSZip = await loadJsZipLib();
      const zip = new JSZip();
      let partNum = 1;
      for (let start = 0; start < totalPages; start += chunkSize) {
        const indices = [];
        for (let i = start; i < Math.min(start + chunkSize, totalPages); i++) indices.push(i);
        const outDoc = await PDFDocument.create();
        const pages = await outDoc.copyPages(srcDoc, indices);
        pages.forEach((p) => outDoc.addPage(p));
        zip.file(`part-${partNum}.pdf`, await outDoc.save());
        partNum++;
      }
      downloadLink.href = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "나누는 중 오류가 발생했습니다: " + e.message;
    } finally {
      loadingEl.hidden = true;
    }
  });
}

/* ---------- PDF 간편 편집(서명) ---------- */
function initPdfSign() {
  const input = document.getElementById("psg-input");
  const hint = document.getElementById("psg-hint");
  const errorEl = document.getElementById("psg-error");
  const downloadLink = document.getElementById("psg-download");
  initSegmented("psg-position");
  let selectedFile = null;

  document.getElementById("psg-select-btn").addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    selectedFile = input.files[0];
    if (selectedFile) hint.textContent = selectedFile.name;
    downloadLink.hidden = true;
  });

  document.getElementById("psg-run-btn").addEventListener("click", async () => {
    errorEl.hidden = true;
    downloadLink.hidden = true;
    const text = document.getElementById("psg-text").value.trim();
    if (!selectedFile || !text) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF 파일과 서명 텍스트를 모두 입력해주세요.";
      return;
    }
    try {
      const { PDFDocument, rgb } = await loadPdfLibExt();
      const doc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const pageNum = Math.min(Math.max(1, parseInt(document.getElementById("psg-page").value, 10) || 1), doc.getPageCount());
      const page = doc.getPages()[pageNum - 1];
      const font = await embedTextFont(doc);
      const { width, height } = page.getSize();
      const fontSize = 18;
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const margin = 30;
      const pos = getSegmentedValue("psg-position");
      const x = pos.includes("right") ? width - textWidth - margin : margin;
      const y = pos.includes("top") ? height - margin - fontSize : margin;
      page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.1, 0.3, 0.85) });
      const outBytes = await doc.save();
      downloadLink.href = URL.createObjectURL(new Blob([outBytes], { type: "application/pdf" }));
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "서명 추가 중 오류가 발생했습니다: " + e.message;
    }
  });
}

/* ---------- PDF 페이지 반으로 나누기 ---------- */
function initPdfHalfSplit() {
  const input = document.getElementById("phs-input");
  const hint = document.getElementById("phs-hint");
  const errorEl = document.getElementById("phs-error");
  const downloadLink = document.getElementById("phs-download");
  let selectedFile = null;

  document.getElementById("phs-select-btn").addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    selectedFile = input.files[0];
    if (selectedFile) hint.textContent = selectedFile.name;
    downloadLink.hidden = true;
  });

  document.getElementById("phs-run-btn").addEventListener("click", async () => {
    errorEl.hidden = true;
    downloadLink.hidden = true;
    if (!selectedFile) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF 파일을 먼저 선택해주세요.";
      return;
    }
    try {
      const { PDFDocument } = await loadPdfLibExt();
      const srcDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const outDoc = await PDFDocument.create();
      for (const srcPage of srcDoc.getPages()) {
        const { width, height } = srcPage.getSize();
        const halfW = width / 2;
        const leftEmbed = await outDoc.embedPage(srcPage, { left: 0, bottom: 0, right: halfW, top: height });
        const rightEmbed = await outDoc.embedPage(srcPage, { left: halfW, bottom: 0, right: width, top: height });
        const leftPage = outDoc.addPage([halfW, height]);
        leftPage.drawPage(leftEmbed, { x: 0, y: 0, width: halfW, height });
        const rightPage = outDoc.addPage([halfW, height]);
        rightPage.drawPage(rightEmbed, { x: 0, y: 0, width: halfW, height });
      }
      const outBytes = await outDoc.save();
      downloadLink.href = URL.createObjectURL(new Blob([outBytes], { type: "application/pdf" }));
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "나누는 중 오류가 발생했습니다: " + e.message;
    }
  });
}

/* ---------- PDF 페이지 2장씩 합치기 ---------- */
function initPdf2Up() {
  const input = document.getElementById("p2u-input");
  const hint = document.getElementById("p2u-hint");
  const errorEl = document.getElementById("p2u-error");
  const downloadLink = document.getElementById("p2u-download");
  let selectedFile = null;

  document.getElementById("p2u-select-btn").addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    selectedFile = input.files[0];
    if (selectedFile) hint.textContent = selectedFile.name;
    downloadLink.hidden = true;
  });

  document.getElementById("p2u-run-btn").addEventListener("click", async () => {
    errorEl.hidden = true;
    downloadLink.hidden = true;
    if (!selectedFile) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF 파일을 먼저 선택해주세요.";
      return;
    }
    try {
      const { PDFDocument } = await loadPdfLibExt();
      const srcDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const outDoc = await PDFDocument.create();
      const srcPages = srcDoc.getPages();
      for (let i = 0; i < srcPages.length; i += 2) {
        const p1 = srcPages[i];
        const p2 = srcPages[i + 1];
        const size1 = p1.getSize();
        const size2 = p2 ? p2.getSize() : { width: 0, height: 0 };
        const maxH = Math.max(size1.height, size2.height);
        const outPage = outDoc.addPage([size1.width + size2.width, maxH]);

        const embed1 = await outDoc.embedPage(p1);
        outPage.drawPage(embed1, { x: 0, y: maxH - size1.height, width: size1.width, height: size1.height });

        if (p2) {
          const embed2 = await outDoc.embedPage(p2);
          outPage.drawPage(embed2, { x: size1.width, y: maxH - size2.height, width: size2.width, height: size2.height });
        }
      }
      const outBytes = await outDoc.save();
      downloadLink.href = URL.createObjectURL(new Blob([outBytes], { type: "application/pdf" }));
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "합치는 중 오류가 발생했습니다: " + e.message;
    }
  });
}

/* ---------- PDF 여백 자르기 ---------- */
function initPdfCrop() {
  const input = document.getElementById("pcr-input");
  const hint = document.getElementById("pcr-hint");
  const marginInput = document.getElementById("pcr-margin");
  const marginLabel = document.getElementById("pcr-margin-label");
  const errorEl = document.getElementById("pcr-error");
  const downloadLink = document.getElementById("pcr-download");
  let selectedFile = null;

  marginInput.addEventListener("input", () => { marginLabel.textContent = `${marginInput.value}%`; });

  document.getElementById("pcr-select-btn").addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    selectedFile = input.files[0];
    if (selectedFile) hint.textContent = selectedFile.name;
    downloadLink.hidden = true;
  });

  document.getElementById("pcr-run-btn").addEventListener("click", async () => {
    errorEl.hidden = true;
    downloadLink.hidden = true;
    if (!selectedFile) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF 파일을 먼저 선택해주세요.";
      return;
    }
    try {
      const { PDFDocument } = await loadPdfLibExt();
      const srcDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
      const outDoc = await PDFDocument.create();
      const marginPct = Number(marginInput.value) / 100;
      for (const srcPage of srcDoc.getPages()) {
        const { width, height } = srcPage.getSize();
        const mx = width * marginPct;
        const my = height * marginPct;
        const cropW = width - mx * 2;
        const cropH = height - my * 2;
        const embedded = await outDoc.embedPage(srcPage, { left: mx, bottom: my, right: width - mx, top: height - my });
        const outPage = outDoc.addPage([cropW, cropH]);
        outPage.drawPage(embedded, { x: 0, y: 0, width: cropW, height: cropH });
      }
      const outBytes = await outDoc.save();
      downloadLink.href = URL.createObjectURL(new Blob([outBytes], { type: "application/pdf" }));
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "자르는 중 오류가 발생했습니다: " + e.message;
    }
  });
}

/* ---------- PDF 텍스트 추출 ---------- */
function initPdfExtractText() {
  const input = document.getElementById("pet-input");
  const hint = document.getElementById("pet-hint");
  const errorEl = document.getElementById("pet-error");
  const loadingEl = document.getElementById("pet-loading");
  const resultGroup = document.getElementById("pet-result-group");
  const output = document.getElementById("pet-output");
  const downloadLink = document.getElementById("pet-download");

  document.getElementById("pet-select-btn").addEventListener("click", () => input.click());
  input.addEventListener("change", async () => {
    errorEl.hidden = true;
    resultGroup.hidden = true;
    downloadLink.hidden = true;
    const file = input.files[0];
    if (!file) return;
    hint.textContent = file.name;
    loadingEl.hidden = false;
    try {
      const pdfjsLib = await loadPdfJsExt();
      const pdfDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const text = await extractPdfFullText(pdfDoc);
      output.value = text || "(텍스트를 찾을 수 없습니다. 스캔된 이미지 PDF일 수 있습니다.)";
      resultGroup.hidden = false;
      downloadLink.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
      downloadLink.download = file.name.replace(/\.[^.]+$/, "") + ".txt";
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "텍스트 추출에 실패했습니다: " + e.message;
    } finally {
      loadingEl.hidden = true;
    }
  });

  document.getElementById("pet-copy-btn").addEventListener("click", async (e) => {
    if (!output.value) return;
    if (await copyText(output.value)) flashCopied(e.target, "결과 복사");
  });
}

/* ---------- PDF 비교 ---------- */
function initPdfCompare() {
  document.getElementById("pcm-run-btn").addEventListener("click", async () => {
    const errorEl = document.getElementById("pcm-error");
    const loadingEl = document.getElementById("pcm-loading");
    const resultWrap = document.getElementById("pcm-result-wrap");
    errorEl.hidden = true;
    resultWrap.hidden = true;

    const fileA = document.getElementById("pcm-input-a").files[0];
    const fileB = document.getElementById("pcm-input-b").files[0];
    if (!fileA || !fileB) {
      errorEl.hidden = false;
      errorEl.textContent = "두 개의 PDF 파일을 모두 선택해주세요.";
      return;
    }
    loadingEl.hidden = false;
    try {
      const pdfjsLib = await loadPdfJsExt();
      const [docA, docB] = await Promise.all([
        pdfjsLib.getDocument({ data: await fileA.arrayBuffer() }).promise,
        pdfjsLib.getDocument({ data: await fileB.arrayBuffer() }).promise,
      ]);
      const [textA, textB] = await Promise.all([extractPdfFullText(docA), extractPdfFullText(docB)]);

      const diff = diffLines(textA, textB);
      const container = document.getElementById("pcm-result");
      container.innerHTML = "";
      let added = 0, removed = 0;
      diff.forEach((d) => {
        const div = document.createElement("div");
        div.style.whiteSpace = "pre-wrap";
        div.style.padding = "2px 8px";
        div.style.fontFamily = "monospace";
        div.style.fontSize = "13px";
        if (d.type === "added") { div.style.background = "rgba(44,158,68,0.18)"; div.textContent = "+ " + d.text; added++; }
        else if (d.type === "removed") { div.style.background = "rgba(216,49,79,0.18)"; div.textContent = "- " + d.text; removed++; }
        else { div.style.color = "var(--text-muted)"; div.textContent = "  " + d.text; }
        container.appendChild(div);
      });
      document.getElementById("pcm-stat").textContent = `추가 ${added}줄 · 삭제 ${removed}줄`;
      resultWrap.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "비교 중 오류가 발생했습니다: " + e.message;
    } finally {
      loadingEl.hidden = true;
    }
  });
}

/* ---------- 이미지→PDF 변환 ---------- */
function imageFileToJpegBytes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const buf = await (await fetch(canvas.toDataURL("image/jpeg", 0.92))).arrayBuffer();
        resolve(buf);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function initImgToPdf() {
  const input = document.getElementById("i2p-input");
  const hint = document.getElementById("i2p-hint");
  const errorEl = document.getElementById("i2p-error");
  const loadingEl = document.getElementById("i2p-loading");
  const downloadLink = document.getElementById("i2p-download");

  document.getElementById("i2p-select-btn").addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    errorEl.hidden = true;
    downloadLink.hidden = true;
    const files = Array.from(input.files);
    if (files.length === 0) return;
    hint.textContent = `${files.length}장 선택됨`;
    loadingEl.hidden = false;
    try {
      const { PDFDocument } = await loadPdfLibExt();
      const doc = await PDFDocument.create();
      for (const file of files) {
        const image = file.type === "image/png"
          ? await doc.embedPng(await file.arrayBuffer())
          : await doc.embedJpg(await imageFileToJpegBytes(file));
        const page = doc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const outBytes = await doc.save();
      downloadLink.href = URL.createObjectURL(new Blob([outBytes], { type: "application/pdf" }));
      downloadLink.hidden = false;
    } catch (e) {
      errorEl.hidden = false;
      errorEl.textContent = "PDF 생성 중 오류가 발생했습니다: " + e.message;
    } finally {
      loadingEl.hidden = true;
    }
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
  initJsonToCsv();
  initUnixTimestamp();
  initBaseConverter();
  initRegexTester();
  initAsciiConverter();
  initKeycodeChecker();
  initHttpStatus();
  initJwtDecoder();
  initHashGenerator();
  initUuidGenerator();
  initColorConverter();
  initCssGradient();
  initCssBoxShadow();
  initWcagContrast();
  initCubicBezier();
  initSqlFormatter();
  initCodeMinifier();
  initCronGenerator();
  initCurlConverter();
  initFaviconGenerator();
  initGitignoreGenerator();
  initHangulTypoFix();
  initIpLookup();
  initBarcodeGenerator();
  initSmiToSrt();
  initTypingSpeedTest();
  initReactionSpeedTest();
  initCpsTest();
  initImageFormatConverter("i2jpg", "image/jpeg", "jpg");
  initImageFormatConverter("i2png", "image/png", "png");
  initImageFormatConverter("i2webp", "image/webp", "webp");
  initImageMerge();
  initImageBase64();
  initPhotoDateStamp();
  initSvgTrim();
  initHeicViewer();
  initTts();
  initExcelMerge();
  initYamlJsonToml();
  initXmlParser();
  initJsonXml();
  initEpubToTxt();
  initMdViewer();
  initTextCompare();
  initPdfMerge();
  initPdfCompress();
  initPdfToJpg();
  initPdfToPng();
  initPdfDeletePage();
  initPdfSplit();
  initPdfSign();
  initPdfHalfSplit();
  initPdf2Up();
  initPdfCrop();
  initPdfExtractText();
  initPdfCompare();
  initImgToPdf();
}

document.addEventListener("DOMContentLoaded", init);
