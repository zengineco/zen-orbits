import { drawMoon } from './moon.js';
import { drawComets } from './comet.js';
import { drawBricks } from './castle.js';

export function render(state, ctx) {
  ctx.clearRect(0, 0, 480, 900);
  drawBricks(ctx, state.bricks);
  drawComets(ctx, state.comets);
  drawMoon(ctx, state.moon);
}
