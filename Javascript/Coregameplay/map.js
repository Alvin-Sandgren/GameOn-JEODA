import { Character, Obstacle, Goat, Lava, Skylt } from "./classer.js";

// GameOver-trigger och flagga
let hasShirt = false;
let hasBoots = false;

export let onCombatTrigger = null;
export let onGameOver = null;
let gameOverTriggered = false;
export function setCombatTrigger(callback) { onCombatTrigger = callback; }
export function setGameOverTrigger(callback) { onGameOver = callback; }

// DOM & canvas
export const canvas = document.getElementById('karta');
export const ctx = canvas.getContext('2d');

// canvas-standardstorlek 
canvas.width = 1910;
canvas.height = 920;

// värld
export const worldWidth = canvas.width * 6;
export const worldHeight = canvas.height * 5;

// spelstatus
export let paused = true;
let lastFrameTime = 0;

export function startMap() {
  paused = false;
  gameOverTriggered = false; 
}

export function pauseMap() { paused = true; }

// kamera
let cameraX = 0;
let cameraY = 0;

// input
export const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

export const player = new Character(
  8000, 4400, 100, 100, 10, 2,
  "./character_bilder/meatball_nack.png",      
  "./character_bilder/Meatball_Lleg.png",      
  "./character_bilder/Meatball_nack_Rleg.png", 
  [                                             
    "./character_bilder/Meatball_dash1.png",
    "./character_bilder/Meatball_dash2.png",
    "./character_bilder/Meatball_dash3.png",
    "./character_bilder/Meatball_dash4.png"
  ],
  "./character_bilder/Meatball_Jump_nack.png"      
);


// getter (fiender)
export const enemygoatgw = new Goat(5450, 2200, 300, 300, "./Goat_bilder/gwget.png", "GWget");
export const enemygoatsten = new Goat(1500, 2855, 150, 150, "./Goat_bilder/stenget.png", "Stenget");
export const enemygoatstefan = new Goat(7300, 4300, 200, 200, "./Goat_bilder/stefanget.png", "Stefanget");
export const enemygoatanton = new Goat(600, 975, 450, 450, "./Goat_bilder/antonget.png", "Antonget");

export let combatGoats = [enemygoatgw, enemygoatsten, enemygoatstefan, enemygoatanton];

// --- Bakgrundsbild ---
export const backgroundImage = new Image();
let backgroundLoaded = false;
backgroundImage.src = "./Bilder/bakgrund.png";
backgroundImage.onload = () => {
  backgroundLoaded = true;
};

