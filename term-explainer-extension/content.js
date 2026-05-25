const BACKEND_URL = "http://localhost:3000/explain";

let icon = null;
let popup = null;
let currentTerm = null;
let currentRect = null;

document.addEventListener("mouseup", (e) => {
    if (icon && icon.contains(e.target)) return;
    if (popup && popup.contains(e.target)) return;

    setTimeout(() => {
        const term = window.getSelection()?.toString().trim();
        if (!term || term.length < 2 || term.length > 80) {
            if (!term) removeAll();
            return;
        }
        if (term === currentTerm) return;
        currentTerm = term;
        currentRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        removePopup();
        showIcon(currentRect);
    }, 200);
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") removeAll();
});

document.addEventListener("mousedown", (e) => {
    if (icon && !icon.contains(e.target) && (!popup || !popup.contains(e.target))) {
        removeAll();
    }
});

function showIcon(rect) {
    removeIcon();
    icon = document.createElement("div");
    icon.id = "te-icon";
    icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    let left = rect.right + window.scrollX + 6;
    let top = rect.top + window.scrollY + (rect.height / 2) - 14;
    if (left + 28 > window.innerWidth - 10) left = rect.left + window.scrollX - 34;

    icon.style.left = left + "px";
    icon.style.top = top + "px";
    document.body.appendChild(icon);
    requestAnimationFrame(() => icon?.classList.add("visible"));

    icon.addEventListener("click", (e) => {
        e.stopPropagation();
        showPopup(currentTerm, currentRect);
    });
}

function showPopup(term, rect) {
    removePopup();
    popup = document.createElement("div");
    popup.id = "te-popup";
    popup.innerHTML = `
    <div class="te-popup-header">
      <span class="te-popup-term">${esc(term)}</span>
      <button class="te-popup-close">✕</button>
    </div>
    <div class="te-popup-body">
      <div class="te-loading"><div class="te-spinner"></div><span>Đang tra cứu...</span></div>
    </div>
    <div class="te-popup-footer">Gemini AI</div>
  `;

    const W = 320, M = 10;
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + M;
    if (left + W > window.innerWidth - M) left = window.innerWidth - W - M;
    if (left < M) left = M;
    if (rect.bottom + 220 > window.innerHeight) top = rect.top + window.scrollY - 220 - M;

    popup.style.left = left + "px";
    popup.style.top = top + "px";
    document.body.appendChild(popup);
    requestAnimationFrame(() => popup?.classList.add("visible"));
    popup.querySelector(".te-popup-close").addEventListener("click", removeAll);
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
        setBody("❌ Không kết nối được server.");
    }
}

function setBody(text) {
    if (!popup) return;
    popup.querySelector(".te-popup-body").innerHTML = `<div class="te-def">${esc(text)}</div>`;
}

function removeIcon() { icon?.remove(); icon = null; }
function removePopup() { popup?.remove(); popup = null; }
function removeAll() { removeIcon(); removePopup(); currentTerm = null; }
function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}