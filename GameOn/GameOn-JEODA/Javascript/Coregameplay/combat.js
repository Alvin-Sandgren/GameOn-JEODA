let inCombat = false;
let currentEnemy = null;
let playerTurn = true;

export { startCombat, endCombat, playerAction };

const PlayerActions = [
    {
        name: "Attack",
        damage: () => player.damage,
        cost: 5
    },
    {
        // Nästa skada minskas med 50%
        name: "Dodge",
        cost: 10,
        apply: () => {
            player.isDodging = true;
            console.log("Du förbereder en dodge! Nästa skada minskas med 50%");
        }
    },
    {
        name: "Heal",
        heal: () => 20,
        cost: 15
    }
];

// Starta strid mot fiende
function startCombat(enemy) {
    inCombat = true;
    currentEnemy = enemy;
    playerTurn = true;
    updateCombatUI();
    openCombatUI();
}

// Uppdatera combat UI 
function updateCombatUI() {
    console.log(`Spelare HP: ${player.health}/${player.maxHealth} | Mana: ${player.mana}/${player.maxMana}`);
    console.log(`${currentEnemy.name} HP: ${currentEnemy.health}`);
}

// Hantera spelarens val
function playerAction(actionIndex) {
    if (!playerTurn) {
        console.log("Det är inte din tur!");
        return;
    }

    const action = PlayerActions[actionIndex];

    if (player.mana < action.cost) {
        console.log("Inte tillräckligt med mana!");
        return;
    }

    player.mana -= action.cost;

    if (action.damage) {
        currentEnemy.health -= action.damage();
        console.log(`Du gjorde ${action.damage()} skada på ${currentEnemy.name}`);
    } else if (action.heal) {
        player.health += action.heal();
        if (player.health > player.maxHealth) player.health = player.maxHealth;
        console.log(`Du helade ${action.heal()} HP`);
    } else if (action.apply) {
        action.apply();
    }

    if (currentEnemy.health <= 0) {
        endCombat(true);
        return;
    }

    playerTurn = false;
    enemyTurn();
}

// Fiendens tur
function enemyTurn() {
    setTimeout(() => {
        let damage = currentEnemy.damage;

        if (player.isDodging) {
            damage = Math.floor(damage * 0.5);
            player.isDodging = false;
        }

        player.health -= damage;
        console.log(`${currentEnemy.name} gjorde ${damage} skada!`);

        if (player.health <= 0) {
            endCombat(false);
            return;
        }

        playerTurn = true;
        updateCombatUI();
    }, 1000);
}

// Avsluta strid
function endCombat(playerWon) {
    if (playerWon) {
        console.log(`Du besegrade ${currentEnemy.name}!`);
    } else {
        console.log("Du blev besegrad!");
    }

    inCombat = false;
    currentEnemy = null;

    closeCombatUI();
}

// Öppna UI 
function openCombatUI() {
    const container = document.getElementById("combat-ui");
    container.innerHTML = ""; // rensa gamla knappar

    PlayerActions.forEach((action, i) => {
        const btn = document.createElement("button");
        btn.innerText = action.name;
        btn.onclick = () => playerAction(i);
        container.appendChild(btn);
    });
}

// Stäng UI 
function closeCombatUI() { 
    const container = document.getElementById("combat-ui");
    container.innerHTML = "";
}


