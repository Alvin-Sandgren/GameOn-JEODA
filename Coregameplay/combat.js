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

//Bergsget enemy 
Enemy_Goat = function(name, health, damage, speed) {
    this.name = Bergsget;
    this.health = 50;
    this.damage = 10;
    this.speed = 5;
}
//unlockables abilities och nya rörelser

// keyboard input for combat actions