const DURATION_MS = 30 * 1000;
const SEARCH_URL = 'https://collectionapi.metmuseum.org/public/collection/v1.1/search'
  + '?q=painting&medium=Paintings&hasImages=true&isHighlight=true';
const OBJECT_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';
const MAX_TRIES = 5;

const screen = document.querySelector('.screen');
const timerEl = document.getElementById('timer');
const toggleBtn = document.getElementById('toggle-btn');
const resetBtn = document.getElementById('reset-btn');
const artWrap = document.getElementById('art-wrap');
const artworkEl = document.getElementById('artwork');

let remainingMs = DURATION_MS;
let endTime = 0;
let intervalId = null;
let finished = false;
let objectIds = [];
let currentId = null;
let loadCount = 0;

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

function pickId() {
  let index = Math.floor(Math.random() * objectIds.length);
  if (objectIds.length > 1 && objectIds[index] === currentId) {
    index = (index + 1) % objectIds.length;
  }
  return objectIds[index];
}

function preload(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
}

async function loadArtwork() {
  const thisLoad = ++loadCount;
  artWrap.dataset.state = 'loading';
  try {
    if (objectIds.length === 0) {
      const search = await (await fetch(SEARCH_URL)).json();
      objectIds = search.objectIDs || [];
    }
    for (let i = 0; i < MAX_TRIES && objectIds.length > 0; i++) {
      const id = pickId();
      const art = await (await fetch(OBJECT_URL + id)).json();
      if (art.isPublicDomain && art.primaryImageSmall) {
        await preload(art.primaryImageSmall);
        if (thisLoad !== loadCount) return;
        artworkEl.src = art.primaryImageSmall;
        currentId = id;
        artWrap.dataset.state = 'image';
        return;
      }
      // No usable photo: never try this one again.
      objectIds = objectIds.filter((other) => other !== id);
    }
  } catch (error) {
    // Keep showing the placeholder below.
  }
  if (thisLoad === loadCount) {
    delete artWrap.dataset.state;
  }
}

toggleBtn.addEventListener('click', () => {
  if (finished) {
    reset();
    loadArtwork();
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

loadArtwork();
