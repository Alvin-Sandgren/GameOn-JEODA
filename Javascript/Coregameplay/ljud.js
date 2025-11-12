export class Soundmanager {
    menuMusic;
    backgroundMusic;
    combatMusic;
    dashsfx;
    constructor() {
        this.menuMusic = new Audio("Ljud/menumusic.wav");
        this.menuMusic.loop = true;
        this.backgroundMusic = new Audio("Ljud/backgroundmusic.wav");
        this.backgroundMusic.loop = true;
        this.combatMusic = new Audio("Ljud/combatmusik.wav");
        this.combatMusic.loop = true;
        this.dashsfx = new Audio("Ljud/dash.wav");
        this.gameoversfx = new Audio("Ljud/gameover.wav");
        this.jump = new Audio("Ljud/jump.wav");
        this.jump.volume = 0.1;
        this.backgroundMusic.volume = 0.1;
        this.combatMusic.volume = 0.1;
        
        // Ability ljud
        this.axeSound = new Audio("Ljud/axe.wav");
        this.blockSound = new Audio("Ljud/block.wav");
        this.healingSound = new Audio("Ljud/healing.wav");
        this.burnSound = new Audio("Ljud/burn.wav");
        this.runeSound = new Audio("Ljud/rune.wav");
        this.anvilSound = new Audio("Ljud/anvil.wav");

        //getljud
        this.goatDeathSound = new Audio("Ljud/goatdeath.wav");
        
        // ändra volym för ability ljud
        this.axeSound.volume = 0.5;
        this.blockSound.volume = 0.5;
        this.healingSound.volume = 0.5;
        this.burnSound.volume = 0.5;
        this.runeSound.volume = 0.5;
        this.anvilSound.volume = 0.5;
    }
    playMenu() {
        this.backgroundMusic.pause();
        this.combatMusic.pause();
        this.dashsfx.pause();
        this.menuMusic.play();
        this.gameoversfx.pause();
        this.jump.pause();
        }
    

    playOverworld() {
        this.menuMusic.pause();
        this.combatMusic.pause();
        this.dashsfx.pause();
        this.backgroundMusic.play();
        this.gameoversfx.pause();
        this.jump.pause();
    }

    playCombat() {
        this.menuMusic.pause();
        this.backgroundMusic.pause();
        this.dashsfx.pause();
        this.combatMusic.play();
        this.gameoversfx.pause();
        this.jump.pause();
    }
    playDash() {
        this.menuMusic.pause();
        this.backgroundMusic.pause();
        this.combatMusic.pause();
        this.dashsfx.play();
        this.gameoversfx.pause();
        this.jump.pause();
    }

    playJump() {
        this.menuMusic.pause();
        this.backgroundMusic.pause();
        this.combatMusic.pause();
        this.dashsfx.pause();
        this.gameoversfx.pause();
        this.jump.play();
    }

    playGameover() {
        this.menuMusic.pause();
        this.backgroundMusic.pause();
        this.combatMusic.pause();
        this.dashsfx.pause();
        this.gameoversfx.play();    
        this.jump.pause();
    }

    // Ability sound methods
    playAxe() {
        this.axeSound.currentTime = 0;
        this.axeSound.play().catch(e => console.log("Could not play axe sound:", e));
    }

    playBlock() {
        this.blockSound.currentTime = 0;
        this.blockSound.play().catch(e => console.log("Could not play block sound:", e));
    }

    playHealing() {
        this.healingSound.currentTime = 0;
        this.healingSound.play().catch(e => console.log("Could not play healing sound:", e));
    }

    playBurn() {
        this.burnSound.currentTime = 0;
        this.burnSound.play().catch(e => console.log("Could not play burn sound:", e));
    }

    playRune() {
        this.runeSound.currentTime = 0;
        this.runeSound.play().catch(e => console.log("Could not play rune sound:", e));
    }

    playAnvil() {
        this.anvilSound.currentTime = 0;
        this.anvilSound.play().catch(e => console.log("Could not play anvil sound:", e));
    }


    
    playGoatDeath() {
        this.goatDeathSound.currentTime = 0;
        this.goatDeathSound.play().catch(e => console.log("Could not play goat death sound:", e));
    }
    

}