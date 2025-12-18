interface GameElements {
  // pemain
  playerNameInput: HTMLInputElement | null;
  playerAgeInput: HTMLInputElement | null;
  playerClassInput: HTMLInputElement | null;
  playerInfo: HTMLElement | null;

  // Game 1 & umum
  startBtn: HTMLButtonElement | null;
  gameSection: HTMLElement | null;
  guessInput: HTMLInputElement | null;
  guessBtn: HTMLButtonElement | null;
  gameMessage: HTMLElement | null;
  paragraf: HTMLElement | null;

  // Game 2
  memorySection: HTMLElement | null;

  // Game 3 (Clicker)
  clickerSection: HTMLElement | null;
  clickerBtn: HTMLButtonElement | null;
  clickerScoreSpan: HTMLElement | null;
  clickerTimerSpan: HTMLElement | null;
  clickerMessage: HTMLElement | null;
}

interface MemoryElements {
  memoryGrid: HTMLElement | null;
  memoryMessage: HTMLElement | null;
}

interface MemoryState {
  firstCard: HTMLButtonElement | null;
  secondCard: HTMLButtonElement | null;
  lockedBoard: boolean;
  matchedPairs: number;
}

interface PlayerInfo {
  name: string;
  age: number;
  kelas: string;
}

const gameElements: GameElements = {
  playerNameInput: document.getElementById(
    "player-name"
  ) as HTMLInputElement | null,
  playerAgeInput: document.getElementById(
    "player-age"
  ) as HTMLInputElement | null,
  playerClassInput: document.getElementById(
    "player-class"
  ) as HTMLInputElement | null,
  playerInfo: document.getElementById("player-info") as HTMLElement | null,

  // Game 1 & umum
  startBtn: document.getElementById("start-btn") as HTMLButtonElement | null,
  gameSection: document.getElementById("game-section") as HTMLElement | null,
  guessInput: document.getElementById("guess-input") as HTMLInputElement | null,
  guessBtn: document.getElementById("guess-btn") as HTMLButtonElement | null,
  gameMessage: document.getElementById("game-message") as HTMLElement | null,
  paragraf: document.getElementById("teks") as HTMLElement | null,

  // Game 2
  memorySection: document.getElementById(
    "memory-section"
  ) as HTMLElement | null,

  // Game 3
  clickerSection: document.getElementById(
    "clicker-section"
  ) as HTMLElement | null,
  clickerBtn: document.getElementById(
    "clicker-btn"
  ) as HTMLButtonElement | null,
  clickerScoreSpan: document.getElementById(
    "clicker-score"
  ) as HTMLElement | null,
  clickerTimerSpan: document.getElementById(
    "clicker-timer"
  ) as HTMLElement | null,
  clickerMessage: document.getElementById(
    "clicker-message"
  ) as HTMLElement | null,
};

const memoryElements: MemoryElements = {
  memoryGrid: document.getElementById("memory-grid") as HTMLElement | null,
  memoryMessage: document.getElementById(
    "memory-message"
  ) as HTMLElement | null,
};

// Data pemain
let currentPlayer: PlayerInfo | null = null;

// Game 1
let secretNumber: number | null = null;

// Game 2
const symbols: string[] = ["🍎", "🍌", "🍇", "🍉"];

let memoryState: MemoryState = {
  firstCard: null,
  secondCard: null,
  lockedBoard: false,
  matchedPairs: 0,
};

// Game 3 (Clicker)
let clickerScore = 0;
let clickerTimeLeft = 10;
let clickerIntervalId: number | null = null;
let clickerRunning = false;

// ===== LOCAL STORAGE KEYS =====
const PLAYER_INFO_KEY = "playerInfo";
const CLICKER_BEST_KEY = "clickerBestScore";

// ===== UTIL: baca & simpan data pemain =====
function readPlayerInfo(): boolean {
  if (
    !gameElements.playerNameInput ||
    !gameElements.playerAgeInput ||
    !gameElements.playerClassInput
  ) {
    return false;
  }

  const name = gameElements.playerNameInput.value.trim();
  const ageValue = Number(gameElements.playerAgeInput.value);
  const kelas = gameElements.playerClassInput.value.trim();

  if (!name || !kelas || isNaN(ageValue) || ageValue <= 0) {
    alert("Isi username, umur (angka > 0), dan kelas sebelum mulai game.");
    return false;
  }

  currentPlayer = {
    name,
    age: ageValue,
    kelas,
  };

  if (gameElements.playerInfo) {
    gameElements.playerInfo.textContent = `Pemain: ${name} · Umur: ${ageValue} · Kelas: ${kelas}`;
  }

  localStorage.setItem(PLAYER_INFO_KEY, JSON.stringify(currentPlayer));
  return true;
}

