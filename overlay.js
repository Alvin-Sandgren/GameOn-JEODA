let currentState = "menu"; // "menu" eller "overworld"

// Game loop
let last = 0;
function gameLoop(ts) {
    const dt = ts - last;
    last = ts;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch(currentState) {
        case "menu":
            states.menu.draw();
            break;
        case "overworld":
            map.update();
            map.draw();
            break;
        case "combat":
            states.combat.draw();
            break;
        case "gameover":
            states.gameover.draw();
            break;
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// Input
window.addEventListener("keydown", e => {
    if (e.key === "Enter") currentState = "overworld";
    else if (e.key === "Escape") currentState = "menu";
});
