/**
 * app.js — Entry point. Wires all modules together on page load.
 *
 * HOW IT WORKS:
 * This file has ONE job: call every module's init function in the
 * right order once the DOM is ready (DOMContentLoaded event).
 *
 * It also handles two small helpers that don't belong to any single
 * module:
 *   - toggleStep()  : expand/collapse step accordion panels
 *   - copyCode()    : copy a code block's text to the clipboard
 *   - sidebar scroll highlight via IntersectionObserver
 *
 * MODULE LOAD ORDER (defined by <script> tags in index.html):
 *   1. data.js      — QUIZZES + SEARCH_INDEX constants
 *   2. confetti.js  — launchConfetti(), showToast()
 *   3. timer.js     — toggleTimer(), resetTimer(), initTimer()
 *   4. progress.js  — stepChecked(), initDayButtons(), initProgress()
 *   5. notes.js     — saveNotes(), initNotes()
 *   6. quiz.js      — renderQuizzes(), selectOpt(), submitQuiz()
 *   7. search.js    — initSearch(), goTo()
 *   8. app.js       — THIS FILE — calls all inits
 */

/* ── Step accordion toggle ───────────────────────────────────────
 * Called by onclick on each .step-head element in index.html.
 * Toggles the .open class on the parent .step, which CSS uses to
 * show/hide .step-body and rotate the chevron icon.
 */
function toggleStep(headEl) {
  headEl.parentElement.classList.toggle('open');
}

/* ── Copy code to clipboard ──────────────────────────────────────
 * Reads the innerText of the <pre> inside the same .code-block,
 * writes it to the clipboard API, and briefly changes the button
 * text to "copied!" as visual feedback.
 */
function copyCode(btn) {
  const pre  = btn.closest('.code-block').querySelector('pre');
  const text = pre.innerText;

  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'copy';
      btn.classList.remove('copied');
    }, 1800);
  });
}

/* ── Sidebar active link on scroll ──────────────────────────────
 * IntersectionObserver fires when a .day-section enters the viewport
 * (threshold 0.35 = 35% visible). It then finds the matching
 * .day-link in the sidebar and adds .active to it.
 *
 * This creates the "auto-highlight as you scroll" effect without
 * any scroll event listeners (which would fire hundreds of times/sec).
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('.day-section');
  const links    = document.querySelectorAll('.day-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const dayId = e.target.id.replace('day', '');
      links.forEach(l => l.classList.remove('active'));
      const activeLink = document.querySelector(`.day-link[data-day="${dayId}"]`);
      if (activeLink) activeLink.classList.add('active');
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}

/* ── Bootstrap ───────────────────────────────────────────────────
 * DOMContentLoaded fires once the HTML is parsed (before images load).
 * Safe to manipulate the DOM here.
 */
document.addEventListener('DOMContentLoaded', () => {
  initTimer();        // restore saved study time
  initProgress();     // restore checkboxes + day completions
  initDayButtons();   // attach click listeners to "Mark Complete" buttons
  initNotes();        // restore saved notes into textareas
  renderQuizzes();    // build quiz HTML for all 10 days
  initSearch();       // attach search input listener
  initScrollSpy();    // observe sections for sidebar highlight
});
