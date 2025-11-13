import { Character, Obstacle, Goat, Lava, Skylt, Decoration } from "./classer.js";
import { Soundmanager } from "./ljud.js";

export const soundmanager = new Soundmanager();

//  Dialog & overlay-variabler och flags
export let dialogActive = false;
export let dialogText = "";
export let dialogOnClose = null;

// GameOver-trigger och flagga
let hasShirt = false;
let hasBoots = false;
let helmetDropped = false;

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

// Skapa spelaren
export const player = new Character(
  200, 4450, 100, 100, 10, 2,
  "./character_bilder/meatball_nack.png",      
  "./character_bilder/meatball_lleg.png",      
  "./character_bilder/meatball_nack_rleg.png", 
  [                                             
    "./character_bilder/meatball_dash1.png",
    "./character_bilder/meatball_dash2.png",
    "./character_bilder/meatball_dash3.png",
    "./character_bilder/meatball_dash4.png"
  ],
  "./character_bilder/meatball_jump_nack.png"      
);

// bild på player i combat
player.combatImg = new Image();
player.combatImg.src = "./character_bilder/meatball_nack.png";

//  se till att spelaren har en flagga för första-gången-händelser
player.seenLava = player.seenLava || false;
player.seenCaveHint = player.seenCaveHint || false;

 // getter (fiender)
export const enemygoatgw = new Goat(5450, 2200, 300, 300, "./goat_bilder/gwget.png", "GWget");
export const enemygoatsten = new Goat(1500, 2780, 225, 225, "./goat_bilder/stenget.png", "Stenget");
export const enemygoatstefan = new Goat(7300, 4300, 200, 200, "./goat_bilder/stefanget.png", "Stefanget");
export const enemygoatanton = new Goat(600, 975, 450, 450, "./goat_bilder/antonget.png", "Antonget");

export let combatGoats = [enemygoatgw, enemygoatsten, enemygoatstefan, enemygoatanton];

//  Bakgrundsbild 
export const backgroundImage = new Image();
let backgroundLoaded = false;
backgroundImage.src = "./kartbilder/bakgrund.png";
backgroundImage.onload = () => {
  backgroundLoaded = true;
};

export const caveSign = new Skylt(4400, 1805, 2200, 900);
caveSign.image = new Image();
caveSign.image.src = "./kartbilder/cave_background.png";

