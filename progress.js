/**
 * progress.js — Manages step checkboxes and day completion buttons
 *
 * HOW IT WORKS:
 *
 * ── Step Checkboxes ──────────────────────────────────────────────
 * Every step has a checkbox. When any checkbox changes, stepChecked()
 * runs. It counts how many are ticked vs total, calculates a %, and
 * updates both the progress bar width (via CSS width transition) and
 * the percentage text in the topbar. The entire state object
 * {checkboxId: true/false} is serialized and saved to localStorage.
 *
 * ── Day Complete Buttons ─────────────────────────────────────────
 * Clicking a "Mark Complete" button toggles its .done class.
 * It also:
 *   1. Toggles the .done class on the day number badge
 *   2. Toggles .completed class on the matching sidebar link
 *   3. Updates the "Completed" stat card count
 *   4. Triggers confetti + toast (from confetti.js / app.js)
 *   5. Persists state in localStorage key 'dg_days'
 *
 * ── Restore on Load ──────────────────────────────────────────────
 * initProgress() is called on DOMContentLoaded. It reads both
 * 'dg_state' (checkboxes) and 'dg_days' (day completions) from
 * localStorage and restores the UI to its last state.
 */

function stepChecked() {
  const all  = document.querySelectorAll('.step-check input[type=checkbox]');
  const done = [...all].filter(c => c.checked).length;
  const pct  = Math.round((done / all.length) * 100);

  document.getElementById('progFill').style.width = pct + '%';
  document.getElementById('prog-pct').textContent  = pct + '%';

  // persist every checkbox state
  const state = {};
  all.forEach(c => { state[c.id] = c.checked; });
  try { localStorage.setItem('dg_state', JSON.stringify(state)); } catch(e) {}
}

function initDayButtons() {
  document.querySelectorAll('.day-complete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const day    = btn.dataset.day;
      const nowDone = !btn.classList.contains('done');

      btn.classList.toggle('done');
      btn.textContent = nowDone ? '✓ Completed' : 'Mark Complete';

      // badge
      btn.closest('.day-section')
         .querySelector('.day-num')
         .classList.toggle('done', nowDone);

      // sidebar dot
      const link = document.querySelector(`.day-link[data-day="${day}"]`);
      if (link) link.classList.toggle('completed', nowDone);

      // stat card
      const count = document.querySelectorAll('.day-complete-btn.done').length;
      document.getElementById('doneCount').textContent = count;

      // celebrate
      if (nowDone) {
        if (typeof launchConfetti === 'function') launchConfetti();
        if (typeof showToast === 'function')
          showToast(`🎉 Day ${day} complete! Keep going!`);
      }

      // persist
      try {
        const s = JSON.parse(localStorage.getItem('dg_days') || '{}');
        s[day] = nowDone;
        localStorage.setItem('dg_days', JSON.stringify(s));
      } catch(e) {}
    });
  });
}

function initProgress() {
  // ── restore checkboxes ──
  try {
    const state = JSON.parse(localStorage.getItem('dg_state') || '{}');
    Object.keys(state).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = state[id];
    });
    stepChecked();
  } catch(e) {}

  // ── restore day completions ──
  try {
    const s = JSON.parse(localStorage.getItem('dg_days') || '{}');
    let cnt = 0;
    Object.keys(s).forEach(day => {
      if (!s[day]) return;
      cnt++;

      const btn = document.querySelector(`.day-complete-btn[data-day="${day}"]`);
      if (btn) { btn.classList.add('done'); btn.textContent = '✓ Completed'; }

      const link = document.querySelector(`.day-link[data-day="${day}"]`);
      if (link) link.classList.add('completed');

      document.getElementById('day' + day)
              ?.querySelector('.day-num')
              ?.classList.add('done');
    });
    document.getElementById('doneCount').textContent = cnt;
  } catch(e) {}
}
