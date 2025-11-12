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
        this.backgroundMusic.volume = 0.2;
        this.combatMusic.volume = 0.85;
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

}