export { startCombat };
import { canvas, ctx, startMap, player, combatGoats, pauseMap, soundmanager, showDialog } from "./map.js";
import { startGame, gameOver, exitCombat } from "./overlay.js";

//  dialog / bok popup 
let combatDialogActive = false;
let combatDialogText = "";
let combatDialogOnClose = null;
let combatDialogPosX = null;
let combatDialogPosY = null;
let combatDialogShownOnce = false;

// bok-området (200x200 från högra hörnet)
const bookW = 200;
const bookH = 200;
const bookX = canvas.width - bookW;
const bookY = 0;

// Lista med bildvägar som ska laddas
const imagePaths = [
    "../kartbilder/combatrunes.png",
    "./character_bilder/meatball_nack.png",
    "./Runes/rune_attackb.png",
    "./Runes/rune_blockb.png",
    "./Runes/rune_healb.png",
    "./Runes/rune_burnb.png",
    "./Runes/rune_weakb.png",
    "./Runes/rune_exposeb.png",
    "./Runes/rune_riskb.png",
    "./Runes/action_stone.png",
];

// Funktion för att ladda bilder
export async function preloadImages(paths) {
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ src, img });
            img.onerror = () => reject(`couldnt load: ${src}`);
            img.src = src;
        });
    };
    const loaded = await Promise.all(paths.map(loadImage));
    const imageMap = {};
    loaded.forEach(({ src, img }) => imageMap[src] = img);
    return imageMap;
}

// Skapa bilder för combat och spelare
const combatImg = new Image();
combatImg.src = "../kartbilder/combatrunes.png";

const playerCombatImg = new Image();
playerCombatImg.src = "./character_bilder/meatball_nack.png";

// Stridsstatusvariabler
let inCombat = false;
let playerTurn = true;
let slays = 0;
let currentGoat = null;
let currentTurn = 0;

// Run-relaterade variabler
let actionStoneSlots = [null, null, null];
let selectingRunes = false;
let selectedRunes = [];
let currentTurnRunes = [];
let discardedRunes = [];
let runeUsesThisTurn = 0;

// Positionskonfiguration för runor
const runeSlots = [
    { x: 0, y: 125 },
    { x: 0, y: 240 },
    { x: 0, y: 375 },
    { x: 0, y: 500 },
    { x: 0, y: 625 },
    { x: 0, y: 750 }
];

// Spelarens grundskada
player.damage = 10;

// Spelarens tillgängliga actions
export const PlayerActions = [
    {
        name: "Viking strike",
        damage: () => player.damage,
        img: "./Runes/rune_attackb.png"
    },
    {
        name: "Shield up",
        apply: () => {
            player.block = Math.min((player.block || 0) + 10, 30);
        },
        img: "./Runes/rune_blockb.png"
    },
    {
        name: "Horn of Mjöd",
        heal: () => 5,
        img: "./Runes/rune_healb.png"
    },
    {
        name: "Wildfire",
        apply: () => {
            if (!currentGoat) return;
            const burn = Math.max(Math.floor(player.damage / 3), 3);
            currentGoat.burnDamage = burn;
            currentGoat.burnTurns = 3;
        },
        img: "./Runes/rune_burnb.png"
    },
    {
        name: "Loki's insult",
        apply: () => {
            if (!currentGoat) return;
            const weaken = Math.max(Math.floor((currentGoat.damage || currentGoat.baseDamage || 20) * 0.4), 3);
            currentGoat.weakenAmount = Math.min((currentGoat.weakenAmount || 0) + weaken, 20);
            currentGoat.weakenTurns = 2;
            refreshGoatDamage(currentGoat);
        },
        img: "./Runes/rune_weakb.png"
    },
    {
        name: "Exposed flesh",
        apply: () => {
            if (!currentGoat) return;
            currentGoat.vulnerable = true;
            currentGoat.vulnerableTurns = 2;
        },
        img: "./Runes/rune_exposeb.png"
    },
    {
        name: "Tyr's gamble",
        apply: () => {
            const outcome = Math.random();
            if (outcome < 0.4) {
                const dmg = Math.floor(player.damage * 0.4);
                applyDamageToGoat(dmg);
            } else if (outcome < 0.8) {
                const dmg = Math.floor(player.damage * 0.1);
                applyDamageToGoat(dmg);
            } else {
                const selfDmg = Math.floor(player.maxHealth * 0.1);
                player.health -= selfDmg;
            }
        },
        img: "./Runes/rune_riskb.png"
    }
];

