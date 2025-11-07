export class Character {
  constructor(
    x, y, w, h, speed, maxJumps,
    imgIdleSrc, imgLeftLegSrc, imgRightLegSrc,
    imgDashSrcs = [], imgJumpSrc = null
  ) {
    // Position & storlek
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;

    // Stats
    this.mana = 100; this.maxMana = 100;
    this.health = 100; this.maxHealth = 100;
    this.damage = 10;

    // Jumping
    this.maxJumps = maxJumps;
    this.jumps = maxJumps;
    this.velY = 0;
    this.gravity = 2;
    this.onGround = false;

    // Walking frames
    this.imgIdle = new Image(); this.imgIdle.src = imgIdleSrc;
    this.imgLeftLeg = new Image(); this.imgLeftLeg.src = imgLeftLegSrc;
    this.imgRightLeg = new Image(); this.imgRightLeg.src = imgRightLegSrc;

    this.currentFrame = 0;
    this.frameCounter = 0;
    this.frameSpeed = 10;

    // Dash frames
    this.imgDashFrames = imgDashSrcs.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    this.dashFrameIndex = 0;
    this.dashFrameCounter = 0;
    this.dashFrameSpeed = 5;
    this.dashTime = 0;
    this.dashDuration = 200; // ms

    // Jump image
    this.imgJump = imgJumpSrc ? new Image() : null;
    if (this.imgJump) this.imgJump.src = imgJumpSrc;

    // State
    this.lastDirection = "right";
    this.canDash = true;
    this.isDashing = false;
    this.jumpPressedLastFrame = false;
  }

  // Kontrollera att alla bilder i en array är färdigladdade
  static _allImagesComplete(images) {
    if (!images) return true;
    if (Array.isArray(images)) return images.every(img => img && img.complete);
    return images.complete;
  }

  // Rita spelaren
  draw(ctx, isMoving = false) {
    let imgToDraw = null;

    if (this.isDashing && this.imgDashFrames.length > 0) {
      if (Character._allImagesComplete(this.imgDashFrames)) {
        imgToDraw = this.imgDashFrames[this.dashFrameIndex];
      } else {
        imgToDraw = this.imgDashFrames.find(i => i && i.complete) || this.imgIdle;
      }
    } else if (!this.onGround && this.imgJump && this.imgJump.complete) {
      imgToDraw = this.imgJump;
    } else {
      if (!isMoving && this.currentFrame === 0) {
        imgToDraw = this.imgIdle;
      } else {
        if (this.imgIdle.complete && this.imgLeftLeg.complete && this.imgRightLeg.complete) {
          if (this.currentFrame === 0) imgToDraw = this.imgIdle;
          else if (this.currentFrame === 1) imgToDraw = this.imgLeftLeg;
          else imgToDraw = this.imgRightLeg;
        } else {
          imgToDraw = this.imgIdle;
        }
      }
    }

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    if (this.lastDirection === "left") ctx.scale(-1, 1);

    if (imgToDraw && imgToDraw.complete) {
      ctx.drawImage(imgToDraw, -this.w / 2, -this.h / 2, this.w, this.h);
    } else {
      ctx.fillStyle = "magenta";
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    }

    ctx.restore();
  }

  // Uppdatera spelaren
  update(obstacles, groundY, keys) {
    let dx = 0;
    let isMoving = false;

    // --- Input & dash ---
    if (!this.isDashing) {
      if (keys["a"] || keys["ArrowLeft"]) { dx -= this.speed; this.lastDirection = "left"; isMoving = true; }
      if (keys["d"] || keys["ArrowRight"]) { dx += this.speed; this.lastDirection = "right"; isMoving = true; }

      if ((keys[" "] && !this.jumpPressedLastFrame) || (keys["w"] && !this.jumpPressedLastFrame) || (keys["ArrowUp"] && !this.jumpPressedLastFrame)) {
        if (this.jumps > 0) { this.velY = -35; this.jumps--; this.onGround = false; }
      }

      if ((keys["Shift"] || keys["ShiftLeft"] || keys["ShiftRight"]) && this.canDash) {
        // Släpp dash-tangenten
        keys["Shift"] = keys["ShiftLeft"] = keys["ShiftRight"] = false;

        // 🟩 NYTT: Nollställ rörelseriktningar så man inte "fastnar" efter dash
        keys["a"] = keys["ArrowLeft"] = false;
        keys["d"] = keys["ArrowRight"] = false;

        // Starta dash
        this.isDashing = true;
        this.canDash = false;
        this.dashTime = this.dashDuration;
        this.dashFrameIndex = 0;
        this.dashFrameCounter = 0;
      }

    } else {
      const dashSpeed = this.speed * 3;
      dx += (this.lastDirection === "left") ? -dashSpeed : dashSpeed;

      this.dashTime -= 10;
      if (this.imgDashFrames.length > 0) {
        this.dashFrameCounter++;
        if (this.dashFrameCounter >= this.dashFrameSpeed) {
          this.dashFrameCounter = 0;
          this.dashFrameIndex = (this.dashFrameIndex + 1) % this.imgDashFrames.length;
        }
      }

      if (this.dashTime <= 0) {
        this.isDashing = false;
        this.dashFrameIndex = 0;
        this.dashFrameCounter = 0;
        setTimeout(() => { this.canDash = true; }, 750);
      }
    }

    // --- Walking animation ---
    if (!this.isDashing) {
      if (isMoving) {
        this.frameCounter++;
        if (this.frameCounter >= this.frameSpeed) {
          this.frameCounter = 0;
          this.currentFrame = (this.currentFrame + 1) % 3;
        }
      } else {
        this.currentFrame = 0;
        this.frameCounter = 0;
      }
    }

    this.jumpPressedLastFrame = keys[" "] || keys["w"] || keys["ArrowUp"];

    // --- Horisontell kollisionshantering ---
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
    this.x = newX;

    // --- Gravitation & vertikal kollisionshantering ---
    if (!this.onGround) this.velY += this.gravity;
    let newY = this.y + this.velY;
    let standingOnSomething = false;

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

    if (newY + this.h >= groundY) {
      newY = groundY - this.h;
      this.velY = 0;
      standingOnSomething = true;
    }

    this.y = newY;
    this.onGround = standingOnSomething;
    if (this.onGround) this.jumps = this.maxJumps;
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
    character.y + character.h >= this.y // ändrat till >=
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
    }

    draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
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