function loadPlayerInfoFromStorage(): void {
  const saved = localStorage.getItem(PLAYER_INFO_KEY);
  if (!saved) return;

  try {
    const data = JSON.parse(saved) as PlayerInfo;
    currentPlayer = data;

    if (gameElements.playerNameInput) {
      gameElements.playerNameInput.value = data.name;
    }
    if (gameElements.playerAgeInput) {
      gameElements.playerAgeInput.value = String(data.age);
    }
    if (gameElements.playerClassInput) {
      gameElements.playerClassInput.value = data.kelas;
    }
    if (gameElements.playerInfo) {
      gameElements.playerInfo.textContent = `Pemain: ${data.name} · Umur: ${data.age} · Kelas: ${data.kelas}`;
    }
  } catch {}
}

// ===== GAME 1: Tebak Angka =====
function startGame(): void {
  if (
    !gameElements.gameSection ||
    !gameElements.memorySection ||
    !gameElements.gameMessage ||
    !gameElements.guessInput
  ) {
    return;
  }

  const ok = readPlayerInfo();
  if (!ok) return;

  gameElements.gameSection.classList.remove("hidden");
  gameElements.memorySection.classList.add("hidden");
  gameElements.clickerSection?.classList.add("hidden");

  secretNumber = Math.floor(Math.random() * 100) + 1;
  gameElements.gameMessage.textContent =
    "Saya sudah memilih angka. Coba tebak!";
  gameElements.guessInput.value = "";
  gameElements.guessInput.focus();
}

function handleGuess(): void {
  if (
    secretNumber === null ||
    !gameElements.guessInput ||
    !gameElements.gameMessage
  ) {
    return;
  }

  const guess = Number(gameElements.guessInput.value);

  if (isNaN(guess) || guess < 1 || guess > 100) {
    gameElements.gameMessage.textContent = "Masukkan angka 1 sampai 100.";
    return;
  }

  const diff = guess - secretNumber;

  switch (true) {
    case diff === 0:
      gameElements.gameMessage.innerHTML = `Benar! Angkanya <strong>${secretNumber}</strong>. Lanjut ke Game 2...`;
      secretNumber = null;
      setTimeout(startMemoryGame, 1200);
      break;

    case diff < 0:
      gameElements.gameMessage.textContent =
        "Terlalu kecil, coba angka yang lebih besar.";
      break;

    case diff > 0:
      gameElements.gameMessage.textContent =
        "Terlalu besar, coba angka yang lebih kecil.";
      break;

    default:
      gameElements.gameMessage.textContent =
        "Terjadi sesuatu yang tidak terduga.";
      break;
  }
}

// ===== GAME 2: Memory Card =====
function startMemoryGame(): void {
  if (!gameElements.gameSection || !gameElements.memorySection) {
    return;
  }

  gameElements.gameSection.classList.add("hidden");
  gameElements.memorySection.classList.remove("hidden");
  gameElements.clickerSection?.classList.add("hidden");

  createMemoryCards();
}

function createMemoryCards(): void {
  if (!memoryElements.memoryGrid || !memoryElements.memoryMessage) {
    return;
  }

  memoryElements.memoryGrid.innerHTML = "";
  memoryState.firstCard = null;
  memoryState.secondCard = null;
  memoryState.lockedBoard = false;
  memoryState.matchedPairs = 0;
  memoryElements.memoryMessage.textContent = "Cocokkan semua pasangan kartu.";

  const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);

  cards.forEach((symbol) => {
    const card = document.createElement("button");
    card.className =
      "h-16 bg-slate-800 rounded flex items-center justify-center text-2xl " +
      "border border-slate-600 cursor-pointer";
    card.dataset.symbol = symbol;
    card.textContent = "";

    card.addEventListener("click", onCardClick);
    memoryElements.memoryGrid!.appendChild(card);
  });
}

function onCardClick(e: Event): void {
  if (memoryState.lockedBoard) return;

  const card = e.currentTarget as HTMLButtonElement | null;
  if (!card) return;

  // gunakan switch untuk meng-handle kondisi klik kartu
  switch (true) {
    case card === memoryState.firstCard:
      // klik kartu yang sama, abaikan
      return;

    case card.classList.contains("matched"):
      // kartu sudah matched, abaikan
      return;

    default:
      break;
  }

  card.textContent = card.dataset.symbol ?? "";
  card.classList.add("bg-orange-500/40");

  if (!memoryState.firstCard) {
    memoryState.firstCard = card;
    return;
  }

  memoryState.secondCard = card;
  memoryState.lockedBoard = true;
  checkForMatch();
}