// 5 av block och attack
const extraRunes = [];

const attackRune = PlayerActions.find(r => r.name === "Viking strike");
const blockRune = PlayerActions.find(r => r.name === "Shield up");

for (let i = 0; i < 5; i++) {
    extraRunes.push({ ...attackRune, id: `attack_${i}`, selected: false });
    extraRunes.push({ ...blockRune, id: `block_${i}`, selected: false });
}

export const AllRunes = [...PlayerActions, ...extraRunes];

// Applicerar skada på den nuvarande geten, tar hänsyn till vulnerablehet och block
function applyDamageToGoat(amount, options = {}) {
    if (!currentGoat || typeof amount !== "number") return 0;
    let dmg = Math.max(Math.round(amount), 0);
    if (currentGoat.vulnerable) {
        dmg = Math.floor(dmg * 1.5); 
        if (currentGoat.vulnerableTurns) {
            currentGoat.vulnerableTurns--; 
            if (currentGoat.vulnerableTurns <= 0) currentGoat.vulnerable = false; 
        }
    }
    if (!options.ignoreBlock && currentGoat.block > 0) {
        const blocked = Math.min(currentGoat.block, dmg); // Skada som blockeras
        dmg -= blocked; // Minska skadan med blockerad mängd
        currentGoat.block = Math.max(currentGoat.block - blocked, 0); // Uppdatera blockvärdet utan att gå under 0
    }
    currentGoat.health = Math.max(currentGoat.health - dmg, 0); // Hälsan kan inte bli negativ
    return dmg;
}

// Applicerar brännskada på en get varje tur och minskar antalet turer kvar
function applyBurnTick(goat) {
    if (!goat || goat.burnTurns <= 0 || !goat.burnDamage) return;
    applyDamageToGoat(goat.burnDamage, { ignoreBlock: true }); // Brännskada ignorerar block
    goat.burnTurns--; // Minska antal brännskadeturner
    if (goat.burnTurns <= 0) {
        goat.burnDamage = 0; // Nollställ skadan när brännskadorna tar slut
    }
}

// Uppdaterar getens skada baserat på basvärde, bonus och eventuell försvagning
function refreshGoatDamage(goat) {
    if (!goat) return;

    const base = goat.baseDamage || goat.damage || 20; // Basvärde, fallback till damage eller 20
    const bonus = goat.damageBonus || 0;
    const weaken = goat.weakenAmount || 0;
    const raw = base + bonus - weaken; // Beräkna rå skada
    goat.damage = Math.max(Math.floor(raw), Math.floor(base * 0.4)); // Säkerställ minst 40% av basvärdet
}


AllRunes.forEach(r => {
    const img = new Image();
    img.src = r.img;
    r.imageObj = img;
});

PlayerActions.forEach(r => {
    const img = new Image();
    img.src = r.img;
    r.imageObj = img;
});

// Fiendens möjliga actions
export const EnemyActions = [
    {
        name: "Attack",
        apply: (goat, player) => {
            const base = goat.damage || goat.tempDamage || 20;
            const blocked = Math.min(base, player.block || 0);
            const dealt = Math.max(base - blocked, 0);
            player.block = Math.max((player.block || 0) - base, 0);
            player.health = Math.max(player.health - dealt, 0);
        }
    },
    {
        name: "Defensive stance",
        apply: (goat) => {
            goat.block = Math.min((goat.block || 0) + 12, 30);
        }
    },

];

let images = {};

// Ladda alla bilder vid start
(async () => {
    try {
        images = await preloadImages(imagePaths);
        combatImg.src = "../kartbilder/combatrunes.png";
        combatImg.imageObj = images["../kartbilder/combatrunes.png"];

        playerCombatImg.src = "./character_bilder/meatball_nack.png";
        player.combatImg = images["./character_bilder/meatball_nack.png"];
    } catch (err) {
        console.warn("Could not preload combat images:", err);
    }
})();

