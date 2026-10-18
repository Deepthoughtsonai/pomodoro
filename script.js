const DURATION_MS = 25 * 60 * 1000;

const screen = document.querySelector('.screen');
const timerEl = document.getElementById('timer');
const toggleBtn = document.getElementById('toggle-btn');
const resetBtn = document.getElementById('reset-btn');

let remainingMs = DURATION_MS;
let endTime = 0;
let intervalId = null;

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
  }
}

function run() {
  endTime = Date.now() + remainingMs;
  intervalId = setInterval(tick, 250);
  screen.classList.add('started');
  toggleBtn.textContent = 'Pause';
}

toggleBtn.addEventListener('click', () => {
  if (intervalId) {
    tick();
    if (intervalId) {
      stop();
      toggleBtn.textContent = 'Resume';
    }
  } else if (remainingMs > 0) {
    run();
  }
});

resetBtn.addEventListener('click', () => {
  stop();
  remainingMs = DURATION_MS;
  render();
  screen.classList.remove('started');
  toggleBtn.textContent = 'Start';
});
