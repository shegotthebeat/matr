

const canvas = document.getElementById('Matrix');
const ctx = canvas.getContext('2d');

// --- BASIC CONFIG (kept simple) ---
let fontSize = 12;
const baseInterval = 50; // ms
const DROPS_PER_COLUMN = 4;

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';
const alphabet = katakana + latin + nums;

let columns, dropsArray, drawingInterval, paused = false;
const dpr = Math.max(1, window.devicePixelRatio || 1);

// --- SUBTLE WORD FLASHES ---
const WORDS = ["      ","     ", " ", "JSON SUBDOMAIN"];
let flashAlpha = 0.45;           // your requested visibility
const FLASH_START_PROB = 0.0075; // per column per frame; raise for more frequent flashes

// One flasher per column (or null)
let flashers = []; // [{word, step, row, active}] per column

function resizeCanvas() {
  const cssW = window.innerWidth;
  const cssH = window.innerHeight;

  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  columns = Math.floor(cssW / fontSize);

  dropsArray = Array.from({ length: columns }, () =>
    Array.from({ length: DROPS_PER_COLUMN }, () =>
      Math.floor(Math.random() * Math.floor(cssH / fontSize))
    )
  );

  flashers = Array.from({ length: columns }, () => null);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function start() {
  clearInterval(drawingInterval);
  drawingInterval = setInterval(draw, baseInterval);
}

function maybeStartFlasher(col, maxRows) {
  if (flashers[col]) return; // already active
  if (Math.random() < FLASH_START_PROB) {
    const word = WORDS[(Math.random() * WORDS.length) | 0];
    // Start somewhere near the top 1/3 so you see it fall
    const startRow = Math.floor(Math.random() * Math.max(5, Math.floor(maxRows / 3)));
    flashers[col] = { word, step: 0, row: startRow, active: true };
  }
}

function draw() {
  if (paused) return;

  // Trail
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

  ctx.font = fontSize + 'px monospace';
  ctx.textBaseline = 'top';

  const hPx = (canvas.height / dpr);
  const maxRows = Math.floor(hPx / fontSize);

  // Rain pass
  for (let i = 0; i < columns; i++) {
    for (let d = 0; d < DROPS_PER_COLUMN; d++) {
      const y = dropsArray[i][d];
      const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      ctx.fillStyle = (Math.random() > 0.97) ? '#B7FFB7' : '#0F0';
      ctx.fillText(text, i * fontSize, y * fontSize);

      if (y * fontSize > hPx && Math.random() > 0.995) {
        dropsArray[i][d] = 0;
      } else {
        dropsArray[i][d]++;
      }
    }
  }

  // Maybe spawn new flashers
  for (let i = 0; i < columns; i++) {
    if (!flashers[i]) maybeStartFlasher(i, maxRows);
  }

  // Draw & advance active flashers (after the rain so they sit on top subtly)
  for (let i = 0; i < columns; i++) {
    const f = flashers[i];
    if (!f || !f.active) continue;

    const letterIndex = f.step;
    if (letterIndex >= f.word.length) {
      flashers[i] = null; // finished
      continue;
    }

    const letter = f.word[letterIndex];
    const yRow = f.row + letterIndex; // vertical word
    if (yRow < maxRows) {
      ctx.save();
      ctx.globalAlpha = flashAlpha;   // subtle visibility
      ctx.fillStyle = '#B7FFB7';      // slightly brighter green for the flash
      ctx.fillText(letter, i * fontSize, yRow * fontSize);
      ctx.restore();
    }

    // Progress one letter per frame; when off-screen, end
    f.step++;
    if (f.row + f.step >= maxRows + 2) {
      flashers[i] = null;
    }
  }
}

// Controls: just opacity + pause to keep it simple
window.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k === ' ') { paused = !paused; return; }
  if (k === '[') { flashAlpha = Math.max(0.02, +(flashAlpha - 0.03).toFixed(2)); }
  if (k === ']') { flashAlpha = Math.min(1.0,  +(flashAlpha + 0.03).toFixed(2)); }
});

// Start
start();
