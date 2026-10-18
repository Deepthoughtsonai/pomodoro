const DURATION_MS = 30 * 1000;

const screen = document.querySelector('.screen');
const timerEl = document.getElementById('timer');
const toggleBtn = document.getElementById('toggle-btn');
const resetBtn = document.getElementById('reset-btn');

let remainingMs = DURATION_MS;
let endTime = 0;
let intervalId = null;
let finished = false;

function render() {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  timerEl.textContent = `${minutes}:${seconds}`;
}

function stop() {
  clearInterval(intervalId);
  intervalId = null;
}

// Works out the time left from the real clock, so it stays correct
// even when the browser slows down a tab that is in the background.
function tick() {
  remainingMs = Math.max(0, endTime - Date.now());
  render();
  if (remainingMs === 0) {
    stop();
    finish();
  }
}

// The painting details are only created here, so they cannot be seen earlier.
function finish() {
  finished = true;
  screen.classList.add('finished');
  toggleBtn.textContent = 'Restart session';
  resetBtn.hidden = true;

  const details = document.createElement('div');
  details.className = 'details';
  details.id = 'details';

  const name = document.createElement('p');
  name.className = 'name';
  name.textContent = 'The Quiet Orchard';

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = 'Marguerite Aldous, 1887';

  details.append(name, meta);
  screen.append(details);
}

function reset() {
  stop();
  finished = false;
  remainingMs = DURATION_MS;
  render();
  screen.classList.remove('started', 'finished');
  toggleBtn.textContent = 'Start';
  resetBtn.hidden = false;
  document.getElementById('details')?.remove();
}

function run() {
  endTime = Date.now() + remainingMs;
  intervalId = setInterval(tick, 250);
  screen.classList.add('started');
  toggleBtn.textContent = 'Pause';
}

toggleBtn.addEventListener('click', () => {
  if (finished) {
    reset();
  } else if (intervalId) {
    tick();
    if (intervalId) {
      stop();
      toggleBtn.textContent = 'Resume';
    }
  } else {
    run();
  }
});

resetBtn.addEventListener('click', reset);