export function drawBackground() {
  if (backgroundLoaded) {
    // Rita bakgrundsbild
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Rita permanent mörkning ovanpå bakgrunden för mörkare tema
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

export const groundImage = new Image();
let groundLoaded = false;
groundImage.src = "./kartbilder/ground.png";
groundImage.onload = () => {
  groundLoaded = true;
};

export function drawGround() {
  if (groundLoaded) {
    // Rita markbild längst ner på världen
    ctx.drawImage(groundImage, 0, worldHeight - 100, worldWidth -1300, 100);
  } else {
    // Fallback (om bilden inte hunnit ladda)
    ctx.fillStyle = "#654321"; // brunaktig reservfärg
    ctx.fillRect(0, worldHeight - 100, worldWidth, 100);
  }
}

// obstacles
export const obstacles = [
  // platforms spawn
  new Obstacle(700, 4300, 300, 50, "./platforms/grass_platform.png"),
  new Obstacle(1200, 4200, 200, 50, "./platforms/grass_platform.png"),
  new Obstacle(1600, 4100, 70, 50, "./platforms/grass_platform_s.png"),
  new Obstacle(1800, 4025, 800, 575, "./platforms/grass_platform_stor.png"),

  //Dropper shute
  new Obstacle(1800, 3000, 100, 900, "platforms/left_dropper_pillar.png"),

  // Höger sida
  new Obstacle(2500, 2600, 100, 1275, "./platforms/right_dropper_pillar.png"),
  new Obstacle(2000, 3600, 100, 50,"./platforms/grass_platform_s.png"),
  new Obstacle(2200, 3800, 50, 50,"./platforms/grass_platform_s.png"),
  new Obstacle(2000, 3400, 75, 50,"./platforms/grass_platform_s.png"),
  new Obstacle(2200, 3200, 100, 50,"./platforms/grass_platform_s.png"),

  //platforms efter droppern som leder till lava
  new Obstacle(3000, 4400, 150, 200,"./platforms/grass_platform_l_t_lava.png"),
  new Obstacle(2800, 4250, 150, 350,"./platforms/grass_platform_s_t_lava.png"),

  //Lava som hindrar progress när man inte har dash
  new Obstacle(3400, 4475, 50 , 25, "./platforms/stone_half_block.png"),
  new Obstacle(3450, 4450, 50, 50, "./platforms/stone_block.png"),
  new Lava(3500, 4500, 600, 600), 
  new Obstacle(4100, 4450, 50, 50, "./platforms/stone_block.png"),
  new Obstacle(4150, 4475, 50, 25, "./platforms/stone_half_block.png"),

  //Vänster sida plus tak på droppern och gången till dash/get nr 2
  new Obstacle(1300, 3000, 500, 100, "./platforms/stone_platform.png"),
  new Obstacle(400, 2500, 3900, 100, "./platforms/stone_platform_l.png"),

  //Obstacles platform med hint om dubbelhopp
  new Obstacle(950, 3000, 70, 40, "./platforms/grass_platform_s.png"),
  new Obstacle(500, 3000, 60, 40,"./platforms/grass_platform_s.png"),
  new Obstacle(300, 2750, 50, 45,"./platforms/grass_platform_s.png"),

  //Cave entrance
  new Obstacle(4000, 0, 2600, 1900, "dimgray"),
  new Obstacle(4300, 2500, 100, 205, "dimgray"),
  new Obstacle(4300, 2700, 2300, 430, "dimgray"),
  new Obstacle(6500, 1800, 1000, 1430, "dimgray"),
  new Obstacle(6250, 2550, 177, 100, "./platforms/stone_platform.png"),
  new Obstacle(6200, 2600, 275, 100, "./platforms/stone_platform.png"),

  //platforms som leder till nivå 4
  new Obstacle(5050, 4300, 75, 25, "./platforms/stone_half_block.png"),
  new Obstacle(5600, 4200, 100, 50, "./platforms/stone_two_block.png"),
  new Obstacle(5050, 4000, 75, 25, "./platforms/stone_half_block.png"),

  //Till nivå 4 trappor tillbaka
  new Obstacle(5700, 3900, 100, 610, "./platforms/stair_six.png"),
  new Obstacle(5800, 4000, 100, 510, "./platforms/stair_five.png"),
  new Obstacle(5900, 4100, 100, 410, "./platforms/stair_four.png"),
  new Obstacle(6000, 4200, 100, 310, "./platforms/stair_three.png"),
  new Obstacle(6100, 4300, 100, 210, "./platforms/stair_two.png"),
  new Obstacle(6200, 4400, 100, 110, "./platforms/stair_one.png"),

  //Nivå 4 boss arena
  new Obstacle(7955, 3400, 100, 500, "./platforms/barrier_pillar.png"),
  new Obstacle(7955, 4495, 100, 150, "./platforms/stair_two.png"),

  new Obstacle(8600, 4350, 100, 100, "./platforms/stone_platform.png"),
  new Obstacle(8500, 4400, 300, 100, "./platforms/stone_platform.png"),

  // Vägen till nivå 5
  new Obstacle(3000, 2000, 200, 50, "./platforms/grass_platform.png"),

  //Nivå 5 platformar
  new Obstacle(3400, 1700, 300, 100, "./platforms/grass_platform.png"),
  new Obstacle(0, 1400, 2600, 200, "./platforms/grass_platform_medium.png"),

  //Väggar på sidorna
  new Obstacle(worldWidth - 1300 , 0, 2000, 10000, "./platforms/dirt.png"),
  new Obstacle(worldWidth - 1305, 0, 100, 4525, "./platforms/wall_right.png"),
  new Obstacle(-70, 0, 100, 10000, "./platforms/wall_left.png")
];

//Lägger ut all equipment och sådant som kommer justeras efter interaktion
//T.ex x & y kordinat ändras efter kollision eller trigga dialogrutor
let shirt = new Obstacle(6300, 2500, 80, 52, "./equipment/equip_shirt.png");
shirt.type = "shirt";
let boots = new Obstacle(8625, 4330, 64, 20, "./equipment/equip_shoes.png");
boots.type = "boots";

let helmet = new Obstacle(-1000, -1000, 0, 0, "./equipment/equip_helmet.png");
helmet.type = "helmet";
helmetDropped = false;
helmet.w = 0; helmet.h = 0; 

let shoesBarrier = new Obstacle(7993, 3900, 24, 600, "#ff6600"); // korrekt
shoesBarrier.active = true; 
obstacles.push(shoesBarrier);

let shirtBarrier = new Obstacle(6100, 1901, 20, 798, "#ff6600");
shirtBarrier.active = true;
obstacles.push(shirtBarrier);

 const skyltar = [
    // Svart stolpe och outline
    new Skylt(2120, 3975, 25, 50, "black"),     
    new Skylt(2065, 3920, 130, 85, "black"),   

    // Själva skylten ovanpå
    new Skylt(2070, 3925, 120, 75, "saddlebrown"),
    new Skylt(2125, 3975, 15, 50, "saddlebrown"),

    // Pilar och detaljer ovanpå
    new Skylt(2100, 3955, 65, 10, "black"),
    new Skylt(2145, 3945, 10, 30, "black"),
    new Skylt(2150, 3950, 10, 20, "black"),
];

// Icke kollidbara objekt som gör världen mer levande
const decorations = [
  new Decoration(580, 4406, 375, 104, "./kartbilder/fence.png"),
  new Decoration(100, 4250, 600, 256, "./kartbilder/house.png")
];

// kamera
function updateCamera() {
  cameraX = player.x + player.w / 2 - canvas.width / 2;
  cameraY = player.y + player.h / 2 - canvas.height / 2;
  cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));
  cameraY = Math.max(0, Math.min(cameraY, worldHeight - canvas.height));
}

