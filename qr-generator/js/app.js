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
    currentTab = target;
    regenerateQr();
  });
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

/* ---------- QR payload 조립 ---------- */
function escapeWifi(str) {
  return String(str).replace(/([\\;,:"])/g, "\\$1");
}

function buildTextPayload() {
  return document.getElementById("text-input").value.trim();
}

function buildWifiPayload() {
  const ssid = document.getElementById("wifi-ssid").value.trim();
  const password = document.getElementById("wifi-password").value;
  const security = getSegmentedValue("wifi-security");
  if (!ssid) return "";
  if (security === "nopass") {
    return `WIFI:T:nopass;S:${escapeWifi(ssid)};;`;
  }
  return `WIFI:T:${security};S:${escapeWifi(ssid)};P:${escapeWifi(password)};;`;
}

function buildVCardPayload() {
  const name = document.getElementById("vcard-name").value.trim();
  const phone = document.getElementById("vcard-phone").value.trim();
  const email = document.getElementById("vcard-email").value.trim();
  const org = document.getElementById("vcard-org").value.trim();
  if (!name && !phone && !email) return "";
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  if (name) lines.push(`FN:${name}`);
  if (org) lines.push(`ORG:${org}`);
  if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
  if (email) lines.push(`EMAIL:${email}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

let currentTab = "text";

function buildPayload() {
  if (currentTab === "wifi") return buildWifiPayload();
  if (currentTab === "vcard") return buildVCardPayload();
  return buildTextPayload();
}

let qrInstance = null;

/* 생성된 QR의 모듈 정보로 SVG 문자열을 만든다 (여백 4칸) */
function buildSvg(fg, bg) {
  const q = qrInstance && qrInstance._oQRCode;
  if (!q || !q.getModuleCount) return "";
  const n = q.getModuleCount();
  const margin = 4;
  let d = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (q.isDark(r, c)) d += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }
  const total = n + margin * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total * 10}" height="${total * 10}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="${bg}"/><path d="${d}" fill="${fg}"/></svg>`;
}

/* ---------- QR 생성 (qrfy.com처럼 입력하는 즉시 미리보기가 갱신됨) ---------- */
function regenerateQr() {
  const resultEl = document.getElementById("qr-result");
  const sizeInput = document.getElementById("qr-size");
  const payload = buildPayload();

  if (!payload) {
    resultEl.innerHTML = '<p class="result-placeholder">정보를 입력하면 QR코드가 바로 만들어집니다.</p>';
    return;
  }

  const size = Number(sizeInput.value);
  const fg = document.getElementById("qr-fg").value;
  const bg = document.getElementById("qr-bg").value;

  resultEl.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "qr-canvas-wrap";
  resultEl.appendChild(wrap);

  try {
    qrInstance = new QRCode(wrap, {
      text: payload,
      width: size,
      height: size,
      colorDark: fg,
      colorLight: bg,
      correctLevel: QRCode.CorrectLevel.M,
    });
  } catch (e) {
    resultEl.innerHTML = '<p class="result-placeholder">QR코드 생성에 실패했습니다. 입력값을 확인해주세요.</p>';
    return;
  }

  const canvas = wrap.querySelector("canvas");
  if (canvas) {
    const actions = document.createElement("div");
    actions.className = "qr-actions";

    const pngBtn = document.createElement("a");
    pngBtn.className = "qr-download-btn primary";
    pngBtn.textContent = "PNG 저장";
    pngBtn.href = canvas.toDataURL("image/png");
    pngBtn.download = "qrcode.png";
    actions.appendChild(pngBtn);

    const svg = buildSvg(fg, bg);
    if (svg) {
      const svgBtn = document.createElement("a");
      svgBtn.className = "qr-download-btn";
      svgBtn.textContent = "SVG 저장";
      svgBtn.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      svgBtn.download = "qrcode.svg";
      actions.appendChild(svgBtn);
    }
    resultEl.appendChild(actions);
  }
}

let regenerateTimer = null;
function scheduleRegenerate() {
  clearTimeout(regenerateTimer);
  regenerateTimer = setTimeout(regenerateQr, 150);
}

function initQrGenerate() {
  const sizeInput = document.getElementById("qr-size");
  const sizeLabel = document.getElementById("qr-size-label");

  sizeInput.addEventListener("input", () => {
    sizeLabel.textContent = `${sizeInput.value}px`;
    scheduleRegenerate();
  });

  const liveInputIds = [
    "text-input",
    "wifi-ssid",
    "wifi-password",
    "vcard-name",
    "vcard-phone",
    "vcard-email",
    "vcard-org",
    "qr-fg",
    "qr-bg",
  ];
  liveInputIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", scheduleRegenerate);
  });

  document.getElementById("wifi-security").addEventListener("click", () => {
    scheduleRegenerate();
  });

  const makeBtn = document.getElementById("qr-make-btn");
  if (makeBtn) makeBtn.addEventListener("click", regenerateQr);
  const textInput = document.getElementById("text-input");
  const fit = () => {
    textInput.style.height = "auto";
    textInput.style.height = Math.min(textInput.scrollHeight, 160) + "px";
  };
  textInput.addEventListener("input", fit);
  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      regenerateQr();
    }
  });
}

function init() {
  initThemeToggle();
  initTabs();
  initSegmented("wifi-security");
  initQrGenerate();
}

document.addEventListener("DOMContentLoaded", init);
