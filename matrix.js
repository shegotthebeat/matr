const canvas = document.getElementById('Matrix');
const ctx = canvas.getContext('2d');

// --- CONFIGURATION ---
let fontSize = 12;    // Smaller for more columns & drop density
let boldMode = false;
let paused = false;
let fastSpeed = false;

const baseInterval = 50; // ms (slightly faster for denser effect)
const fastInterval = 20; // ms

const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';
const alphabet = katakana + latin + nums;

let columns, dropsArray, drawingInterval;

// Each "drop" is an independent rain stream; we allow more than one per column for density
const DROPS_PER_COLUMN = 2; // Increase for even greater density

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);

    // Re-initialize drops: one array per column for multiple drops per column
    dropsArray = Array.from({ length: columns }, () =>
        Array.from({ length: DROPS_PER_COLUMN }, () =>
            // Stagger start Y positions for randomness
            Math.floor(Math.random() * Math.floor(canvas.height / fontSize))
        )
    );
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function startMatrix() {
    clearInterval(drawingInterval);
    drawingInterval = setInterval(draw, fastSpeed ? fastInterval : baseInterval);
}

function draw() {
    if (paused) return;
    // Lower alpha = longer trails/ghosts
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = (boldMode ? 'bold ' : '') + fontSize + 'px monospace';
    ctx.textBaseline = 'top';

    for (let i = 0; i < columns; i++) {
        for (let d = 0; d < DROPS_PER_COLUMN; d++) {
            const y = dropsArray[i][d];
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            // Occasional highlight effect
            ctx.fillStyle = (Math.random() > 0.97) ? '#B7FFB7' : '#0F0';
            ctx.fillText(text, i * fontSize, y * fontSize);

            // Make "resetting" to the top much less likely (so trails persist longer)
            if (y * fontSize > canvas.height && Math.random() > 0.995) {
                dropsArray[i][d] = 0;
            } else {
                dropsArray[i][d]++;
            }
        }
    }
}

function restartMatrix() {
    dropsArray = Array.from({ length: columns }, () =>
        Array.from({ length: DROPS_PER_COLUMN }, () =>
            Math.floor(Math.random() * Math.floor(canvas.height / fontSize))
        )
    );
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Keyboard interaction
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'f': case 'F':
            boldMode = !boldMode;
            break;
        case 's': case 'S':
            fastSpeed = !fastSpeed;
            startMatrix();
            break;
        case ' ':
            paused = !paused;
            break;
        case 'q': case 'Q': case 'Escape':
            restartMatrix();
            break;
    }
});

// Initial launch
startMatrix();
