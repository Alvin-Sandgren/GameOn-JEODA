// Klassen för spelkaraktären
export class Character {
constructor(x, y, w, h, speed, maxJumps, imgIdleSrc, imgLeftLegSrc, imgRightLegSrc) {
    this.x = x; 
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.mana = 100; this.maxMana = 100;
    this.health = 100; this.maxHealth = 100;
    this.damage = 10;
    this.maxJumps = maxJumps;
    this.jumps = maxJumps;
    this.velY = 0;
    this.gravity = 2;
    this.onGround = false;

    // Animation frames
    this.imgIdle = new Image();
    this.imgIdle.src = imgIdleSrc;

    this.imgLeftLeg = new Image();
    this.imgLeftLeg.src = imgLeftLegSrc;

    this.imgRightLeg = new Image();
    this.imgRightLeg.src = imgRightLegSrc;

    this.currentFrame = 0;       // index för animation
    this.frameCounter = 0;       // för att styra hastighet
    this.frameSpeed = 10;        // antal uppdateringar per frame

    this.lastDirection = "right";
    this.canDash = true;
    this.isDashing = false;
    this.dashTime = null;
    this.jumpPressedLastFrame = false;
}


draw(ctx, isMoving) {
    if (this.imgIdle.complete && this.imgLeftLeg.complete && this.imgRightLeg.complete) {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        if (this.lastDirection === "left") ctx.scale(-1, 1);

        // Välj bild
        let imgToDraw;
        if (!isMoving) {
            imgToDraw = this.imgIdle;
        } else {
            if (this.currentFrame === 0) imgToDraw = this.imgIdle;
            else if (this.currentFrame === 1) imgToDraw = this.imgLeftLeg;
            else imgToDraw = this.imgRightLeg;
        }

        ctx.drawImage(imgToDraw, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    } else {
        // Om någon bild inte är laddad än
        this.imgIdle.onload = () => this.draw(ctx, isMoving);
    }
}


  // Movement funktioner
  update(obstacles, groundY, keys) {

    let dx = 0;
    let isMoving = false;

    if (!this.isDashing) {
        if (keys["a"] || keys["ArrowLeft"]) { dx -= this.speed; this.lastDirection = "left"; isMoving = true; }
        if (keys["d"] || keys["ArrowRight"]) { dx += this.speed; this.lastDirection = "right"; isMoving = true; }

        if ((keys[" "] && !this.jumpPressedLastFrame) || (keys["w"] && !this.jumpPressedLastFrame) || (keys["ArrowUp"] && !this.jumpPressedLastFrame)) {
            if (this.jumps > 0) { this.velY = -35; this.jumps--; this.onGround = false; }
        }

        if ((keys["Shift"] || keys["ShiftLeft"] || keys["ShiftRight"]) && this.canDash) {
            keys["Shift"] = keys["ShiftLeft"] = keys["ShiftRight"] = false;
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
            setTimeout(() => { this.canDash = true; }, 750);
        }
    }

    // Frame-animation
    if (isMoving) {
        this.frameCounter++;
        if (this.frameCounter >= this.frameSpeed) {
            this.frameCounter = 0;
            this.currentFrame = (this.currentFrame + 1) % 3; // 3 frames: idle, left leg, right leg
        }
    } else {
        this.currentFrame = 0; // idle
        this.frameCounter = 0;
    }

    this.jumpPressedLastFrame = keys[" "] || keys["w"] || keys["ArrowUp"];

    // Horisontell kollisionshantering = förhindrar att spelaren går igenom hinder från vänster eller höger
    let newX = this.x + dx;
    if (dx !== 0) {
      for (let obs of obstacles) {
        if (this.y + this.h > obs.y + 1 && this.y < obs.y + obs.h - 1) {
          const rightEdge = this.x + this.w;
          const newRightEdge = newX + this.w;
          if (dx > 0 && rightEdge <= obs.x && newRightEdge > obs.x) newX = obs.x - this.w;
          else if (dx < 0 && this.x >= obs.x + obs.w && newX < obs.x + obs.w) newX = obs.x + obs.w;
        }
      }
    }
    //Sätter ny x position för gubben
    this.x = newX;

    //tillför gravitation när man är i luften/inte på marken
    if (!this.onGround) this.velY += this.gravity;
    let newY = this.y + this.velY;
    let standingOnSomething = false;

    // Vertikal kollisionshantering = förhindrar att spelaren åker igenom objekten ovanifrån eller att man hoppar igenom de underifrån
    for (let obs of obstacles) {
      if (this.x + this.w > obs.x + 1 && this.x < obs.x + obs.w - 1) {
        const prevBottom = this.y + this.h;
        const nextBottom = newY + this.h;
        if (prevBottom <= obs.y && nextBottom >= obs.y) {
          newY = obs.y - this.h; this.velY = 0; standingOnSomething = true;
        } else {
          const prevTop = this.y, nextTop = newY;
          if (prevTop >= obs.y + obs.h && nextTop <= obs.y + obs.h) {
            newY = obs.y + obs.h; this.velY = 0;
          }
        }
      }
    }

    // Kolla om spelaren når marken
    if (newY + this.h >= groundY) {
        newY = groundY - this.h; // placera spelaren precis ovanpå marken
        this.velY = 0;            // stoppar fallet
        standingOnSomething = true; // visar att spelaren står på något
    }

    // Uppdatera spelarens position
    this.y = newY;

    // Visa onGround när spelaren står på något
    this.onGround = standingOnSomething;

    // Återställ hopp när spelaren står på marken
    if (this.onGround) 
        this.jumps = this.maxJumps;
  }
}

export class Obstacle {
  constructor(x, y, w, h, imageOrColor = null) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.imageLoaded = false;

    if (imageOrColor && imageOrColor.endsWith(".png")) {
      this.image = new Image();
      this.image.src = imageOrColor;
      this.color = null;

      this.image.onload = () => {
        this.imageLoaded = true;
      };
      this.image.onerror = () => {
        // fallback till grön om bilden inte hittas
        this.image = null;
        this.color = "green";
      };
    } else {
      this.image = null;
      this.color = imageOrColor || "green"; // fallbackgrön om inget skickas
    }
  }

  draw(ctx) {
    if (this.image && this.imageLoaded) {
      ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    } else {
      ctx.fillStyle = this.color || "green";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
}



export class Goat {
    constructor(x, y, w, h, imageSrc) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.health = 100;      // exempel
        this.damage = 10;       // exempel
        this.name = imageSrc.split("/").pop().split(".")[0]; // t.ex. "Stenget"

        // **Skapa HTMLImageElement**
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    }
}
