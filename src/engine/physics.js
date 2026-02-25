export function applyPhysics(comet, state, dt) {
  let { x, y, vx, vy } = comet;

  x += vx * dt;
  y += vy * dt;

  if (x < comet.r || x > 480 - comet.r) vx *= -1;
  if (y < comet.r) vy *= -1;

  return { ...comet, x, y, vx, vy };
}
