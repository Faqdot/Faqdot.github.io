/**
 * timer.js — Study session stopwatch
 *
 * HOW IT WORKS:
 * - timerSeconds  : total seconds elapsed this session.
 * - timerRunning  : boolean flag — is the clock ticking right now?
 * - timerInterval : the ID returned by setInterval(), so we can
 *                   clear it (pause) when the user clicks Pause.
 *
 * toggleTimer()   — If running → clearInterval (pause).
 *                   If stopped → start a new setInterval that fires
 *                   every 1000ms, increments timerSeconds, updates
 *                   the display, and saves to localStorage.
 *
 * resetTimer()    — Clears the interval, resets seconds to 0,
 *                   updates display, saves 0 to localStorage.
 *
 * updateTimerDisplay() — Converts raw seconds into MM:SS for the
 *                   topbar display, and Xh Ym for the stat card.
 *
 * Persistence:    Timer total is saved in localStorage key 'dg_timer'
 *                 so study time accumulates across sessions.
 */

let timerSeconds  = 0;
let timerRunning  = false;
let timerInterval = null;

function toggleTimer() {
  const btn = document.getElementById('timerBtn');

  if (timerRunning) {
    // ── PAUSE ──
    clearInterval(timerInterval);
    btn.textContent = 'Resume';
    btn.classList.remove('running');
  } else {
    // ── START / RESUME ──
    timerInterval = setInterval(() => {
      timerSeconds++;
      updateTimerDisplay();
      try { localStorage.setItem('dg_timer', timerSeconds); } catch(e) {}
    }, 1000);
    btn.textContent = 'Pause';
    btn.classList.add('running');
  }

  timerRunning = !timerRunning;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning  = false;
  timerSeconds  = 0;
  const btn = document.getElementById('timerBtn');
  btn.textContent = 'Start';
  btn.classList.remove('running');
  updateTimerDisplay();
  try { localStorage.setItem('dg_timer', 0); } catch(e) {}
}

function updateTimerDisplay() {
  const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const s = String(timerSeconds % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${m}:${s}`;

  // update the stat card
  const totalMin = Math.floor(timerSeconds / 60);
  const card = document.getElementById('studyTimeCard');
  if (card) {
    card.textContent = totalMin >= 60
      ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`
      : `${totalMin}m`;
  }
}

function initTimer() {
  try {
    timerSeconds = parseInt(localStorage.getItem('dg_timer') || '0', 10);
    updateTimerDisplay();
  } catch(e) {}
}
