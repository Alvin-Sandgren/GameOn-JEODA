import { Character, obstacle, Goat } from "./classer.js";

export let onCombatTrigger = null;

// DOM & canvas (exporteras så andra moduler kan använda dem)
export const canvas = document.getElementById('karta');
export const ctx = canvas.getContext('2d');

// canvas-standardstorlek (kan ändras av fullscreen.js senare)
canvas.width = 1910;
canvas.height = 920;

// värld
export const worldWidth = canvas.width * 6;
export const worldHeight = canvas.height * 5;

// spelstatus
export let paused = true;
let lastFrameTime = 0;
export function startMap() { paused = false; }
export function pauseMap() { paused = true; }

// kamera
let cameraX = 0;
let cameraY = 0;

// input
export const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// spelare (exporteras så overlay kan flytta den vid gameover)
export const player = new Character(1700, 2855, 100, 100, 10, 2, "./character_bilder/meatball_fullkladd.png");

export const enemyGoats = [
    new Goat(5450, 2200, 300, 300, "./Goat_bilder/gwget.png"),
    new Goat(1500,2855,150,150, "./Goat_bilder/stenget.png"),
    new Goat(7300,4300,200,200, "./Goat_bilder/stefanget.png"),
    new Goat(600,975,450,450, "./Goat_bilder/antonget.png")

]

// ritfunktioner
export function drawBackground() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, worldWidth, worldHeight);
}
export function drawGround() {
  ctx.fillStyle = "green";
  ctx.fillRect(0, worldHeight - 100, worldWidth, 100);
}

// obstacles (använd obstacle-klassen och kalla draw(ctx))
export const obstacles = [
    // platforms spawn
    new obstacle(700, 4300, 300, 50),
    new obstacle(1200, 4200, 200, 50),
    new obstacle(1600, 4000, 40, 50),
    new obstacle(1800, 4025, 800, 475),

    //Dropper shute
    new obstacle(1800, 3000, 100, 900),

    //Vänster sida plus tak på droppern och gången till dash/get nr 2
    new obstacle(1300, 3000, 500, 100, "green"),
    
    new obstacle(400, 2500, 4000, 100, "gray"),

    //Cave entrance 1.Tak 2.Väggar 3. Temporär barrier
    new obstacle(4000, 0, 2600, 1900, "gray"),
    new obstacle(4300, 2500, 100, 200, "gray"),
    new obstacle(4300, 2700, 2300, 200, "gray"),
    new obstacle(6100, 1901, 20, 798, "red"),
    new obstacle(6500, 1800, 100, 1000, "gray"),

    new obstacle(6200, 2600, 275, 100, "gray"),
    new obstacle(6250, 2550, 177, 100, "gray"),

    // Vägen till nivå 5
    new obstacle(3000, 2000, 200, 50, "green"),

    //Nivå 5 plattformar
    new obstacle(3500, 1700, 500, 200, "green"),
    new obstacle(0, 1400, 2600, 200, "green"),


    //Obstacles mot nivå 3
    new obstacle(950, 3000, 45, 30, "green"),

    new obstacle(500, 3000, 39, 30),
    new obstacle(300, 2750, 30, 30),

    // Höger sida
    new obstacle(2500, 2600, 100, 1275,),

    new obstacle(2000, 3600, 100, 50),
    new obstacle(2200, 3800, 50, 50),
    new obstacle(2000, 3400, 75, 50),
    new obstacle(2200, 3200, 100, 50),

    //Platforms efter droppern
    new obstacle(3000, 4400, 150, 100),
    new obstacle(2800, 4250, 150, 250),


    //Lavablock när man inte har dash
    new obstacle(3450, 4490, 50, 10, "gray"),
    new obstacle(3500, 4500, 600, 600, "red"),

    //Platforms som leder till nivå 4
    new obstacle(5000, 4300, 75, 25, "gray"),
    new obstacle(5500, 4200, 75, 50, "gray"),
    new obstacle(5000, 4000, 75, 75, "gray"),

    //Till nivå 4 trappor tillbaka
    new obstacle(5700, 3800, 100, 1000, "gray"),
    new obstacle(5800, 4000, 150, 700, "gray"),
    new obstacle(5950, 4200, 150, 700, "gray"),
    new obstacle(6100, 4400, 150, 700, "gray"),

    //Nivå 4 boss arena plus double jump

    new obstacle(7955, 3850, 100, 50, "gray"),
    new obstacle(7990, 3900, 30, 600, "orange"),
    new obstacle(8000, 3900, 10, 600, "yellow"),
    new obstacle(8015, 3900, 5, 600, "red"),
    new obstacle(7990, 3900, 5, 600, "red"),
    new obstacle(7955, 4495, 100, 50, "gray"),


    new obstacle(8500, 4400, 150, 100, "gray"),
    new obstacle(8600, 4350, 100, 100, "gray"),
    new obstacle(8650, 4400, 150, 100, "gray"),

    //Väggar på sidorna
    new obstacle(worldWidth - 30, 0, 30, 10000, "green"),
    new obstacle(0, 0, 30, 10000, "green")
];

// kamerauppdatering
function updateCamera() {
  cameraX = player.x + player.w / 2 - canvas.width / 2;
  cameraY = player.y + player.h / 2 - canvas.height / 2;
  cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));
  cameraY = Math.max(0, Math.min(cameraY, worldHeight - canvas.height));
}

// game loop (modulen startas automatiskt)
const targetFPS = 60;
const frameDuration = 1000 / targetFPS;

export function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);
  if (paused) return;
  const elapsed = timestamp - lastFrameTime;
  if (elapsed >= frameDuration) {
    lastFrameTime = timestamp - (elapsed % frameDuration);
    updateCamera();
    ctx.save();
    ctx.translate(-cameraX, -cameraY);
    drawBackground();
    drawGround();
    for (let obs of obstacles) obs.draw(ctx);
    player.update(obstacles, worldHeight - 95, keys);
    player.draw(ctx);
    for (let goat of enemyGoats) {
    goat.draw(ctx);
    }
        // --- Kolla om spelaren nuddar en get ---
    for (let goat of enemyGoats) {
    if (
        player.x < goat.x + goat.w &&
        player.x + player.w > goat.x &&
        player.y < goat.y + goat.h &&
        player.y + player.h > goat.y
    ) {
        if (onCombatTrigger) {
        onCombatTrigger(); // 🔥 anropa funktionen om den är kopplad
        }
        break;
    }
    }

    ctx.restore();
  }
}

// starta loopen (requestAnimationFrame körs men pausad tills startMap())
requestAnimationFrame(gameLoop);

// Direktbind startknapp i modulen (bättre än inline onclick)
const startBtn = document.getElementById('start-btn');
if (startBtn) {
  startBtn.addEventListener('click', () => {
    startMap();
  });
}

export function setCombatTrigger(callback) {
  onCombatTrigger = callback;
}