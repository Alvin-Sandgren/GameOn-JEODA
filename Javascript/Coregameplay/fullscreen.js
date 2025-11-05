const btn = document.getElementById('fullscreen-btn');

    // Ladda menybilden
    const menuImage = new Image();
    menuImage.src = 'Bilder/meny.png';


    menuImage.onload = () => {
      resizeCanvas();
    };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Rensa och rita bilden över hela canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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