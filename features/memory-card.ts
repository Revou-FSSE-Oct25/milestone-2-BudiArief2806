// memory-card.ts
import { bindHomeButton, ensurePlayerExistsOrRedirect } from "../main.js";

interface MemoryElements {
  instructions: HTMLElement | null;
  startBtn: HTMLButtonElement | null;

  memoryGrid: HTMLElement | null;
  memoryMessage: HTMLElement | null;
}

interface MemoryState {
  firstCard: HTMLButtonElement | null;
  secondCard: HTMLButtonElement | null;
  lockedBoard: boolean;
  matchedPairs: number;
}

const el: MemoryElements = {
  instructions: document.getElementById("instructions") as HTMLElement,
  startBtn: document.getElementById("btn-start") as HTMLButtonElement,

  memoryGrid: document.getElementById("memory-grid") as HTMLElement,
  memoryMessage: document.getElementById("memory-message") as HTMLElement,
};

const symbols: string[] = ["🍎", "🍌", "🍇", "🍉"];

let state: MemoryState = {
  firstCard: null,
  secondCard: null,
  lockedBoard: false,
  matchedPairs: 0,
};

function setInstructions(): void {
  if (!el.instructions) return;

  el.instructions.innerHTML = `
    <div class="text-left text-sm text-slate-200 space-y-2">
      <p><strong>Cara bermain:</strong></p>
      <ol class="list-decimal ml-5 space-y-1">
        <li>Klik <strong>Mulai Game</strong> untuk mengacak kartu.</li>
        <li>Klik 2 kartu untuk membukanya.</li>
        <li>Jika simbol sama, kartu akan terkunci sebagai <em>matched</em>.</li>
        <li>Cocokkan semua pasangan untuk lanjut ke Clicker.</li>
      </ol>
    </div>
  `;
}

function resetState(): void {
  state = {
    firstCard: null,
    secondCard: null,
    lockedBoard: false,
    matchedPairs: 0,
  };
}

function startMemoryGame(): void {
  if (!el.memoryGrid || !el.memoryMessage) return;

  el.memoryGrid.innerHTML = "";
  resetState();

  el.memoryMessage.textContent = "Cocokkan semua pasangan kartu.";

  const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);

  cards.forEach((symbol) => {
    const card = document.createElement("button");
    card.className =
      "h-16 bg-slate-800 rounded flex items-center justify-center text-2xl " +
      "border border-slate-600 cursor-pointer";
    card.dataset.symbol = symbol;
    card.textContent = "";

    card.addEventListener("click", onCardClick);
    el.memoryGrid!.appendChild(card);
  });
}

function onCardClick(e: Event): void {
  if (state.lockedBoard) return;

  const card = e.currentTarget as HTMLButtonElement;
  if (!card) return;

  switch (true) {
    case card === state.firstCard:
      return;
    case card.classList.contains("matched"):
      return;
    default:
      break;
  }

  card.textContent = card.dataset.symbol ?? "";
  card.classList.add("bg-orange-500/40");

  if (!state.firstCard) {
    state.firstCard = card;
    return;
  }

  state.secondCard = card;
  state.lockedBoard = true;
  checkForMatch();
}

function checkForMatch(): void {
  if (!state.firstCard || !state.secondCard) {
    resetTurn();
    return;
  }

  const isMatch =
    state.firstCard.dataset.symbol === state.secondCard.dataset.symbol;

  switch (isMatch) {
    case true:
      handleMatch();
      break;
    case false:
      hideCards();
      break;
  }
}

function handleMatch(): void {
  if (!state.firstCard || !state.secondCard || !el.memoryMessage) return;

  state.firstCard.classList.add("matched", "bg-green-600/60");
  state.secondCard.classList.add("matched", "bg-green-600/60");
  state.matchedPairs++;
  resetTurn();

  if (state.matchedPairs === symbols.length) {
    el.memoryMessage.textContent =
      "Keren! Semua pasangan cocok. Pindah ke Clicker...";
    setTimeout(() => {
      window.location.href = "clicker.html";
    }, 900);
  }
}

function hideCards(): void {
  if (!state.firstCard || !state.secondCard) {
    resetTurn();
    return;
  }

  setTimeout(() => {
    if (!state.firstCard || !state.secondCard) {
      resetTurn();
      return;
    }
    state.firstCard.textContent = "";
    state.secondCard.textContent = "";
    state.firstCard.classList.remove("bg-orange-500/40");
    state.secondCard.classList.remove("bg-orange-500/40");
    resetTurn();
  }, 800);
}

function resetTurn(): void {
  state.firstCard = null;
  state.secondCard = null;
  state.lockedBoard = false;
}

document.addEventListener("DOMContentLoaded", () => {
  bindHomeButton();
  ensurePlayerExistsOrRedirect();

  setInstructions();

  // game mulai hanya setelah klik start (sesuai tugas: instruksi sebelum mulai)
  if (el.startBtn) el.startBtn.addEventListener("click", startMemoryGame);
});
