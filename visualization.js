/**
 * Romeo e Giulietta - Visualizzazione con linee Romeo-Juliet
 * Collega ogni istanza di "Romeo" con ogni istanza di "Juliet"
 */

// 9:16 formato verticale telefono
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const ANIMATION_DURATION_MS = 30000; // 30 secondi
const FONT_SIZE = 4;
const LINE_HEIGHT = 6;
const PADDING = 40;
const TEXT_COLOR = "#999999";
const LINE_COLOR = "#cc0000";
const LINE_OPACITY = 0.4;

let words = [];
let romeoPositions = [];
let julietPositions = [];
let connections = [];
let animationIndex = 0;
let animationRunning = false;
let animationFrameId = null;
let animationStartTime = 0;
let mediaRecorder = null;
let recordedChunks = [];
let contentScale = 1;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const btnPlay = document.getElementById("btnPlay");
const btnPause = document.getElementById("btnPause");
const btnReset = document.getElementById("btnReset");
const btnRecord = document.getElementById("btnRecord");
const statusEl = document.getElementById("status");

function normalizeWord(w) {
  return w.replace(/[^\w]/g, "").toLowerCase();
}

function isRomeo(w) {
  const n = normalizeWord(w);
  return n === "romeo" || n.startsWith("romeo");
}

function isJuliet(w) {
  const n = normalizeWord(w);
  return n === "juliet" || n.startsWith("juliet");
}

function tokenize(text) {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

function layoutWords(text) {
  const tokens = tokenize(text);
  const result = [];
  const maxWidth = CANVAS_WIDTH - PADDING * 2;
  let x = PADDING;
  let y = PADDING + LINE_HEIGHT;
  ctx.font = `${FONT_SIZE}px sans-serif`;

  for (const word of tokens) {
    const m = ctx.measureText(word + " ");
    const w = m.width;
    if (x + w > maxWidth && x > PADDING) {
      x = PADDING;
      y += LINE_HEIGHT;
    }
    const wordW = ctx.measureText(word).width;
    const cx = x + wordW / 2;
    const cy = y - FONT_SIZE / 2;
    result.push({
      word,
      x,
      y,
      cx,
      cy,
      width: m.width,
    });
    x += w;
  }
  return { words: result, maxY: y };
}

function buildConnections() {
  connections = [];
  const n = romeoPositions.length;
  const m = julietPositions.length;
  const count = Math.min(n, m);
  for (let i = 0; i < count; i++) {
    const from = romeoPositions[i];
    const to = julietPositions[m - 1 - i];
    connections.push({ from, to });
  }
  // ordine casuale di apparizione delle linee
  for (let i = connections.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [connections[i], connections[j]] = [connections[j], connections[i]];
  }
}

function drawText() {
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `${FONT_SIZE * contentScale}px sans-serif`;
  for (const w of words) {
    ctx.fillText(w.word, w.x, w.y);
  }
}

function drawLines(upToIndex) {
  ctx.strokeStyle = LINE_COLOR;
  ctx.globalAlpha = LINE_OPACITY;
  ctx.lineWidth = Math.max(0.3, 0.5 * contentScale);
  for (let i = 0; i < Math.min(upToIndex, connections.length); i++) {
    const c = connections[i];
    ctx.beginPath();
    ctx.moveTo(c.from.cx, c.from.cy);
    ctx.lineTo(c.to.cx, c.to.cy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawText();
  drawLines(animationIndex);
}

function animate() {
  if (!animationRunning) return;
  const total = connections.length;
  if (total === 0) return;
  const elapsed = performance.now() - animationStartTime;
  const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
  animationIndex = Math.floor(progress * total);
  render();
  const sec = Math.floor(elapsed / 1000);
  statusEl.textContent = `${animationIndex.toLocaleString()} / ${total.toLocaleString()} linee · ${sec}s / 30s`;
  if (progress >= 1) {
    animationRunning = false;
    btnPlay.disabled = false;
    btnPause.disabled = true;
    statusEl.textContent = `${total.toLocaleString()} linee · completato`;
  } else {
    animationFrameId = requestAnimationFrame(animate);
  }
}

function startAnimation() {
  if (animationIndex >= connections.length) {
    animationIndex = 0;
  }
  animationRunning = true;
  animationStartTime = performance.now() - (animationIndex / connections.length) * ANIMATION_DURATION_MS;
  btnPlay.disabled = true;
  btnPause.disabled = false;
  animate();
}

function pauseAnimation() {
  animationRunning = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  btnPlay.disabled = false;
  btnPause.disabled = true;
}

function resetAnimation() {
  pauseAnimation();
  animationIndex = 0;
  render();
  statusEl.textContent = `0 / ${connections.length.toLocaleString()} linee`;
  btnPlay.disabled = false;
}

function startRecording() {
  const stream = canvas.captureStream(30); // 30 fps per video fluido
  mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recordedChunks = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size) recordedChunks.push(e.data);
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "romeo_juliet_visualization.webm";
    a.click();
    URL.revokeObjectURL(a.href);
    btnRecord.textContent = "Registra video";
    btnRecord.classList.remove("recording");
    btnRecord.disabled = false;
  };
  mediaRecorder.start();
  btnRecord.textContent = "Stop";
  btnRecord.classList.add("recording");
  btnRecord.disabled = true;
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}

document.getElementById("btnStart").addEventListener("click", () => {
  document.getElementById("title-slide").classList.add("hidden");
  if (connections.length > 0) {
    startAnimation();
  }
});

btnPlay.addEventListener("click", startAnimation);
btnPause.addEventListener("click", pauseAnimation);
btnReset.addEventListener("click", resetAnimation);
btnRecord.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") stopRecording();
  else startRecording();
});

async function init() {
  statusEl.textContent = "Caricamento testo...";
  let text;
  try {
    const res = await fetch("romeo_and_juliet.txt");
    text = await res.text();
  } catch (e) {
    statusEl.textContent =
      "Errore: avvia un server locale (es. python -m http.server 8080) e apri http://localhost:8080";
    return;
  }

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT; // fissi 9:16 per video verticale
  statusEl.textContent = "Layout parole...";
  const layoutResult = layoutWords(text);
  words = layoutResult.words;
  const contentHeight = layoutResult.maxY + PADDING;
  contentScale = 1;
  if (contentHeight > CANVAS_HEIGHT) {
    contentScale = CANVAS_HEIGHT / contentHeight;
    words.forEach((w) => {
      w.x *= contentScale;
      w.y *= contentScale;
      w.cx *= contentScale;
      w.cy *= contentScale;
    });
  }

  romeoPositions = words.filter((w) => isRomeo(w.word)).map((w) => ({ cx: w.cx, cy: w.cy }));
  julietPositions = words.filter((w) => isJuliet(w.word)).map((w) => ({ cx: w.cx, cy: w.cy }));

  buildConnections();
  statusEl.textContent = `${romeoPositions.length} Romeo, ${julietPositions.length} Juliet, ${connections.length.toLocaleString()} linee`;

  render();

  btnPlay.disabled = false;
  btnPause.disabled = true;
  btnReset.disabled = false;
  btnRecord.disabled = false;

  const btnStart = document.getElementById("btnStart");
  btnStart.disabled = false;
  btnStart.textContent = "Avvia animazione";
}

init();
