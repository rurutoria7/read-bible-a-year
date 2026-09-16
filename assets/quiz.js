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
 * 複選題用 .quiz[data-quiz="multiple"]；選項放在 .quiz-options 內，
 * 正解 input 標 data-correct="true"，每項解析放在 .option-explanations。
 * 先選再核對；完整選對才算答對，重試保留本次開啟頁面時的首次結果。
 * 無外部依賴，純原生 JS。
 */
(function () {
  function initRecall(quiz) {
    quiz.querySelectorAll(".q").forEach(function (q) {
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

  function initMultiple(quiz) {
    var questions = Array.from(quiz.querySelectorAll(".q"));
    var firstResults = new Map();
    var summary = quiz.querySelector(".quiz-score");
    var review = quiz.querySelector(".quiz-review");
    var progress = quiz.querySelector(".quiz-progress");

    function updateSummary() {
      var right = 0;
      var topics = [];
      firstResults.forEach(function (correct, question) {
        if (correct) right++;
        else topics.push(question.getAttribute("data-topic"));
      });
      summary.textContent = "已核對 " + firstResults.size + " / " + questions.length +
        " 題 · 首次完整答對 " + right + " 題";
      progress.value = firstResults.size;
      review.textContent = topics.length
        ? "首次作答待回顧：" + topics.join("、") + "。看過解析後可再試；首次結果會保留。"
        : firstResults.size === questions.length
          ? "這次首次作答全部選對。隔一段時間再回想每題的理由，確認自己仍記得。"
          : "選定一題後再核對；多選或漏選都會列出原因。";
    }

    questions.forEach(function (q) {
      var inputs = Array.from(q.querySelectorAll('.quiz-options input[type="checkbox"]'));
      var check = q.querySelector(".quiz-check");
      var retry = q.querySelector(".quiz-retry");
      var feedback = q.querySelector(".quiz-feedback");
      var result = q.querySelector(".quiz-result");
      var key = q.querySelector(".quiz-answer-key");
      var first = q.querySelector(".quiz-first");
      var graded = false;

      function updateSelection() {
        inputs.forEach(function (input) {
          input.closest(".quiz-option").classList.toggle("is-selected", input.checked);
        });
        check.disabled = graded || !inputs.some(function (input) { return input.checked; });
      }

      inputs.forEach(function (input) {
        input.addEventListener("change", updateSelection);
      });

      check.addEventListener("click", function () {
        if (graded || !inputs.some(function (input) { return input.checked; })) return;
        graded = true;
        var wrong = [];
        var missed = [];
        var correctLetters = [];
        var firstAttempt = !firstResults.has(q);

        inputs.forEach(function (input) {
          var correct = input.getAttribute("data-correct") === "true";
          var option = input.closest(".quiz-option");
          var verdict = option.querySelector(".option-verdict");
          var letter = input.value;
          if (correct) correctLetters.push(letter);
          if (input.checked && !correct) wrong.push(letter);
          if (!input.checked && correct) missed.push(letter);
          var state = input.checked
            ? (correct ? "right" : "wrong")
            : (correct ? "missed" : "excluded");
          var labels = { right: "選對", wrong: "誤選", missed: "漏選", excluded: "正確排除" };
          option.setAttribute("data-verdict", state);
          verdict.textContent = labels[state];
          verdict.hidden = false;
          input.disabled = true;
        });

        var complete = wrong.length === 0 && missed.length === 0;
        if (firstAttempt) firstResults.set(q, complete);
        first.textContent = firstResults.get(q) ? "首次：完整答對" : "首次：仍需回顧";
        first.hidden = false;
        q.setAttribute("data-result", complete ? "correct" : "review");
        var issues = [];
        if (wrong.length) issues.push("誤選 " + wrong.join("、"));
        if (missed.length) issues.push("漏選 " + missed.join("、"));
        result.textContent = complete
          ? (firstAttempt ? "完整答對。看看各項理由是否和你想的一樣。" : "這次練習選對了；首次結果保留。")
          : "還有需要釐清的地方：" + issues.join("；") + "。";
        key.textContent = "正確選項：" + correctLetters.join("、");
        feedback.hidden = false;
        retry.hidden = false;
        check.textContent = "已核對";
        check.disabled = true;
        updateSummary();
        result.focus({ preventScroll: true });
      });

      retry.addEventListener("click", function () {
        graded = false;
        inputs.forEach(function (input) {
          input.checked = false;
          input.disabled = false;
          var option = input.closest(".quiz-option");
          option.removeAttribute("data-verdict");
          option.classList.remove("is-selected");
          var verdict = option.querySelector(".option-verdict");
          verdict.textContent = "";
          verdict.hidden = true;
        });
        q.removeAttribute("data-result");
        feedback.hidden = true;
        result.textContent = "";
        key.textContent = "";
        retry.hidden = true;
        check.textContent = "核對這題";
        updateSelection();
        inputs[0].focus();
      });
      updateSelection();
    });
    updateSummary();
  }

  function init() {
    document.querySelectorAll(".quiz").forEach(function (quiz) {
      if (quiz.getAttribute("data-quiz") === "multiple") initMultiple(quiz);
      else initRecall(quiz);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
