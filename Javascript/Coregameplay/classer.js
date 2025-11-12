import { Soundmanager } from "./ljud.js";
export const soundmanager = new Soundmanager();

export class Character {
  constructor(
    x, y, w, h, speed, maxJumps,
    imgIdleSrc, imgLeftLegSrc, imgRightLegSrc,
    imgDashSrcs = [], imgJumpSrc = null
  ) {
    // Position och storlek
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.speed = speed;
    this.hasShirt = false; this.hasBoots = false;

    // Hälsa och skada
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.damage = 20;
    this.name = imgIdleSrc.split("/").pop().split(".")[0]; // ✅ fixat


    // Hopprelaterade variabler
    this.maxJumps = maxJumps; 
    this.jumps = maxJumps;
    this.velY = 0; 
    this.gravity = 2; 
    this.onGround = false;

    // Animationer
    this.imgIdle = this._load(imgIdleSrc);
    this.imgLeftLeg = this._load(imgLeftLegSrc);
    this.imgRightLeg = this._load(imgRightLegSrc);
    this.imgDashFrames = imgDashSrcs.map(src => this._load(src));
    this.imgJump = imgJumpSrc ? this._load(imgJumpSrc) : null;

    // Frame-hantering för animationer
    this.currentFrame = 0; this.frameCounter = 0; this.frameSpeed = 10;
    this.dashFrameIndex = 0; this.dashFrameCounter = 0; this.dashFrameSpeed = 5;
    this.dashTime = 0; this.dashDuration = 200;

    // State
    this.lastDirection = "right"; // Vilket håll spelaren senast gick
    this.canDash = true; this.isDashing = false;
    this.jumpPressedLastFrame = false; // För att undvika dubbelhopp när man håller ned hopp
  }

  // Skapar och returnerar en ny Imagge
  _load(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  // Kollar om alla bilder i en array är färdigladdade
  allImagesComplete(images) {
    if (!images) return true;
    return Array.isArray(images) ? images.every(i => i?.complete) : images.complete;
  }

  // Rita spelaren på canvas
  draw(ctx, isMoving = false) {
    let img = this.imgIdle;

    // Välj rätt bild beroende på dash, hopp eller gång
    if (this.isDashing && this.imgDashFrames.length && this.allImagesComplete(this.imgDashFrames)) {
      img = this.imgDashFrames[this.dashFrameIndex];
    } else if (!this.onGround && this.imgJump?.complete) {
      img = this.imgJump;
    } else if (isMoving && this.imgIdle.complete && this.imgLeftLeg.complete && this.imgRightLeg.complete) {
      img = [this.imgIdle, this.imgLeftLeg, this.imgRightLeg][this.currentFrame];
    }

    // Rita bilden på rätt plats och spegla om spelaren går vänster
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    if (this.lastDirection === "left") ctx.scale(-1, 1);

    if (img?.complete) ctx.drawImage(img, -this.w / 2, -this.h / 2, this.w, this.h);
    else { ctx.fillStyle = "magenta"; ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h); }

    ctx.restore();
  }