export function showDialog(text, onClose = null) {
  paused = true;                
  dialogActive = true;           
  dialogText = text;            
  // Spela popup-ljudet (utan att krascha om det inte går)
  try {
    soundmanager.playpopupSfx();
  } catch (err) {
    console.warn("Popup SFX kunde inte spelas:", err);
  }
  dialogOnClose = typeof onClose === 'function' ? onClose : null;
}


//  Klick-hanterare för att stänga dialog (vänsterklick)
canvas.addEventListener('mousedown', (e) => {
  if (dialogActive && e.button === 0) { // 0 = vänster musknapp
    dialogActive = false;
    paused = false;
    if (dialogOnClose) {
      try { dialogOnClose(); } catch (err) { console.error(err); }
      dialogOnClose = null;
    }
  }
});

// Game Loop
const targetFPS = 60;
const frameDuration = 1000 / targetFPS;

export function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  // Pausa uppdatering om spelet är pausat eller bakgrunden inte är laddad
  if (paused || !backgroundLoaded) return;

  // Tidsberäkning för att hålla konstant FPS
  const elapsed = timestamp - lastFrameTime;
  if (elapsed >= frameDuration) {
    lastFrameTime = timestamp - (elapsed % frameDuration);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    updateCamera();

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // Rita caveSign i världens koordinater
    caveSign.draw(ctx);

    for (let skylt of skyltar) {
      skylt.draw(ctx);
    }

    drawGround();
    for (let obs of obstacles) obs.draw(ctx);

    for (let decor of decorations) {
      decor.draw(ctx);
    }

    const isMoving = keys["a"] || keys["d"] || keys["ArrowLeft"] || keys["ArrowRight"];
    player.update(obstacles, worldHeight - 95, keys);
    player.draw(ctx, isMoving);

    shirt.draw(ctx);
    boots.draw(ctx);

    // Rita hjälmen om den finns
    if (helmet && helmet.w > 0 && helmet.h > 0) {
      helmet.draw && helmet.draw(ctx);
    }

    // Kolla kollision med tröjan
    if (player.x < shirt.x + shirt.w &&
        player.x + player.w > shirt.x &&
        player.y < shirt.y + shirt.h &&
        player.y + player.h > shirt.y) {
      hasShirt = true;
      player.canDash = true;
      shirt.w = 0; shirt.h = 0; shirt.image = null;
      localStorage.setItem("hasDash", "true");
      player.imgIdle.src = "./character_bilder/meatball_ht.png";
      player.imgLeftLeg.src = "./character_bilder/meatball_ht_lleg.png";
      player.imgRightLeg.src = "./character_bilder/meatball_ht_rleg.png";
      player.imgJump.src = "./character_bilder/meatball_ht_jump.png";
      player.hasShirt = true;  
      shirt.x = -1000;
      shirt.y = -1000;
      showDialog("You found a shirt!\nYou can now dash! (by using Shift)");
    }

    // Kolla kollision med skorna
    if (player.x < boots.x + boots.w &&
        player.x + player.w > boots.x &&
        player.y < boots.y + boots.h &&
        player.y + player.h > boots.y) {
      hasBoots = true;
      player.maxJumps = Math.max(player.maxJumps, 2);
      boots.w = 0; boots.h = 0; boots.image = null;
      localStorage.setItem("hasDoubleJump", "true");
      player.imgIdle.src = "./character_bilder/meatball_hts.png";
      player.imgLeftLeg.src = "./character_bilder/meatball_hts_lleg.png";
      player.imgRightLeg.src = "./character_bilder/meatball_hts_rleg.png";
      player.imgJump.src = "./character_bilder/meatball_hts_jump.png";
      player.hasShirt = true;  
      player.hasBoots = true;
      boots.x = -1000;  
      showDialog("You found shoes!\nYou can now double jump!");
    }

    //Sätter ut hjälmen när Sten dör
    if (!helmetDropped && enemygoatsten && enemygoatsten.health <= 0) {
      helmetDropped = true;
      helmet.x = enemygoatsten.x + (enemygoatsten.w / 2) - 24;
      helmet.y = enemygoatsten.y - 10;
      helmet.w = 68;
      helmet.h = 52;
      enemygoatsten.x = -1000;
      enemygoatsten.y = -1000;

      showDialog("You defeated the goat Sten, He also dropped a helmet!");
    }

    // Kollar om spelaren kollidar med hjälmen när Sten har dött och tar den utanför kartan efter kollision
    if (helmet.w > 0 && helmet.h > 0 &&
        player.x < helmet.x + helmet.w &&
        player.x + player.w > helmet.x &&
        player.y < helmet.y + helmet.h &&
        player.y + player.h > helmet.y) {

      player.hasHelmet = true;
      player.defense = (player.defense || 0) + 1;

      helmet.w = 0; helmet.h = 0; helmet.image = null; helmet.x = -1000;
      localStorage.setItem("hasHelmet", "true");

      //Ändrar animations för Gubben med hjälm
      player.imgIdle.src = "./character_bilder/meatball_h_idle.png";
      player.imgLeftLeg.src = "./character_bilder/meatball_h_lleg.png";
      player.imgRightLeg.src = "./character_bilder/meatball_h_rleg.png";
      player.imgJump.src = "./character_bilder/meatball_h_jump.png";

      showDialog("You picked up a helmet!\nYou feel tougher already! \n(+20 hp)");
    }

    // Upptäck höga plattformen innan caven
    if (!player.seenCaveHint) {
      const triggerZoneX1 = 2800; 
      const triggerZoneX2 = 3000; 
      const triggerZoneYMin = 2000;
      const triggerZoneYMax = 2800;
      const playerFeetY = player.y + player.h;

      if (
        player.x > triggerZoneX1 &&
        player.x < triggerZoneX2 &&
        playerFeetY >= triggerZoneYMin &&
        playerFeetY <= triggerZoneYMax
      ) {
        player.seenCaveHint = true;
        showDialog(
          "Hmm... that platform looks a bit too high.\nIf only I could jump once more in the air...\n (I probably need shoes for a jump like that!)"
        );
      }
    }

    for (let goat of combatGoats) {
      if (goat.health > 0) { // rita bara levande getter
        goat.draw(ctx);
       }
        }

for (let goat of combatGoats) {
  if (goat.health <= 0 || goat._defeated) continue; // IGNORERA döda eller markerade getter
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


    // Kolla kollision med Lava
    const lava = obstacles.find(o => o instanceof Lava);
    if (lava && lava.checkCollision(player)) {
      if (!gameOverTriggered) {
        gameOverTriggered = true;
        soundmanager.playGameover();
        pauseMap();
        if (onGameOver) onGameOver();
      }
    }

    // Upptäck lava
    if (!player.seenLava && !hasShirt) {
      const triggerZoneX1 = 3050;
      const triggerZoneX2 = 4200;
      const triggerZoneYMin = 4000;
      const triggerZoneYMax = 4700;
      const playerFeetY = player.y + player.h;

      if (
        player.x > triggerZoneX1 &&
        player.x < triggerZoneX2 &&
        playerFeetY >= triggerZoneYMin &&
        playerFeetY <= triggerZoneYMax
      ) {
        player.seenLava = true;
        showDialog("That ground looks dangerous, almost like it's lava...\nBetter not touch it! \n (I probably need to be able to dash to get over it *wink-wink*)");
      }
    }

    // Trigger för controls-dialog
    if (!player.seenControls) {
      const triggerX1 = 200;
      const triggerX2 = 400;

      if (player.x >= triggerX1 && player.x <= triggerX2) {
        player.seenControls = true;

        showDialog(
          "This is how you play:\n\nMove Left/Right: A/D or ← →\nJump: W or Space \n M = meny/pause the game"
        );
      }
    }

    // Trigger för uppföljande dialog direkt efter
    if (player.seenControls && !player.seenGoatClues) {
      const followUpX1 = 405; // precis lite till höger
      const followUpX2 = 450;

      if (player.x >= followUpX1 && player.x <= followUpX2) {
        player.seenGoatClues = true;

        showDialog(
          "Oh no! all my goats have disappeared and turned evil!\n...\nWait, where are my clothes?! \nI need to go and kill the goats, before they go haywire!"
        );
      }
    }

    //Triggar dialog efter gwget dör och tar bort barriern bakom honom
    if (enemygoatgw.health <= 0 && !player.seenGoatGwDead) {
      player.seenGoatGwDead = true;
      showDialog("You have defeated the goat GW!  \n *click* (A barrier has disappeared from this land)");
      shirtBarrier.w = 0; shirtBarrier.h = 0; 
      shirtBarrier.active = false;
      shirtBarrier.x = -1000;
      shirtBarrier.y = -1000;
      enemygoatgw.x = -1000;
      enemygoatgw.y = -1000;
    }

    //-||- stefanget dör och -||-
    if (enemygoatstefan.health <= 0 && !player.seenGoatStefanDead) {
      player.seenGoatStefanDead = true;
      showDialog("You have defeated the goat Stefan! \n *click* (A barrier has disappeared from this land)");
      shoesBarrier.active = false; 
      shoesBarrier.x = -1000;
      shoesBarrier.y = -1000;
      enemygoatstefan.x = -1000;
      enemygoatstefan.y = -1000;
    }

    // Sätter win condition och directar spelaren mot slutet
    const allGoatsDead =
      enemygoatgw.health <= 0 &&
      enemygoatsten.health <= 0 &&
      enemygoatstefan.health <= 0 &&
      enemygoatanton.health <= 0;

    const antonDead = enemygoatanton.health <= 0;

    // Triggerzon: lite till höger om Anton (x mellan 650 och 800, nära hans y-position)
    const inAntonTriggerZone =
      player.x > 1200 && player.x < 1500 &&
      player.y > 0 && player.y < 1600; // runt y = 975

    if (
      antonDead &&
      allGoatsDead && // ta bort denna rad om du bara vill kräva att Anton är död
      inAntonTriggerZone &&
      !player.seenAllGoatsDead
    ) {
      player.seenAllGoatsDead = true;
      showDialog("All goats have been defeated! Get back to your house to celebrate!");
    }

    // Trigger vid slutet av spelet rulla credits
    const inEndZone = 
        player.x > 0 && player.x < 400 &&
        player.y > 4200 && player.y < 4600 &&
        player.seenAllGoatsDead;

    //Rolla credits om du har uppfyllt kraven
    if (inEndZone && !creditsActive) {
        startCredits();
    }

    ctx.restore();

    if (dialogActive) {
    const boxW = 800;
    const boxH = 260;
    const boxX = canvas.width / 2 - boxW / 2;
    const boxY = canvas.height / 2 - boxH / 2;

    // Bakgrund i träton med rundade hörn
    ctx.save();
    const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
    gradient.addColorStop(0, "#3b2615"); 
    gradient.addColorStop(1, "#6b4423"); 
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 20);
    ctx.fill();
    ctx.restore();

    // Nordisk Skogskant på textrutan
    ctx.strokeStyle = "#285513ff"; 
    ctx.lineWidth = 5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = "#f0e6c8"; 
    ctx.font = "26px serif"; 
    ctx.textBaseline = "top";

    const lines = dialogText.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, boxX + 30, boxY + 34 + i * 38);
    });

    // Fortsätt-text i guld
    ctx.font = "18px serif";
    ctx.fillStyle = "#c8a34a";
    ctx.fillText("⚔ Tryck för att fortsätta...", boxX + boxW - 320, boxY + boxH - 40);
  }

}
}

