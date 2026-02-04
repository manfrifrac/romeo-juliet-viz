/**
 * Romeo e Giulietta - Visualizzazione con linee Romeo-Juliet
 * Collega ogni istanza di "Romeo" con ogni istanza di "Juliet"
 */

// 9:16 formato verticale telefono
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const BASE_ANIMATION_DURATION_MS = 15000; // durata standard 15 secondi
const FONT_SIZE = 5;
const LINE_HEIGHT = 7;
const PADDING = 40;
const TEXT_COLOR = "#555555";
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
let animationDurationMs = BASE_ANIMATION_DURATION_MS;
let storyMode = "chronological"; // "random" oppure "chronological"
let mediaRecorder = null;
let recordedChunks = [];
let contentScale = 1;
let zoomLevel = 1;
const MIN_ZOOM = 1;
const MAX_ZOOM = 16;
let dpr = window.devicePixelRatio || 1;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const btnPlay = document.getElementById("btnPlay");
const btnPause = document.getElementById("btnPause");
const btnReset = document.getElementById("btnReset");
const btnRecord = document.getElementById("btnRecord");
const btnZoomIn = document.getElementById("btnZoomIn");
const btnZoomOut = document.getElementById("btnZoomOut");
const statusEl = document.getElementById("status");

function applyZoom() {
  // zoom ottico via CSS, canvas resta ad alta risoluzione dpr
  canvas.style.transformOrigin = "center center";
  canvas.style.transform = `scale(${zoomLevel})`;
}

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
  ctx.font = `${FONT_SIZE}px "Times New Roman", "Georgia", serif`;

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
  // collega OGNI Romeo con OGNI Juliet (prodotto cartesiano)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const from = romeoPositions[i];
      const to = julietPositions[j];
      connections.push({ from, to });
    }
  }
  // ordine di apparizione delle linee:
  // - "random": web caotico, come innamoramento improvviso
  // - "chronological": dal primo incontro all'ultima scena
  if (storyMode === "random") {
    for (let i = connections.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [connections[i], connections[j]] = [connections[j], connections[i]];
    }
  }
}

function drawText() {
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `${FONT_SIZE * contentScale}px "Times New Roman", "Georgia", serif`;
  for (const w of words) {
    ctx.fillText(w.word, w.x, w.y);
  }
}

function drawLines(upToIndex) {
  ctx.strokeStyle = LINE_COLOR;
  ctx.globalAlpha = LINE_OPACITY;
  // linee il più sottili possibile ma ancora visibili
  ctx.lineWidth = Math.max(0.05, 0.15 * contentScale);
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
  const linear = Math.min(elapsed / animationDurationMs, 1);
  // ease-in: partenza lenta, poi accelera (quadratico)
  const eased = linear * linear;
  animationIndex = Math.floor(eased * total);
  render();
  const sec = Math.floor(elapsed / 1000);
  const totalSec = Math.round(animationDurationMs / 1000);
  statusEl.textContent = `${animationIndex.toLocaleString()} / ${total.toLocaleString()} linee · ${sec}s / ${totalSec}s`;
  if (linear >= 1) {
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
  animationStartTime = performance.now() - (animationIndex / connections.length) * animationDurationMs;
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

function zoomIn() {
  zoomLevel = Math.min(MAX_ZOOM, zoomLevel * 1.4);
  applyZoom();
}

function zoomOut() {
  zoomLevel = Math.max(MIN_ZOOM, zoomLevel / 1.4);
  applyZoom();
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
  // leggi le scelte narrative dallo splash
  const speedSelect = document.getElementById("speedSelect");
  const storySelect = document.getElementById("storySelect");
  if (speedSelect) {
    if (speedSelect.value === "slow") animationDurationMs = BASE_ANIMATION_DURATION_MS * 2;
    else if (speedSelect.value === "fast") animationDurationMs = BASE_ANIMATION_DURATION_MS / 2;
    else animationDurationMs = BASE_ANIMATION_DURATION_MS;
  }
  if (storySelect) {
    storyMode = storySelect.value === "chronological" ? "chronological" : "random";
    // ricostruisci le connessioni nel nuovo ordine narrativo
    buildConnections();
  }
  document.getElementById("title-slide").classList.add("hidden");
  document.body.classList.add("no-toolbar");
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
if (btnZoomIn) btnZoomIn.addEventListener("click", zoomIn);
if (btnZoomOut) btnZoomOut.addEventListener("click", zoomOut);

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

  // canvas ad alta definizione per evitare sfocatura su mobile
  dpr = window.devicePixelRatio || 1;
  canvas.width = CANVAS_WIDTH * dpr;
  canvas.height = CANVAS_HEIGHT * dpr; // fissi 9:16 per video verticale
  canvas.style.width = CANVAS_WIDTH + "px";
  canvas.style.height = CANVAS_HEIGHT + "px";
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
  // centra il blocco di testo orizzontalmente (spazi uguali a destra e sinistra)
  let minX = Infinity;
  let maxX = -Infinity;
  words.forEach((w) => {
    if (w.x < minX) minX = w.x;
    const right = w.x + w.width;
    if (right > maxX) maxX = right;
  });
  if (isFinite(minX) && isFinite(maxX) && maxX > minX) {
    const usedWidth = maxX - minX;
    const offsetX = (CANVAS_WIDTH - usedWidth) / 2 - minX;
    words.forEach((w) => {
      w.x += offsetX;
      w.cx += offsetX;
    });
  }

  romeoPositions = words.filter((w) => isRomeo(w.word)).map((w) => ({ cx: w.cx, cy: w.cy }));
  julietPositions = words.filter((w) => isJuliet(w.word)).map((w) => ({ cx: w.cx, cy: w.cy }));

  buildConnections();
  statusEl.textContent = `${romeoPositions.length} Romeo, ${julietPositions.length} Juliet, ${connections.length.toLocaleString()} linee`;

  // aggiorna il testo delle occorrenze nello splash (se presente)
  const countsEl = document.getElementById("countsText");
  if (countsEl) {
    countsEl.textContent = `${romeoPositions.length} occurrences of “Romeo” and ${julietPositions.length} of “Juliet”.`;
  }

  // applica lo zoom iniziale (1x) e disegna
  applyZoom();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  render();

  btnPlay.disabled = false;
  btnPause.disabled = true;
  btnReset.disabled = false;
  btnRecord.disabled = false;
  if (btnZoomIn) btnZoomIn.disabled = false;
  if (btnZoomOut) btnZoomOut.disabled = false;

  const btnStart = document.getElementById("btnStart");
  btnStart.disabled = false;
  btnStart.textContent = "Start animation";
}

init();
