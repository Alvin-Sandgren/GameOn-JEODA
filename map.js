const canvas = document.getElementById('karta');
const ctx = canvas.getContext('2d');


canvas.width = 1910;
canvas.height = 920;
function draw() {
    ctx.clearRect(0, 0, 1910, 920);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1910, 920);
}

draw();
