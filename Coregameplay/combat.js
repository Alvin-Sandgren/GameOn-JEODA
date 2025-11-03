//heal function
Heal = function(target, heal_amount) {
    target.health += heal_amount;
}

//attack function
attack = function(target, damage) {
    target.health -= damage;
}

//block function
block = function(character, target) {
    let blocked_damage = target.damage * 0.5;
    defender.health -= reduced_damage;
}

//unlockables abilities och nya rörelser