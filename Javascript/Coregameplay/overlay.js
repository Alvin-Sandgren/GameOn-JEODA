// Javascript/Coregameplay/overlay.js
import { canvas, ctx, startMap, pauseMap, player } from "./map.js";

let currentState = "menu";
const startBtn = document.getElementById('start-btn');

const menuImg = new Image();
menuImg.src = "./Bilder/meny.png";

function fadeInOverlay() {
    const times = 5;           // fadeout counter
    let count = 0;

    function drawStep() {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        count++;
        if (count < times) {
            setTimeout(drawStep, 200); // vänta 200 ms innan nästa steg
        }
    }
    drawStep();
}

function showMenu() {
  currentState = "menu";
  startBtn.style.display = "block";
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(menuImg, 0,0,canvas.width,canvas.height);
  pauseMap();
}

function gameOver() {
  currentState = "gameover";
  startBtn.style.display = "block";
  player.x = 200;
  player.y = 4200;
  showMenu();
}

function enterCombat() {
  currentState = "combat";
  startBtn.style.display = "none";
  pauseMap();
  // enkel visual för combat
  fadeInOverlay();
  ctx.fillRect(0,0,canvas.width,canvas.height);
  setTimeout(()=> {
    ctx.fillStyle = "red";
    const rectW = 100, rectH = 100;
    ctx.fillRect((canvas.width-rectW)/2,(canvas.height-rectH)/2,rectW,rectH);
  }, 1000);
}

function startGame() {
  currentState = "overworld";
  startBtn.style.display = "none";
  startMap();
}

startBtn.addEventListener('click', startGame);

window.addEventListener('keydown', e => {
  if (currentState === "menu" && e.key === "Enter") startGame();
  else if (e.key.toLowerCase() === "m") showMenu();
  else if (e.key.toLowerCase() === "å") gameOver();
  else if (e.key.toLowerCase() === "ä") enterCombat();
});

// init: visa menyn första gången
menuImg.onload = () => showMenu();