// Funktion för att starta runval
function startRuneSelection() {
    if (!currentGoat) return;

    selectingRunes = true;
    actionStoneSlots = [null, null, null];
    selectedRunes = [];

    discardedRunes = shuffleArray([...AllRunes]);

    hoveredRuneIndex = null;
    hoveredSelectedRuneIndex = null;

    discardedRunes.slice(0, 6).forEach((rune, index) => {
        const slot = runeSlots[index];
        if (!slot) return;
        rune._clickArea = {
            x: slot.x,
            y: slot.y,
            width: rune.imageObj?.width || 200,
            height: rune.imageObj?.height || 50
        };
    });

    drawCombat(currentGoat);
}

// Funktion för att slumpa array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Konfiguration för action stone
const actionStoneConfig = {
    x: 740,
    y: 500,
    width: 450,
    height: 470
};

const actionStoneRunes = [
    { x: 60, y: 50, width: 320, height: 130 },
    { x: 60, y: 160, width: 320, height: 130 },
    { x: 60, y: 280, width: 320, height: 130 }
]

// Rita action stone och runor i stone
function drawActionStone() {
    const stone = images["./Runes/action_stone.png"];
    if (!stone || !stone.complete) return;

    ctx.drawImage(stone, actionStoneConfig.x, actionStoneConfig.y, actionStoneConfig.width, actionStoneConfig.height);

    actionStoneSlots.forEach((rune, index) => {
        if (!rune || !rune.imageObj?.complete) return;

        const config = actionStoneRunes[index];
        const runeX = actionStoneConfig.x + config.x;
        const runeY = actionStoneConfig.y + config.y;
        const runeW = config.width;
        const runeH = config.height;

        ctx.drawImage(rune.imageObj, runeX, runeY, runeW, runeH);

        // Uppdaterar klickområde
        rune._clickArea = { x: runeX, y: runeY, width: runeW, height: runeH };
    });
}

// Rita alla runor på canvas
function drawRunes(alwaysVisible = false) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";

    const runesToShow = discardedRunes.slice(0, 6);
    runesToShow.forEach((rune, index) => {
        if (rune.selected) return;
        const slot = runeSlots[index];
        if (!slot || !rune.imageObj?.complete) return;

        const x = slot.x;
        const y = slot.y;

        let w = rune.imageObj.width;
        let h = rune.imageObj.height;

        let scale = (hoveredRuneIndex === index) ? 1.1 : 1;
        const scaledW = w * scale;
        const scaledH = h * scale;
        const offsetX = x - (scaledW - w) / 2;
        const offsetY = y - (scaledH - h) / 2;

        if (!selectingRunes) ctx.globalAlpha = 0.5;
        ctx.drawImage(rune.imageObj, offsetX, offsetY, scaledW, scaledH);
        ctx.globalAlpha = 1;

        rune._clickArea = { x: offsetX, y: offsetY, width: scaledW, height: scaledH };
    });

    if (selectingRunes) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("Select 3 runes for next round", 30, 30);
    }
}

// Rita valda runor under strid
function drawSelectedRunes() {
    if (selectingRunes) {

        const runesToDraw = selectedRunes;
        if (runesToDraw.length === 0) return;

        const totalWidth = runesToDraw.reduce((sum, rune) => sum + (rune.imageObj?.width || 200) + 20, -20);
        const startX = (canvas.width - totalWidth) / 2;
        const y = canvas.height - 220;

        let xOffset = startX;
        runesToDraw.forEach((rune, index) => {
            if (!rune.imageObj?.complete) return;

            let w = rune.imageObj.width;
            let h = rune.imageObj.height;

            let scale = (hoveredSelectedRuneIndex === index) ? 1.1 : 1;
            const scaledW = w * scale;
            const scaledH = h * scale;
            const offsetX = xOffset - (scaledW - w) / 2;
            const offsetY = y - (scaledH - h) / 2;

            ctx.drawImage(rune.imageObj, offsetX, offsetY, scaledW, scaledH);
            xOffset += scaledW + 20;
        });
    }
}

