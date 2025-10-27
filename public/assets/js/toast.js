// Simple toast utility (ES module)
export function show({ message = "", type = "info", duration = 4000 } = {}) {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    // default position bottom-right
    root.style.position = "fixed";
    root.style.right = "16px";
    root.style.bottom = "24px";
    root.style.zIndex = 9999;
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.style.gap = "12px";
    document.body.appendChild(root);
  }

  const el = document.createElement("div");
  el.className = "toast-item";
  el.style.minWidth = "160px";
  el.style.maxWidth = "320px";
  el.style.padding = "10px 14px";
  el.style.borderRadius = "8px";
  el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
  el.style.fontSize = "14px";
  el.style.lineHeight = "1.2";
  el.style.color = type === "error" ? "#fff" : "#111827";
  el.style.background =
    type === "error" ? "#dc2626" : type === "success" ? "#fff" : "#fff";
  if (type === "success") {
    // success: subtle white/dark mode style; add border
    el.style.border = "1px solid rgba(15,23,42,0.06)";
  }

  el.textContent = message;
  root.appendChild(el);

  const t = setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity 200ms ease-out, transform 200ms ease-out";
    el.style.transform = "translateY(6px)";
    setTimeout(() => el.remove(), 220);
  }, duration);

  // allow manual dismiss on click
  el.addEventListener("click", () => {
    clearTimeout(t);
    el.remove();
  });

  return {
    dismiss() {
      clearTimeout(t);
      el.remove();
    },
  };
}

export default { show };
