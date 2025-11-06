import { canvas, ctx, startMap, pauseMap, player, setCombatTrigger, combatGoats } from "./map.js";
import { startCombat, PlayerActions, playerAction } from "./combat.js";
import * as MapModule from "./map.js";

let currentState = "menu";
let currentCombatGoat = null;

const startBtn = document.getElementById('start-btn');
const menuImg = new Image();
menuImg.src = "./Bilder/meny.png";

setCombatTrigger((collidedGoat) => {
  if (currentState === "overworld") {
    enterCombat(collidedGoat); // skicka med den kolliderade geten
  }
});

// --- Menu ---
function fadeInOverlay(callback) {
    let count = 0;
    const times = 6;

    function step() {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        count++;
        if (count < times) setTimeout(step, 200);
        else if (callback) callback();
    }
    step();
}

function showMenu() {
    currentState = "menu";
    startBtn.style.display = "block";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(menuImg, 0, 0, canvas.width, canvas.height);
    pauseMap();
}

function gameOver() {
    currentState = "gameover";
    startBtn.style.display = "block";
    player.x = 200;
    player.y = 4200;
    showMenu();
}

export function enterCombat(collidedGoat) {
    pauseMap();
    fadeInOverlay();

    setTimeout(() => {
        currentState = "combat";
        startCombat(collidedGoat);  // nu får combat exakt den get vi krockade med
    }, 1200);
}

// --- Start Game ---
function startGame() {
    currentState = "overworld";
    startBtn.style.display = "none";
    startMap();
}

// --- Event Listeners ---
startBtn.addEventListener('click', startGame);

window.addEventListener('keydown', e => {
    if (currentState === "menu" && e.key === "Enter") startGame();
    else if (e.key.toLowerCase() === "m") showMenu();
    else if (e.key.toLowerCase() === "å") gameOver();
    else if (e.key.toLowerCase() === "l") startGame();
});

canvas.addEventListener("click", (e) => {
    if (currentState !== "combat") return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    PlayerActions.forEach((action, i) => {
        const btnX = 50;
        const btnY = 120 + i*40;
        const btnW = 120;
        const btnH = 30;

        if (mouseX >= btnX && mouseX <= btnX + btnW &&
            mouseY >= btnY && mouseY <= btnY + btnH
        ) {
            playerAction(i, currentCombatGoat);
        }
    });
});

// --- Initial Menu ---
menuImg.onload = () => showMenu();