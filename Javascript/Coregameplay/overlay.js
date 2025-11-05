let currentState = "menu"; // menu, overworld, gameover, combat
const startBtn = document.getElementById('start-btn');

function fadeInOverlay() {
    const times = 5;           // fadeout counter
    let count = 0;

    function drawStep() {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        count++;
        if (count < times) {
            setTimeout(drawStep, 200); // vänta 200 ms innan nästa steg
        }
    }

    drawStep();
}

// Ladda meny-bilden
const menuImg = new Image();
menuImg.src = "meny.png";

// Visa menyn
function showMenu() {
    currentState = "menu";
    startBtn.style.display = "block";

    // Rita menyn
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(menuImg, 0, 0, canvas.width, canvas.height);

    // Pausa spelet
    if (typeof pauseMap === "function") pauseMap();
}

// Game Over
function gameOver() {
    currentState = "gameover";
    startBtn.style.display = "block"; // visa startknapp igen

    // Flytta spelaren till testposition
    player.x = 200;
    player.y = 4200;

    // Rita menyn igen
    showMenu();
}

// Combat
function enterCombat() {
    currentState = "combat";
    startBtn.style.display = "none"; // göm startknappen under combat

    // Pausa spelvärlden
    if (typeof pauseMap === "function") pauseMap();

    // Starta fade-in
    fadeInOverlay();

    // Rita den röda rutan efter 200ms * antal steg i fadeInOverlay
    const fadeDuration = 200 * 5; // t.ex. 5 steg à 200ms = 1000ms totalt
    setTimeout(() => {
        const rectWidth = 100;
        const rectHeight = 100;
        const centerX = canvas.width / 2 - rectWidth / 2;
        const centerY = canvas.height / 2 - rectHeight / 2;

        ctx.fillStyle = "red";
        ctx.fillRect(centerX, centerY, rectWidth, rectHeight);

        console.log("Combat state activated!");
    }, fadeDuration);
}

// Starta spelet
function startGame() {
    currentState = "overworld";
    startBtn.style.display = "none";
    if (typeof startMap === "function") startMap();
}

// Eventlistener
startBtn.addEventListener('click', startGame);
window.addEventListener('keydown', e => {
    if (currentState === "menu" && e.key === "Enter") {
        startGame();
    }
    else if (e.key.toLowerCase() === "m") {
        showMenu();
    }
    else if (e.key.toLowerCase() === "å") {
        gameOver();
    }
    else if (e.key.toLowerCase() === "ä") {
        enterCombat();
    }
});
