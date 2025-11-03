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