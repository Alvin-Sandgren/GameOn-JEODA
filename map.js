const canvas = document.getElementById('karta');
const ctx = canvas.getContext('2d');

canvas.width = 1910;
canvas.height = 920;

const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

class Characther {
    constructor(x, y, w, h, speed, jumps, imgSrc) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = speed;
        this.jumps = jumps;
        this.velY = 0;
        this.gravity = 3;
        this.onGround = false;
        this.img = new Image();
        this.img.src = imgSrc;
    }

    draw() {
        if (this.img.complete) {
            ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        } else {
            this.img.onload = () => ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        }
    }

    update(groundY) {
        // Rörelse i sidled
        if (keys["a"] || keys["ArrowLeft"]) this.x -= this.speed;
        if (keys["d"] || keys["ArrowRight"]) this.x += this.speed;

        // Gravitation
        if (!this.onGround) {
            this.velY += this.gravity;
            this.y += this.velY;
        }

        // Kollision med marken
        if (this.y + this.h >= groundY) {
            this.y = groundY - this.h;
            this.velY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }

        // Hoppa
        if ((keys["w"] || keys[" "]) && this.onGround) {
            this.velY = -40;
            this.onGround = false;
        }
    }
}

const player = new Characther(100, 600, 100, 100, 10, 2, "meatball.png");

const enemyGoat = new goat();
enemyGoat.w = 80;
enemyGoat.h = 80;
enemyGoat.x = 600;
enemyGoat.y = 740

function drawBackground() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGround() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
}

function gameLoop() {
    drawBackground();
    drawGround();

    player.update(canvas.height - 75);
    player.draw();

    // Rita get enemy
    ctx.drawImage(enemyGoat.img, enemyGoat.x, enemyGoat.y, enemyGoat.w, enemyGoat.h);
    
  
    requestAnimationFrame(gameLoop);
}

gameLoop();
