const canvas = document.getElementById('karta');
const ctx = canvas.getContext('2d');

canvas.width = 1910;
canvas.height = 920;

const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

class Character {
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

        // Dash-egenskaper
        this.lastDirection = "right";
        this.canDash = true;
        this.isDashing = false;
        this.dashTime = 0;
    }

    draw() {
        if (this.img.complete) {
            ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        } else {
            this.img.onload = () => ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        }
    }

    update(groundY) {
        // === Om inte dashar, vanlig rörelse ===
        if (!this.isDashing) {
            // Vänster/höger rörelse
            if (keys["a"] || keys["ArrowLeft"]) {
                this.x -= this.speed;
                this.lastDirection = "left";
            }
            if (keys["d"] || keys["ArrowRight"]) {
                this.x += this.speed;
                this.lastDirection = "right";
            }

            // Hoppa
            if ((keys["w"] || keys[" "]) && this.onGround) {
                this.velY = -40;
                this.onGround = false;
            }

            // Starta dash
            if (keys["f"] && this.canDash) {
                keys["f"] = false;
                this.isDashing = true;
                this.canDash = false;
                this.dashTime = 200; // dash varar i 200ms
            }
        } 
        // === Om dashar, glid snabbt fram ===
        else {
            const dashSpeed = this.speed * 6;

            if (this.lastDirection === "left") this.x -= dashSpeed;
            if (this.lastDirection === "right") this.x += dashSpeed;

            this.dashTime -= 16; // ungefär 60 FPS

            if (this.dashTime <= 0) {
                this.isDashing = false;

                // Cooldown innan nästa dash
                setTimeout(() => {
                    this.canDash = true;
                }, 1000);
            }
        }

        // === Gravitation och markkollision ===
        if (!this.onGround) {
            this.velY += this.gravity;
            this.y += this.velY;
        }

        if (this.y + this.h >= groundY) {
            this.y = groundY - this.h;
            this.velY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }
    }
}

const player = new Character(100, 600, 100, 100, 10, 2, "meatball.png");

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

    requestAnimationFrame(gameLoop);
}

gameLoop();
