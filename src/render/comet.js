export function drawComets(ctx, comets) {
  comets.forEach(c => {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });
}
