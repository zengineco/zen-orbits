import { initState } from './engine/state.js';
import { update } from './engine/update.js';
import { render } from './render/renderer.js';
import { setupInput } from './input/touch.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let G = initState(0);
let last = 0;
let acc = 0;
const STEP = 1 / 60;

setupInput(canvas);

function loop(ts) {
  const dt = Math.min((ts - last) / 1000, 0.1);
  last = ts;
  acc += dt;

  while (acc >= STEP) {
    const input = window.inputQueue.shift() || null;
    G = update(G, STEP * 60, input);
    acc -= STEP;
  }

  render(G, ctx);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
