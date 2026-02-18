/**
 * confetti.js — Canvas-based celebration animation + toast notification
 *
 * HOW IT WORKS (Confetti):
 * We use an HTML <canvas> element that sits fixed over the entire page
 * with pointer-events:none so it doesn't block clicks.
 *
 * launchConfetti() creates 120 particle objects, each with:
 *   - x, y       : starting position (random across screen width, above viewport)
 *   - r          : radius / thickness
 *   - d          : fall speed
 *   - color      : one of 6 bright colours
 *   - tiltAngle  : oscillation angle (makes them wobble left-right)
 *   - tiltSpeed  : how fast they wobble
 *
 * The draw() function runs via requestAnimationFrame (~60fps):
 *   1. Clears the canvas
 *   2. For each particle: updates tiltAngle, moves y down, wobbles x
 *   3. Draws a short angled line (stroke) as the confetti piece
 *   4. Counts frames — stops after 160 frames (~2.7 seconds)
 *
 * HOW IT WORKS (Toast):
 * The toast is a fixed div positioned below the viewport (translateY 80px).
 * showToast() adds the .show class which CSS transitions it up into view.
 * After 3 seconds it removes .show, sliding it back down.
 */

const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx    = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let confettiParticles = [];
let confettiAnimId;

const CONFETTI_COLORS = ['#4af2a1','#38bdf8','#f59e0b','#f87171','#c084fc','#ffffff'];

function launchConfetti() {
  if (!confettiCanvas || !confettiCtx) return;

  // resize canvas to full viewport
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiCanvas.style.display = 'block';

  // create particles
  confettiParticles = Array.from({ length: 120 }, () => ({
    x:          Math.random() * confettiCanvas.width,
    y:          Math.random() * -200,              // start above screen
    r:          4 + Math.random() * 7,
    d:          1 + Math.random() * 2,             // fall speed
    color:      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    tilt:       0,
    tiltAngle:  0,
    tiltSpeed:  0.1 + Math.random() * 0.2,
  }));

  cancelAnimationFrame(confettiAnimId);
  let frames = 0;

  function draw() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y         += p.d + 1;                      // fall down
      p.x         += Math.sin(p.tiltAngle) * 1.5;  // wobble
      p.tilt       = Math.sin(p.tiltAngle) * 12;

      confettiCtx.beginPath();
      confettiCtx.lineWidth   = p.r;
      confettiCtx.strokeStyle = p.color;
      confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      confettiCtx.stroke();
    });

    frames++;

    if (frames < 160) {
      confettiAnimId = requestAnimationFrame(draw);
    } else {
      // animation done — hide canvas
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiCanvas.style.display = 'none';
    }
  }

  draw();
}

/* ── Toast ────────────────────────────────────────────────────── */

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