// Rita hela combat 
export function drawCombat(goat) {
    if (!goat) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (inCombat && combatImg.complete) ctx.drawImage(combatImg, 0, 0, canvas.width, canvas.height);

    // spelaren ritas
    if (player.combatImg && player.combatImg.complete) {
        const width = 250;
        const height = 300;
        const x = 400;
        const y = 450;
        ctx.drawImage(player.combatImg, x, y, width, height);
    }
    // ritar geten
    if (goat.image && goat.image.complete) ctx.drawImage(goat.image, 1400, 330, 400, 400);

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";

    ctx.fillText(`You have defeated: ${slays}/4`, 760, canvas.height - 860);
    ctx.fillText(`Combat against: ${goat.name}`, 750, canvas.height - 920);

    drawHealthBar(player.health, player.maxHealth, 310, 775, 440, 110);
    drawHealthBar(goat.health, goat.maxHealth, 1280, 775, 440, 110);

    drawStatus(400, 250, player);
    drawStatus(canvas.width - 570, 280, goat);

    drawRunes(true);
    drawSelectedRunes();
    drawActionStone();

    if (goat.nextMove && goat.nextMove.length) {
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";

        let movesText = goat.nextMove.map(move => {
            let extra = "";

            if (move.name === "Attack") {
                const potentialDmg = Math.floor(goat.tempDamage || goat.damage || 20);
                const blocked = player.block || 0;
                extra = ` (${potentialDmg} dmg → ${Math.max(potentialDmg - blocked, 0)} after block)`;

            } else if (move.name === "Defensive stance") {
                extra = ` (will gain 12 block)`;

            } else if (move.name === "Goat buff") {
                extra = ` (+2 damage for upcoming turns)`;
            }
            return `${move.name}${extra}`;

        }).join(" + ");
        ctx.fillText(`Next enemy action: ${movesText}`, canvas.width - 1300, 300);
    }

    // Rita combat-dialog om aktiv (större och centrerad)
    if (combatDialogActive) {
        const boxW = 900;   // större ruta
        const boxH = 600;   // större ruta

        // Om pos ej satt => centrera
        const centerX = (canvas.width / 2);
        const centerY = (canvas.height / 2);

        const boxX = centerX - boxW / 2;
        const boxY = centerY - boxH / 2;

        ctx.save();
        const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
        gradient.addColorStop(0, "#3b2615");
        gradient.addColorStop(1, "#6b4423");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(boxX, boxY, boxW, boxH, 15);
            ctx.fill();
        } else {
            // fallback om roundRect saknas
            ctx.fillRect(boxX, boxY, boxW, boxH);
        }
        ctx.restore();

        ctx.strokeStyle = "#285513ff";
        ctx.lineWidth = 4;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = "#f0e6c8";
        ctx.font = "20px serif";
        ctx.textBaseline = "top";

        // enkel radbrytning som passar boxen
        const padding = 20;
        const maxWidth = boxW - padding * 2;
        const lines = wrapTextToLines(ctx, combatDialogText, maxWidth);

        lines.forEach((line, i) => ctx.fillText(line, boxX + padding, boxY + padding + i * 30));

        ctx.font = "16px serif";
        ctx.fillStyle = "#c8a34a";
        ctx.fillText("⚔ Click to close", boxX + boxW - 160, boxY + boxH - 36);
    }
}

function wrapTextToLines(context, text, maxWidth) {
    const lines = [];
    const paragraphs = text.split("\n"); // dela på \n

    for (let para of paragraphs) {
        const words = para.split(" ");
        let current = "";

        for (let word of words) {
            const test = current ? current + " " + word : word;
            if (context.measureText(test).width > maxWidth) {
                if (current) lines.push(current);
                current = word;
            } else {
                current = test;
            }
        }
        if (current) lines.push(current);
    }

    return lines;
}

// Rita status (burn, block, vulnerable)
function drawStatus(x, y, target) {
    ctx.fillStyle = "yellow";
    ctx.font = "20px Arial";

    let statusText = [];
    if (target.burnTurns > 0) statusText.push(`Burn rounds left: ${target.burnTurns}`);
    if (target.vulnerable) statusText.push(`Vulnerable`);
    if (target.block > 0) statusText.push(`Block: ${Math.round(target.block)}`);
    if (target.buffTurns > 0) statusText.push(`Enraged: ${target.buffTurns}`);
    if (target.weakenTurns > 0) statusText.push(`Weakened: ${target.weakenTurns}`);
    ctx.fillText(statusText.join(" | "), x, y);
}

