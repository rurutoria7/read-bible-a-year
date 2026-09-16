/*
 * 一年讀經一遍 — 夜間主題切換組件（reusable theme toggle）
 *
 * 在頁面右上角注入一顆圓形按鈕，切換日間／夜間主題。
 * 選擇會存進 localStorage，下次開啟自動沿用。
 * 依賴 assets/styles.css 中的 html[data-theme="dark"] 變數覆寫。
 * 無外部依賴，純原生 JS。
 */
(function () {
  var KEY = "rd-theme";
  var root = document.documentElement;

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function apply(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function label(theme) {
    return theme === "dark" ? "☀" : "☾";
  }

  function aria(theme) {
    return theme === "dark" ? "切換日間主題" : "切換夜間主題";
  }

  function makeButton(theme) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    btn.setAttribute("aria-label", aria(theme));
    btn.title = aria(theme);
    btn.textContent = label(theme);
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      btn.setAttribute("aria-label", aria(next));
      btn.title = aria(next);
      btn.textContent = label(next);
    });
    return btn;
  }

  function init() {
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    if (stored === "dark") apply("dark");
    else if (stored === "light") apply("light");
    // 未存偏好時，預設維持日間（亮）主題，夜間由使用者手動開啟。

    document.body.appendChild(makeButton(current()));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
