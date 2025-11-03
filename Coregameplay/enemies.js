class enemies {
    constructor(name, health, damage, speed) {
        this.name = name;
        this.health = health;
        this.damage = damage;
        this.speed = speed;
    }
}

class goat extends enemies {
    constructor() {
        super("Goat", 50, 10, 5);
    }
}
