export const GUESS_MIN = 1;
export const GUESS_MAX = 100;
export const MAX_ATTEMPTS = 5;
export const CLICKER_DURATION = 10;
export const PLAYER_INFO_KEY = "playerInfo";
export const CLICKER_BEST_KEY = "clickerBestScore";
export function goHome() {
    window.location.href = "index.html";
}
export function bindHomeButton() {
    const homeBtn = document.getElementById("btn-home");
    if (!homeBtn)
        return;
    homeBtn.addEventListener("click", goHome);
}
export function loadPlayerInfoFromStorage() {
    const saved = localStorage.getItem(PLAYER_INFO_KEY);
    if (!saved)
        return null;
    try {
        return JSON.parse(saved);
    }
    catch {
        return null;
    }
}
export function ensurePlayerExistsOrRedirect() {
    const p = loadPlayerInfoFromStorage();
    if (!p) {
        window.location.href = "number-gues.html"; // <-- sesuaikan nama file kamu
        return null;
    }
    return p;
}
