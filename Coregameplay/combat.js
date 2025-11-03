// heal function (drick mjöd)
// välj ett target och öka dess health med heal_amount värdet
window.heal = function(target, heal_amount) {
    if (!target) return;
    target.health = (target.health || 0) + heal_amount;
    if (target.maxHealth) target.health = Math.min(target.health, target.maxHealth);
}

// attack function
//välj en target och minska dess health med damage värdet
window.attack = function(target, damage) {
    if (!target) return;
    target.health = (target.health || 0) - (damage || 0);
}

// block function
// reducerar skada med 50% 
window.block = function(defender, attacker) {
    if (!defender || !attacker) return;
    let blocked_damage = (attacker.damage || 0) * 0.5;
    defender.health = (defender.health || 0) - blocked_damage;
}

//unlockables abilities och nya rörelser