export function drawBackground() {
  if (backgroundLoaded) {
    // Rita bakgrund på hela canvas
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Rita permanent mörkning ovanpå
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // justera 0.05–0.15
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  } else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

export const groundImage = new Image();
let groundLoaded = false;
groundImage.src = "./Bilder/ground.png";
groundImage.onload = () => {
  groundLoaded = true;
};

export function drawGround() {
  if (groundLoaded) {
    // Rita markbild längst ner på världen
    ctx.drawImage(groundImage, 0, worldHeight - 100, worldWidth, 100);
  } else {
    // Fallback (om bilden inte hunnit ladda)
    ctx.fillStyle = "#654321"; // brunaktig reservfärg
    ctx.fillRect(0, worldHeight - 100, worldWidth, 100);
  }
}


// skriver text för visa keybinds 
function drawKeybinds() {
  ctx.fillStyle = "gray";
  ctx.fillRect(100, 3950, 850, 250);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.strokeRect(100, 3950, 850, 250);
  
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";

  ctx.fillText("Såhär spelar du:", 150, 4010);
  ctx.fillText("Gå Vänster/Höger: A/D eller ← →", 150, 4080);
  ctx.fillText("Hoppa: W eller Mellanslag", 150, 4150);
}

// obstacles
export const obstacles = [
  // platforms spawn
  new Obstacle(700, 4300, 300, 50, "./Bilder/grass_platform.png"),
  new Obstacle(1200, 4200, 200, 50, "./Bilder/grass_platform.png"),
  new Obstacle(1600, 4100, 70, 50, "./Bilder/grass_platform.png"),
  new Obstacle(1800, 4025, 800, 575, "Bilder/grassplatformstor.png"),

  //Dropper shute
  new Obstacle(1800, 3000, 100, 900),

  //Vänster sida plus tak på droppern och gången till dash/get nr 2
  new Obstacle(1300, 3000, 500, 100, "./Bilder/stone_platform.png"),
  new Obstacle(400, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(700, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(1000, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(1300, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(1600, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(1900, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(2200, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(2500, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(2800, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(3100, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(3400, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(3700, 2500, 300, 100, "./Bilder/stone_platform.png"),
  new Obstacle(4000, 2500, 300, 100, "./Bilder/stone_platform.png"),

  //Cave entrance
  new Obstacle(4000, 0, 2600, 1900, "gray"),
  new Obstacle(4300, 2500, 100, 205, "gray"),
  new Obstacle(4300, 2700, 2300, 430, "gray"),
  //new Obstacle(6100, 1901, 20, 798, "red"),
  new Obstacle(6500, 1800, 1000, 1430, "gray"),
  new Obstacle(6200, 2600, 275, 100, "./Bilder/stone_platform.png"),
  //Här imellan hamnar trjöjan
  new Obstacle(6250, 2550, 177, 100, "./Bilder/stone_platform.png"),

  // Vägen till nivå 5
  new Obstacle(3000, 2000, 200, 50, "./Bilder/grass_platform.png"),

  //Nivå 5 platformar
  new Obstacle(3400, 1700, 300, 100, "Bilder/grass_platform.png"),
  new Obstacle(0, 1400, 2600, 200, "green"),

  //Obstacles mot nivå 3
  new Obstacle(950, 3000, 45, 30, "./Bilder/stone_platform.png"),
  new Obstacle(500, 3000, 39, 30,"./Bilder/stone_platform.png"),
  new Obstacle(300, 2750, 30, 30,"./Bilder/stone_platform.png"),

  // Höger sida
  new Obstacle(2500, 2600, 100, 1275,),
  new Obstacle(2000, 3600, 100, 50,"./Bilder/grass_platform.png"),
  new Obstacle(2200, 3800, 50, 50,"./Bilder/grass_platform.png"),
  new Obstacle(2000, 3400, 75, 50,"./Bilder/grass_platform.png"),
  new Obstacle(2200, 3200, 100, 50,"./Bilder/grass_platform.png"),

  //Platforms efter droppern
  new Obstacle(3000, 4400, 150, 100,"Bilder/grassplatformstor.png"),
  new Obstacle(2800, 4250, 150, 250,"Bilder/grassplatformstor.png"),

  //Lavablock som hindrar progress när man inte har dash
  new Obstacle(3400, 4475, 50 , 25, "./Bilder/stone_platform.png"),
  new Obstacle(3450, 4450, 50, 50, "./Bilder/stone_platform.png"),
  new Lava(3500, 4500, 600, 600),   // Lavan
  new Obstacle(4100, 4450, 50, 50, "./Bilder/stone_platform.png"),
  new Obstacle(4150, 4475, 50, 25, "./Bilder/stone_platform.png"),

  //Platforms som leder till nivå 4
  new Obstacle(5050, 4300, 75, 25, "./Bilder/stone_platform.png"),
  new Obstacle(5600, 4200, 100, 50, "./Bilder/stone_platform.png"),
  new Obstacle(5050, 4000, 75, 25, "./Bilder/stone_platform.png"),

  //Till nivå 4 trappor tillbaka
  new Obstacle(5700, 3900, 100, 1000, "gray"),
  new Obstacle(5800, 4000, 100, 700, "gray"),
  new Obstacle(5900, 4100, 100, 700, "gray"),
  new Obstacle(6000, 4200, 100, 500, "gray"),
  new Obstacle(6100, 4300, 100, 300, "gray"),
  new Obstacle(6200, 4400, 100, 200, "gray"),



  //Nivå 4 boss arena
  new Obstacle(7955, 3850, 100, 50, "gray"),
  //new Obstacle(7990, 3900, 30, 600, "orange"),
  //new Obstacle(8000, 3900, 10, 600, "yellow"),
  //new Obstacle(8015, 3900, 5, 600, "red"),
  //new Obstacle(7990, 3900, 5, 600, "red"),
  new Obstacle(7955, 4495, 100, 50, "gray"),

  new Obstacle(8500, 4400, 150, 100, "./Bilder/stone_platform.png"),
  new Obstacle(8600, 4350, 100, 100, "./Bilder/stone_platform.png"),
  //Här imellan hamnar skorna
  new Obstacle(8650, 4400, 150, 100, "./Bilder/stone_platform.png"),

  //Väggar på sidorna
  new Obstacle(worldWidth - 30, 0, 30, 10000, "green"),
  new Obstacle(0, 0, 30, 10000, "green")
];


let shirt = new Obstacle(6300, 2500, 80, 52, "./Bilder/equip_shirt.png");
shirt.type = "shirt";
let boots = new Obstacle(8625, 4330, 64, 20, "./Bilder/equip_shoes.png");
boots.type = "boots";

 const skyltar = [
    new Skylt(2115, 4000, 25, 25,"black"),
    new Skylt(2120, 3975, 15, 50, "saddlebrown"),
    new Skylt(2070, 3925, 120, 75),
    new Skylt(2065, 3920, 5, 80, "black"),
    new Skylt(2065, 3920, 125, 5),
    new Skylt(2190, 3920, 5, 80),
    new Skylt(2065, 4000, 130, 5, ),
    new Skylt(2110, 3940, 10, 40),
    new Skylt(2100, 3950, 30, 10),
    new Skylt(2105, 3945, 20, 5),
    new Skylt(2110, 3975, 65, 10),
    new Skylt(2155, 3965, 10, 30),
    new Skylt(2160, 3970, 10, 20,)
];

// kamera
function updateCamera() {
  cameraX = player.x + player.w / 2 - canvas.width / 2;
  cameraY = player.y + player.h / 2 - canvas.height / 2;
  cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));
  cameraY = Math.max(0, Math.min(cameraY, worldHeight - canvas.height));
}

// Game Loop
const targetFPS = 60;
const frameDuration = 1000 / targetFPS;

export function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);
  if (paused || !backgroundLoaded) return;

  const elapsed = timestamp - lastFrameTime;
  if (elapsed >= frameDuration) {
    lastFrameTime = timestamp - (elapsed % frameDuration);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    updateCamera();

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    drawGround();
    drawKeybinds();
    for (let obs of obstacles) obs.draw(ctx);

    for (let skylt of skyltar) {
      skylt.draw(ctx);
    }

    const isMoving = keys["a"] || keys["d"] || keys["ArrowLeft"] || keys["ArrowRight"];
    player.update(obstacles, worldHeight - 95, keys);
    player.draw(ctx, isMoving);

    shirt.draw(ctx);
    boots.draw(ctx);

    if (player.x < shirt.x + shirt.w &&
    player.x + player.w > shirt.x &&
    player.y < shirt.y + shirt.h &&
    player.y + player.h > shirt.y) {
    hasShirt = true;
    player.canDash = true;
    shirt.w = 0; shirt.h = 0; shirt.image = null;
    localStorage.setItem("hasDash", "true");
    player.imgIdle.src = "./character_bilder/Meatball_HT.png";
    player.imgLeftLeg.src = "./character_bilder/Meatball_HT_LLeg.png";
    player.imgRightLeg.src = "./character_bilder/Meatball_HT_RLeg.png";
    player.imgJump.src = "./character_bilder/Meatball_HT_Jump.png";
    player.hasShirt = true;  
    player.message = "Du fick en tröja! Du kan nu dash:a (Shift)!";
    shirt.x = -1000; 
    
}

if (player.x < boots.x + boots.w &&
    player.x + player.w > boots.x &&
    player.y < boots.y + boots.h &&
    player.y + player.h > boots.y) {
    hasBoots = true;
    player.maxJumps = Math.max(player.maxJumps, 2);
    boots.w = 0; boots.h = 0; boots.image = null;
    localStorage.setItem("hasDoubleJump", "true");
    player.imgIdle.src = "./character_bilder/Meatball_HTS.png";
    player.imgLeftLeg.src = "./character_bilder/Meatball_HTS_LLeg.png";
    player.imgRightLeg.src = "./character_bilder/Meatball_HTS_RLeg.png";
    player.imgJump.src = "./character_bilder/Meatball_HTS_Jump.png";
    player.hasShirt = true;  
    player.hasBoots = true;
    player.message
    boots.x = -1000;  
}
    

    // Rita getter
    enemygoatgw.draw(ctx);
    enemygoatsten.draw(ctx);
    enemygoatstefan.draw(ctx);
    enemygoatanton.draw(ctx);

    // Kolla kollision med getter (combat)
    for (let goat of combatGoats) {
      if (
        player.x < goat.x + goat.w &&
        player.x + player.w > goat.x &&
        player.y < goat.y + goat.h &&
        player.y + player.h > goat.y
      ) {
        if (onCombatTrigger) onCombatTrigger(goat);
        break;
      }
    }

    //  Kolla kollision med Lava 
    const lava = obstacles.find(o => o instanceof Lava);
      if (lava && lava.checkCollision(player)) {
        if (!gameOverTriggered) {
          gameOverTriggered = true;
          pauseMap();
          if (onGameOver) onGameOver();
      }
    }

    ctx.restore();
}
}

// starta loopen
requestAnimationFrame(gameLoop);

// startknapp
const startBtn = document.getElementById('start-btn');
if (startBtn) {
  startBtn.addEventListener('click', () => startMap());
}
