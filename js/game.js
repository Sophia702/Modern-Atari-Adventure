// ── Game init ─────────────────────────────────────────────────────────────────
function startGame(n) {
  gameNumber  = n;
  won         = false;
  gameOverMsg = '';
  showNames   = false;

  player = { x: 9*GX, y: 7*GX, room: 0, w: GX*0.8, h: GX*0.8, facing: 'S' };
  stepCount    = 0;
  carrying     = null;
  visitedRooms = new Set([0]);

  roomItems = {};
  for (let i = 0; i < rooms.length; i++) roomItems[i] = [...rooms[i].items];
  if (n === 3) randomizeItems();

  dragons = DRAGON_DEFS.map(d => ({
    ...d,
    x: 10*GX, y: 7*GX,
    room:    d.homeRoom,
    alive:   true,
    carrying: null,
    state:   'wander',
    timer:   Math.random() * 60,
    targetX: 10*GX,
    targetY: 7*GX,
  }));

  state = 'playing';
  canvas.style.display = 'block';
  document.getElementById('title-screen').style.display = 'none';
}

function randomizeItems() {
  const all = [];
  for (let i = 0; i < rooms.length; i++) { all.push(...roomItems[i]); roomItems[i] = []; }
  for (let i = all.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  all.forEach((item, idx) => roomItems[idx % rooms.length].push(item));
  if (!roomItems[2].includes('dot')) roomItems[2].push('dot');
}

// ── Win condition ─────────────────────────────────────────────────────────────
function checkWin() {
  if (carrying === 'chalice' && (player.room === 0 || player.room === 4)) {
    won   = true;
    state = 'win';
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
const SPEED = 3;

function update() {
  if (state !== 'playing') return;

  let dx = 0, dy = 0;
  if (keys['ArrowLeft']  || keys['a']) { dx = -SPEED; player.facing = 'W'; }
  if (keys['ArrowRight'] || keys['d']) { dx =  SPEED; player.facing = 'E'; }
  if (keys['ArrowUp']    || keys['w']) { dy = -SPEED; player.facing = 'N'; }
  if (keys['ArrowDown']  || keys['s']) { dy =  SPEED; player.facing = 'S'; }
  if (dx && dy) {
    if (keys['ArrowLeft'] || keys['a']) player.facing = 'W';
    if (keys['ArrowRight']|| keys['d']) player.facing = 'E';
    dx *= 0.707; dy *= 0.707;
  }
  if (dx || dy) stepCount++;

  const nx = player.x + dx;
  const ny = player.y + dy;
  if (!collideWalls(player.x, player.y, nx, player.y, player.w, player.h, player.room)) player.x = nx;
  if (!collideWalls(player.x, player.y, player.x, ny, player.w, player.h, player.room)) player.y = ny;

  checkExit();
  checkWin();
  dragons.forEach(updateDragon);
  if (flashTimer > 0) flashTimer--;
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  ctx.fillStyle = '#08090d';
  ctx.fillRect(0, 0, W, H);

  if (state === 'playing' || state === 'gameover' || state === 'win') {
    const room = player.room;

    drawFloor(room);
    drawWalls(room);
    drawDecorations(room);
    drawDoors();
    drawItems(room);
    dragons.forEach(drawDragon);
    drawPlayer();
    drawCarried();
    drawMinimap();

    if (showNames) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, 22);
      ctx.fillStyle = C.white;
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(rooms[room].name, W/2, 15);
    }

    const inv   = carrying ? `Carrying: ${ITEMS[carrying].name}` : 'Carrying: nothing';
    const alive = dragons.filter(d => d.alive).map(d => d.name).join(', ') || 'all slain';
    document.getElementById('ui').textContent =
      `Game ${gameNumber}  |  ${rooms[room].name}  |  ${inv}  |  Dragons: ${alive}  |  [N] names  [M] map  [Space] pick up/drop`;
  }

  drawOverlays();
}

// ── Loop ──────────────────────────────────────────────────────────────────────
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
canvas.style.display = 'none';
document.getElementById('title-screen').style.display = 'flex';
loop();
