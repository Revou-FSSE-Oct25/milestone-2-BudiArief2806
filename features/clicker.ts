// clicker.ts
import {
  bindHomeButton,
  ensurePlayerExistsOrRedirect,
  CLICKER_BEST_KEY,
  CLICKER_DURATION,
} from "../main.js";

interface ClickerElements {
  instructions: HTMLElement | null;
  startBtn: HTMLButtonElement | null;

  clickerBtn: HTMLButtonElement | null;
  clickerScoreSpan: HTMLElement | null;
  clickerTimerSpan: HTMLElement | null;
  clickerMessage: HTMLElement | null;
}

const el: ClickerElements = {
  instructions: document.getElementById("instructions") as HTMLElement,
  startBtn: document.getElementById("btn-start") as HTMLButtonElement,

  clickerBtn: document.getElementById("clicker-btn") as HTMLButtonElement,
  clickerScoreSpan: document.getElementById("clicker-score") as HTMLElement,
  clickerTimerSpan: document.getElementById("clicker-timer") as HTMLElement,
  clickerMessage: document.getElementById("clicker-message") as HTMLElement,
};

let score = 0;
let timeLeft = CLICKER_DURATION;
let intervalId: number | null = null;
let running = false;

function setInstructions(): void {
  if (!el.instructions) return;

  el.instructions.innerHTML = `
    <div class="text-left text-sm text-slate-200 space-y-2">
      <p><strong>Cara bermain:</strong></p>
      <ol class="list-decimal ml-5 space-y-1">
        <li>Klik <strong>Mulai Game</strong> untuk memulai timer.</li>
        <li>Selama <strong>${CLICKER_DURATION}</strong> detik, klik tombol <strong>CLICK</strong> secepat mungkin.</li>
        <li>Skor kamu = jumlah klik sebelum waktu habis.</li>
      </ol>
    </div>
  `;
}

function resetUI(): void {
  if (el.clickerScoreSpan) el.clickerScoreSpan.textContent = "0";
  if (el.clickerTimerSpan)
    el.clickerTimerSpan.textContent = String(CLICKER_DURATION);
  if (el.clickerMessage) el.clickerMessage.textContent = "";
}

function startClicker(): void {
  if (!el.clickerScoreSpan || !el.clickerTimerSpan || !el.clickerMessage)
    return;

  // reset state
  score = 0;
  timeLeft = CLICKER_DURATION;
  running = true;

  el.clickerScoreSpan.textContent = "0";
  el.clickerTimerSpan.textContent = String(timeLeft);
  el.clickerMessage.textContent = "Mulai! Klik cepat!";

  // anti double listener (pertahankan gaya kamu)
  if (el.clickerBtn) {
    const newBtn = el.clickerBtn.cloneNode(true) as HTMLButtonElement;
    el.clickerBtn.replaceWith(newBtn);
    el.clickerBtn = newBtn;
  }

  const btn = el.clickerBtn;
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!running) return;
    score++;
    el.clickerScoreSpan!.textContent = String(score);
  });

  if (intervalId !== null) clearInterval(intervalId);

  intervalId = window.setInterval(() => {
    timeLeft--;
    el.clickerTimerSpan!.textContent = String(timeLeft);

    if (timeLeft <= 0) {
      endClicker();
    }
  }, 1000);
}

function endClicker(): void {
  if (!el.clickerMessage) return;

  running = false;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  el.clickerMessage.innerHTML = `Waktu habis! Skor akhir kamu: <strong>${score}</strong>.`;

  const bestRaw = localStorage.getItem(CLICKER_BEST_KEY);
  const best = bestRaw ? Number(bestRaw) : 0;

  switch (true) {
    case isNaN(best) || score > best:
      localStorage.setItem(CLICKER_BEST_KEY, String(score));
      el.clickerMessage.innerHTML += `<br/><span class="text-green-300">Rekor baru! 🎉</span>`;
      break;

    default:
      el.clickerMessage.innerHTML += `<br/><span class="text-slate-300">Skor terbaik: <strong>${best}</strong></span>`;
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bindHomeButton();
  ensurePlayerExistsOrRedirect();

  setInstructions();
  resetUI();

  // mulai hanya setelah klik start (instruksi sebelum mulai)
  if (el.startBtn) el.startBtn.addEventListener("click", startClicker);
});
