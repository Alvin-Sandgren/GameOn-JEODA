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

    update(obstacles, groundY) {
        // 1) Beräkna horisontell rörelse / dash / uppdatera riktning
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
            if ((keys["w"] || keys[" "]) && !this.jumpPressedLastFrame) {
                if (this.jumps > 0) {
                    this.velY = -35;
                    this.jumps--;
                    this.onGround = false;
                }
            }
            // Starta dash
            if (keys["q"] && this.canDash) {
                keys["q"] = false;
                this.isDashing = true;
                this.canDash = false;
                this.dashTime = 200;
            }
        } else {
            const dashSpeed = this.speed * 4;
            dx += (this.lastDirection === "left") ? -dashSpeed : dashSpeed;
            this.dashTime -= 16;
            if (this.dashTime <= 0) {
                this.isDashing = false;
                setTimeout(() => { this.canDash = true; }, 5000);
            }
        }

        // Uppdatera jumpPressedLastFrame (bör efter att vi kollat hopp)
        this.jumpPressedLastFrame = keys["w"] || keys[" "];

        // 2) Horisontell rörelse + kollisionskorrigering
        let newX = this.x + dx;
        if (dx !== 0) {
            for (let obs of obstacles) {
                // kolla om spelaren vertikalt överlappar obstacle (lite padding för stabilitet)
                if (this.y + this.h > obs.y + 1 && this.y < obs.y + obs.h - 1) {
                    // rör sig åt höger och skulle penetrera obstacle från vänster
                    if (dx > 0 && this.x + this.w <= obs.x && newX + this.w > obs.x) {
                        newX = obs.x - this.w;
                    }
                    // rör sig åt vänster och skulle penetrera obstacle från höger
                    else if (dx < 0 && this.x >= obs.x + obs.w && newX < obs.x + obs.w) {
                        newX = obs.x + obs.w;
                    }
                }
            }
        }
        this.x = newX;

        // 3) Gravitation (uppdatera vertikal hastighet) och vertikal kollisionshantering
        // Tillämpa gravitation om inte onGround (vi låter onGround kunna återställas nedan)
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

        // Markkollision (sista fallback)
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



class obstacle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

    }
    
    draw() {
        ctx.fillStyle = "darkgreen"; // mörkgrön färg
        ctx.fillRect(this.x, this.y, this.w, this.h); // Rita rektangeln
    }
    
}

const obstacle1 = new obstacle(800, 600, 100, 225);
const obstacle2 = new obstacle(0, 500, 150, 325);

const player = new Character(700, 600, 100, 100, 10, 2, "meatball.png");


const enemyGoat = new goat();
enemyGoat.w = 80;
enemyGoat.h = 80;
enemyGoat.x = 1200;
enemyGoat.y = 0

function drawBackground() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGround() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
}


const obstacles = [new obstacle(800, 600, 100, 225),
                   new obstacle(50, 500, 150, 325)
                  ]; // lägg till fler i arrayen vid behov

function gameLoop() {
    drawBackground();
    drawGround();

    player.update(obstacles, canvas.height - 95); // OBS: skicka obstacles-array
    player.draw();

    for (let obs of obstacles) {
        obs.draw();
    }

    // Rita get enemy
    ctx.drawImage(enemyGoat.img, enemyGoat.x, enemyGoat.y, enemyGoat.w, enemyGoat.h);

    requestAnimationFrame(gameLoop);
}

gameLoop();