// starta loopen
requestAnimationFrame(gameLoop);

// startknapp
const startBtn = document.getElementById('start-btn');
if (startBtn) {
  startBtn.addEventListener('click', () => startMap());
}

// Credits-system
let creditsActive = false, creditsY = canvas.height, fadeAlpha = 1, holdTimer = 0;

// Ladda in bilder för credits och deras positioner
const creditEntities = [
  { src: "./goat_bilder/antonget.png", x: 50, y: 50 },
  { src: "./goat_bilder/gwget.png", x: 1700, y: 50 },
  { src: "./goat_bilder/stenget.png", x: 50, y: 700 },
  { src: "./goat_bilder/stefanget.png", x: 1700, y: 700 },
  { src: "./character_bilder/meatball_horn.png", x: 500, y: 400 }
];

//Loopar igenom creditEntities och laddar bilderna
creditEntities.forEach(e => { e.img = new Image(); e.img.src = e.src; });

// Textinnehåll för credits
const creditsText = [
  "Thank you for playing!", "", "A game by:",
  " - Alvin Sandgren (Logic & Gameplay)",
  " - Jeffery (Story & Music)",
  " - Oliver (Goatdesign and Combat UI)",
  " - Erik (Enemy AI & Combat System)",
  " - Damien (Graphics and Character Design)",
  "", "Special Thanks:",
  " - Our goats Stefan, Gw, Anton & Sten",
  " - Our music inspirations",
  " - A stubborn meatball", "", " Music Credits:",
  " - Zen_Man, background music",
  " - OB-LIX, menu music",
  " - u_r7cny11q7r Game over",
  " - Alvin Sandgren, Jump sound",
  "", "", "JEODA GameOn - A Platformer Adventure",
  "The End..."
];

