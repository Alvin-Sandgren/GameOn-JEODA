class LjudManager {
    playMenu() {
        this.menuMusic = new Audio("Ljud/Menumusic.wav");
        this.menuMusic.loop = true;
        this.backgroundMusic = new Audio("Ljud/Background-music.wav");
        this.backgroundMusic.loop = true;
        this.combatMusic = new Audio("Ljud/cOMBATMUSIK.wav");
        this.combatMusic.loop = true;
        this.backgroundMusic.pause();
        this.combatMusic.pause();
        this.menuMusic.play();
        }
    

    playOverworld() {
        this.menuMusic = new Audio("Ljud/Menumusic.wav");
        this.menuMusic.loop = true;
        this.backgroundMusic = new Audio("Ljud/Background-music.wav");
        this.backgroundMusic.loop = true;
        this.combatMusic = new Audio("Ljud/cOMBATMUSIK.wav");
        this.combatMusic.loop = true;
        this.menuMusic.pause();
        this.combatMusic.pause();
        this.backgroundMusic.play();
    }

    playCombat() {
        this.menuMusic = new Audio("Ljud/Menumusic.wav");
        this.menuMusic.loop = true;
        this.backgroundMusic = new Audio("Ljud/Background-music.wav");
        this.backgroundMusic.loop = true;
        this.combatMusic = new Audio("Ljud/cOMBATMUSIK.wav");
        this.combatMusic.loop = true;
        this.menuMusic.pause();
        this.backgroundMusic.pause();
        this.combatMusic.play();
    }
}