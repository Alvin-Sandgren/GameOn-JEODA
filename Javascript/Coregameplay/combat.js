import { canvas, ctx, startMap, player, combatGoats } from "./map.js";
import { startGame, gameOver } from "./overlay.js";

const combatImg = new Image();
combatImg.src = "./Bilder/combat.png";

let inCombat = false;
let playerTurn = true;
let slays = 0;
let currentGoat = null;
let currentTurn = 0;

let selectingRunes = false;
let selectedRunes = [];
let discardedRunes = [];
let runeUsesThisTurn = 0;

// Player actions
export const PlayerActions = [
    {
        name: "Viking strike",
        damage: () => player.damage
    },

    {
        name: "Shield up",
        apply: () => { 
            player.isBlocking = true; 
            console.log("Preparing a block!"); 
        }
    },

    {
        name: "Horn of Mjöd",
        heal: () => 20
    },

    {
        name: "Wildfire",
        apply: () => { 
            currentGoat.burnTurns = 3; 
            currentGoat.burnDamage = player.damage / 2; 
            console.log(`${currentGoat.name} was set on fire!`); 
        }
    },

    {
        name: "Loki's insult",
        apply: () => { 
            currentGoat.damage = Math.floor(currentGoat.damage * 0.5); 
            console.log(`${currentGoat.name} was weakened!`); 
        }
    },

    {
        name: "Exposed flesh",
        apply: () => { 
            currentGoat.vulnerable = true; 
            console.log(`${currentGoat.name} is vulnerable!`); 
        }
    },

    {
        name: "Tyr's gamble",
        apply: () => {
            if (Math.random() > 0.5) {
                const dmg = Math.floor(player.damage * 1.5);
                currentGoat.health -= dmg;
                console.log(`Won the gamble! Dealt ${dmg} damage!`);
            } else {
                const dmg = Math.floor(player.damage * 0.5);
                currentGoat.health -= dmg;
                console.log(`Lost the gamble! Dealt only ${dmg} damage.`);
            }
        }
    }
];


// Enemy actions
export const EnemyActions = [
    {
        name: "Bite",
        apply: (goat, player) => {
            let damage = goat.damage;
            if (player.isBlocking) damage = Math.floor(damage * 0.5);
            player.health -= damage;
            console.log(`${goat.name} bit and dealt ${damage} damage!`);
        }
    },

    {
        name: "Goat rush",
        apply: (goat) => {
            goat.burnDamage = goat.damage;
            console.log(`${goat.name} rammed you with horns, you're bleeding!`);
        }
    },

    {
        name: "Defensive stance",
        apply: (goat) => {
            goat.isDefending = true;
            console.log(`${goat.name} takes a defensive stance!`);
        }
    },
    
    {
        name: "Goat buff",
        apply: (goat) => {
            goat.damage *= 1.5;
            console.log(`${goat.name} is enraged!`);
        }
    },

    {
        name: "Curse of Weakness",
        apply: (goat, player) => {
            player.vulnerable = true;
            console.log(`${goat.name} cursed you with weakness!`);
        }
    }
];


function startRuneSelection() {
    selectingRunes = true;
    selectedRunes = [];
    discardedRunes = [];
    drawCombat(currentGoat);
}

function drawRunes(alwaysVisible = false) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Your runes:", 30, 100);

    PlayerActions.forEach((rune, index) => {
        const x = 30;
        const y = 120 + index * 70;

        const isSelected = selectedRunes.includes(rune);
        const color = isSelected ? "green" : "gray";

        ctx.fillStyle = color;
        ctx.fillRect(x, y, 200, 50);

        ctx.fillStyle = "white";
        ctx.fillText(rune.name, x + 10, y + 32);
    });

    if (selectingRunes) {
        ctx.fillStyle = "white";
        ctx.fillText("Select 3 runes for next round", 30, 50);
    }
}

function drawSelectedRunes() {
    if (selectedRunes.length === 0) return;

    const totalWidth = selectedRunes.length * 220 - 20;
    const startX = (canvas.width - totalWidth) / 2;
    const y = canvas.height - 120;

    selectedRunes.forEach((rune, index) => {
        const x = startX + index * 220;

        ctx.fillStyle = "darkgreen";
        ctx.fillRect(x, y, 200, 60);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(rune.name, x + 10, y + 35);
    });

    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText("Selected Runes", canvas.width / 2 - 70, canvas.height - 140);
}

