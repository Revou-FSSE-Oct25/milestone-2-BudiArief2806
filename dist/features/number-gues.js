// number-guessing.ts
import { GUESS_MIN, GUESS_MAX, MAX_ATTEMPTS, PLAYER_INFO_KEY, bindHomeButton, } from "../main.js";
const el = {
    playerNameInput: document.getElementById("player-name"),
    playerAgeInput: document.getElementById("player-age"),
    playerClassInput: document.getElementById("player-class"),
    playerInfo: document.getElementById("player-info"),
    instructions: document.getElementById("instructions"),
    startBtn: document.getElementById("btn-start"),
    gameSection: document.getElementById("game-section"),
    guessInput: document.getElementById("guess-input"),
    guessBtn: document.getElementById("guess-btn"),
    gameMessage: document.getElementById("game-message"),
    paragraf: document.getElementById("teks"),
    attemptsInfo: document.getElementById("attempts-info"),
};
let currentPlayer = null;
let secretNumber = null;
let attemptsLeft = MAX_ATTEMPTS;
function setInstructions() {
    if (!el.instructions)
        return;
    el.instructions.innerHTML = `
    <div class="text-left text-sm text-slate-200 space-y-2">
      <p><strong>Cara bermain:</strong></p>
      <ol class="list-decimal ml-5 space-y-1">
        <li>Isi data pemain (Username, Umur, Kelas).</li>
        <li>Klik <strong>Mulai Game</strong>.</li>
        <li>Tebak angka dari <strong>${GUESS_MIN}</strong> sampai <strong>${GUESS_MAX}</strong>.</li>
        <li>Kamu punya <strong>${MAX_ATTEMPTS}</strong> kesempatan.</li>
        <li>Jika benar, lanjut ke Memory Card.</li>
      </ol>
    </div>
  `;
}
function updateAttemptsUI() {
    if (!el.attemptsInfo)
        return;
    el.attemptsInfo.textContent = `Sisa kesempatan: ${attemptsLeft}/${MAX_ATTEMPTS}`;
}
function readPlayerInfo() {
    if (!el.playerNameInput || !el.playerAgeInput || !el.playerClassInput) {
        return false;
    }
    const name = el.playerNameInput.value.trim();
    const age = Number(el.playerAgeInput.value);
    const kelas = el.playerClassInput.value.trim();
    if (!name || !kelas || isNaN(age) || age <= 0) {
        alert("Isi username, umur (angka > 0), dan kelas sebelum mulai game.");
        return false;
    }
    currentPlayer = { name, age, kelas };
    if (el.playerInfo) {
        el.playerInfo.textContent = `Pemain: ${name} · Umur: ${age} · Kelas: ${kelas}`;
    }
    localStorage.setItem(PLAYER_INFO_KEY, JSON.stringify(currentPlayer));
    return true;
}
function loadPlayerToForm() {
    const saved = localStorage.getItem(PLAYER_INFO_KEY);
    if (!saved)
        return;
    try {
        const data = JSON.parse(saved);
        currentPlayer = data;
        if (el.playerNameInput)
            el.playerNameInput.value = data.name;
        if (el.playerAgeInput)
            el.playerAgeInput.value = String(data.age);
        if (el.playerClassInput)
            el.playerClassInput.value = data.kelas;
        if (el.playerInfo) {
            el.playerInfo.textContent = `Pemain: ${data.name} · Umur: ${data.age} · Kelas: ${data.kelas}`;
        }
    }
    catch { }
}
function startGame() {
    if (!el.gameSection || !el.gameMessage || !el.guessInput)
        return;
    const ok = readPlayerInfo();
    if (!ok)
        return;
    el.gameSection.classList.remove("hidden");
    // generate secret number
    secretNumber =
        Math.floor(Math.random() * (GUESS_MAX - GUESS_MIN + 1)) + GUESS_MIN;
    window.secretNumber = secretNumber;
    attemptsLeft = MAX_ATTEMPTS;
    updateAttemptsUI();
    el.gameMessage.textContent = "Saya sudah memilih angka. Coba tebak!";
    el.guessInput.value = "";
    el.guessInput.focus();
}
function handleGuess() {
    if (secretNumber === null || !el.guessInput || !el.gameMessage)
        return;
    const guess = Number(el.guessInput.value);
    if (isNaN(guess) || guess < GUESS_MIN || guess > GUESS_MAX) {
        el.gameMessage.textContent = `Masukkan angka ${GUESS_MIN} sampai ${GUESS_MAX}.`;
        return;
    }
    attemptsLeft--;
    updateAttemptsUI();
    const diff = guess - secretNumber;
    switch (true) {
        case diff === 0:
            el.gameMessage.innerHTML = `Benar! Angkanya <strong>${secretNumber}</strong>. Pindah ke Memory Card...`;
            secretNumber = null;
            window.secretNumber = null;
            setTimeout(() => {
                window.location.href = "memory-card.html";
            }, 900);
            return;
        case diff < 0:
            el.gameMessage.textContent =
                "Terlalu kecil, coba angka yang lebih besar.";
            break;
        case diff > 0:
            el.gameMessage.textContent =
                "Terlalu besar, coba angka yang lebih kecil.";
            break;
    }
    if (attemptsLeft <= 0) {
        el.gameMessage.innerHTML =
            `Kesempatan habis! Angka yang benar adalah <strong>${secretNumber}</strong>. ` +
                `Klik <strong>Mulai Game</strong> untuk coba lagi.`;
        secretNumber = null;
        window.secretNumber = null;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    bindHomeButton();
    if (el.paragraf)
        el.paragraf.textContent = "Indahnya permainan Anak-Anak";
    setInstructions();
    loadPlayerToForm();
    el.startBtn?.addEventListener("click", startGame);
    el.guessBtn?.addEventListener("click", handleGuess);
});
