export function drawBricks(ctx, bricks) {
  bricks.forEach(b => {
    if (!b.alive) return;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });
}
