/*
 * 一年讀經一遍 — 自測題組件（reusable quiz widget）
 *
 * 用法：在 HTML 中放置 <div class="quiz">，內含多個 .q：
 *
 *   <div class="q">
 *     <p class="q-text">問題？</p>
 *     <button class="reveal" type="button">顯示答案</button>
 *     <div class="a" hidden><span>答案</span><span class="a-ref">民 24:17</span></div>
 *   </div>
 *
 * 每個問題先回想（retrieval practice），再按「顯示答案」立即核對。
 * 無外部依賴，純原生 JS。
 */
(function () {
  function init() {
    var qs = document.querySelectorAll(".quiz .q");
    qs.forEach(function (q, i) {
      var btn = q.querySelector(".reveal");
      var ans = q.querySelector(".a");
      if (!btn || !ans) return;
      btn.addEventListener("click", function () {
        var opened = ans.hasAttribute("hidden") === false;
        if (opened) {
          ans.setAttribute("hidden", "");
          btn.textContent = "顯示答案";
        } else {
          ans.removeAttribute("hidden");
          btn.textContent = "收起答案";
          q.classList.add("reviewed");
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
