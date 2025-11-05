// Klassen för spelkaraktären
export class Character {
  constructor(x, y, w, h, speed, maxJumps, imgSrc) {
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
    this.img = new Image(); 
    this.img.src = imgSrc;

    this.lastDirection = "right";
    this.canDash = true;
    this.isDashing = false;
    this.dashTime = null;
    this.jumpPressedLastFrame = false;
  }

  //Ritar gubben beroende på vilken riktning han står mot
  //Bilden blir inverted när man byter riktning till vänster
  draw(ctx) {
    if (this.img.complete) {
      ctx.save();
      if (this.lastDirection === "left") {
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
      } else {
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
      }
      ctx.restore();
    } else {
      this.img.onload = () => this.draw(ctx);
    }
  }

  // Movement funktioner
  update(obstacles, groundY, keys) {
    let dx = 0;
    //Rörelse höger vänster
    if (!this.isDashing) {
      if (keys["a"] || keys["ArrowLeft"]) { dx -= this.speed; this.lastDirection = "left"; }
      if (keys["d"] || keys["ArrowRight"]) { dx += this.speed; this.lastDirection = "right"; }

    // Funktion för hopp och vilka keys som gör det, definerar även hur högt hoppet är.
      if (keys[" "] && !this.jumpPressedLastFrame || (keys["w"] && !this.jumpPressedLastFrame || (keys["ArrowUp"] && !this.jumpPressedLastFrame))) {
        if (this.jumps > 0) { this.velY = -35; this.jumps--; this.onGround = false; }
      }

      if ((keys["Shift"] || keys["ShiftLeft"] || keys["ShiftRight"]) && this.canDash) {
        // Nollställ de shiftknappar du använder så du inte dashar konstant
        keys["Shift"] = false;
        keys["ShiftLeft"] = false;
        keys["ShiftRight"] = false;

        this.isDashing = true;
        this.canDash = false;
        this.dashTime = 200;
}   
    //Uppdaterar spelarens position och löser cooldown så man inte kan abusea
    } else {
      const dashSpeed = this.speed * 4;
      dx += (this.lastDirection === "left") ? -dashSpeed : dashSpeed;
      this.dashTime -= 16;
      if (this.dashTime <= 0) {
        this.isDashing = false;
        setTimeout(() => { this.canDash = true; }, 750);
      }
    }

    //Registrerar hopptryck från förra framen
    this.jumpPressedLastFrame = keys[" "] || keys["w"] || keys["ArrowUp"] ;

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

//Sätter defaultvärden för hinder
export class obstacle {
  constructor(x, y, w, h, color = "green") {
    this.x = x; this.y = y; this.w = w; this.h = h; this.color = color;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

// exempel Enemy
export class Goat {
  constructor(x,y,w,h,imgSrc)
  { this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
    this.img=new Image();
    this.img.src=imgSrc; }
}