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

/* ---------- 유틸 ---------- */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const EXT_BY_TYPE = { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" };

/* ---------- 이미지 처리 ---------- */
let currentFile = null;
let currentImage = null;

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  currentFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      const previewRow = document.getElementById("preview-row");
      const previewImg = document.getElementById("preview-img");
      const previewMeta = document.getElementById("preview-meta");
      previewImg.src = e.target.result;
      previewMeta.innerHTML = `
        <div><strong>${file.name}</strong></div>
        <div>${img.naturalWidth} x ${img.naturalHeight}px · ${formatBytes(file.size)}</div>
      `;
      previewRow.hidden = false;
      document.getElementById("dropzone").hidden = true;
      document.getElementById("workspace").hidden = false;
      document.getElementById("result-card").hidden = true;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function initUpload() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");

  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) loadFile(fileInput.files[0]);
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  });
}

function initOptions() {
  const maxWidthInput = document.getElementById("opt-maxwidth");
  const maxWidthLabel = document.getElementById("opt-maxwidth-label");
  maxWidthInput.addEventListener("input", () => {
    maxWidthLabel.textContent = `${maxWidthInput.value}px`;
  });

  const qualityInput = document.getElementById("opt-quality");
  const qualityLabel = document.getElementById("opt-quality-label");
  qualityInput.addEventListener("input", () => {
    qualityLabel.textContent = `${qualityInput.value}%`;
  });
}

function initProcess() {
  document.getElementById("process-btn").addEventListener("click", () => {
    if (!currentImage || !currentFile) return;

    const maxWidth = Number(document.getElementById("opt-maxwidth").value);
    const quality = Number(document.getElementById("opt-quality").value) / 100;
    const format = getSegmentedValue("opt-format");

    let targetW = currentImage.naturalWidth;
    let targetH = currentImage.naturalHeight;
    if (targetW > maxWidth) {
      const ratio = maxWidth / targetW;
      targetW = Math.round(targetW * ratio);
      targetH = Math.round(targetH * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (format === "image/jpeg") {
      // JPEG는 투명 배경을 지원하지 않으므로 흰 배경을 먼저 채운다.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
    }
    ctx.drawImage(currentImage, 0, 0, targetW, targetH);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const resultImg = document.getElementById("result-img");
        resultImg.src = url;

        document.getElementById("result-original-size").textContent = formatBytes(currentFile.size);
        document.getElementById("result-new-size").textContent = formatBytes(blob.size);
        const reduction = Math.max(0, Math.round((1 - blob.size / currentFile.size) * 100));
        document.getElementById("result-reduction").textContent = `${reduction}%`;

        const dlBtn = document.getElementById("result-download-btn");
        dlBtn.href = url;
        const baseName = currentFile.name.replace(/\.[^.]+$/, "");
        dlBtn.download = `${baseName}.${EXT_BY_TYPE[format]}`;

        document.getElementById("result-card").hidden = false;
      },
      format,
      format === "image/png" ? undefined : quality
    );
  });
}

function init() {
  initThemeToggle();
  initSegmented("opt-format");
  initUpload();
  initOptions();
  initProcess();
}

document.addEventListener("DOMContentLoaded", init);
