import { applyPhysics } from './physics.js';

export function update(state, dt, input) {
  let moon = state.moon;

  if (input?.type === 'moon') {
    moon = { ...moon, x: Math.max(moon.hw, Math.min(480 - moon.hw, moon.x + input.deltaX)) };
  }

  const comets = state.comets.map(c => applyPhysics(c, state, dt));

  return {
    ...state,
    tick: state.tick + 1,
    moon,
    comets
  };
}
