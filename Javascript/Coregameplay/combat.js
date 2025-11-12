export { startCombat };
import { canvas, ctx, startMap, player, combatGoats, pauseMap } from "./map.js";
import { startGame, gameOver } from "./overlay.js";

const imagePaths = [
    "../kartbilder/combat.png",
    "./character_bilder/meatball_nack.png",
    "./Runes/rune_attack.png",
    "./Runes/rune_block.png",
    "./Runes/rune_heal.png",
    "./Runes/rune_burn.png",
    "./Runes/rune_weak.png",
    "./Runes/rune_expose.png",
    "./Runes/rune_risk.png",
];

export async function preloadImages(paths) {
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ src, img });
            img.onerror = () => reject(`Kunde inte ladda: ${src}`);
            img.src = src;
        });
    };

    const loaded = await Promise.all(paths.map(loadImage));
    const imageMap = {};
    loaded.forEach(({ src, img }) => imageMap[src] = img);
    return imageMap;
}

const combatImg = new Image();
combatImg.src = "../kartbilder/combat.png";

const playerCombatImg = new Image();
playerCombatImg.src = "./character_bilder/meatball_nack.png";

let inCombat = false;
let playerTurn = true;
let slays = 0;
let currentGoat = null;
let currentTurn = 0;

let selectingRunes = false;
let selectedRunes = [];
let currentTurnRunes = [];
let discardedRunes = [];
let runeUsesThisTurn = 0;

const runeSlots = [
    { x: 15, y: 100 },
    { x: 15, y: 200 },
    { x: 15, y: 300 },
    { x: 15, y: 400 },
    { x: 15, y: 500 },
    { x: 15, y: 600 }
];

player.damage=10;

export const PlayerActions = [
    {
        name: "Viking strike",
        damage: () => player.damage,
        img: "./Runes/rune_attack.png"
    },
    {
        name: "Shield up",
        apply: () => { 
            player.block = 10; 
            console.log(`You prepare a shield! Will block ${player.block} damage next turn.`);
        },
        img: "./Runes/rune_block.png"
    },
    {
        name: "Horn of Mjöd",
        heal: () => 5,
        img: "./Runes/rune_heal.png"
    },
    {
        name: "Wildfire",
        apply: () => { 
            currentGoat.burnTurns = 3; 
            currentGoat.burnDamage = Math.floor(player.damage / 3); 
            console.log(`${currentGoat.name} was set on fire!`); 
        },
        img: "./Runes/rune_burn.png"
    },
    {
        name: "Loki's insult",
        apply: () => { 
            currentGoat.tempDamage = Math.floor((currentGoat.damage || 20) * 0.5); 
            console.log(`${currentGoat.name} was weakened!`); 
        },
        img: "./Runes/rune_weak.png"
    },
    {
        name: "Exposed flesh",
        apply: () => { 
            currentGoat.vulnerable = true; 
            console.log(`${currentGoat.name} is vulnerable!`); 
        },
        img: "./Runes/rune_expose.png"
    },
{
    name: "Tyr's gamble",
    apply: () => {
        const outcome = Math.random();
        if (outcome < 0.4) { // 40% chance: mer damage
            const dmg = Math.floor(player.damage * 0.4); 
            currentGoat.health = (currentGoat.health || currentGoat.maxHealth) - dmg;
            console.log(`Won the gamble! Dealt ${dmg} damage!`);
        } else if (outcome < 0.8) { // 40% chance: låg damage
            const dmg = Math.floor(player.damage * 0.1);
            currentGoat.health = (currentGoat.health || currentGoat.maxHealth) - dmg;
            console.log(`Lost the gamble! Dealt only ${dmg} damage.`);
        } else { // 20% chance: självskada
            const selfDmg = Math.floor(player.maxHealth * 0.1);
            player.health -= selfDmg;
            console.log(`Oh no! Tyr's gamble backfired. You took ${selfDmg} damage!`);
        }
    },
    img: "./Runes/rune_risk.png"
    }
];

PlayerActions.forEach(r => {
    const img = new Image();
    img.src = r.img;
    r.imageObj = img;
});

