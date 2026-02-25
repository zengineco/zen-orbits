export function applyBonus(state, bonus) {
  if (bonus.type === 'multiplier') state.multiplier *= bonus.value;
  if (bonus.type === 'life') state.lives += bonus.value;
  if (bonus.type === 'comet') state.comets.push({ ...state.comets[0] });
}
