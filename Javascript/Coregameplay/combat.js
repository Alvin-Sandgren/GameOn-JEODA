import { canvas, ctx, player } from "./map.js";  // <-- lägg till ctx och canv


let inCombat = false;
let playerTurn = true;

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
            console.log("Du förbereder en dodge!");
        }
    },
    {
        name: "Heal",
        heal: () => 20,
        cost: 15
    }
];

export function startCombat(goat) {
    inCombat = true;
    playerTurn = true;
    drawCombat(goat); // får nu en giltig Goat
}

// --- Player Action ---
export function playerAction(actionIndex, goat) {
    if (!playerTurn || !inCombat) return;

    const action = PlayerActions[actionIndex];

    if (player.mana < action.cost) {
        console.log("Inte tillräckligt mana!");
        return;
    }

    player.mana -= action.cost;

    if (action.damage) {
        goat.health -= action.damage();
        console.log(`Du gjorde ${action.damage()} skada på ${goat.name}`);
    } else if (action.heal) {
        player.health += action.heal();
        if (player.health > player.maxHealth) player.health = player.maxHealth;
        console.log(`Du helade ${action.heal()} HP`);
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
    let damage = goat.damage || 5;

    if (player.isDodging) {
        damage = Math.floor(damage * 0.5);
        player.isDodging = false;
    }

    player.health -= damage;
    console.log(`${goat.name} gjorde ${damage} skada!`);

    if (player.health <= 0) {
        endCombat(false, goat);
        return;
    }

    playerTurn = true;
    drawCombat(goat);
}

// --- End Combat ---
function endCombat(playerWon, goat) {
    if (playerWon) console.log(`Du besegrade ${goat.name}!`);
    else console.log("Du blev besegrad!");

    inCombat = false;
    playerTurn = true;
}

export function drawCombat(goat) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bakgrund
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Spelare
    if (player.img.complete) {
        ctx.drawImage(player.img, 400, canvas.height / 2 - 75, 150, 150);
    }

    // Fiende (Goat)
    if (goat.image.complete) {
        ctx.drawImage(goat.image, canvas.width - 600, canvas.height / 2 - 75, 150, 150);
    }

    // Text
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Player HP: ${player.health}/${player.maxHealth}`, 200, 50);
    ctx.fillText(`Player Mana: ${player.mana}/${player.maxMana}`, 200, 80);
    ctx.fillText(`${goat.name} HP: ${goat.health}`, canvas.width - 250, 50);
}