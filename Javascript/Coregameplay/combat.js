import { canvas, ctx, startMap, player } from "./map.js";
import { startGame } from "./overlay.js";

let inCombat = false;
let playerTurn = true;
let slays = 0;
let currentGoat = null;

// Log system
const gameLogs = [];

function addLog(message) {
    gameLogs.push(message);
    if (gameLogs.length > 6) gameLogs.shift();
    drawCombat(currentGoat);
}

// --- Player Actions ---
export const PlayerActions = [
    {
        name: "Attack",
        damage: () => player.damage,
        cost: 5
    },
    {
        name: "Dodge",
        cost: 10,
        apply: () => {
            player.isDodging = true;
            addLog("Du förbereder en dodge!");
        }
    },
    {
        name: "Heal",
        heal: () => 20,
        cost: 15
    }
];

// --- Start Combat ---
export function startCombat(goat) {
    if (!goat) return;
    inCombat = true;
    playerTurn = true;
    currentGoat = goat;
    addLog(`En ${goat.name} dyker upp!`);
    drawCombat(goat);
}

// --- Player Action ---
export function playerAction(actionIndex, goat) {
    if (!playerTurn || !inCombat || !goat) return;

    const action = PlayerActions[actionIndex];

    if (player.mana < action.cost) {
        addLog("Inte tillräckligt mana!");
        return;
    }

    player.mana -= action.cost;

    if (action.damage) {
        goat.health -= action.damage();
        addLog(`Du gjorde ${action.damage()} skada på ${goat.name}`);
    } else if (action.heal) {
        player.health += action.heal();
        if (player.health > player.maxHealth) player.health = player.maxHealth;
        addLog(`Du helade ${action.heal()} HP`);
    } else if (action.apply) {
        action.apply();
    }

    if (goat.health <= 0) {
        endCombat(true, goat);
        return;
    }

    playerTurn = false;
    setTimeout(() => enemyTurn(goat), 1000);
}

// --- Enemy Turn ---
function enemyTurn(goat) {
    if (!goat) return;
    let damage = goat.damage || 5;

    if (player.isDodging) {
        damage = Math.floor(damage * 0.5);
        player.isDodging = false;
    }

    player.health -= damage;
    addLog(`${goat.name} gjorde ${damage} skada!`);

    if (player.health <= 0) {
        endCombat(false, goat);
        return;
    }

    playerTurn = true;
    drawCombat(goat);
}

// --- End Combat ---
function endCombat(playerWon, goat) {
    if (playerWon) {
        addLog(`Du besegrade ${goat.name}!`);
        slays += 1;
        startMap();
        startGame();
    } else {
        addLog("Du blev besegrad!");
        startGame();
        // Reset player stats
        player.health = player.maxHealth;
        player.mana = player.maxMana;
        player.x = 370;
        player.y = 4405;
    }

    inCombat = false;
    playerTurn = true;
    currentGoat = null;
}

// --- Draw Combat ---
export function drawCombat(goat) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!goat) return;

    // Player
    if (player.img && player.img.complete) {
        ctx.drawImage(player.img, 400, canvas.height / 2 - 75, 150, 150);
    }

    // Enemy (Goat)
    if (goat.image && goat.image.complete) {
        ctx.drawImage(goat.image, canvas.width - 570, canvas.height / 2 - 75, 150, 150);
    }

    // Stats Text
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Du har besegrat: ${slays}/4`, 680, canvas.height - 650);
    ctx.fillText(`Strid mot: ${goat.name}`, 690, canvas.height - 700);
    ctx.fillText(`Ditt HP: ${player.health}/${player.maxHealth}`, 400, 220);
    ctx.fillText(`Din Mana: ${player.mana}/${player.maxMana}`, 400, 250);
    ctx.fillText(`${goat.name} HP: ${goat.health}`, canvas.width - 570, 250);

    // Player Actions UI
    PlayerActions.forEach((action, index) => {
        ctx.fillStyle = "gray";
        ctx.fillRect(670, canvas.height - 250 + index * 50, 200, 40);
        ctx.fillStyle = "white";
        ctx.fillText(`${action.name} (Mana: ${action.cost})`, 695, canvas.height - 222 + index * 50);
    });

    // Game Logs
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    gameLogs.forEach((log, index) => {
        ctx.fillText(log, 50, canvas.height - 380 + index * 25);
    });
}

// --- Click Handling for Player Actions ---
canvas.addEventListener("click", (event) => {
    if (!inCombat || !playerTurn || !currentGoat) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    PlayerActions.forEach((action, index) => {
        const actionX = 670;
        const actionY = canvas.height - 250 + index * 50;

        if (x >= actionX && x <= actionX + 200 && y >= actionY && y <= actionY + 40) {
            playerAction(index, currentGoat);
        }
    });
});