export const EnemyActions = [
    {
        name: "Attack",
        apply: (goat, player) => {
            let damage = goat.tempDamage || goat.damage || 20;
            const blocked = Math.min(damage, player.block || 0);
            damage -= blocked;
            player.block = 0;
            player.health = (player.health || player.maxHealth) - damage;
            console.log(`${goat.name} attacked and dealt ${damage} damage (${blocked} blocked)!`);
        }
    },
    {
        name: "Defensive stance",
        apply: (goat) => {
            goat.block = 10;
            console.log(`${goat.name} is preparing to block ${goat.block} damage next turn!`);
        }
    },
    {
        name: "Goat buff",
        apply: (goat) => {
            goat.damage = Math.floor((goat.damage || 20) * 1.2);
            console.log(`${goat.name} is enraged!`);
        }
    },
];

let images = {};

(async () => {
    console.log("Loading images");
    images = await preloadImages(imagePaths);
    console.log("All images are loaded");

    combatImg.src = "../kartbilder/combat.png";
    combatImg.imageObj = images["./kartbilder/combat.png"];

    playerCombatImg.src = "./character_bilder/meatball_nack.png";
    player.combatImg = images["./character_bilder/meatball_nack.png"];

    PlayerActions.forEach(r => {
        r.imageObj = images[r.img];
    });

    startMap();
    startGame();
})();

playerCombatImg.onload = () => {
    ctx.drawImage(playerCombatImg, 350, canvas.height/2 - 75, 150, 150);
};

function startRuneSelection() {
    if (!currentGoat) return;

    selectingRunes = true;
    selectedRunes = [];
    currentTurnRunes = [];
    runeUsesThisTurn = 0;

    discardedRunes = shuffleArray([...PlayerActions]);
    hoveredRuneIndex = null;
    hoveredSelectedRuneIndex = null;

    currentGoat.maxHealth = currentGoat.maxHealth || 100;
    currentGoat.health = currentGoat.health ?? currentGoat.maxHealth;

    currentGoat.vulnerable = false;
    currentGoat.tempDamage = currentGoat.damage;

    currentGoat.blockRemaining = currentGoat.block || 0;

    drawCombat(currentGoat);
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function drawRunes(alwaysVisible = false) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Your runes:", 30, 100);

    const runesToShow = discardedRunes.slice(0, 6);
    runesToShow.forEach((rune, index) => {
        const slot = runeSlots[index];
        if (!slot) return;
        const x = slot.x;
        const y = slot.y;
        const w = 200;
        const h = 50;

        let scale = (hoveredRuneIndex === index) ? 1.1 : 1;
        const scaledW = w * scale;
        const scaledH = h * scale;
        const offsetX = x - (scaledW - w) / 2;
        const offsetY = y - (scaledH - h) / 2;
        if (rune.imageObj?.complete) {
            if (!selectingRunes) ctx.globalAlpha = 0.5;
            ctx.drawImage(rune.imageObj, offsetX, offsetY, scaledW, scaledH);
            ctx.globalAlpha = 1;
        }
    });
    if (selectingRunes) {
        ctx.fillStyle = "white";
        ctx.fillText("Select 3 runes for next round", 30, 30);
    }
}

function drawSelectedRunes() {
    const runesToDraw = selectingRunes ? selectedRunes : currentTurnRunes;

    if (runesToDraw.length === 0) return;
    const totalWidth = runesToDraw.length * 220 - 20;
    const startX = (canvas.width - totalWidth) / 2;
    const y = canvas.height - 220;

    runesToDraw.forEach((rune, index) => {
        let x = startX + index * 220;
        const w = 200;
        const h = 50;

        let scale = (hoveredSelectedRuneIndex === index) ? 1.1 : 1;
        const scaledW = w * scale;
        const scaledH = h * scale;
        const offsetX = x - (scaledW - w) / 2;
        const offsetY = y - (scaledH - h) / 2;

        if (rune.imageObj?.complete) {
            ctx.drawImage(rune.imageObj, offsetX, offsetY, scaledW, scaledH);
        }
    });
}

