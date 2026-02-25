window.inputQueue = [];

export function setupInput(canvas) {
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touch = e.touches[0];
    window.inputQueue.push({ type: 'moon', deltaX: touch.movementX || 0 });
  }, { passive: false });
}
