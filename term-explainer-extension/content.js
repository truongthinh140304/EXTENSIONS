const BACKEND_URL = "http://localhost:3000/explain";

let tooltip = null;
let debounceTimer = null;
let currentTerm = null;

document.addEventListener("mouseup", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const term = window.getSelection()?.toString().trim();
        if (!term || term.length < 2 || term.length > 80) {
            if (!term) removeTooltip();
            return;
        }
        if (term === currentTerm && tooltip) return;
        currentTerm = term;
        const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        showTooltip(term, rect);
    }, 400);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") removeTooltip();
});

function showTooltip(term, rect) {
    removeTooltip();
    tooltip = document.createElement("div");
    tooltip.id = "te-tooltip";
    tooltip.innerHTML = `
    <div class="te-header">
      <span class="te-term">${esc(term)}</span>
      <span class="te-badge">AI</span>
    </div>
    <div class="te-body">
      <div class="te-loading"><div class="te-spinner"></div> Đang tra cứu...</div>
    </div>
    <div class="te-footer">
      <span>Gemini AI</span>
      <button class="te-close">Đóng ✕</button>
    </div>
  `;
    document.body.appendChild(tooltip);
    position(rect);
    requestAnimationFrame(() => tooltip?.classList.add("visible"));
    tooltip.querySelector(".te-close").addEventListener("click", removeTooltip);
    fetchDef(term);
}

async function fetchDef(term) {
    try {
        const res = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ term }),
        });
        const data = await res.json();
        setBody(data.definition || "Không tìm được định nghĩa.");
    } catch {
        setBody("❌ Không kết nối được server. Hãy kiểm tra backend đang chạy.");
    }
}

function setBody(text) {
    if (!tooltip) return;
    tooltip.querySelector(".te-body").innerHTML =
        `<div class="te-def">${esc(text)}</div>`;
}

function position(rect) {
    if (!tooltip) return;
    const W = 300, M = 10;
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + M;
    if (left + W > window.innerWidth - M) left = window.innerWidth - W - M;
    if (left < M) left = M;
    if (rect.bottom + 150 > window.innerHeight) {
        top = rect.top + window.scrollY - tooltip.offsetHeight - M;
    }
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
}

function removeTooltip() {
    tooltip?.remove();
    tooltip = null;
    currentTerm = null;
}

function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}