  // Uppdatera spelarens position, animation och fysik
  update(obstacles, groundY, keys) {
      let dx = 0;
      let isMoving = false;

      // Rörelse via tangenter, bara om vi inte dashar
      if (!this.isDashing) {
          if (keys["a"] || keys["ArrowLeft"]) { dx -= this.speed; this.lastDirection = "left"; isMoving = true; }
          if (keys["d"] || keys["ArrowRight"]) { dx += this.speed; this.lastDirection = "right"; isMoving = true; }

          // Hopphantering
          if ((keys[" "] || keys["w"] || keys["ArrowUp"]) && !this.jumpPressedLastFrame && this.jumps > 0) {
              if (this.jumps === this.maxJumps || this.hasBoots) {
                  this.velY = -35; this.jumps--; this.onGround = false;
                  soundmanager.playJump();
              }
          }

          // Dash-trigger
          if ((keys["Shift"] || keys["ShiftLeft"] || keys["ShiftRight"]) && this.canDash && this.hasShirt) {
              keys["Shift"] = keys["ShiftLeft"] = keys["ShiftRight"] = false;
              this.isDashing = true;
              this.canDash = false;
              this.dashTime = this.dashDuration;
              this.dashFrameIndex = 0;
              this.dashFrameCounter = 0;
              this.dashDirection = (this.lastDirection === "left") ? -1 : 1;
              soundmanager.playDash();
          }
      }

      // Dash-rörelse 
      if (this.isDashing) {
          dx = this.dashDirection * this.speed * 3;
          this.dashTime -= 12;

          // Dash-animation
          if (this.imgDashFrames.length) {
              this.dashFrameCounter++;
              if (this.dashFrameCounter >= this.dashFrameSpeed) {
                  this.dashFrameCounter = 0;
                  this.dashFrameIndex = (this.dashFrameIndex + 1) % this.imgDashFrames.length;
              }
          }

          // Avsluta dash
          if (this.dashTime <= 0) {
              this.isDashing = false;
              this.dashFrameIndex = 0;
              this.dashFrameCounter = 0;
              this.dashDirection = null;
              setTimeout(() => { this.canDash = true; }, 1250);
          }
      }

    this.jumpPressedLastFrame = keys[" "] || keys["w"] || keys["ArrowUp"];

    //  Horisontell kollisionshantering 
    let newX = this.x + dx;
      for (let obs of obstacles) {
        if (this.y + this.h > obs.y + 1 && this.y < obs.y + obs.h - 1) {
          const rightEdge = this.x + this.w, newRightEdge = newX + this.w;
          if (dx > 0 && rightEdge <= obs.x && newRightEdge > obs.x) newX = obs.x - this.w;
          if (dx < 0 && this.x >= obs.x + obs.w && newX < obs.x + obs.w) newX = obs.x + obs.w;
        }
      }

    this.x = newX;

    //  Gravitation & vertikal kollisionshantering 
    if (!this.onGround) this.velY += this.gravity;
    let newY = this.y + this.velY;
    let standingOnSomething = false;

    for (let obs of obstacles) {
      if (this.x + this.w > obs.x + 1 && this.x < obs.x + obs.w - 1) {
        const prevBottom = this.y + this.h, nextBottom = newY + this.h;
        if (prevBottom <= obs.y && nextBottom >= obs.y) { newY = obs.y - this.h; this.velY = 0; standingOnSomething = true; }
        const prevTop = this.y, nextTop = newY;
        if (prevTop >= obs.y + obs.h && nextTop <= obs.y + obs.h) newY = obs.y + obs.h, this.velY = 0;
      }
    }

    // Stå på marken
    if (newY + this.h >= groundY) { newY = groundY - this.h; this.velY = 0; standingOnSomething = true; }
    this.y = newY; 
    this.onGround = standingOnSomething;
    if (this.onGround) this.jumps = this.maxJumps;

    // Animation
    if (!this.isDashing) {
      if (isMoving) {
        this.frameCounter++;
        if (this.frameCounter >= this.frameSpeed) {
          this.frameCounter = 0;
          this.currentFrame = (this.currentFrame + 1) % 3;
        }
      } else this.frameCounter = this.currentFrame = 0;
    }
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

export class Lava extends Obstacle {
  constructor(x, y, w, h, imageOrColor = null) {
    super(x, y, w, h, imageOrColor || "red");
  }

  draw(ctx) {
    if (this.image && this.imageLoaded) {
      ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    } else {
      const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
      gradient.addColorStop(0, "#ff6600");
      gradient.addColorStop(0.5, "#ff3300");
      gradient.addColorStop(1, "#cc0000");
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }

  // Endast kollisionstest (returnerar true/false)
  checkCollision(character) {
  return (
    character.x < this.x + this.w &&
    character.x + character.w > this.x &&
    character.y < this.y + this.h &&
    character.y + character.h >= this.y
  );
  }
}

export class Skylt {
  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.image = null;
  }

  draw(ctx) {
    if (this.image && this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    } else {
      ctx.fillStyle = this.color;
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
        this.health = 100;      
        this.damage = 10;       
        this.name = imageSrc.split("/").pop().split(".")[0]; 

        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    }
}

export class Decoration {
  constructor(x, y, w, h, src) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.image = new Image();
    this.image.src = src;
  }

  draw(ctx) {
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    }
  }
}
