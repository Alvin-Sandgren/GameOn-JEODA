import { Character, Obstacle, Goat, Lava, Skylt, Decoration } from "./classer.js";
import { Soundmanager } from "./ljud.js";

export const soundmanager = new Soundmanager();

//  Dialog & overlay-variabler och flags
let dialogActive = false;
let dialogText = "";
let dialogOnClose = null;

// GameOver-trigger och flagga
let hasShirt = false;
let hasBoots = false;

// Check för trigger av ending
const hasAllTokens = true;


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
  200, 4400, 100, 100, 10, 2,
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

//  se till att spelaren har en flagga för första-gången-händelser
player.seenLava = player.seenLava || false;
player.seenCaveHint = player.seenCaveHint || false;


 // getter (fiender)
export const enemygoatgw = new Goat(5450, 2200, 300, 300, "./goat_bilder/gwget.png", "GWget");
export const enemygoatsten = new Goat(1500, 2855, 150, 150, "./goat_bilder/stenget.png", "Stenget");
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

    // Rita permanent mörkning ovanpå bakgrunden
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // justera 0.05–0.15
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
    ctx.drawImage(groundImage, 0, worldHeight - 100, worldWidth, 100);
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
  new Obstacle(1600, 4100, 70, 50, "./platforms/grass_platform_small.png"),
  new Obstacle(1800, 4025, 800, 575, "./platforms/grass_platform_stor.png"),

  //Dropper shute
  new Obstacle(1800, 3000, 100, 900, "platforms/left_dropper_pillar.png"),

  // Höger sida
  new Obstacle(2500, 2600, 100, 1275, "./platforms/right_dropper_pillar.png"),
  new Obstacle(2000, 3600, 100, 50,"./platforms/grass_platform_small.png"),
  new Obstacle(2200, 3800, 50, 50,"./platforms/grass_platform_small.png"),
  new Obstacle(2000, 3400, 75, 50,"./platforms/grass_platform_small.png"),
  new Obstacle(2200, 3200, 100, 50,"./platforms/grass_platform_small.png"),

  //platforms efter droppern som leder till lava
  new Obstacle(3000, 4400, 150, 200,"./platforms/grass_platform_l_t_lava.png"),
  new Obstacle(2800, 4250, 150, 350,"./platforms/grass_platform_s_t_lava.png"),

  //Vänster sida plus tak på droppern och gången till dash/get nr 2
  new Obstacle(1300, 3000, 500, 100, "./platforms/stone_platform.png"),
  new Obstacle(400, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(700, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(1000, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(1300, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(1600, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(1900, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(2200, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(2500, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(2800, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(3100, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(3400, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(3700, 2500, 300, 100, "./platforms/stone_platform.png"),
  new Obstacle(4000, 2500, 300, 100, "./platforms/stone_platform.png"),

  //Be Damien göra en bättre bild så jag kan göra en bättre plattform här 1300-4000 så 3000=bredd i x-led och 100=höjd i y-led

  //Cave entrance
  new Obstacle(4000, 0, 2600, 1900, "dimgray"),
  new Obstacle(4300, 2500, 100, 205, "dimgray"),
  new Obstacle(4300, 2700, 2300, 430, "dimgray"),
  //new Obstacle(6100, 1901, 20, 798, "red"),
  new Obstacle(6500, 1800, 1000, 1430, "dimgray"),
  new Obstacle(6250, 2550, 177, 100, "./platforms/stone_platform.png"),
  new Obstacle(6200, 2600, 275, 100, "./platforms/stone_platform.png"),


  // Vägen till nivå 5
  new Obstacle(3000, 2000, 200, 50, "./platforms/grass_platform.png"),

  //Nivå 5 platformar
  new Obstacle(3400, 1700, 300, 100, "./platforms/grass_platform.png"),
  new Obstacle(0, 1400, 2600, 200, "./platforms/grass_platform_medium.png"),

  //Obstacles mot nivå 3
  new Obstacle(950, 3000, 45, 30, "./platforms/stone_platform.png"),
  new Obstacle(500, 3000, 39, 30,"./platforms/stone_platform.png"),
  new Obstacle(300, 2750, 30, 30,"./platforms/stone_platform.png"),

  //Lavablock som hindrar progress när man inte har dash
  new Obstacle(3400, 4475, 50 , 25, "./platforms/stone_platform.png"),
  new Obstacle(3450, 4450, 50, 50, "./platforms/stone_platform.png"),
  new Lava(3500, 4500, 600, 600),   // Lavan
  new Obstacle(4100, 4450, 50, 50, "./platforms/stone_platform.png"),
  new Obstacle(4150, 4475, 50, 25, "./platforms/stone_platform.png"),

  //platforms som leder till nivå 4
  new Obstacle(5050, 4300, 75, 25, "./platforms/stone_platform.png"),
  new Obstacle(5600, 4200, 100, 50, "./platforms/stone_platform.png"),
  new Obstacle(5050, 4000, 75, 25, "./platforms/stone_platform.png"),

  //Till nivå 4 trappor tillbaka
  new Obstacle(5700, 3900, 100, 1000, "gray"),
  new Obstacle(5800, 4000, 100, 700, "gray"),
  new Obstacle(5900, 4100, 100, 700, "gray"),
  new Obstacle(6000, 4200, 100, 500, "gray"),
  new Obstacle(6100, 4300, 100, 300, "gray"),
  new Obstacle(6200, 4400, 100, 200, "gray"),
  //Be Damien göra bättre bilder på trappor så kan jag göra bättre trappa

  //Nivå 4 boss arena
  new Obstacle(7955, 3400, 100, 500, "./platforms/stone_platform.png"),
  new Obstacle(7993, 3900, 24, 600, "#ff6600"),
  new Obstacle(7955, 4495, 100, 50, "./platforms/stone_platform.png"),

  new Obstacle(8600, 4350, 100, 100, "./platforms/stone_platform.png"),
  new Obstacle(8500, 4400, 300, 100, "./platforms/stone_platform.png"),

  //Väggar på sidorna
  new Obstacle(worldWidth - 30, 0, 100, 10000, "./platforms/wall_right.png"),
  new Obstacle(-70, 0, 100, 10000, "./platforms/wall_left.png")
];


let shirt = new Obstacle(6300, 2500, 80, 52, "./equipment/equip_shirt.png");
shirt.type = "shirt";
let boots = new Obstacle(8625, 4330, 64, 20, "./equipment/equip_shoes.png");
boots.type = "boots";

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

const decorations = [
  new Decoration(100, 4400 - 150, 600, 256, "./kartbilder/house.png")
];

// kamera
function updateCamera() {
  cameraX = player.x + player.w / 2 - canvas.width / 2;
  cameraY = player.y + player.h / 2 - canvas.height / 2;
  cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));
  cameraY = Math.max(0, Math.min(cameraY, worldHeight - canvas.height));
}

//  Funktion för att visa dialog (pausar spelet)
function showDialog(text, onClose = null) {
  paused = true;
  dialogActive = true;
  dialogText = text;
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

    caveSign.image.onload = () => console.log("caveSign image loaded:", caveSign.image.complete);
    caveSign.image.onerror = () => console.warn("Failed to load caveSign image:", caveSign.image.src);

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

  //  Kolla kollision med tröjan och visa dialog samt uppdatera spelarens förmåga att dash'a plus animationerna av walking
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
    showDialog("You found a shirt!\nYou can now dash! (by using Shift)");
}

  // -||- som med tröjan fast skorna låser upp dubbelhopp
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

//  upptäck höga plattformen innan caven (hint om dubbelhopp)
if (!player.seenCaveHint) {
  const triggerZoneX1 = 2800; 
  const triggerZoneX2 = 3000; 
  const triggerZoneYMin = 2400;
  const triggerZoneYMax = 2800;
  const playerFeetY = player.y + player.h;

  //Kollar om spelaren gått in i triggerzonen och visar dialogen enbart en gång
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

// Rita getter ur listan om de inte är döda
    for (let goat of combatGoats) {
        if (goat.health > 0) {
            goat.draw(ctx);
        }
    }

    // Kolla kollision med getter (combattrigger)
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

    //  Kolla kollision med Lava spelar ljudet av gubben som dör och pausar spelet samt sätter en i gameOver state
    const lava = obstacles.find(o => o instanceof Lava);
      if (lava && lava.checkCollision(player)) {
        if (!gameOverTriggered) {
          gameOverTriggered = true;
          soundmanager.playGameover();
          pauseMap();
          if (onGameOver) onGameOver();
      }
    }


    //  upptäck lava (första gången spelaren ser den från höger vid droppern) 
    if (!player.seenLava && !hasShirt) {
      const triggerZoneX1 = 3100;
      const triggerZoneX2 = 4200;
      const triggerZoneYMin = 4000;
      const triggerZoneYMax = 4700;
      const playerFeetY = player.y + player.h;

      // Kollar om spelaren gått in i triggerzonen och visar dialogen för lava enbart en gång
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
    // Trigger för controls-dialog visas när man spawnar in i spelet första gången
    if (!player.seenControls) {
        const triggerX1 = 200;
        const triggerX2 = 400;

        if (player.x >= triggerX1 && player.x <= triggerX2) {
            player.seenControls = true;
            showDialog(
                "This is how you play:\n\nMove Left/Right: A/D or ← →\nJump: W or Space\n Spam L + hold a movement key: to get out of combat"
            );
        }
    }

    // Placeholder: Trigger vid slutet av banan (testläge) som visar credits
    const inEndZone = player.x > 9500 && player.x < 11000 && player.y > 3800 && player.y < 4600;

    if (inEndZone && hasAllTokens && !creditsActive) {
      startCredits();
    }
    ctx.restore();

    //  Rita dialogruta i skärmlägen
    if (dialogActive) {
      // bakgrundsruta
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      const boxW = 800;
      const boxH = 260;
      const boxX = canvas.width / 2 - boxW / 2;
      const boxY = canvas.height / 2 - boxH / 2;
      ctx.fillRect(boxX, boxY, boxW, boxH);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 5;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = "white";
      ctx.font = "26px Arial";
      ctx.textBaseline = "top";
      //Gör så att dialogen kan ha flera rader
      const lines = dialogText.split("\n");
      lines.forEach((line, i) => {
        ctx.fillText(line, boxX + 24, boxY + 24 + i * 36);
      });

      ctx.font = "18px Arial";
      ctx.fillText("Click left mouse button to continue...", boxX + boxW - 350, boxY + boxH - 40);
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

// === Credits-system (minimal) ===
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
  " - Jeffery (Lore & Music)",
  " - Oliver (Goatdesign and Combat UI)",
  " - Erik (Enemy AI & Combat System)",
  " - Damien (Graphics and Character Design)",
  "", "Special Thanks:",
  " - Our goats Stefan, Gw, Anton & Sten",
  " - Our music inspirations",
  " - A stubborn meatball", "", " Music Credits:",
  " - 'Epic Fantasy Adventure' by Scott Buckley (www.scottbuckley.com.au)",
  " - 'Heroic Quest' by Alexander Nakarada (www.serpentsoundstudios.com)",
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

  //hur snabbt credits ska scrolla
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