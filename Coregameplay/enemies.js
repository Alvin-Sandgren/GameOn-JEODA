class enemies {
    constructor(name, health, damage, speed, x , y, w, h) {
        this.name = name;
        this.health = health;
        this.damage = damage;
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

    }
}

class goat extends enemies {
    constructor() {
        super("Goat", 50, 10, 5,);
        this.img = new Image();
        this.img.src = "goat.png";
    }
}
