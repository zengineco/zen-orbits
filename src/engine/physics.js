const GRAVITY = 0.12;
const MAX_VY = 8;

export function applyPhysics(comet, state, dt) {
  if (!comet.active) return comet;

  let { x, y, vx, vy, r } = comet;

  vy = Math.min(vy + GRAVITY * dt, MAX_VY);
  x += vx * dt;
  y += vy * dt;

  // Walls
  if (x < r || x > 480 - r) vx *= -1;
  if (y < r) vy *= -1;

  // Moon collision
  const m = state.moon;
  if (y + r > m.y - m.ht && x > m.x - m.hw && x < m.x + m.hw) {
    vy = -Math.abs(vy);
    vx += (x - m.x) * 0.03;
  }

  // Brick collision
  state.bricks.forEach(b => {
    if (!b.alive) return;
    if (x > b.x && x < b.x + b.w && y - r < b.y + b.h && y + r > b.y) {
      b.damage = Math.min(1, b.damage + 0.25);
      if (b.damage >= 1) b.alive = false;
      vy *= -1;
      state.particles.push({ x, y, life: 30 });
    }
  });

  // Death
  if (y > 920) comet.active = false;

  return { ...comet, x, y, vx, vy };
}
