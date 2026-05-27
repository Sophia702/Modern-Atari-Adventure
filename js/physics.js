// ── Collision ─────────────────────────────────────────────────────────────────
function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

function wallsForRoom(r) {
  return rooms[r].walls.map(w => ({
    x: w.x*GX, y: w.y*GX, w: w.w*GX, h: w.h*GX
  }));
}

// Pixel rects of the open gaps in border walls, so collision ignores them.
function doorGapsForRoom(r) {
  const gaps    = [];
  const exits   = rooms[r].exits;
  const gapHalf = GX * 1.5;
  if (exits.N !== undefined) gaps.push({ x: PW/2 - gapHalf, y: 0,        w: gapHalf*2, h: GX });
  if (exits.S !== undefined) gaps.push({ x: PW/2 - gapHalf, y: PH - GX,  w: gapHalf*2, h: GX });
  if (exits.W !== undefined) gaps.push({ x: 0,               y: PH/2 - gapHalf, w: GX, h: gapHalf*2 });
  if (exits.E !== undefined) gaps.push({ x: PW - GX,         y: PH/2 - gapHalf, w: GX, h: gapHalf*2 });
  return gaps;
}

function collideWalls(ox, oy, nx, ny, w, h, room) {
  const walls = wallsForRoom(room);
  const gaps  = doorGapsForRoom(room);
  for (const wall of walls) {
    if (!rectOverlap(nx, ny, w, h, wall.x, wall.y, wall.w, wall.h)) continue;
    const inGap = gaps.some(g => rectOverlap(nx, ny, w, h, g.x, g.y, g.w, g.h));
    if (!inGap) return true;
  }
  return false;
}

// ── Room transitions ──────────────────────────────────────────────────────────
function checkExit() {
  const r      = rooms[player.room];
  const exits  = r.exits;
  const locked = r.locked;
  const pw = player.w, ph = player.h;

  let dir = null;
  if (player.x < 0)        dir = 'W';
  else if (player.x+pw>PW) dir = 'E';
  else if (player.y < 0)   dir = 'N';
  else if (player.y+ph>PH) dir = 'S';
  if (!dir) return;

  if (exits[dir] === undefined) {
    if (dir === 'W') player.x = 0;
    if (dir === 'E') player.x = PW - pw;
    if (dir === 'N') player.y = 0;
    if (dir === 'S') player.y = PH - ph;
    return;
  }

  if (locked[dir] && carrying !== locked[dir]) {
    if (dir === 'W') player.x = GX;
    if (dir === 'E') player.x = PW - pw - GX;
    if (dir === 'N') player.y = GX;
    if (dir === 'S') player.y = PH - ph - GX;
    flashTimer = 30;
    return;
  }

  player.room = exits[dir];
  visitedRooms.add(player.room);
  if (dir === 'W') player.x = PW - pw - GX;
  if (dir === 'E') player.x = GX;
  if (dir === 'N') player.y = PH - ph - GX;
  if (dir === 'S') player.y = GX;
}

// ── Item interaction ──────────────────────────────────────────────────────────
function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const itemPositions = {};

function getItemPos(room, id) {
  const key = `${room}_${id}`;
  if (!itemPositions[key]) {
    const slots = [
      {x:5*GX,y:5*GX}, {x:10*GX,y:7*GX}, {x:14*GX,y:5*GX},
      {x:7*GX,y:10*GX},{x:12*GX,y:10*GX},{x:4*GX,y:8*GX},
    ];
    itemPositions[key] = slots[strHash(key) % slots.length];
  }
  return itemPositions[key];
}

function interact() {
  if (carrying) {
    roomItems[player.room].push(carrying);
    carrying = null;
    return;
  }
  const items = roomItems[player.room];
  if (!items.length) return;
  let best = null, bestDist = Infinity;
  for (const id of items) {
    const pos = getItemPos(player.room, id);
    const d = (pos.x-player.x)**2 + (pos.y-player.y)**2;
    if (d < bestDist && d < (GX*3)**2) { bestDist = d; best = id; }
  }
  if (best) {
    roomItems[player.room] = items.filter(i => i !== best);
    carrying = best;
  }
}