function checkForMatch(): void {
  if (!memoryState.firstCard || !memoryState.secondCard) {
    resetTurn();
    return;
  }

  const isMatch =
    memoryState.firstCard.dataset.symbol ===
    memoryState.secondCard.dataset.symbol;

  // switch untuk hasil pencocokan
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
  if (
    !memoryState.firstCard ||
    !memoryState.secondCard ||
    !memoryElements.memoryMessage
  ) {
    return;
  }

  memoryState.firstCard.classList.add("matched", "bg-green-600/60");
  memoryState.secondCard.classList.add("matched", "bg-green-600/60");
  memoryState.matchedPairs++;
  resetTurn();

  if (memoryState.matchedPairs === symbols.length) {
    memoryElements.memoryMessage.textContent =
      "Keren! Semua pasangan sudah cocok . Lanjut ke Clicker Game...";
    setTimeout(startClickerGame, 1200);
  }
}

function hideCards(): void {
  if (!memoryState.firstCard || !memoryState.secondCard) {
    resetTurn();
    return;
  }

  setTimeout(() => {
    if (!memoryState.firstCard || !memoryState.secondCard) {
      resetTurn();
      return;
    }
    memoryState.firstCard.textContent = "";
    memoryState.secondCard.textContent = "";
    memoryState.firstCard.classList.remove("bg-orange-500/40");
    memoryState.secondCard.classList.remove("bg-orange-500/40");
    resetTurn();
  }, 800);
}

function resetTurn(): void {
  memoryState.firstCard = null;
  memoryState.secondCard = null;
  memoryState.lockedBoard = false;
}

// ===== GAME 3: Clicker Game =====
function startClickerGame(): void {
  if (
    !gameElements.clickerSection ||
    !gameElements.clickerScoreSpan ||
    !gameElements.clickerTimerSpan ||
    !gameElements.clickerMessage
  ) {
    return;
  }

  gameElements.gameSection?.classList.add("hidden");
  gameElements.memorySection?.classList.add("hidden");
  gameElements.clickerSection.classList.remove("hidden");

  clickerScore = 0;
  clickerTimeLeft = 10;
  clickerRunning = true;

  gameElements.clickerScoreSpan.textContent = String(clickerScore);
  gameElements.clickerTimerSpan.textContent = String(clickerTimeLeft);
  gameElements.clickerMessage.textContent = "";

  // hindari double listener
  if (gameElements.clickerBtn) {
    const newBtn = gameElements.clickerBtn.cloneNode(true) as HTMLButtonElement;
    gameElements.clickerBtn.replaceWith(newBtn);
    gameElements.clickerBtn = newBtn;
  }

  const btn = gameElements.clickerBtn;
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!clickerRunning) return;
    clickerScore++;
    gameElements.clickerScoreSpan!.textContent = String(clickerScore);
  });

  if (clickerIntervalId !== null) {
    clearInterval(clickerIntervalId);
  }

  clickerIntervalId = window.setInterval(() => {
    clickerTimeLeft--;
    gameElements.clickerTimerSpan!.textContent = String(clickerTimeLeft);

    if (clickerTimeLeft <= 0) {
      endClickerGame();
    }
  }, 1000);
}

function endClickerGame(): void {
  if (!gameElements.clickerMessage) return;

  clickerRunning = false;

  if (clickerIntervalId !== null) {
    clearInterval(clickerIntervalId);
    clickerIntervalId = null;
  }

  gameElements.clickerMessage.innerHTML = `Waktu habis! Skor akhir kamu: <strong>${clickerScore}</strong>.`;

  const bestRaw = localStorage.getItem(CLICKER_BEST_KEY);
  const best = bestRaw ? Number(bestRaw) : 0;
  if (isNaN(best) || clickerScore > best) {
    localStorage.setItem(CLICKER_BEST_KEY, String(clickerScore));
  }
}

// ===== DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", () => {
  const p = document.getElementById("teks") as HTMLElement | null;
  if (p) {
    p.innerHTML = "Indahnya permainan Anak-Anak";
  }

  loadPlayerInfoFromStorage();

  if (gameElements.startBtn) {
    gameElements.startBtn.addEventListener("click", startGame);
  }
  if (gameElements.guessBtn) {
    gameElements.guessBtn.addEventListener("click", handleGuess);
  }
});
