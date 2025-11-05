class enemies {
    constructor(name , health, damage, speed , x , y, w , h) {
        this.name = name;
        this.health = health;
        this.damage = damage;
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.maxHealth = health;
    }
}
// Basic bergsget enemy
class goat extends enemies {
    constructor(x = 0, y = 0, w = 80, h = 80) {
        super("Get", 50, 5, 5, x, y, w, h);
        this.img = new Image();
        this.img.src = "goat.png"; 
    }
}

