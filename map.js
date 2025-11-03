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

        ctx.restore(); // Återställ canvas till ursprungsinställningar
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
                setTimeout(() => { this.canDash = true; }, 2000);
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

// Klass för hinder
class obstacle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

    }
    
    //Rita hindret
    draw() {
        ctx.fillStyle = "darkgreen"; 
        ctx.fillRect(this.x, this.y, this.w, this.h);
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
                   new obstacle(50, 500, 150, 325),
                   new obstacle(1200, 200, 200, 400)
                  ];

// Olika skärmars uppdateringsfrekvenser hanteras här, annars blir spelet för snabbt eller långsamt beroende på skärm
let lastFrameTime = 0;
const targetFPS = 60;
const frameDuration = 1000 / targetFPS; // Target fps är 60

function gameLoop(timestamp) {
    const elapsed = timestamp - lastFrameTime;

    if (elapsed >= frameDuration) {
        lastFrameTime = timestamp - (elapsed % frameDuration); // för att hålla timing jämn

        drawBackground();
        drawGround();

        player.update(obstacles, canvas.height - 95);
        player.draw();

        for (let obs of obstacles) {
            obs.draw();
        }

        ctx.drawImage(enemyGoat.img, enemyGoat.x, enemyGoat.y, enemyGoat.w, enemyGoat.h);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();