// ritar bakgrundsbilden combat.png
export function drawCombat(goat) {
    if (!goat) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rita combat-bakgrund
    if (combatImg.complete) {
        ctx.drawImage(combatImg, 0, 0, canvas.width, canvas.height);
    } else {
        combatImg.onload = () => drawCombat(goat);
    }

    if (player.img) {
        if (player.img.complete) {
            ctx.drawImage(player.img, 400, canvas.height / 2 - 75, 150, 150);
        } else {
            player.img.onload = () => drawCombat(goat); 
        }
    }

    if (goat.image) {
        if (goat.image.complete) {
            ctx.drawImage(goat.image, canvas.width - 400, canvas.height / 2 - 175, 400, 400);
        } else {
            goat.image.onload = () => drawCombat(goat); 
        }
    }

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`You have defeated: ${slays}/4`, 680, canvas.height - 650);
    ctx.fillText(`Combat against: ${goat.name}`, 690, canvas.height - 700);
    ctx.fillText(`Your HP: ${player.health}/${player.maxHealth}`, 400, 220);
    ctx.fillText(`${goat.name} HP: ${goat.health}`, canvas.width - 570, 250);

    drawRunes(true);
    drawSelectedRunes();
}



export function startCombat(goat) {
    if (!goat) return;
    inCombat = true;
    playerTurn = true;
    currentGoat = goat;
    currentGoat.burnTurns = 0;
    currentGoat.burnDamage = 0;
    currentGoat.vulnerable = false;
    player.isBlocking = false;
    console.log(`An evil ${goat.name} has appeared!`);
    startRuneSelection();
}

export function playerAction(actionIndex, goat) {
    if (!playerTurn || !inCombat || !goat) return;

    const action = selectedRunes[actionIndex];
    if (!action) return;

    if (goat.burnTurns > 0) {
        goat.health -= goat.burnDamage;
        console.log(`${goat.name} took ${goat.burnDamage} burn damage!`);
        goat.burnTurns -= 1;
        if (goat.health <= 0) { endCombat(true, goat); return; }
    }

    if (action.apply) action.apply();
    if (action.damage) {
        const missChance = 0.1;
        if (Math.random() < missChance) console.log(`You missed your attack on ${goat.name}!`);
        else {
            let dmg = action.damage();
            if (goat.vulnerable) dmg = Math.floor(dmg * 1.5);
            goat.health -= dmg;
            console.log(`You dealt ${dmg} damage to ${goat.name}`);
        }
    } else if (action.heal) {
        const healed = action.heal();
        player.health += healed;
        if (player.health > player.maxHealth) player.health = player.maxHealth;
        console.log(`You healed ${healed} HP`);
    }

    if (goat.health <= 0) { endCombat(true, goat); return; }

    runeUsesThisTurn++;
    if (runeUsesThisTurn >= 3) {
        runeUsesThisTurn = 0;
        playerTurn = false;
        setTimeout(() => enemyTurn(goat), 1000);
    }
}

function enemyTurn(goat) {
    if (!goat) return;

    goat.isDefending = false;
    const randomAction = EnemyActions[Math.floor(Math.random() * EnemyActions.length)];
    randomAction.apply(goat, player);

    if (player.health <= 0) { endCombat(false, goat); return; }

    playerTurn = true;
    currentTurn += 1;
    runeUsesThisTurn = 0;
    player.isBlocking = false;
    startRuneSelection();
}

function endCombat(playerWon, goat) {
    if (playerWon) {
        console.log(`You defeated ${goat.name}!`);
        slays += 1;

        const index = combatGoats.indexOf(goat);
        if (index !== -1) combatGoats.splice(index, 1);

        currentGoat = null;
        player.health = player.maxHealth;

        inCombat = false;
        playerTurn = true;

        startMap();
        startGame();
    } else {
        console.log("You were defeated!");
        gameOver();
        player.health = player.maxHealth;
        player.x = 370;
        player.y = 4405;

        inCombat = false;
        playerTurn = true;
        currentGoat = null;
    }
}


canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    PlayerActions.forEach((rune, index) => {
        const rx = 30;
        const ry = 120 + index * 70;

        if (x >= rx && x <= rx + 200 && y >= ry && y <= ry + 50) {
            if (selectingRunes) {
                if (selectedRunes.includes(rune)) selectedRunes = selectedRunes.filter(r => r !== rune);
                else if (selectedRunes.length < 3) selectedRunes.push(rune);
                drawCombat(currentGoat);

                if (selectedRunes.length === 3) {
                    discardedRunes = PlayerActions.filter(r => !selectedRunes.includes(r));
                    selectingRunes = false;
                    console.log("Runes locked for this round!");
                }
            } else {
                const indexInSelected = selectedRunes.indexOf(rune);
                if (indexInSelected !== -1) playerAction(indexInSelected, currentGoat);
            }
        }
    });
});