// Rita healthbar
function drawHealthBar(current, max, x, y, width, height) {
    current = Number(current) || 0;
    max = Number(max) || 1;
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, width, height);

    const healthWidth = Math.max((current / max) * width, 0);
    ctx.fillStyle = "green";
    ctx.fillRect(x, y, healthWidth, height);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
}

// showCombatDialog med valfri position
export function showCombatDialog(text, onClose = null, x = null, y = null) {
    combatDialogActive = true;
    combatDialogText = text;
    combatDialogOnClose = typeof onClose === 'function' ? onClose : null;

    // Om position inte anges -> null (centering i drawCombat)
    combatDialogPosX = x ?? null;
    combatDialogPosY = y ?? null;
    drawCombat(currentGoat);
}

//  centraliserad klick-hanterare 
// Den här hanteraren stänger dialog först, annars kör den resterande click-logiken (rune selection / action stone)
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Om combat-dialog är aktiv -> stäng och returnera (förhindra övrig klick-logik)
    if (combatDialogActive) {
        combatDialogActive = false;
        if (combatDialogOnClose) {
            try { combatDialogOnClose(); } catch (err) { console.error(err); }
            combatDialogOnClose = null;
        }
        drawCombat(currentGoat);
        return;
    }

    // Klick på boken (visar dialog) - endast i combat
    if (inCombat && mouseX >= bookX && mouseX <= bookX + bookW &&
        mouseY >= bookY && mouseY <= bookY + bookH) {

        // Visa dialog centrerad
        showCombatDialog("HOW TO PLAY MJÖD BELLY COMBAT:\n- Combat is turn based. You always play first.\n- At the start of your turn, you get 6 random RUNES (left side).\n- Place 3 runes in the ACTION STONE (AS). Click each rune in order to use it.\n\n Enemy Actions:\n- Above the enemy, see what they will do AFTER your turn.\n- Choose your runes to counter it.\n  Example: Enemy plans to ATTACK 10 → place a BLOCK rune.\n\n Next Turn:\n- Your runes refresh each turn. Old runes are discarded.\n- You never run out of runes.\n\n Runes:\n- ATTACK – Deal 10 damage\n- BLOCK – Block 10 damage\n- HEAL – Heal 5 HP\n- WEAK GOAT – Enemy deals 50% damage\n- EXPOSE GOAT – Enemy takes 50% more damage\n- RISK? – Deal more or less damage \n- BURN - deals 5 damage for 3 rounds (Could backfire and burn you too)")
        return;
    }

    // Hantera rune-val om vi är i selectingRunes-mode
    if (selectingRunes) {
        const runesToShow = discardedRunes.slice(0, 6);
        for (let rune of runesToShow) {
            if (!rune._clickArea || rune.selected) continue;
            const area = rune._clickArea;
            if (mouseX >= area.x && mouseX <= area.x + area.width &&
                mouseY >= area.y && mouseY <= area.y + area.height) {

                const firstEmptyIndex = actionStoneSlots.findIndex(s => s === null);
                if (firstEmptyIndex !== -1) {
                    actionStoneSlots[firstEmptyIndex] = rune;
                    rune.selected = true; // markera runan som vald
                    selectedRunes.push(rune);

                    const config = actionStoneRunes[firstEmptyIndex];
                    rune._clickArea = {
                        x: actionStoneConfig.x + config.x,
                        y: actionStoneConfig.y + config.y,
                        width: config.width,
                        height: config.height
                    };
                }

                drawCombat(currentGoat);

                if (!actionStoneSlots.includes(null)) {
                    selectingRunes = false;
                    currentTurnRunes = [...actionStoneSlots];
                    runeUsesThisTurn = 0;
                }

                return;
            }
        }
        return;
    }

    // Hantera klick på action stone slots under inCombat
    if (inCombat) {
        for (let i = 0; i < actionStoneSlots.length; i++) {
            const rune = actionStoneSlots[i];
            if (!rune || !rune._clickArea) continue;
            const area = rune._clickArea;
            if (mouseX >= area.x && mouseX <= area.x + area.width &&
                mouseY >= area.y && mouseY <= area.y + area.height) {

                playerAction(i, currentGoat);
                actionStoneSlots[i] = null;
                drawCombat(currentGoat);

                if (!actionStoneSlots.some(slot => slot !== null)) {
                    // Återställ selected för alla runor
                    discardedRunes.forEach(r => r.selected = false);
                    startRuneSelection();
                }
                return;
            }
        }
    }
});