export function drawCombat(goat) {
    if (!goat) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (combatImg.complete) ctx.drawImage(combatImg, 0, 0, canvas.width, canvas.height);
    if (player.combatImg && player.combatImg.complete) {
        const width = 250;
        const height = 250;
        const x = 300; 
        const y = 320;
        ctx.drawImage(player.combatImg, x, y, width, height);
    }

    if (goat.image && goat.image.complete) ctx.drawImage(goat.image, canvas.width - 400, canvas.height / 2 - 175, 400, 400);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";

    ctx.fillText(`You have defeated: ${slays}/4`, 660, canvas.height - 660);
    ctx.fillText(`Combat against: ${goat.name}`, 650, canvas.height - 720);

    drawHealthBar(player.health, player.maxHealth, 230, 560, 350, 80);
    drawHealthBar(goat.health, goat.maxHealth, 1000, 560, 350, 80);

    drawStatus(400, 250, player);
    drawStatus(canvas.width - 570, 280, goat);

    drawRunes(true);
    drawSelectedRunes();

    if (goat.nextMove && goat.nextMove.length) {
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";

        let movesText = goat.nextMove.map(move => {
            let extra = "";

            if (move.name === "Attack") {
                const potentialDmg = Math.floor(goat.tempDamage || goat.damage || 20);
                const blocked = player.block || 0;
                extra = ` (${potentialDmg} dmg → ${Math.max(potentialDmg - blocked,0)} after block)`;

            } else if (move.name === "Defensive stance") {
                extra = ` (will block 10)`;

            } else if (move.name === "Goat buff") {
                extra = ` (damage x1.2)`;
            }
            return `${move.name}${extra}`;

        }).join(" + ");
        ctx.fillText(`Next enemy action: ${movesText}`, canvas.width - 1200, 200);
    }
}

function drawStatus(x, y, target) {
    ctx.fillStyle = "yellow";
    ctx.font = "20px Arial";

    let statusText = [];
    if (target.burnTurns > 0) statusText.push(`Burn rounds left: ${target.burnTurns}`);
    if (target.vulnerable) statusText.push(`Vulnerable`);
    if (target.block > 0) statusText.push(`Block: ${target.block}`);
    ctx.fillText(statusText.join(" | "), x, y);
}

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

function startCombat(goat) {
    if (!goat) return;

    inCombat = true;
    playerTurn = true;
    currentGoat = goat; 

    currentGoat.maxHealth = currentGoat.maxHealth || 100;
    currentGoat.health = currentGoat.health ?? currentGoat.maxHealth;

    currentGoat.nextMove = [EnemyActions[Math.floor(Math.random() * EnemyActions.length)], EnemyActions[Math.floor(Math.random() * EnemyActions.length)]];

    currentGoat.burnTurns = 0;
    currentGoat.burnDamage = 0;
    currentGoat.vulnerable = false;

    currentGoat.tempDamage = currentGoat.damage || 20;
    player.block = 0;
    currentGoat.block = 0;
    currentGoat.damage = currentGoat.damage || 20;

    console.log(`An evil ${goat.name} has appeared!`);
    startRuneSelection();
}

export function playerAction(actionIndex, goat) {
    if (!playerTurn || !inCombat || !goat) return;
    const action = currentTurnRunes[actionIndex];
    if (!action) return;

    currentTurnRunes.splice(actionIndex, 1);

    if (action.apply) action.apply();

    if (action.damage) {
        const missChance = 0.1;
        if (Math.random() < missChance) {
            console.log(`You missed your attack on ${goat.name}!`);
        } else {
            let dmg = action.damage();
            if (goat.vulnerable) dmg = Math.floor(dmg * 1.3);

            const blocked = Math.min(dmg, goat.blockRemaining || 0);
            dmg -= blocked;
            goat.blockRemaining -= blocked;

            goat.health -= dmg;
            console.log(`You dealt ${dmg} damage to ${goat.name} (${blocked} blocked)`);
        }
    }

    if (action.heal) {
        const healed = action.heal();
        player.health = Math.min(player.health + healed, player.maxHealth);
        console.log(`You healed ${healed} HP`);
    }

    if (goat.health <= 0) { endCombat(true, goat); return; }

    runeUsesThisTurn++;
    if (runeUsesThisTurn >= 3) {
        runeUsesThisTurn = 0;
        playerTurn = false;

        //reset alla effecter förutom burn efter varje omgång
        goat.vulnerable = false;
        goat.tempDamage = goat.damage;
        goat.block = 0;
        goat.blockRemaining = 0;
        player.block = 0;

        setTimeout(() => enemyTurn(goat), 1000);
    }
}


