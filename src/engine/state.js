import levels from '../data/levels/index.js';

export function initState(levelIdx) {
  const lvl = levels[levelIdx % levels.length];
  return {
    phase: 'playing',
    levelIdx,
    lvl,
    score: 0,
    lives: 3,
    multiplier: 1,
    moon: { x: 240, y: 800, hw: 70, ht: 14 },
    comets: [{ x: 240, y: 760, vx: 2, vy: -4, r: 7, trail: [], active: true }],
    bricks: lvl.bricks,
    particles: [],
    bonusDrop: [],
    activeBonuses: {},
    tick: 0,
    shakeT: 0,
  };
}