// Musrörelse (hover) - oförändrad logik
let hoveredRuneIndex = null;
let hoveredSelectedRuneIndex = null;

canvas.addEventListener("mousemove", (event) => {
    if (!currentGoat) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    hoveredRuneIndex = null;
    hoveredSelectedRuneIndex = null;

    if (selectingRunes) {
        const runesToShow = discardedRunes.slice(0, 6);
        runesToShow.forEach((rune, index) => {
            const slot = runeSlots[index];
            if (!slot) return;
            if (x >= slot.x && x <= slot.x + 200 && y >= slot.y && y <= slot.y + 50) hoveredRuneIndex = index;
        });
    }
    if (selectedRunes.length > 0) {
        const totalWidth = selectedRunes.length * 220 - 20;
        const startX = (canvas.width - totalWidth) / 2;
        const yTop = canvas.height - 220;
        const yBottom = yTop + 50;

        selectedRunes.forEach((rune, index) => {
            const xLeft = startX + index * 220;
            const xRight = xLeft + 200;
            if (x >= xLeft && x <= xRight && y >= yTop && y <= yBottom) hoveredSelectedRuneIndex = index;
        });
    }
    drawCombat(currentGoat);
});

// playerAction, enemyTurn, endCombat och övrig logik (oförändrad utom att startCombat innehåller auto-show)
export function playerAction(actionIndex, goat) {
    if (!playerTurn || !inCombat || !goat) return;

    const action = currentTurnRunes[actionIndex];
    if (!action) return;

    currentTurnRunes[actionIndex] = null;

    // Starta ljud för varje rune
    if (action.name === "Viking strike") soundmanager.playAxe();
    else if (action.name === "Shield up") soundmanager.playBlock();
    else if (action.name === "Horn of Mjöd") soundmanager.playHealing();
    else if (action.name === "Wildfire") soundmanager.playBurn();
    else if (action.name === "Loki's insult" || action.name === "Exposed flesh") soundmanager.playRune();
    else if (action.name === "Tyr's gamble") soundmanager.playAnvil();

    if (typeof action.damage === "function") {
        applyDamageToGoat(action.damage());
    } else if (typeof action.damage === "number") {
        applyDamageToGoat(action.damage);
    }

    if (action.apply) action.apply();

    if (action.heal) {
        const healed = action.heal();
        player.health = Math.min(player.health + healed, player.maxHealth);
    }

    runeUsesThisTurn++;

    if (goat.health <= 0) {
        soundmanager.playGoatDeath?.();
        endCombat(true, goat);
        return;
    }

    if (player.health <= 0) {
        endCombat(false, goat);
        return;
    }

    const allUsed = currentTurnRunes.every(rune => !rune);

    if (runeUsesThisTurn >= 3 || allUsed) {
        runeUsesThisTurn = 0;
        playerTurn = false;

        if (!inCombat) return;

        // Förbered fienden för nästa tur
        goat.tempDamage = goat.damage;

        setTimeout(() => enemyTurn(goat), 1000);
    }
}

function endCombat(victory, goat) {
    inCombat = false;
    playerTurn = false;

    // Nollställ stridsvariabler
    selectingRunes = false;
    selectedRunes = [];
    currentTurnRunes = [];
    discardedRunes = [];
    runeUsesThisTurn = 0;

    if (victory) {
        slays++;
        player.health = player.maxHealth;
        goat.health = 0;

        setTimeout(() => {
            startMap();
            currentGoat = null;
            exitCombat();
        }, 500);

    } else {
        player.health = player.maxHealth;
        gameOver();
    }
}

