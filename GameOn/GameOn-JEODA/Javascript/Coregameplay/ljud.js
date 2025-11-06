if (gamestate === "menu") {
    Menu_music.play();
}
else if (gamestate === "Overworld") {
    Combat_music.pause();
    Background_music.play();
}
else if (gamestate === "combat") {
    Background_music.pause();
    Combat_music.play();
}