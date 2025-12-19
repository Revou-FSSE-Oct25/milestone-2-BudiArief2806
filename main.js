var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var gameElements = {
    playerNameInput: document.getElementById("player-name"),
    playerAgeInput: document.getElementById("player-age"),
    playerClassInput: document.getElementById("player-class"),
    playerInfo: document.getElementById("player-info"),
    // Game 1 & umum
    startBtn: document.getElementById("start-btn"),
    gameSection: document.getElementById("game-section"),
    guessInput: document.getElementById("guess-input"),
    guessBtn: document.getElementById("guess-btn"),
    gameMessage: document.getElementById("game-message"),
    paragraf: document.getElementById("teks"),
    // Game 2
    memorySection: document.getElementById("memory-section"),
    // Game 3
    clickerSection: document.getElementById("clicker-section"),
    clickerBtn: document.getElementById("clicker-btn"),
    clickerScoreSpan: document.getElementById("clicker-score"),
    clickerTimerSpan: document.getElementById("clicker-timer"),
    clickerMessage: document.getElementById("clicker-message"),
};
var memoryElements = {
    memoryGrid: document.getElementById("memory-grid"),
    memoryMessage: document.getElementById("memory-message"),
};
// Data pemain
var currentPlayer = null;
// Game 1
var secretNumber = null;
// Game 2
var symbols = ["🍎", "🍌", "🍇", "🍉"];
var memoryState = {
    firstCard: null,
    secondCard: null,
    lockedBoard: false,
    matchedPairs: 0,
};
// Game 3 (Clicker)
var clickerScore = 0;
var clickerTimeLeft = 10;
var clickerIntervalId = null;
var clickerRunning = false;
// ===== LOCAL STORAGE KEYS =====
var PLAYER_INFO_KEY = "playerInfo";
var CLICKER_BEST_KEY = "clickerBestScore";
// ===== UTIL: baca & simpan data pemain =====
function readPlayerInfo() {
    if (!gameElements.playerNameInput ||
        !gameElements.playerAgeInput ||
        !gameElements.playerClassInput) {
        return false;
    }
    var name = gameElements.playerNameInput.value.trim();
    var ageValue = Number(gameElements.playerAgeInput.value);
    var kelas = gameElements.playerClassInput.value.trim();
    if (!name || !kelas || isNaN(ageValue) || ageValue <= 0) {
        alert("Isi username, umur (angka > 0), dan kelas sebelum mulai game.");
        return false;
    }
    currentPlayer = {
        name: name,
        age: ageValue,
        kelas: kelas,
    };
    if (gameElements.playerInfo) {
        gameElements.playerInfo.textContent = "Pemain: ".concat(name, " \u00B7 Umur: ").concat(ageValue, " \u00B7 Kelas: ").concat(kelas);
    }
    localStorage.setItem(PLAYER_INFO_KEY, JSON.stringify(currentPlayer));
    return true;
}
function loadPlayerInfoFromStorage() {
    var saved = localStorage.getItem(PLAYER_INFO_KEY);
    if (!saved)
        return;
    try {
        var data = JSON.parse(saved);
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
            gameElements.playerInfo.textContent = "Pemain: ".concat(data.name, " \u00B7 Umur: ").concat(data.age, " \u00B7 Kelas: ").concat(data.kelas);
        }
    }
    catch (_a) { }
}
// ===== GAME 1: Tebak Angka =====
function startGame() {
    var _a;
    if (!gameElements.gameSection ||
        !gameElements.memorySection ||
        !gameElements.gameMessage ||
        !gameElements.guessInput) {
        return;
    }
    var ok = readPlayerInfo();
    if (!ok)
        return;
    gameElements.gameSection.classList.remove("hidden");
    gameElements.memorySection.classList.add("hidden");
    (_a = gameElements.clickerSection) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    secretNumber = Math.floor(Math.random() * 100) + 1;
    gameElements.gameMessage.textContent =
        "Saya sudah memilih angka. Coba tebak!";
    gameElements.guessInput.value = "";
    gameElements.guessInput.focus();
}
function handleGuess() {
    if (secretNumber === null ||
        !gameElements.guessInput ||
        !gameElements.gameMessage) {
        return;
    }
    var guess = Number(gameElements.guessInput.value);
    if (isNaN(guess) || guess < 1 || guess > 100) {
        gameElements.gameMessage.textContent = "Masukkan angka 1 sampai 100.";
        return;
    }
    var diff = guess - secretNumber;
    switch (true) {
        case diff === 0:
            gameElements.gameMessage.innerHTML = "Benar! Angkanya <strong>".concat(secretNumber, "</strong>. Lanjut ke Game 2...");
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
function startMemoryGame() {
    var _a;
    if (!gameElements.gameSection || !gameElements.memorySection) {
        return;
    }
    gameElements.gameSection.classList.add("hidden");
    gameElements.memorySection.classList.remove("hidden");
    (_a = gameElements.clickerSection) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    createMemoryCards();
}
function createMemoryCards() {
    if (!memoryElements.memoryGrid || !memoryElements.memoryMessage) {
        return;
    }
    memoryElements.memoryGrid.innerHTML = "";
    memoryState.firstCard = null;
    memoryState.secondCard = null;
    memoryState.lockedBoard = false;
    memoryState.matchedPairs = 0;
    memoryElements.memoryMessage.textContent = "Cocokkan semua pasangan kartu.";
    var cards = __spreadArray(__spreadArray([], symbols, true), symbols, true).sort(function () { return Math.random() - 0.5; });
    cards.forEach(function (symbol) {
        var card = document.createElement("button");
        card.className =
            "h-16 bg-slate-800 rounded flex items-center justify-center text-2xl " +
                "border border-slate-600 cursor-pointer";
        card.dataset.symbol = symbol;
        card.textContent = "";
        card.addEventListener("click", onCardClick);
        memoryElements.memoryGrid.appendChild(card);
    });
}
function onCardClick(e) {
    var _a;
    if (memoryState.lockedBoard)
        return;
    var card = e.currentTarget;
    if (!card)
        return;
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
    card.textContent = (_a = card.dataset.symbol) !== null && _a !== void 0 ? _a : "";
    card.classList.add("bg-orange-500/40");
    if (!memoryState.firstCard) {
        memoryState.firstCard = card;
        return;
    }
    memoryState.secondCard = card;
    memoryState.lockedBoard = true;
    checkForMatch();
}
function checkForMatch() {
    if (!memoryState.firstCard || !memoryState.secondCard) {
        resetTurn();
        return;
    }
    var isMatch = memoryState.firstCard.dataset.symbol ===
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
function handleMatch() {
    if (!memoryState.firstCard ||
        !memoryState.secondCard ||
        !memoryElements.memoryMessage) {
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
function hideCards() {
    if (!memoryState.firstCard || !memoryState.secondCard) {
        resetTurn();
        return;
    }
    setTimeout(function () {
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
function resetTurn() {
    memoryState.firstCard = null;
    memoryState.secondCard = null;
    memoryState.lockedBoard = false;
}
// ===== GAME 3: Clicker Game =====
function startClickerGame() {
    var _a, _b;
    if (!gameElements.clickerSection ||
        !gameElements.clickerScoreSpan ||
        !gameElements.clickerTimerSpan ||
        !gameElements.clickerMessage) {
        return;
    }
    (_a = gameElements.gameSection) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    (_b = gameElements.memorySection) === null || _b === void 0 ? void 0 : _b.classList.add("hidden");
    gameElements.clickerSection.classList.remove("hidden");
    clickerScore = 0;
    clickerTimeLeft = 10;
    clickerRunning = true;
    gameElements.clickerScoreSpan.textContent = String(clickerScore);
    gameElements.clickerTimerSpan.textContent = String(clickerTimeLeft);
    gameElements.clickerMessage.textContent = "";
    // hindari double listener
    if (gameElements.clickerBtn) {
        var newBtn = gameElements.clickerBtn.cloneNode(true);
        gameElements.clickerBtn.replaceWith(newBtn);
        gameElements.clickerBtn = newBtn;
    }
    var btn = gameElements.clickerBtn;
    if (!btn)
        return;
    btn.addEventListener("click", function () {
        if (!clickerRunning)
            return;
        clickerScore++;
        gameElements.clickerScoreSpan.textContent = String(clickerScore);
    });
    if (clickerIntervalId) {
        clearInterval(clickerIntervalId);
    }
    clickerIntervalId = window.setInterval(function () {
        clickerTimeLeft--;
        gameElements.clickerTimerSpan.textContent = String(clickerTimeLeft);
        if (clickerTimeLeft <= 0) {
            endClickerGame();
        }
    }, 1000);
}
function endClickerGame() {
    if (!gameElements.clickerMessage)
        return;
    clickerRunning = false;
    if (clickerIntervalId) {
        clearInterval(clickerIntervalId);
        clickerIntervalId;
    }
    gameElements.clickerMessage.innerHTML = "Waktu habis! Skor akhir kamu: <strong>".concat(clickerScore, "</strong>.");
    var bestRaw = localStorage.getItem(CLICKER_BEST_KEY);
    var best = bestRaw ? Number(bestRaw) : 0;
    if (isNaN(best) || clickerScore > best) {
        localStorage.setItem(CLICKER_BEST_KEY, String(clickerScore));
    }
}
// ===== DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", function () {
    var p = document.getElementById("teks");
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
