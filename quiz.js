/**
 * quiz.js — Renders and manages all quiz interactions
 *
 * HOW IT WORKS:
 * 1. renderQuizzes()  — called on page load. Loops through each day
 *    in QUIZZES (from data.js) and builds the quiz HTML inside
 *    the <div id="quiz-N"> placeholder in index.html.
 *
 * 2. renderQuestion() — builds the HTML for one question at a time.
 *    It reads localStorage to restore previously answered state.
 *
 * 3. selectOpt()      — called when user clicks an answer option.
 *    Highlights it as "selected" and stores the choice in memory.
 *
 * 4. submitQuiz()     — checks the selected answer against the correct
 *    one, colors options green/red, shows a result message, and saves
 *    the answer to localStorage so it persists on page refresh.
 *
 * 5. nextQuestion()   — advances to the next question in the same day.
 */

const selectedOpts = {};

function renderQuizzes() {
  Object.keys(QUIZZES).forEach(day => {
    const container = document.getElementById(`quiz-${day}`);
    if (!container) return;
    const qs = QUIZZES[day];
    container.innerHTML = `
      <div class="quiz-label">🧠 Knowledge Check — Day ${day}</div>
      <div class="quiz-progress-dots">
        ${qs.map((_, i) => `<div class="q-dot ${i === 0 ? 'current' : ''}" id="qdot-${day}-${i}"></div>`).join('')}
      </div>
      <div id="qbody-${day}"></div>
    `;
    renderQuestion(day, 0);
  });
}

function renderQuestion(day, idx) {
  const qs    = QUIZZES[day];
  const q     = qs[idx];
  const body  = document.getElementById(`qbody-${day}`);
  const saved = getSavedAnswer(day, idx);   // null if not yet answered

  const isLast = idx === qs.length - 1;

  body.innerHTML = `
    <div class="quiz-question">${idx + 1}. ${q.q}</div>
    <div class="quiz-options">
      ${q.options.map((opt, i) => {
        let cls = '';
        if (saved !== null) {
          if (i === q.answer)       cls = 'correct';
          else if (i === saved)     cls = 'wrong';
        }
        return `<div class="quiz-opt ${cls}" data-i="${i}"
                  onclick="selectOpt(this, ${day}, ${idx})">${opt}</div>`;
      }).join('')}
    </div>

    <button class="quiz-submit" id="qsub-${day}-${idx}"
      onclick="submitQuiz(${day}, ${idx})"
      ${saved !== null ? 'disabled' : ''}>
      Check Answer
    </button>

    <div class="quiz-result ${saved !== null ? (saved === q.answer ? 'correct' : 'wrong') : ''}"
         id="qres-${day}-${idx}"
         style="${saved !== null ? 'display:block' : 'display:none'}">
      ${saved !== null
        ? (saved === q.answer
            ? '✓ Correct! Well done.'
            : `✗ Incorrect. Correct answer: "${q.options[q.answer]}"`)
        : ''}
    </div>

    ${!isLast
      ? `<button class="quiz-next" id="qnext-${day}-${idx}"
           style="${saved !== null ? 'display:inline-block' : 'display:none'}"
           onclick="nextQuestion(${day}, ${idx})">Next question →</button>`
      : `<div id="qnext-${day}-${idx}"
             style="${saved !== null ? 'display:block' : 'display:none'}"
             class="callout tip">🎉 Day ${day} quiz complete!</div>`
    }
  `;
}

function selectOpt(el, day, idx) {
  const sub = document.getElementById(`qsub-${day}-${idx}`);
  if (sub.disabled) return;                           // already answered
  el.parentElement.querySelectorAll('.quiz-opt')
    .forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedOpts[`${day}-${idx}`] = parseInt(el.dataset.i);
}

function submitQuiz(day, idx) {
  const key = `${day}-${idx}`;
  const sel = selectedOpts[key];
  if (sel === undefined) return;                      // nothing selected

  const q     = QUIZZES[day][idx];
  const body  = document.getElementById(`qbody-${day}`);
  const res   = document.getElementById(`qres-${day}-${idx}`);
  const sub   = document.getElementById(`qsub-${day}-${idx}`);
  const next  = document.getElementById(`qnext-${day}-${idx}`);

  // colour the options
  body.querySelectorAll('.quiz-opt').forEach((o, i) => {
    o.classList.remove('selected');
    if (i === q.answer)   o.classList.add('correct');
    else if (i === sel)   o.classList.add('wrong');
  });

  const correct = sel === q.answer;
  res.className = `quiz-result ${correct ? 'correct' : 'wrong'}`;
  res.style.display = 'block';
  res.textContent   = correct
    ? '✓ Correct! Well done.'
    : `✗ Incorrect. Correct answer: "${q.options[q.answer]}"`;

  sub.disabled = true;
  if (next) next.style.display = 'inline-block';

  // update progress dots
  const dot = document.getElementById(`qdot-${day}-${idx}`);
  if (dot) { dot.classList.remove('current'); dot.classList.add('done'); }
  const nextDot = document.getElementById(`qdot-${day}-${idx + 1}`);
  if (nextDot) nextDot.classList.add('current');

  // persist
  saveAnswer(day, idx, sel);
}

function nextQuestion(day, idx) {
  renderQuestion(day, idx + 1);
}

/* ── localStorage helpers ── */
function saveAnswer(day, idx, value) {
  try { localStorage.setItem(`quiz-${day}-${idx}`, JSON.stringify(value)); } catch(e) {}
}
function getSavedAnswer(day, idx) {
  try {
    const raw = localStorage.getItem(`quiz-${day}-${idx}`);
    return raw !== null ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}
