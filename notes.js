/**
 * notes.js — Per-day notes scratchpad with auto-save
 *
 * HOW IT WORKS:
 * Each day's textarea fires saveNotes(day) on every keystroke (oninput).
 *
 * Instead of writing to localStorage on every single keypress (which
 * would be wasteful), we use a DEBOUNCE pattern:
 *
 *   clearTimeout(notesTimers[day])   — cancel any pending save
 *   notesTimers[day] = setTimeout(() => { … }, 600)
 *                                    — schedule a new save 600ms later
 *
 * So the save only happens 600ms AFTER the user stops typing.
 * This is a very common performance technique in web development.
 *
 * After saving, a "✓ Saved" badge fades in via CSS (adds .show class),
 * then fades out 1.5 seconds later (removes .show class).
 *
 * initNotes() — called on DOMContentLoaded. Reads each day's note
 * from localStorage and populates the textarea.
 */

const notesTimers = {};

function saveNotes(day) {
  // debounce: wait until typing pauses before saving
  clearTimeout(notesTimers[day]);

  notesTimers[day] = setTimeout(() => {
    const textarea = document.getElementById(`notes-${day}`);
    if (!textarea) return;

    try {
      localStorage.setItem(`dg_notes_${day}`, textarea.value);
    } catch(e) {}

    // flash the "✓ Saved" badge
    const badge = document.getElementById(`notes-saved-${day}`);
    if (badge) {
      badge.classList.add('show');
      setTimeout(() => badge.classList.remove('show'), 1500);
    }
  }, 600);
}

function initNotes() {
  for (let d = 1; d <= 10; d++) {
    try {
      const saved = localStorage.getItem(`dg_notes_${d}`);
      if (saved !== null) {
        const el = document.getElementById(`notes-${d}`);
        if (el) el.value = saved;
      }
    } catch(e) {}
  }
}
