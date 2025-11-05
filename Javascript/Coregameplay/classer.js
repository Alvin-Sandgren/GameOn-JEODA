class Characther {
        constructor(x, y, w, h, speed, maxJumps, imgSrc) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = speed;
        this.mana = 100;
        this.maxMana = 100;
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 10;
        this.maxJumps = maxJumps;
        this.jumps = maxJumps;
        this.velY = 0;
        this.gravity = 2;
        this.onGround = false;
        this.img = new Image();
        this.img.src = imgSrc;

        // Dash
        this.lastDirection = "right";
        this.canDash = true;
        this.isDashing = false;
        this.dashTime = null;

        this.jumpPressedLastFrame = false;
    }

    draw() {
    if (this.img.complete) {
        ctx.save(); // Spara nuvarande canvas-inställningar

        if (this.lastDirection === "left") {
            // Spegla bilden horisontellt
            ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
            ctx.scale(-1, 1); // invertera horisontellt
            ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
        } else {
            ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        }

        ctx.restore(); // Återställ canvas till normalt läge
    } else {
        this.img.onload = () => this.draw();
    }
}

    update(obstacles, groundY) {

        
        // Beräkna hopp / dash / uppdaterar riktning
        let dx = 0;
        if (!this.isDashing) {
            if (keys["a"] || keys["ArrowLeft"]) {
                dx -= this.speed;
                this.lastDirection = "left";
            }
            if (keys["d"] || keys["ArrowRight"]) {
                dx += this.speed;
                this.lastDirection = "right";
            }

            // Hoppa endast vid nytt knapptryck
            if ((keys[" "]) && !this.jumpPressedLastFrame) {
                if (this.jumps > 0) {
                    this.velY = -35;
                    this.jumps--;
                    this.onGround = false;
                }
            }
            // Starta dash
            if (keys["q"] && this.canDash) {
                keys["q"] = false; //förhindra dashspam
                this.isDashing = true;
                this.canDash = false; 
                this.dashTime = 200; // dash varar i 200 millisekunder
            }
        } else {
            const dashSpeed = this.speed * 4;
            dx += (this.lastDirection === "left") ? -dashSpeed : dashSpeed;
            this.dashTime -= 16;
            if (this.dashTime <= 0) {
                this.isDashing = false;
                setTimeout(() => { this.canDash = true; }, 750);
            }
        }

        // Uppdatera jumpPressedLastFrame för att kolla om hoppknappen är nytryckt
        this.jumpPressedLastFrame = keys[" "];

        // Hopp + kollisionskorrigering
        let newX = this.x + dx;

        if (dx !== 0) {
            for (let obs of obstacles) {
                // Kolla vertikal kollision
                if (this.y + this.h > obs.y + 1 && this.y < obs.y + obs.h - 1) {
                    // Kolla horisontell kollision
                    const rightEdge = this.x + this.w;
                    const newRightEdge = newX + this.w;

                    if (dx > 0 && rightEdge <= obs.x && newRightEdge > obs.x) {
                        // Kolliderar från vänster
                        newX = obs.x - this.w;
                    } else if (dx < 0 && this.x >= obs.x + obs.w && newX < obs.x + obs.w) {
                        // Kolliderar från höger
                        newX = obs.x + obs.w;
                    }
                }
            }
        }

        this.x = newX;

        // Gravitation (uppdatera vertikal hastighet) och vertikal kollisionshantering
        // Gravitation är bara om inte onGround är true (alltså i luften)
        if (!this.onGround) {
            this.velY += this.gravity;
        }

        let newY = this.y + this.velY;
        let standingOnSomething = false;

        for (let obs of obstacles) {
            // kolla horisontell overlap (spelaren efter horisontell korrigering)
            if (this.x + this.w > obs.x + 1 && this.x < obs.x + obs.w - 1) {
                const prevBottom = this.y + this.h;
                const nextBottom = newY + this.h;
                // Landar på toppen: tidigare under botten, nu passerar ner till/toppen
                if (prevBottom <= obs.y && nextBottom >= obs.y) {
                    newY = obs.y - this.h;
                    this.velY = 0;
                    standingOnSomething = true;
                } else {
                    // Slår huvudet i underkant
                    const prevTop = this.y;
                    const nextTop = newY;
                    if (prevTop >= obs.y + obs.h && nextTop <= obs.y + obs.h) {
                        newY = obs.y + obs.h;
                        this.velY = 0;
                    }
                }
            }
        }

        // Markkollision (marken är vid groundY)
        if (newY + this.h >= groundY) {
            newY = groundY - this.h;
            this.velY = 0;
            standingOnSomething = true;
        }

        this.y = newY;
        this.onGround = standingOnSomething;

        // Återställ hopp när man landar
        if (this.onGround) this.jumps = this.maxJumps;
    }
}