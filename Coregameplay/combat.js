let inCombat = false;
let currentEnemy = null;
let playerTurn = true;

function logMessage(msg) {
    const log = document.getElementById("combat-log");
    const entry = document.createElement("div");
    entry.textContent = msg;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

const PlayerActions = [
    {
        name: "Attack (Gör 10 damage : 5 Mana)",
        damage: () => player.damage,
        cost: 5
    },
    {
        name: "Dodge (50% mindre skada nästa attack : 10 Mana)",
        cost: 10,
        apply: () => {
            player.isDodging = true;
            logMessage("Du är redo med en dodge, nästa attack på dig minskas med 50%.");
        }
    },
    {
        name: "Heal (20 HP : 15 Mana)",
        heal: () => 20,
        cost: 15
    },
    {
        name: "Flee (Avsluta striden : 0 Mana)",
        cost: 0,
        apply: () => {
            logMessage("Du flydde!");
                endCombat(false, true); 
        }
    }
];

function startCombat(enemy) {
    inCombat = true;
    currentEnemy = enemy;
    playerTurn = true;
    openCombatUI();
    updateCombatUI();
    logMessage(`Du blev attackerad av en ond ${enemy.name}!`);
}

function updateCombatUI() {
    if (!currentEnemy) return;
    document.getElementById("combat-status").textContent =
        `HP: ${player.health}/${player.maxHealth} | Mana: ${player.mana}/${player.maxMana} | ` +
        `${currentEnemy.name} HP: ${currentEnemy.health}/${currentEnemy.maxHealth}`;
}

function playerAction(actionIndex) {
    if (!playerTurn) {
        logMessage("Det är inte din tur!");
        return;
    }

    const action = PlayerActions[actionIndex];
    if (player.mana < action.cost) {
        logMessage("Inte tillräckligt med mana!");
        return;
    }

    player.mana -= action.cost;

    if (action.damage) {
        const dmg = action.damage();
        currentEnemy.health -= dmg;
        logMessage(`Du gjorde ${dmg} skada på ${currentEnemy.name}!`);
    } else if (action.heal) {
        const heal = action.heal();
        player.health = Math.min(player.health + heal, player.maxHealth);
        logMessage(`Du helade ${heal} HP!`);
    } else if (action.apply) {
        action.apply();
        updateCombatUI();
        return;
    }

    updateCombatUI();

    if (currentEnemy.health <= 0) {
        endCombat(true);
        return;
    }

    playerTurn = false;
    enemyTurn();
}

function enemyTurn() {
    setTimeout(() => {
        if (!currentEnemy) return;

        let damage = currentEnemy.damage;
        if (player.isDodging) {
            damage = Math.floor(damage * 0.5);
            player.isDodging = false;
        }

        player.health -= damage;
        logMessage(`${currentEnemy.name} gjorde ${damage} skada på dig!`);

        if (player.health <= 0) {
            endCombat(false);
            return;
        }

        playerTurn = true;
        updateCombatUI();
    }, 1000);
}

function endCombat(playerWon, fled = false) {
    if (fled) {
        logMessage("Du flydde från striden.");
    } else if (playerWon) {
        logMessage(`Du besegrade ${currentEnemy.name}!`);
    } else {
        logMessage("Du dog!");
    }

    inCombat = false;
    currentEnemy = null;
    playerTurn = true;
    closeCombatUI();
}

function openCombatUI() {
    const container = document.getElementById("combat-ui");
    container.innerHTML = "";

    PlayerActions.forEach((action, i) => {
        const btn = document.createElement("button");
        btn.innerText = action.name;
        btn.onclick = () => playerAction(i);
        container.appendChild(btn);
    });

    document.getElementById("combat-log").innerHTML = "";
    document.getElementById("combat-container").style.display = "block";
    updateCombatUI();
}

function closeCombatUI() {
    document.getElementById("combat-container").style.display = "none";
}
function updatePlayerStats() {
    document.getElementById("stat-health").textContent = `${player.health}/${player.maxHealth}`;
    document.getElementById("stat-mana").textContent = `${player.mana}/${player.maxMana}`;
    document.getElementById("stat-damage").textContent = player.damage;
    document.getElementById("stat-speed").textContent = player.speed;
}


function CombatTrigger(enemy) {
    if (!inCombat &&
        player.x < enemy.x + enemy.w &&
        player.x + player.w > enemy.x &&
        player.y < enemy.y + enemy.h &&
        player.y + player.h > enemy.y) {
        startCombat(enemy);
    }
}
