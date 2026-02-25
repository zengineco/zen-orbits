export function drawMoon(ctx, moon) {
  ctx.fillStyle = '#ddd';
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, moon.hw, 0, Math.PI * 2);
  ctx.fill();
}