// Rita credits på canvasen
function drawCredits() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundLoaded) ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const e of creditEntities) {
    if (!e.img.complete) continue;
    ctx.drawImage(e.img, e.x, e.y, 200, 200);
  }

  ctx.fillStyle = "white";
  ctx.font = "32px Arial";
  ctx.textAlign = "center";

  // Rita varje rad av credits-texten och låter dem scrolla uppåt
  //Förutom de två sista raderna som får fadea ut och hålla stilla i mitten
  for (let i = 0; i < creditsText.length; i++) {
    const line = creditsText[i];
    const y = creditsY + i * 50;
    if (i >= creditsText.length - 2) {
      const targetY = canvas.height / 2 + (i === creditsText.length - 1 ? 50 : -50);
      const drawY = y < targetY ? targetY : y;
      ctx.globalAlpha = fadeAlpha;
      ctx.fillText(line, canvas.width / 2 + 150, drawY);
      ctx.globalAlpha = 1;
      if (y < targetY) holdTimer += 1 / 60;
    } else {
      ctx.fillText(line, canvas.width / 2 + 150, y);
    }
  }

  //Hur snabbt credits ska scrolla
  creditsY -= 1.8;
  // Hantera fade-out för de sista raderna
  if (holdTimer >= 7) fadeAlpha = Math.max(0, fadeAlpha - 0.01);

  if (fadeAlpha > 0) requestAnimationFrame(drawCredits);
  else { creditsActive = false; window.location.reload(); }
}

// Starta credits-sekvensen
function startCredits() {
  if (creditsActive) return;
  creditsActive = true;
  paused = true;
  creditsY = canvas.height;
  fadeAlpha = 1;
  holdTimer = 0;
  requestAnimationFrame(drawCredits);
}