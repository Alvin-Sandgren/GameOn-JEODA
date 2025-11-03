const canvas = document.getElementById('karta');
const ctx = canvas.getContext('2d');

canvas.width = 1910;
canvas.height = 920;

const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

class Character {
    constructor(x, y, w, h, speed, maxJumps, imgSrc) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = speed;
        this.maxJumps = maxJumps; // max antal hopp
        this.jumps = maxJumps;    // nuvarande hopp kvar
        this.velY = 0;
        this.gravity = 2;
        this.onGround = false;
        this.img = new Image();
        this.img.src = imgSrc;

        // Dash
        this.lastDirection = "right";
        this.canDash = true;
        this.isDashing = false;
        this.dashTime = 0;

        this.jumpPressedLastFrame = false;
    }

    draw() {
        if (this.img.complete) {
            ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        } else {
            this.img.onload = () => ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        }
    }

    update(groundY) {
        // --- Dash ---
        if (!this.isDashing) {
            // Rörelse
            if (keys["a"] || keys["ArrowLeft"]) {
                this.x -= this.speed;
                this.lastDirection = "left";
            }
            if (keys["d"] || keys["ArrowRight"]) {
                this.x += this.speed;
                this.lastDirection = "right";
            }

            // Hoppa endast vid nytt knapptryck
            if ((keys["w"] || keys[" "]) && !this.jumpPressedLastFrame) {
                if (this.jumps > 0) {
                    this.velY = -35; // hoppkraft
                    this.jumps--;
                    this.onGround = false;
                }
            }
            // Uppdatera senaste frame
            this.jumpPressedLastFrame = keys["w"] || keys[" "];

            // Starta dash
            if (keys["q"] && this.canDash) {
                keys["q"] = false;
                this.isDashing = true;
                this.canDash = false;
                this.dashTime = 200;
            }

        } else { // Dashar
            const dashSpeed = this.speed * 3;
            if (this.lastDirection === "left") this.x -= dashSpeed;
            if (this.lastDirection === "right") this.x += dashSpeed;

            this.dashTime -= 16;

            if (this.dashTime <= 0) {
                this.isDashing = false;
                setTimeout(() => { this.canDash = true; }, 1000);
            }
        }

        // --- Gravitation ---
        if (!this.onGround) {
            this.velY += this.gravity;
            this.y += this.velY;
        }

        // --- Markkollision ---
        if (this.y + this.h >= groundY) {
            this.y = groundY - this.h;
            this.velY = 0;
            this.onGround = true;
            this.jumps = this.maxJumps; // återställ hopp när man landar
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
