import { canvas, ctx, startMap, pauseMap, player, setCombatTrigger, combatGoats } from "./map.js";
import { startCombat, PlayerActions, playerAction, drawCombat } from "./combat.js";
import { Soundmanager } from "./ljud.js";
import * as MapModule from "./map.js";

let currentState = "menu";
let currentCombatGoat = null;

export const soundmanager = new Soundmanager();

const startBtn = document.getElementById('start-btn');
const menuImg = new Image();
menuImg.src = "./Bilder/meny.png";

//  Combat & Game Over Triggers 
window.addEventListener("DOMContentLoaded", () => {
  setCombatTrigger((collidedGoat) => {
    if (currentState === "overworld") {
      enterCombat(collidedGoat);
    }
  });

  MapModule.setGameOverTrigger(() => {
    gameOver();
  });
});

// Fade overlay for transitions 
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

//  Menu 
export function showMenu() {
  currentState = "menu";
  soundmanager.playMenu();
  startBtn.style.display = "block";

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (menuImg.complete) {
    ctx.drawImage(menuImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  pauseMap();
}

//  Game Over 
export function gameOver() {
  console.log("🔥 Game over triggered!");
  currentState = "gameover";
  pauseMap();

  let opacity = 0;
  const fadeInterval = setInterval(() => {
    opacity += 0.05;
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (opacity >= 1) {
      clearInterval(fadeInterval);
      drawGameOverText();
    }
  }, 50);
}

function resetToMenu() {
  player.x = 200;
  player.y = 4200;
  showMenu();
}

//  Combat 
export function enterCombat(collidedGoat) {
    pauseMap();
    soundmanager.playCombat();
    fadeInOverlay(() => {
        currentState = "combat";
        startCombat(collidedGoat);
        currentCombatGoat = collidedGoat;

        // Om drawCombat finns exporterat så rita upp combaten direkt
        if (typeof drawCombat === "function") {
          drawCombat(collidedGoat);
        }
    });
}

//  Start Game 
export function startGame() {
    currentState = "overworld";
    soundmanager.playOverworld();
    startBtn.style.display = "none";
    startMap();
}

//  Event Listeners 
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

//  Initial Menu 
menuImg.onload = () => showMenu();

function drawGameOverText() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.font = "bold 120px Georgia";
  ctx.textAlign = "center";
  ctx.fillText("YOU DIED", canvas.width / 2, canvas.height / 2 - 50);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Click anywhere to return to the menu", canvas.width / 2, canvas.height / 2 + 50);

  const handleClick = () => {
    canvas.removeEventListener("click", handleClick);
    resetToMenu();
  };
  canvas.addEventListener("click", handleClick);
}