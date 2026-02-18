/**
 * search.js — Live search bar with dropdown results
 *
 * HOW IT WORKS:
 * The search input listens for the 'input' event (fires on every keystroke).
 *
 * On each keystroke:
 *   1. Read the current value and lowercase it
 *   2. Filter SEARCH_INDEX (from data.js) — check if the title or day
 *      label includes the query string
 *   3. Render matching results as clickable <div> rows inside the
 *      dropdown (#searchResults)
 *   4. Add the .show class to make the dropdown visible
 *
 * goTo(id):
 *   Called when a result row is clicked. Uses scrollIntoView with
 *   smooth behavior to animate-scroll to the target day section,
 *   then hides the dropdown and clears the input.
 *
 * Click-outside:
 *   A global document click listener hides the dropdown whenever
 *   the user clicks anywhere that isn't the search input.
 */

function initSearch() {
  const input   = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  if (!input || !results) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();

    if (!q) {
      results.classList.remove('show');
      return;
    }

    const filtered = SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.day.toLowerCase().includes(q)
    );

    if (!filtered.length) {
      results.classList.remove('show');
      return;
    }

    results.innerHTML = filtered.slice(0, 8).map(item => `
      <div class="sr-item" onclick="goTo('${item.id}')">
        <span class="sr-day">${item.day}</span>${item.title}
      </div>
    `).join('');

    results.classList.add('show');
  });

  // hide on outside click
  document.addEventListener('click', e => {
    if (!input.contains(e.target)) {
      results.classList.remove('show');
    }
  });
}

function goTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });

  document.getElementById('searchResults').classList.remove('show');
  document.getElementById('searchInput').value = '';
}
