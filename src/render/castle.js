export function drawBricks(ctx, bricks) {
  bricks.forEach(b => {
    if (!b.alive) return;
    const dmg = b.damage || 0;
    ctx.fillStyle = `rgba(160,140,200,${1 - dmg})`;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    if (dmg > 0.5) {
      ctx.strokeStyle = '#000';
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }
  });
}
