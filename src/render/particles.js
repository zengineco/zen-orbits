export function drawParticles(ctx, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    ctx.fillStyle = `rgba(255,255,255,${p.life / 30})`;
    ctx.fillRect(p.x, p.y, 3, 3);
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}
