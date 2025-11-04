const canvas = document.getElementById('karta');
const ctx = canvas.getContext('2d');

canvas.width = 1910;
canvas.height = 920;

// Större värld
const worldWidth = canvas.width * 6;
const worldHeight = canvas.height * 5;

// Kamerans position
let cameraX = 0;
let cameraY = 0;


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

// Klass för hinder
class obstacle {
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
    }
    
    //Rita hindret
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    
}

const player = new Character(5500, 1500, 100, 100, 10, 2, "meatball.png");

const enemyGoat = new goat();
enemyGoat.w = 80;
enemyGoat.h = 80;
enemyGoat.x = 1200;
enemyGoat.y = 0

function drawBackground() {
    ctx.fillStyle = "#000"; // svart himmel
    ctx.fillRect(0, 0, worldWidth, worldHeight);
}

function drawGround() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, worldHeight - 100, worldWidth, 100);
}


const obstacles = [
    // platforms spawn
    new obstacle(700, 4300, 300, 50),
    new obstacle(1200, 4200, 200, 50),
    new obstacle(1600, 4000, 40, 50),
    new obstacle(1800, 4025, 800, 475),



    //Dropper shute
    new obstacle(1800, 3000, 100, 900),

    //Vänster sida plus tak på droppern och gången till dash/get nr 2
    new obstacle(1300, 3000, 500, 100, "green"),
    
    new obstacle(400, 2500, 4000, 100, "gray"),

    //Cave entrance 1.Tak 2.Väggar 3. Temporär barrier
    new obstacle(4000, 0, 2600, 1900, "gray"),
    new obstacle(4300, 2500, 100, 200, "gray"),
    new obstacle(4300, 2700, 2300, 200, "gray"),
    new obstacle(6100, 1901, 20, 798, "red"),
    new obstacle(6500, 1800, 100, 1000, "gray"),

    new obstacle(6200, 2600, 275, 100, "gray"),
    new obstacle(6250, 2550, 177, 100, "gray"),



    // Vägen till nivå 5
    new obstacle(3000, 2000, 200, 50, "green"),

    //Nivå 5 plattformar
    new obstacle(3500, 1700, 500, 200, "green"),
    new obstacle(0, 1400, 2600, 200, "green"),


    //Obstacles mot nivå 3
    new obstacle(950, 3000, 45, 30, "green"),

    new obstacle(500, 3000, 39, 30),
    new obstacle(300, 2750, 30, 30),

    // Höger sida
    new obstacle(2500, 2600, 100, 1275,),

    new obstacle(2000, 3600, 100, 50),
    new obstacle(2200, 3800, 50, 50),
    new obstacle(2000, 3400, 75, 50),
    new obstacle(2200, 3200, 100, 50),


    


    //Platforms efter droppern
    new obstacle(3000, 4400, 150, 100),
    new obstacle(2800, 4250, 150, 250),


    //Lavablock när man inte har dash
    new obstacle(3450, 4490, 50, 10, "gray"),
    new obstacle(3500, 4500, 600, 600, "red"),

    //Platforms som leder till nivå 4
    new obstacle(5000, 4300, 75, 25, "gray"),
    new obstacle(5500, 4200, 75, 50),
    new obstacle(5000, 4000, 75, 75, "gray"),

    //Till nivå 4 trappor tillbaka
    new obstacle(5700, 3800, 100, 1000, "gray"),
    new obstacle(5800, 4000, 150, 700, "gray"),
    new obstacle(5950, 4200, 150, 700, "gray"),
    new obstacle(6100, 4400, 150, 700, "gray"),

    //Nivå 4 boss arena plus double jump

    new obstacle(7955, 3850, 100, 50, "gray"),
    new obstacle(7990, 3900, 30, 600, "orange"),
    new obstacle(8000, 3900, 10, 600, "yellow"),
    new obstacle(8015, 3900, 5, 600, "red"),
    new obstacle(7990, 3900, 5, 600, "red"),
    new obstacle(7955, 4495, 100, 50, "gray"),


    new obstacle(8500, 4400, 150, 100, "gray"),
    new obstacle(8600, 4350, 100, 100, "gray"),
    new obstacle(8650, 4400, 150, 100, "gray"),

    //Väggar på sidorna
    new obstacle(worldWidth - 30, 0, 30, 10000, "green"),
    new obstacle(0, 0, 30, 10000, "green")
];


function updateCamera() {
    // Håll kameran centrerad på spelaren
    cameraX = player.x + player.w / 2 - canvas.width / 2;
    cameraY = player.y + player.h / 2 - canvas.height / 2;

    // Förhindra att kameran går utanför världen
    cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));
    cameraY = Math.max(0, Math.min(cameraY, worldHeight - canvas.height));
}


// Olika skärmars uppdateringsfrekvenser hanteras här, annars blir spelet för snabbt eller långsamt beroende på skärm
let lastFrameTime = 0;
const targetFPS = 60;
const frameDuration = 1000 / targetFPS; // Target fps är 60

function gameLoop(timestamp) {
    const elapsed = timestamp - lastFrameTime;

    if (elapsed >= frameDuration) {
        lastFrameTime = timestamp - (elapsed % frameDuration);

        updateCamera();

        ctx.save();
        ctx.translate(-cameraX, -cameraY); // Flytta allt med kameran

        drawBackground();
        drawGround();

        for (let obs of obstacles) obs.draw();
        player.update(obstacles, worldHeight - 95);
        player.draw();

        ctx.drawImage(enemyGoat.img, enemyGoat.x, enemyGoat.y, enemyGoat.w, enemyGoat.h);

        ctx.restore();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();