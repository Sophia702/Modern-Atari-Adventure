// ── Keyboard input ────────────────────────────────────────────────────────────
const keys = {};

document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ' && state === 'playing') { e.preventDefault(); interact(); }
  if (e.key === 'n' || e.key === 'N') showNames   = !showNames;
  if (e.key === 'm' || e.key === 'M') showMinimap = !showMinimap;
  if ((e.key === 'r' || e.key === 'R') && (state === 'gameover' || state === 'win')) showTitle();
});

document.addEventListener('keyup', e => { keys[e.key] = false; });

function showTitle() {
  state = 'title';
  canvas.style.display = 'none';
  document.getElementById('title-screen').style.display = 'flex';
}