// Fiendens tur
function enemyTurn(goat) {
    if (!inCombat || !goat || !player) return;

    // Brännskada först
    applyBurnTick(goat);
    if (goat.health <= 0) {
        soundmanager.playGoatDeath?.();
        endCombat(true, goat);
        return;
    }

    if (goat.buffTurns > 0) {
        goat.buffTurns--;
        if (goat.buffTurns <= 0) {
            goat.damageBonus = 0;
        }
    }

    if (goat.weakenTurns > 0) {
        goat.weakenTurns--;
        if (goat.weakenTurns <= 0) {
            goat.weakenAmount = 0;
        }
    }

    refreshGoatDamage(goat);

    goat.tempDamage = goat.damage;

    // Slumpa handlingar om inga finns
    let actions = goat.nextMove || [];
    if (actions.length === 0) {
        actions = [
            EnemyActions[Math.floor(Math.random() * EnemyActions.length)],
            EnemyActions[Math.floor(Math.random() * EnemyActions.length)]
        ];
    }

    // Se till att minst en Attack finns
    if (!actions.some(a => a.name === "Attack")) {
        actions[0] = EnemyActions.find(a => a.name === "Attack");
    }

    // Utför handlingarna
    actions.forEach(action => {
        if (action && typeof action.apply === "function") {
            action.apply(goat, player);
        }
    });

    // Kontrollera om spelaren dog
    if (player.health <= 0) {
        player.health = player.maxHealth;
        inCombat = false;
        playerTurn = false;
        currentGoat = null;
        gameOver();
        return;
    }

    refreshGoatDamage(goat);
    goat.tempDamage = goat.damage;

    // Slumpa nya handlingar för nästa tur
    goat.nextMove = [
        EnemyActions[Math.floor(Math.random() * EnemyActions.length)],
        EnemyActions[Math.floor(Math.random() * EnemyActions.length)]
    ];

    // Ge kontrollen tillbaka till spelaren
    playerTurn = true;
    currentTurn++;
    runeUsesThisTurn = 0;
    startRuneSelection();
}

// startCombat (endast en implementation, med auto-show första gången)
function startCombat(goat) {
    if (!goat) return;
    if (goat.health <= 0) return;

    inCombat = true;
    playerTurn = true;
    currentGoat = goat;

    // Visa combat-guide automatiskt första gången
    if (!combatDialogShownOnce) {
        combatDialogShownOnce = true;
        showCombatDialog(
    "HOW TO PLAY MJÖD BELLY COMBAT:\n- Combat is turn based. You always play first.\n- At the start of your turn, you get 6 random RUNES (left side).\n- Place 3 runes in the ACTION STONE (AS). Click each rune in order to use it.\n\n Enemy Actions:\n- Above the enemy, see what they will do AFTER your turn.\n- Choose your runes to counter it.\n  Example: Enemy plans to ATTACK 10 → place a BLOCK rune.\n\n Next Turn:\n- Your runes refresh each turn. Old runes are discarded.\n- You never run out of runes.\n\n Runes:\n- ATTACK – Deal 10 damage\n- BLOCK – Block 10 damage\n- HEAL – Heal 5 HP\n- WEAK GOAT – Enemy deals 50% damage\n- EXPOSE GOAT – Enemy takes 50% more damage\n- RISK? – Deal more or less damage \n- BURN - deals 5 damage for 3 rounds (Could backfire and burn you too)"
);
    }

    selectingRunes = false;
    selectedRunes = [];
    currentTurnRunes = [];
    discardedRunes = [];
    runeUsesThisTurn = 0;

    // Nollställ getens stats helt inför ny strid
    const baseHealth = 100
    const baseDamage =  20
    currentGoat.baseMaxHealth = baseHealth;
    currentGoat.maxHealth = baseHealth;
    currentGoat.health = baseHealth;
    currentGoat.baseDamage = baseDamage;
    currentGoat.damage = baseDamage;
    currentGoat.tempDamage = currentGoat.damage;
    currentGoat.block = 0;
    currentGoat.burnTurns = 0;
    currentGoat.burnDamage = 0;
    currentGoat.vulnerable = false;
    currentGoat.vulnerableTurns = 0;
    currentGoat.damageBonus = 0;
    currentGoat.buffTurns = 0;
    currentGoat.weakenAmount = 0;
    currentGoat.weakenTurns = 0;
    refreshGoatDamage(currentGoat);
    AllRunes.forEach(r => r.selected = false);

    // Slumpa första fiendehandlingar
    currentGoat.nextMove = [
        EnemyActions[Math.floor(Math.random() * EnemyActions.length)],
        EnemyActions[Math.floor(Math.random() * EnemyActions.length)]
    ];

    // Spelaren börjar utan block
    player.block = 0;

    // Kollar vilken equipment spelaren har
    player.combatImg = player.imgIdle;

    startRuneSelection();
    drawCombat(currentGoat);
}