function enemyTurn(goat) {
    if (!goat || !player) return;

    // burn skada
    if (goat.burnTurns > 0) {
        goat.health -= goat.burnDamage;
        goat.burnTurns -= 1;
        console.log(`${goat.name} took ${goat.burnDamage} burn damage!`);
        if (goat.health <= 0) {
            endCombat(true, goat);
            return;
        }
    }

    goat.vulnerable = false;
    goat.tempDamage = goat.damage || 20;
    player.block = player.block ?? 0;

    // Använd redan valda moves (nästa drag)
    const actions = goat.nextMove || [];

    // Applicera icke-attack effekter först
    actions.forEach(action => {
        if (action.name !== "Attack") action.apply(goat, player);
    });

    // Beräkna attackskada efter block
    let totalDamage = 0;
    actions.forEach(action => {
        if (action.name === "Attack") {
            totalDamage += goat.tempDamage || goat.damage || 20;
        }
    });

    const blocked = Math.min(totalDamage, player.block);
    const damageToTake = Math.max(totalDamage - blocked, 0);
    player.health -= damageToTake;
    console.log(`${goat.name} dealt ${damageToTake} damage (${blocked} blocked)!`);

    // Kolla om spelaren dog
    if (player.health <= 0) {
        player.health = 0;
        inCombat = false;
        playerTurn = false;
        currentGoat = null;
        console.log("You were defeated!");
        gameOver();
        return;
    }

    // Förbered nästa drag
    goat.nextMove = [
        EnemyActions[Math.floor(Math.random() * EnemyActions.length)],
        EnemyActions[Math.floor(Math.random() * EnemyActions.length)]
    ];

    playerTurn = true;
    currentTurn += 1;
    runeUsesThisTurn = 0;
    player.block = 0;

    startRuneSelection();
}

let hoveredRuneIndex = null;
let hoveredSelectedRuneIndex = null;

canvas.addEventListener("mousemove", (event) => {
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

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectingRunes) {
        const runesToShow = discardedRunes.slice(0, 6);
        runesToShow.forEach((rune, index) => {
            const slot = runeSlots[index];
            if (!slot) return;
            if (x >= slot.x && x <= slot.x + 200 && y >= slot.y && y <= slot.y + 50) {
                if (!selectedRunes.includes(rune) && selectedRunes.length < 3) {
                    selectedRunes.push(rune);
                    discardedRunes = discardedRunes.filter(r => r !== rune);
                } else {
                    selectedRunes = selectedRunes.filter(r => r !== rune);
                    discardedRunes.push(rune);
                }
                drawCombat(currentGoat);
                if (selectedRunes.length === 3) {
                    selectingRunes = false;
                    currentTurnRunes = [...selectedRunes];
                    runeUsesThisTurn = 0;
                }
            }
        });
        return;
    }

    if (inCombat && !selectingRunes) {
        const totalWidth = currentTurnRunes.length * 220 - 20;
        const startX = (canvas.width - totalWidth) / 2;
        const yTop = canvas.height - 220;
        const yBottom = yTop + 50;

        for (let index = currentTurnRunes.length - 1; index >= 0; index--) {
            const rune = currentTurnRunes[index];
            const xLeft = startX + index * 220;
            const xRight = xLeft + 200;

            if (x >= xLeft && x <= xRight && y >= yTop && y <= yBottom) {
                playerAction(index, currentGoat);
                drawCombat(currentGoat);
                break; 
            }
        }
    }
});