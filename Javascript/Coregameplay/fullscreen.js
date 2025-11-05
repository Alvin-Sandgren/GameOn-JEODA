// Javascript/Coregameplay/fullscreen.js
import { canvas, ctx } from "./map.js";

export const btn = document.getElementById('fullscreen-btn');
const menuImage = new Image();
menuImage.src = './Bilder/meny.png';

menuImage.onload = () => resizeCanvas();

function resizeCanvas() {
  // justera storlek (bevakar att canvas finns)
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // rita menybild direkt
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
}

btn.addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await canvas.requestFullscreen();
    btn.textContent = '⏏ Exit Fullscreen';
  } else {
    await document.exitFullscreen();
    btn.textContent = '⛶ Fullscreen';
  }
  resizeCanvas();
});

window.addEventListener('resize', resizeCanvas);