// ── Color utils ───────────────────────────────────────────────────────────────
function hexRGB(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
function lighten(hex, amt) {
  const [r,g,b] = hexRGB(hex);
  const c = v => Math.min(255,v+amt).toString(16).padStart(2,'0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
function darken(hex, amt) { return lighten(hex, -amt); }
function hexAlpha(hex, a) {
  const [r,g,b] = hexRGB(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Pixel helpers ─────────────────────────────────────────────────────────────
// Draw a pixel-art outlined filled rectangle (1px dark outline)
function px(x, y, w, h, fill, outline) {
  if (outline) { ctx.fillStyle = outline; ctx.fillRect(x-1,y-1,w+2,h+2); }
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

// Stardew-style shadow under an entity
function drawShadow(cx, by, rx, ry) {
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, by, rx, ry, 0, 0, Math.PI*2);
  ctx.fill();
}

// ── Floor ─────────────────────────────────────────────────────────────────────
// Pre-seeded cheap pseudo-random for stable tile variation
function tileRand(x, y, seed) {
  let h = (x*2357 + y*7919 + seed*13) | 0;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h);
  return (h & 0xff) / 255;
}

function drawFloor(room) {
  const r    = rooms[room];
  const fa   = r.floorA;
  const fb   = r.floorB;
  const styl = r.floorStyle;
  const T    = GX; // tile size = 1 grid cell

  // Base fill
  ctx.fillStyle = fa;
  ctx.fillRect(0, 0, PW, PH);

  if (styl === 'wood') {
    // Wood planks: horizontal planks 2 tiles wide, alternating shades
    const plankH = T;
    for (let row = 0; row < ROWS; row++) {
      const y   = row * T;
      const alt = row % 2 === 0;
      ctx.fillStyle = alt ? fa : fb;
      ctx.fillRect(0, y, PW, plankH);
      // Plank seam line
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, y, PW, 1);
      // Wood grain lines
      ctx.fillStyle = alt ? hexAlpha(fb, 0.22) : hexAlpha(fa, 0.22);
      for (let gx2 = 0; gx2 < PW; gx2 += T*2 + (tileRand(row, gx2, 3)*T|0)) {
        ctx.fillRect(gx2, y+3, 1, plankH-4);
      }
      // Plank end notches every ~4 tiles
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      for (let col = 0; col < COLS; col += 4) {
        const ox = (col + (row%2)*2) * T;
        ctx.fillRect(ox, y, 2, plankH);
      }
    }
    // Highlight top of planks
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let row = 0; row < ROWS; row++) ctx.fillRect(0, row*T+1, PW, 2);

  } else if (styl === 'stone') {
    // Stone tiles: each GX cell is a tile with bevel
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x   = col * T, y = row * T;
        const v   = tileRand(col, row, 7);
        // Slightly varied tile color
        const base = v > 0.7 ? lighten(fa, 8) : v < 0.2 ? darken(fa, 8) : fa;
        const alt2  = (col + row) % 2 === 0;
        ctx.fillStyle = alt2 ? base : fb;
        ctx.fillRect(x+1, y+1, T-2, T-2);
        // Grout
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(x, y, T, 1);    // top
        ctx.fillRect(x, y, 1, T);    // left
        // Inner highlight
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(x+1, y+1, T-3, 1);
        ctx.fillRect(x+1, y+1, 1, T-3);
      }
    }

  } else if (styl === 'grass') {
    // Grass: base color + random darker patches + tiny grass tufts
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col*T, y = row*T;
        const v = tileRand(col, row, 11);
        ctx.fillStyle = v > 0.65 ? lighten(fa, 10) : v < 0.2 ? darken(fa, 12) : fa;
        ctx.fillRect(x, y, T, T);
      }
    }
    // Subtle tile grid
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let x = 0; x <= PW; x += T) ctx.fillRect(x, 0, 1, PH);
    for (let y = 0; y <= PH; y += T) ctx.fillRect(0, y, PW, 1);
    // Grass tufts (small pixel clusters)
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const v = tileRand(col, row, 23);
        if (v > 0.8) {
          const tx = col*T + (tileRand(col,row,5)*T*0.6|0) + T*0.1;
          const ty = row*T + (tileRand(col,row,9)*T*0.6|0) + T*0.1;
          ctx.fillStyle = darken(fa, 20);
          ctx.fillRect(tx, ty, 1, 3);
          ctx.fillRect(tx+2, ty+1, 1, 2);
        }
      }
    }

  } else { // dirt
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col*T, y = row*T;
        const v = tileRand(col, row, 17);
        ctx.fillStyle = v > 0.6 ? lighten(fa,8) : v < 0.25 ? darken(fa,10) : fa;
        ctx.fillRect(x, y, T, T);
        // Dirt pebbles
        if (v > 0.82) {
          ctx.fillStyle = darken(fa, 18);
          ctx.fillRect(x + (tileRand(col,row,6)*T*0.7|0)+2, y + (tileRand(col,row,8)*T*0.7|0)+2, 2, 2);
        }
      }
    }
    // Subtle grid
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let x = 0; x <= PW; x += T) ctx.fillRect(x, 0, 1, PH);
    for (let y = 0; y <= PH; y += T) ctx.fillRect(0, y, PW, 1);
  }

  // Vignette — dark edges like Stardew's indoor rooms
  const vg = ctx.createRadialGradient(PW/2, PH/2, PH*0.25, PW/2, PH/2, PW*0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, PW, PH);
}

// ── Walls ─────────────────────────────────────────────────────────────────────
function drawStoneWall(wx, wy, ww, wh, color) {
  const T  = GX;
  const dk = darken(color, 28);
  const lt = lighten(color, 18);

  // Base
  ctx.fillStyle = color;
  ctx.fillRect(wx, wy, ww, wh);

  // Stone block pattern (each T×T cell is one stone block)
  const cols = Math.ceil(ww / T);
  const rows2 = Math.ceil(wh / T);
  for (let row = 0; row < rows2; row++) {
    for (let col = 0; col < cols; col++) {
      const bx  = wx + col*T;
      const by  = wy + row*T;
      const bw  = Math.min(T, wx+ww-bx);
      const bh  = Math.min(T, wy+wh-by);
      const v   = tileRand(Math.round(bx/T), Math.round(by/T), 31);
      // Slightly varied stone color
      const bc  = v > 0.6 ? lighten(color,12) : v < 0.3 ? darken(color,12) : color;
      ctx.fillStyle = bc;
      ctx.fillRect(bx+1, by+1, bw-2, bh-2);
      // Top-left highlight
      ctx.fillStyle = hexAlpha(lt, 0.35);
      ctx.fillRect(bx+1, by+1, bw-3, 1);
      ctx.fillRect(bx+1, by+1, 1, bh-3);
      // Bottom-right shadow
      ctx.fillStyle = hexAlpha(dk, 0.5);
      ctx.fillRect(bx+1, by+bh-2, bw-2, 1);
      ctx.fillRect(bx+bw-2, by+1, 1, bh-2);
    }
  }
  // Grout lines
  ctx.fillStyle = hexAlpha(dk, 0.6);
  for (let row = 0; row <= rows2; row++) ctx.fillRect(wx, wy+row*T, ww, 1);
  for (let col = 0; col <= cols; col++) ctx.fillRect(wx+col*T, wy, 1, wh);
  // Outer border
  ctx.fillStyle = darken(color, 40);
  ctx.fillRect(wx, wy, ww, 1); ctx.fillRect(wx, wy+wh-1, ww, 1);
  ctx.fillRect(wx, wy, 1, wh); ctx.fillRect(wx+ww-1, wy, 1, wh);
}

function drawWalls(room) {
  const r = rooms[room];
  for (const w of r.walls)
    drawStoneWall(w.x*GX, w.y*GX, w.w*GX, w.h*GX, r.wallColor);
}

// ── Doors ─────────────────────────────────────────────────────────────────────
function drawOpenDoor(gx, gy, gw, gh, dir, wallColor) {
  // Dark passage interior
  ctx.fillStyle = '#0a0806';
  ctx.fillRect(gx, gy, gw, gh);

  // Wooden door frame (Stardew style — thick planked frame)
  const F = 4; // frame thickness
  const frame = SDV.doorFrame;
  const wood  = SDV.doorWood;
  const woodLt = lighten(wood, 22);

  // Draw frame planks
  if (dir === 'N' || dir === 'S') {
    // Top/bottom door: frame on sides
    ctx.fillStyle = frame; ctx.fillRect(gx, gy, F, gh); ctx.fillRect(gx+gw-F, gy, F, gh);
    ctx.fillStyle = wood;  ctx.fillRect(gx+F, gy, gw-F*2, gh);
    // Plank lines on frame
    ctx.fillStyle = hexAlpha(woodLt, 0.4);
    ctx.fillRect(gx+1, gy, 2, gh); ctx.fillRect(gx+gw-3, gy, 2, gh);
    // Arch top cap
    ctx.fillStyle = darken(frame, 20);
    if (dir === 'N') ctx.fillRect(gx, gy, gw, 3);
    else             ctx.fillRect(gx, gy+gh-3, gw, 3);
  } else {
    // E/W door: frame on top/bottom
    ctx.fillStyle = frame; ctx.fillRect(gx, gy, gw, F); ctx.fillRect(gx, gy+gh-F, gw, F);
    ctx.fillStyle = wood;  ctx.fillRect(gx, gy+F, gw, gh-F*2);
    ctx.fillStyle = hexAlpha(woodLt, 0.4);
    ctx.fillRect(gx, gy+1, gw, 2); ctx.fillRect(gx, gy+gh-3, gw, 2);
    ctx.fillStyle = darken(frame, 20);
    if (dir === 'W') ctx.fillRect(gx, gy, 3, gh);
    else             ctx.fillRect(gx+gw-3, gy, 3, gh);
  }
}

function drawLockedDoor(gx, gy, gw, gh, keyColor, flash) {
  const col = flash ? '#fff' : keyColor;
  // Fill
  ctx.fillStyle = flash ? 'rgba(255,255,255,0.4)' : hexAlpha(keyColor, 0.25);
  ctx.fillRect(gx, gy, gw, gh);
  // Iron bars / portcullis
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  const horiz = gw > gh;
  const bars = 4;
  if (horiz) {
    for (let i = 0; i <= bars; i++) {
      const bx = gx + (gw/bars)*i;
      ctx.beginPath(); ctx.moveTo(bx, gy); ctx.lineTo(bx, gy+gh); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(gx, gy+gh/2); ctx.lineTo(gx+gw, gy+gh/2); ctx.stroke();
  } else {
    for (let i = 0; i <= bars; i++) {
      const by = gy + (gh/bars)*i;
      ctx.beginPath(); ctx.moveTo(gx, by); ctx.lineTo(gx+gw, by); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(gx+gw/2, gy); ctx.lineTo(gx+gw/2, gy+gh); ctx.stroke();
  }
  // Rounded bar caps
  ctx.fillStyle = col;
  if (horiz) {
    for (let i = 0; i <= bars; i++) {
      const bx = gx + (gw/bars)*i;
      ctx.beginPath(); ctx.arc(bx, gy+gh/2, 3, 0, Math.PI*2); ctx.fill();
    }
  }
  // Key color gem in center
  const cx2 = gx+gw/2, cy2 = gy+gh/2;
  const gem = Math.min(gw,gh)*0.22;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(cx2,       cy2-gem);
  ctx.lineTo(cx2+gem*0.7, cy2);
  ctx.lineTo(cx2,       cy2+gem);
  ctx.lineTo(cx2-gem*0.7, cy2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(cx2-gem*0.2, cy2-gem*0.2, gem*0.22, 0, Math.PI*2); ctx.fill();
}

function drawDoors() {
  const r     = rooms[player.room];
  const flash = flashTimer > 0 && (flashTimer % 6 < 3);

  for (const [dir] of Object.entries(r.exits)) {
    const lk = r.locked[dir];
    const lockColor = lk ? (ITEMS[lk]?.color || '#aaa') : null;
    const gw = GX*3, gh = GX;
    let gx, gy, gw2, gh2;
    if (dir==='N') { gx=PW/2-gw/2; gy=0;        gw2=gw; gh2=gh; }
    if (dir==='S') { gx=PW/2-gw/2; gy=PH-gh;    gw2=gw; gh2=gh; }
    if (dir==='W') { gx=0;          gy=PH/2-gw/2; gw2=gh; gh2=gw; }
    if (dir==='E') { gx=PW-gh;      gy=PH/2-gw/2; gw2=gh; gh2=gw; }
    if (!lk) drawOpenDoor(gx, gy, gw2, gh2, dir, r.wallColor);
    else     drawLockedDoor(gx, gy, gw2, gh2, lockColor, flash);
  }
}

// ── Decorations ───────────────────────────────────────────────────────────────
// Stardew-style torches on walls and rugs on floors
function drawDecorations(room) {
  const r = rooms[room];
  // Torch flicker
  const tf = 0.85 + 0.15*Math.sin(Date.now()/80);
  const tInner = `rgba(255,${Math.round(210+30*tf)},${Math.round(40*tf)},${0.9*tf})`;
  const tOuter = `rgba(255,160,20,0)`;

  function torch(tx, ty) {
    // Wall bracket
    ctx.fillStyle = '#6a5030'; ctx.fillRect(tx-2, ty, 4, 6);
    // Glow
    const tg = ctx.createRadialGradient(tx, ty, 1, tx, ty, 18*tf);
    tg.addColorStop(0, tInner); tg.addColorStop(1, tOuter);
    ctx.fillStyle = tg; ctx.fillRect(tx-18, ty-18, 36, 36);
    // Flame body
    ctx.fillStyle = SDV.torchOrange;
    ctx.beginPath();
    ctx.moveTo(tx-3, ty); ctx.lineTo(tx+3, ty);
    ctx.lineTo(tx+1, ty-8); ctx.lineTo(tx, ty-11); ctx.lineTo(tx-1, ty-8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = SDV.torchYellow;
    ctx.beginPath();
    ctx.moveTo(tx-1.5, ty); ctx.lineTo(tx+1.5, ty);
    ctx.lineTo(tx, ty-7); ctx.closePath(); ctx.fill();
  }

  // Place torches based on room index for variety
  const torchPositions = {
    0:  [[1.5*GX, 1.5*GX], [18.5*GX, 1.5*GX]],
    4:  [[1.5*GX, 1.5*GX], [18.5*GX, 1.5*GX], [1.5*GX, 13.5*GX], [18.5*GX, 13.5*GX]],
    7:  [[1.5*GX, 2.5*GX], [18.5*GX, 2.5*GX]],
    10: [[1.5*GX, 1.5*GX], [18.5*GX, 1.5*GX]],
    12: [[1.5*GX, 1.5*GX], [18.5*GX, 1.5*GX]],
    13: [[1.5*GX, 1.5*GX], [18.5*GX, 1.5*GX]],
  };
  for (const [tp1, tp2] of (torchPositions[room] || [])) torch(tp1, tp2);

  // Rug in castle rooms
  const rugRooms = [0, 4, 8, 12];
  if (rugRooms.includes(room)) {
    const rw = 8*GX, rh = 5*GX;
    const rx = (PW-rw)/2, ry = (PH-rh)/2;
    ctx.fillStyle = hexAlpha(SDV.rug1, 0.55);
    ctx.fillRect(rx, ry, rw, rh);
    ctx.fillStyle = hexAlpha(SDV.rug2, 0.4);
    ctx.fillRect(rx+GX, ry+GX, rw-2*GX, rh-2*GX);
    // Rug border
    ctx.strokeStyle = hexAlpha(SDV.rug2, 0.7);
    ctx.lineWidth = 2;
    ctx.strokeRect(rx+1, ry+1, rw-2, rh-2);
    ctx.strokeStyle = hexAlpha(SDV.rug1, 0.6);
    ctx.lineWidth = 1;
    ctx.strokeRect(rx+GX+2, ry+GX+2, rw-2*GX-4, rh-2*GX-4);
  }
}

// ── Player (Stardew-style top-down sprite) ────────────────────────────────────
function drawPlayer() {
  const cx   = Math.round(player.x + player.w/2);
  const cy   = Math.round(player.y + player.h/2);
  const f    = player.facing;
  const walk = Math.floor(stepCount/6) % 4;
  const leg  = [2,0,-2,0][walk];

  // Colors — warm Stardew palette
  const skin  = '#f0c8a0';
  const skinD = '#d8a070';
  const hair  = '#6a3818';
  const shirt = '#5888c8'; // blue shirt
  const pants = '#3a5040'; // dark green pants
  const boots = '#5a3820';
  const bootsD= '#3a2010';
  const outline = '#1a0e04';

  drawShadow(cx, cy+13, 10, 4);

  if (f === 'S') {
    // Boots
    px(cx-6, cy+8+leg,   5, 6, boots, outline);
    px(cx+2, cy+8-leg,   5, 6, boots, outline);
    // Boot highlight
    ctx.fillStyle = lighten(boots,18); ctx.fillRect(cx-5, cy+9+leg, 2, 2);
    ctx.fillStyle = lighten(boots,18); ctx.fillRect(cx+3, cy+9-leg, 2, 2);
    // Pants
    px(cx-6, cy+4,  5, 5, pants, outline);
    px(cx+2, cy+4,  5, 5, pants, outline);
    // Body/shirt
    px(cx-7, cy-5, 14, 10, shirt, outline);
    // Shirt crease
    ctx.fillStyle = darken(shirt,18);
    ctx.fillRect(cx-1, cy-4, 2, 8);
    ctx.fillStyle = lighten(shirt,20);
    ctx.fillRect(cx-5, cy-4, 2, 6);
    // Collar
    ctx.fillStyle = lighten(shirt,30); ctx.fillRect(cx-3, cy-5, 6, 2);
    // Arms
    px(cx-12, cy-4,  5, 8, shirt, outline);
    px(cx+7,  cy-4,  5, 8, shirt, outline);
    // Hands
    ctx.fillStyle = skin; ctx.fillRect(cx-11, cy+2, 3, 3);
    ctx.fillStyle = skin; ctx.fillRect(cx+8,  cy+2, 3, 3);
    // Neck
    px(cx-2, cy-8, 4, 4, skin, outline);
    // Head
    px(cx-7, cy-20, 14, 14, skin, outline);
    // Face shading
    ctx.fillStyle = skinD; ctx.fillRect(cx-6, cy-14, 12, 4);
    // Eyes (2px each, Stardew style)
    ctx.fillStyle = outline;
    ctx.fillRect(cx-4, cy-17, 3, 3);
    ctx.fillRect(cx+2, cy-17, 3, 3);
    // Eye whites
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx-4, cy-17, 2, 2);
    ctx.fillRect(cx+2, cy-17, 2, 2);
    // Pupils
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(cx-3, cy-16, 1, 1);
    ctx.fillRect(cx+3, cy-16, 1, 1);
    // Mouth
    ctx.fillStyle = skinD; ctx.fillRect(cx-2, cy-12, 4, 1);
    ctx.fillStyle = '#c07050'; ctx.fillRect(cx-1, cy-11, 2, 1);
    // Hair (front flop)
    px(cx-7, cy-21, 14, 5, hair, outline);
    ctx.fillStyle = lighten(hair,18);
    ctx.fillRect(cx-5, cy-20, 3, 2);
    ctx.fillStyle = hair; ctx.fillRect(cx-7, cy-18, 3, 2); ctx.fillRect(cx+5, cy-18, 2, 2);

  } else if (f === 'N') {
    // Boots
    px(cx-6, cy+8+leg, 5, 6, boots, outline);
    px(cx+2, cy+8-leg, 5, 6, boots, outline);
    // Pants
    px(cx-6, cy+4, 5, 5, pants, outline);
    px(cx+2, cy+4, 5, 5, pants, outline);
    // Body
    px(cx-7, cy-5, 14, 10, shirt, outline);
    ctx.fillStyle = darken(shirt,14); ctx.fillRect(cx-1, cy-4, 2, 8);
    // Arms
    px(cx-12, cy-4, 5, 8, shirt, outline);
    px(cx+7,  cy-4, 5, 8, shirt, outline);
    ctx.fillStyle = skin; ctx.fillRect(cx-11, cy+2, 3, 3);
    ctx.fillStyle = skin; ctx.fillRect(cx+8,  cy+2, 3, 3);
    // Neck
    px(cx-2, cy-8, 4, 4, skin, outline);
    // Head (back view — just hair)
    px(cx-7, cy-20, 14, 14, skinD, outline);
    px(cx-7, cy-21, 14, 9, hair, outline);
    // Hair highlight
    ctx.fillStyle = lighten(hair, 22); ctx.fillRect(cx-4, cy-20, 4, 2);

  } else {
    // E or W
    const d = f === 'E' ? 1 : -1;
    // Boot
    px(cx+d*1,  cy+8+leg, 6*d, 6, boots, outline);
    px(cx-d*4,  cy+8-leg, 6*d, 6, bootsD, outline);
    ctx.fillStyle = lighten(boots,18); ctx.fillRect(cx+d*2, cy+9+leg, 2, 2);
    // Pants
    px(cx+d*1,  cy+4, 6*d, 5, pants, outline);
    px(cx-d*5,  cy+4, 6*d, 5, darken(pants,12), outline);
    // Body
    px(cx-6, cy-5, 12, 10, shirt, outline);
    ctx.fillStyle = d > 0 ? darken(shirt,20) : lighten(shirt,10);
    ctx.fillRect(cx+(d>0?2:-6), cy-4, 4, 8);
    // Far arm
    px(cx-d*7, cy-4, 5*d, 7, darken(shirt,18), outline);
    // Near arm
    px(cx+d*6, cy-4, 5*d, 7, shirt, outline);
    ctx.fillStyle = skin; ctx.fillRect(cx+d*6, cy+1, 4*d, 3);
    // Neck
    px(cx+d*1, cy-8, 4, 4, skin, outline);
    // Head
    px(cx-5+d*2, cy-20, 12, 14, skin, outline);
    ctx.fillStyle = skinD; ctx.fillRect(cx-4+d*2, cy-14, 10, 3);
    // Eye (side profile — one eye)
    const ex = cx + d*4;
    ctx.fillStyle = outline; ctx.fillRect(ex, cy-17, 3, 3);
    ctx.fillStyle = '#fff';  ctx.fillRect(ex, cy-17, 2, 2);
    ctx.fillStyle = '#2a1a0a'; ctx.fillRect(ex+d, cy-16, 1, 1);
    // Nose bump
    ctx.fillStyle = skinD; ctx.fillRect(cx+d*7, cy-13, 2, 2);
    // Mouth
    ctx.fillStyle = '#c07050'; ctx.fillRect(cx+d*6, cy-11, 2, 1);
    // Hair
    px(cx-5+d*2, cy-21, 12, 6, hair, outline);
    ctx.fillStyle = lighten(hair,18); ctx.fillRect(cx-3+d*2, cy-20, 4, 2);
    // Hair side tuft
    ctx.fillStyle = hair; ctx.fillRect(cx+d*7, cy-18, 2*d, 4);
  }
}

// ── Items ─────────────────────────────────────────────────────────────────────
function drawItemShape(shape, x, y, color, scale) {
  const sc = scale || 1;
  const s  = Math.round(GX * 1.2 * sc);
  const ol = '#1a0e04'; // dark outline
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  switch (shape) {

    case 'sword': {
      // Pixel-art sword — Stardew style (clean, readable at small size)
      const bw = Math.max(2, s*0.14|0);
      const bx = s/2 - bw/2 | 0;
      // Blade
      const bg = ctx.createLinearGradient(bx, 0, bx+bw, 0);
      bg.addColorStop(0, '#d0d8e8'); bg.addColorStop(0.5, '#f0f4ff'); bg.addColorStop(1, '#9098a8');
      ctx.fillStyle = ol; ctx.fillRect(bx-1, 0, bw+2, s*0.72);
      ctx.fillStyle = bg; ctx.fillRect(bx, 1, bw, s*0.7);
      // Blade tip
      ctx.fillStyle = ol;
      ctx.beginPath(); ctx.moveTo(bx-1, 1); ctx.lineTo(bx+bw+1, 1); ctx.lineTo(s/2, -6); ctx.fill();
      ctx.fillStyle = '#e8ecf8';
      ctx.beginPath(); ctx.moveTo(bx, 2); ctx.lineTo(bx+bw, 2); ctx.lineTo(s/2, -4); ctx.fill();
      // Crossguard
      const gw2 = s*0.72|0, gy2 = s*0.66|0;
      ctx.fillStyle = ol; ctx.fillRect(s/2-gw2/2-1, gy2-1, gw2+2, s*0.12+2);
      ctx.fillStyle = '#c8a030'; ctx.fillRect(s/2-gw2/2, gy2, gw2, s*0.12|0);
      ctx.fillStyle = lighten('#c8a030',22); ctx.fillRect(s/2-gw2/2, gy2, gw2, 2);
      ctx.fillStyle = '#d8b040'; ctx.fillRect(s/2-gw2/2+2, gy2+2, 4, 4); ctx.fillRect(s/2+gw2/2-6, gy2+2, 4, 4);
      // Grip
      const grip = s*0.18|0, gx3 = s/2-4|0;
      ctx.fillStyle = ol; ctx.fillRect(gx3-1, gy2+s*0.12-1, 10, grip+2);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i%2===0 ? '#8b5e3c' : '#6b3e1e';
        ctx.fillRect(gx3, gy2+s*0.12+i*(grip/3), 8, grip/3|0);
      }
      // Pommel
      ctx.fillStyle = ol; ctx.beginPath(); ctx.arc(s/2, gy2+s*0.12+grip+4, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#c8a030'; ctx.beginPath(); ctx.arc(s/2, gy2+s*0.12+grip+4, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e8c050'; ctx.beginPath(); ctx.arc(s/2-1, gy2+s*0.12+grip+3, 2, 0, Math.PI*2); ctx.fill();
      break;
    }

    case 'key': {
      // Pixel key
      const kr = s*0.3|0;
      const kx = s*0.3|0, ky = s*0.32|0;
      // Bow
      ctx.strokeStyle = ol; ctx.lineWidth = s*0.16+2;
      ctx.beginPath(); ctx.arc(kx, ky, kr, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = s*0.16;
      ctx.beginPath(); ctx.arc(kx, ky, kr, 0, Math.PI*2); ctx.stroke();
      // Hole in bow
      ctx.fillStyle = '#1a0e0488';
      ctx.beginPath(); ctx.arc(kx, ky, kr*0.42, 0, Math.PI*2); ctx.fill();
      // Highlight on bow
      ctx.strokeStyle = hexAlpha(lighten(color,50), 0.6); ctx.lineWidth = s*0.07;
      ctx.beginPath(); ctx.arc(kx-kr*0.3, ky-kr*0.3, kr*0.55, Math.PI*1.05, Math.PI*1.55); ctx.stroke();
      // Shaft
      const sx2 = kx+kr, sy2 = ky-s*0.06|0, sw = s*0.45|0, sh = s*0.12|0;
      ctx.fillStyle = ol; ctx.fillRect(sx2-1, sy2-1, sw+2, sh+2);
      ctx.fillStyle = color; ctx.fillRect(sx2, sy2, sw, sh);
      ctx.fillStyle = hexAlpha(lighten(color,40),0.5); ctx.fillRect(sx2, sy2, sw, 2);
      // Teeth
      ctx.fillStyle = ol; ctx.fillRect(sx2+sw*0.3-1, sy2+sh-1, s*0.09+2, s*0.14+2);
      ctx.fillStyle = color; ctx.fillRect(sx2+sw*0.3, sy2+sh, s*0.09|0, s*0.14|0);
      ctx.fillStyle = ol; ctx.fillRect(sx2+sw*0.58-1, sy2+sh-1, s*0.09+2, s*0.1+2);
      ctx.fillStyle = color; ctx.fillRect(sx2+sw*0.58, sy2+sh, s*0.09|0, s*0.1|0);
      break;
    }

    case 'bridge': {
      // Wooden plank bridge (top-down)
      const plankH = s*0.17|0;
      const railW  = s*0.1|0;
      // Rails
      ctx.fillStyle = ol; ctx.fillRect(0, 0, railW+1, s); ctx.fillRect(s-railW-1, 0, railW+1, s);
      ctx.fillStyle = '#6b3e1e'; ctx.fillRect(0, 0, railW, s); ctx.fillRect(s-railW, 0, railW, s);
      ctx.fillStyle = '#8b5e3c'; ctx.fillRect(1, 0, 2, s); ctx.fillRect(s-railW+1, 0, 2, s);
      // Planks
      const plankColors = ['#c8924a','#a07238','#d8a25a'];
      for (let i = 0; i < 5; i++) {
        const py = i*(s/5)|0;
        ctx.fillStyle = ol; ctx.fillRect(railW, py, s-railW*2, plankH+1);
        ctx.fillStyle = plankColors[i%3]; ctx.fillRect(railW, py, s-railW*2, plankH);
        ctx.fillStyle = hexAlpha(lighten(plankColors[i%3],25),0.5);
        ctx.fillRect(railW, py, s-railW*2, 2);
        // Nail dots
        ctx.fillStyle = '#5a3010';
        ctx.fillRect(railW+3, py+plankH/2-1, 2, 2);
        ctx.fillRect(s-railW-5, py+plankH/2-1, 2, 2);
      }
      break;
    }

    case 'chalice': {
      // Animated golden glow
      const pulse = 0.18 + 0.1*Math.sin(Date.now()/380);
      const glow  = ctx.createRadialGradient(s/2, s/2, s*0.05, s/2, s/2, s*0.9);
      glow.addColorStop(0, `rgba(255,220,80,${pulse})`);
      glow.addColorStop(1, 'rgba(255,180,0,0)');
      ctx.fillStyle = glow; ctx.fillRect(-s*0.5, -s*0.5, s*2, s*2);

      // Cup body — gradient gold
      const cg = ctx.createLinearGradient(s*0.1, 0, s*0.9, 0);
      cg.addColorStop(0, '#a07820'); cg.addColorStop(0.25, '#e8c040');
      cg.addColorStop(0.5, '#f8e070'); cg.addColorStop(0.75, '#e8c040'); cg.addColorStop(1, '#a07820');
      // Outline first
      ctx.fillStyle = ol;
      ctx.beginPath();
      ctx.moveTo(s*0.1-1, s*0.07); ctx.lineTo(s*0.9+1, s*0.07);
      ctx.lineTo(s*0.72, s*0.6); ctx.lineTo(s*0.64, s*0.6); ctx.lineTo(s*0.64, s*0.78);
      ctx.lineTo(s*0.8,  s*0.78); ctx.lineTo(s*0.8,  s*0.94); ctx.lineTo(s*0.2,  s*0.94);
      ctx.lineTo(s*0.2,  s*0.78); ctx.lineTo(s*0.36, s*0.78); ctx.lineTo(s*0.36, s*0.6);
      ctx.lineTo(s*0.28, s*0.6);  ctx.closePath(); ctx.fill();
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.moveTo(s*0.12, s*0.08); ctx.lineTo(s*0.88, s*0.08);
      ctx.lineTo(s*0.7,  s*0.58); ctx.lineTo(s*0.62, s*0.58); ctx.lineTo(s*0.62, s*0.76);
      ctx.lineTo(s*0.78, s*0.76); ctx.lineTo(s*0.78, s*0.92); ctx.lineTo(s*0.22, s*0.92);
      ctx.lineTo(s*0.22, s*0.76); ctx.lineTo(s*0.38, s*0.76); ctx.lineTo(s*0.38, s*0.58);
      ctx.lineTo(s*0.3,  s*0.58); ctx.closePath(); ctx.fill();
      // Rim highlight
      ctx.fillStyle = 'rgba(255,255,220,0.6)'; ctx.fillRect(s*0.14, s*0.08, s*0.72, 3);
      // Gems
      const gems = [{x:0.3,y:0.22,c:'#ff4444'},{x:0.5,y:0.18,c:'#44aaff'},{x:0.7,y:0.22,c:'#44ff88'}];
      for (const g of gems) {
        ctx.fillStyle = ol; ctx.beginPath(); ctx.arc(s*g.x, s*g.y, s*0.065, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = g.c; ctx.beginPath(); ctx.arc(s*g.x, s*g.y, s*0.055, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(s*g.x-1, s*g.y-1, s*0.022, 0, Math.PI*2); ctx.fill();
      }
      // Sparkles
      const now = Date.now();
      for (const sp of [{ox:-0.35,oy:-0.35,ph:0},{ox:1.0,oy:-0.2,ph:1.3},{ox:-0.2,oy:1.0,ph:2.5},{ox:1.05,oy:0.9,ph:0.8}]) {
        const a = 0.5 + 0.5*Math.sin(now/280 + sp.ph);
        if (a < 0.15) continue;
        ctx.save(); ctx.globalAlpha = a;
        ctx.fillStyle = '#fffbe0';
        const spx = s*sp.ox+s*0.5, spy = s*sp.oy+s*0.5, sr = s*0.065;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const ang = (i/8)*Math.PI*2;
          const rr = i%2===0 ? sr : sr*0.3;
          i===0 ? ctx.moveTo(spx+Math.cos(ang)*rr, spy+Math.sin(ang)*rr)
                : ctx.lineTo(spx+Math.cos(ang)*rr, spy+Math.sin(ang)*rr);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
      break;
    }

    case 'magnet': {
      const arc2 = s*0.34;
      ctx.lineWidth = s*0.22;
      ctx.lineCap = 'round';
      // Outline
      ctx.strokeStyle = ol; ctx.lineWidth = s*0.22+3;
      ctx.beginPath(); ctx.arc(s*0.5, s*0.54, arc2, Math.PI, 0); ctx.stroke();
      // Red pole
      ctx.strokeStyle = '#cc2020'; ctx.lineWidth = s*0.22;
      ctx.beginPath(); ctx.arc(s*0.5, s*0.54, arc2, Math.PI, Math.PI*1.5); ctx.stroke();
      // Blue pole
      ctx.strokeStyle = '#2040cc'; ctx.lineWidth = s*0.22;
      ctx.beginPath(); ctx.arc(s*0.5, s*0.54, arc2, Math.PI*1.5, 0); ctx.stroke();
      // Caps
      const capW = s*0.22|0, capH = s*0.34|0;
      ctx.fillStyle = ol;
      ctx.fillRect(s*0.12-2, s*0.5-1, capW+4, capH+2); ctx.fillRect(s*0.66-2, s*0.5-1, capW+4, capH+2);
      ctx.fillStyle = '#cc2020'; ctx.fillRect(s*0.12, s*0.5, capW, capH);
      ctx.fillStyle = '#2040cc'; ctx.fillRect(s*0.66, s*0.5, capW, capH);
      ctx.fillStyle = '#ff6060'; ctx.fillRect(s*0.14, s*0.52, 4, 4);
      ctx.fillStyle = '#6080ff'; ctx.fillRect(s*0.68, s*0.52, 4, 4);
      ctx.fillStyle = '#fff'; ctx.font = `bold ${s*0.2|0}px monospace`; ctx.textAlign = 'center';
      ctx.fillText('N', s*0.23, s*0.88); ctx.fillText('S', s*0.77, s*0.88);
      break;
    }

    case 'dot': {
      // Glowing orb
      const og = ctx.createRadialGradient(s*0.4, s*0.38, 0, s*0.5, s*0.5, s*0.38);
      og.addColorStop(0, '#ffffff'); og.addColorStop(0.4, '#c0d8ff'); og.addColorStop(1, 'rgba(100,140,255,0.3)');
      ctx.fillStyle = ol; ctx.beginPath(); ctx.arc(s*0.5, s*0.5, s*0.36, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = og;  ctx.beginPath(); ctx.arc(s*0.5, s*0.5, s*0.34, 0, Math.PI*2); ctx.fill();
      break;
    }

    default:
      ctx.fillStyle = color; ctx.fillRect(0, 0, s, s);
  }
  ctx.restore();
}

function drawItems(room) {
  for (const id of roomItems[room]) {
    const pos  = getItemPos(room, id);
    const item = ITEMS[id];
    drawShadow(pos.x + GX*0.6, pos.y + GX*1.1, GX*0.42, GX*0.14);
    drawItemShape(item.shape, pos.x, pos.y, item.color);
  }
}

function drawCarried() {
  if (!carrying) return;
  const item = ITEMS[carrying];
  drawItemShape(item.shape, player.x + GX*1.0, player.y - GX*0.8, item.color, 0.68);
}

// ── Dragon (Stardew-style creature) ───────────────────────────────────────────
function drawDragon(d) {
  if (!d.alive || d.room !== player.room) return;

  const s        = GX * 2.2;
  const breathe  = Math.sin(Date.now()/240) * 1.5;
  const legAnim  = Math.sin(Date.now()/140) * 3.5;
  const chasing  = (carrying !== 'sword' || !d.fearsSword);
  const jawOpen  = chasing ? s*0.13 : s*0.03;
  const ol       = '#1a0e04';

  // Derived colors
  const base  = d.color;
  const light = lighten(base, 35);
  const dark  = darken(base, 30);
  const belly = lighten(base, 55);

  ctx.save();
  ctx.translate(Math.round(d.x), Math.round(d.y));

  drawShadow(s*0.42, s*0.96, s*0.38, s*0.09);

  // Tail segments
  const tailSegs = [{x:s*0.04,y:s*0.58,rx:s*0.13,ry:s*0.1},{x:-s*0.1,y:s*0.52,rx:s*0.1,ry:s*0.08},{x:-s*0.2,y:s*0.44,rx:s*0.07,ry:s*0.06}];
  for (const ts of tailSegs) {
    ctx.fillStyle = ol; ctx.beginPath(); ctx.ellipse(ts.x, ts.y, ts.rx+1, ts.ry+1, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(ts.x, ts.y, ts.rx, ts.ry, 0, 0, Math.PI*2); ctx.fill();
  }
  // Tail tip
  ctx.fillStyle = ol;
  ctx.beginPath(); ctx.moveTo(-s*0.2,s*0.44); ctx.lineTo(-s*0.3,s*0.36); ctx.lineTo(-s*0.14,s*0.4); ctx.fill();
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.moveTo(-s*0.2,s*0.44); ctx.lineTo(-s*0.28,s*0.37); ctx.lineTo(-s*0.15,s*0.41); ctx.fill();

  // Body outline + fill
  ctx.fillStyle = ol;
  ctx.beginPath(); ctx.ellipse(s*0.4, s*0.52+breathe*0.28, s*0.35+1, s*0.29+1, 0, 0, Math.PI*2); ctx.fill();
  const bodyG = ctx.createRadialGradient(s*0.34, s*0.42, 0, s*0.4, s*0.52, s*0.35);
  bodyG.addColorStop(0, light); bodyG.addColorStop(1, base);
  ctx.fillStyle = bodyG;
  ctx.beginPath(); ctx.ellipse(s*0.4, s*0.52+breathe*0.28, s*0.35, s*0.29, 0, 0, Math.PI*2); ctx.fill();

  // Belly
  ctx.fillStyle = hexAlpha(belly, 0.65);
  ctx.beginPath(); ctx.ellipse(s*0.4, s*0.56+breathe*0.2, s*0.19, s*0.15, 0, 0, Math.PI*2); ctx.fill();
  // Belly scales
  ctx.fillStyle = hexAlpha(darken(belly,15), 0.45);
  for (let si = 0; si < 3; si++) {
    ctx.beginPath();
    ctx.arc(s*(0.3+si*0.1), s*0.56+breathe*0.2, s*0.04, 0, Math.PI*2); ctx.fill();
  }

  // Back spines
  ctx.fillStyle = ol;
  for (let i = 0; i < 4; i++) {
    const spx = s*(0.18+i*0.1), spy = s*0.27-i*2;
    ctx.beginPath(); ctx.moveTo(spx-3, spy); ctx.lineTo(spx+s*0.04, spy-s*0.12+i*2); ctx.lineTo(spx+s*0.08+3, spy); ctx.fill();
  }
  ctx.fillStyle = dark;
  for (let i = 0; i < 4; i++) {
    const spx = s*(0.18+i*0.1), spy = s*0.27-i*2;
    ctx.beginPath(); ctx.moveTo(spx-1, spy); ctx.lineTo(spx+s*0.04, spy-s*0.12+i*2+2); ctx.lineTo(spx+s*0.08+1, spy); ctx.fill();
  }

  // Legs
  ctx.fillStyle = ol;
  ctx.fillRect(s*0.22-1, s*0.68-1, s*0.12+2, s*0.22+legAnim+2);
  ctx.fillRect(s*0.44-1, s*0.68-1, s*0.12+2, s*0.22-legAnim+2);
  ctx.fillStyle = dark;
  ctx.fillRect(s*0.22, s*0.68, s*0.12, s*0.22+legAnim);
  ctx.fillRect(s*0.44, s*0.68, s*0.12, s*0.22-legAnim);
  // Foot pads
  ctx.fillStyle = ol;
  ctx.beginPath(); ctx.ellipse(s*0.28, s*0.9+legAnim,  s*0.1, s*0.06, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.5,  s*0.9-legAnim,  s*0.1, s*0.06, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = darken(dark,10);
  ctx.beginPath(); ctx.ellipse(s*0.28, s*0.9+legAnim,  s*0.09, s*0.055, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s*0.5,  s*0.9-legAnim,  s*0.09, s*0.055, 0, 0, Math.PI*2); ctx.fill();
  // Claws
  ctx.fillStyle = '#e8e0d0';
  for (let c = 0; c < 3; c++) {
    ctx.beginPath(); ctx.moveTo(s*(0.2+c*0.04), s*0.9+legAnim);  ctx.lineTo(s*(0.18+c*0.04), s*0.96+legAnim);  ctx.lineTo(s*(0.23+c*0.04), s*0.93+legAnim);  ctx.fill();
    ctx.beginPath(); ctx.moveTo(s*(0.42+c*0.04), s*0.9-legAnim); ctx.lineTo(s*(0.40+c*0.04), s*0.96-legAnim); ctx.lineTo(s*(0.45+c*0.04), s*0.93-legAnim); ctx.fill();
  }

  // Neck
  ctx.fillStyle = ol;
  ctx.beginPath(); ctx.moveTo(s*0.58,s*0.34); ctx.lineTo(s*0.7,s*0.16); ctx.lineTo(s*0.84,s*0.22); ctx.lineTo(s*0.68,s*0.44); ctx.fill();
  ctx.fillStyle = base;
  ctx.beginPath(); ctx.moveTo(s*0.6,s*0.35); ctx.lineTo(s*0.72,s*0.18); ctx.lineTo(s*0.82,s*0.23); ctx.lineTo(s*0.66,s*0.43); ctx.fill();
  ctx.fillStyle = hexAlpha(light,0.3);
  ctx.beginPath(); ctx.moveTo(s*0.64,s*0.38); ctx.lineTo(s*0.74,s*0.2); ctx.lineTo(s*0.76,s*0.22); ctx.lineTo(s*0.66,s*0.42); ctx.fill();

  // Head
  ctx.fillStyle = ol;
  ctx.beginPath(); ctx.ellipse(s*0.8, s*0.25, s*0.22+1, s*0.18+1, -0.15, 0, Math.PI*2); ctx.fill();
  const headG = ctx.createRadialGradient(s*0.74, s*0.2, 0, s*0.8, s*0.25, s*0.22);
  headG.addColorStop(0, light); headG.addColorStop(1, base);
  ctx.fillStyle = headG;
  ctx.beginPath(); ctx.ellipse(s*0.8, s*0.25, s*0.22, s*0.18, -0.15, 0, Math.PI*2); ctx.fill();

  // Upper jaw
  ctx.fillStyle = ol;
  ctx.beginPath(); ctx.moveTo(s*0.65,s*0.3); ctx.lineTo(s*1.04,s*0.28); ctx.lineTo(s*1.04,s*0.32); ctx.lineTo(s*0.65,s*0.36); ctx.fill();
  ctx.fillStyle = base;
  ctx.beginPath(); ctx.moveTo(s*0.67,s*0.31); ctx.lineTo(s*1.02,s*0.29); ctx.lineTo(s*1.02,s*0.31); ctx.lineTo(s*0.67,s*0.35); ctx.fill();
  // Lower jaw
  ctx.fillStyle = ol;
  ctx.beginPath(); ctx.moveTo(s*0.68,s*0.35); ctx.lineTo(s*1.0,s*0.33); ctx.lineTo(s*1.0,s*0.33+jawOpen); ctx.lineTo(s*0.68,s*0.37+jawOpen*0.6); ctx.fill();
  ctx.fillStyle = darken(base,12);
  ctx.beginPath(); ctx.moveTo(s*0.7,s*0.36); ctx.lineTo(s*0.98,s*0.34); ctx.lineTo(s*0.98,s*0.34+jawOpen*0.85); ctx.lineTo(s*0.7,s*0.36+jawOpen*0.55); ctx.fill();

  if (chasing && jawOpen > s*0.06) {
    // Mouth interior
    ctx.fillStyle = '#c03020';
    ctx.beginPath(); ctx.moveTo(s*0.72,s*0.35); ctx.lineTo(s*0.97,s*0.33); ctx.lineTo(s*0.97,s*0.33+jawOpen*0.7); ctx.lineTo(s*0.72,s*0.35+jawOpen*0.5); ctx.fill();
    // Tongue
    ctx.fillStyle = '#e04050';
    ctx.beginPath(); ctx.moveTo(s*0.92,s*0.34+jawOpen*0.4); ctx.lineTo(s*1.04,s*0.3+jawOpen*0.2); ctx.lineTo(s*1.07,s*0.33+jawOpen*0.3); ctx.lineTo(s*1.04,s*0.36+jawOpen*0.4); ctx.lineTo(s*0.92,s*0.37+jawOpen*0.45); ctx.fill();
    // Teeth
    ctx.fillStyle = '#f0ece8';
    for (let t2 = 0; t2 < 4; t2++) {
      const tx2 = s*(0.72+t2*0.07);
      ctx.fillStyle = ol; ctx.beginPath(); ctx.moveTo(tx2,s*0.35); ctx.lineTo(tx2+s*0.025,s*0.3); ctx.lineTo(tx2+s*0.055,s*0.35); ctx.fill();
      ctx.fillStyle = '#f0ece8'; ctx.beginPath(); ctx.moveTo(tx2+1,s*0.35); ctx.lineTo(tx2+s*0.025,s*0.32); ctx.lineTo(tx2+s*0.05,s*0.35); ctx.fill();
    }
  }

  // Eye
  const eyeColor = chasing ? '#e85010' : '#4070d0';
  ctx.fillStyle = ol; ctx.beginPath(); ctx.ellipse(s*0.86, s*0.2, s*0.065+1, s*0.072+1, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(s*0.86, s*0.2, s*0.065, s*0.072, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = eyeColor; ctx.beginPath(); ctx.ellipse(s*0.87, s*0.2, s*0.042, s*0.055, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#080410'; ctx.beginPath(); ctx.ellipse(s*0.875, s*0.2, s*0.024, s*0.032, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(s*0.865, s*0.19, s*0.014, 0, Math.PI*2); ctx.fill();

  // Brow ridge
  ctx.fillStyle = dark; ctx.fillRect(s*0.8, s*0.14, s*0.12, 3);

  // Horn
  ctx.fillStyle = ol;
  ctx.beginPath(); ctx.moveTo(s*0.77,s*0.12); ctx.lineTo(s*0.8,s*-0.04); ctx.lineTo(s*0.87,s*0.12); ctx.fill();
  ctx.fillStyle = darken(base,35);
  ctx.beginPath(); ctx.moveTo(s*0.78,s*0.12); ctx.lineTo(s*0.8,s*-0.02); ctx.lineTo(s*0.86,s*0.12); ctx.fill();
  ctx.fillStyle = lighten(darken(base,35), 20); ctx.fillRect(s*0.8, s*0.04, 2, s*0.06);

  // Name label
  ctx.fillStyle = 'rgba(10,6,2,0.7)';
  const lw = ctx.measureText(d.name).width + 10;
  ctx.font = `bold ${Math.round(s*0.12)}px monospace`;
  const lw2 = ctx.measureText(d.name).width + 10;
  ctx.beginPath(); ctx.roundRect(s*0.44-lw2/2, -s*0.12, lw2, s*0.15, 3); ctx.fill();
  ctx.fillStyle = hexAlpha(light, 0.9);
  ctx.textAlign = 'center';
  ctx.fillText(d.name, s*0.44, -s*0.01);

  if (d.carrying) {
    const ic = ITEMS[d.carrying].color;
    ctx.fillStyle = ol; ctx.beginPath(); ctx.roundRect(s*0.18, -s*0.28, s*0.2, s*0.2, 3); ctx.fill();
    ctx.fillStyle = ic; ctx.beginPath(); ctx.roundRect(s*0.2, -s*0.26, s*0.16, s*0.16, 2); ctx.fill();
  }

  ctx.restore();
}

// ── Minimap ───────────────────────────────────────────────────────────────────
function drawMinimap() {
  if (!showMinimap) return;
  const mx = W - MM_W - 8, my = 8;

  // Panel — Stardew-style parchment/wood frame
  ctx.fillStyle = 'rgba(18,12,6,0.88)'; ctx.fillRect(mx, my, MM_W, MM_H);
  ctx.fillStyle = '#6b3e1e'; ctx.strokeStyle = '#3a1e08'; ctx.lineWidth = 2;
  ctx.strokeRect(mx+0.5, my+0.5, MM_W-1, MM_H-1);
  ctx.fillStyle = hexAlpha('#c8924a', 0.25); ctx.fillRect(mx+2, my+2, MM_W-4, MM_H-4);

  ctx.fillStyle = '#c8a060'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('MAP', mx+MM_W/2, my+11);

  const ox = mx+MM_PAD, oy = my+MM_PAD+14;

  ctx.lineWidth = 1;
  for (let i = 0; i < rooms.length; i++) {
    if (!visitedRooms.has(i)) continue;
    const [ac, ar] = ROOM_GRID[i];
    const ax = ox+ac*MM_CELL+MM_CELL/2, ay = oy+ar*MM_CELL+MM_CELL/2;
    for (const [dir, j] of Object.entries(rooms[i].exits)) {
      if (!visitedRooms.has(j)) continue;
      const [bc, br] = ROOM_GRID[j];
      const lk = rooms[i].locked[dir];
      ctx.strokeStyle = lk ? (ITEMS[lk]?.color || '#aaa') : '#5a4020';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ox+bc*MM_CELL+MM_CELL/2, oy+br*MM_CELL+MM_CELL/2); ctx.stroke();
    }
  }

  const nodeR = Math.floor(MM_CELL*0.36);
  for (let i = 0; i < rooms.length; i++) {
    const [c, r] = ROOM_GRID[i];
    const rx = ox+c*MM_CELL+MM_CELL/2, ry = oy+r*MM_CELL+MM_CELL/2;
    if (!visitedRooms.has(i)) {
      ctx.fillStyle = '#2a1e14'; ctx.beginPath(); ctx.arc(rx, ry, nodeR*0.5, 0, Math.PI*2); ctx.fill();
      continue;
    }
    ctx.fillStyle = rooms[i].wallColor;
    ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(rx, ry, nodeR, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = i===player.room ? '#f0e0a0' : '#6a5030';
    ctx.lineWidth = i===player.room ? 2 : 1;
    ctx.beginPath(); ctx.arc(rx, ry, nodeR, 0, Math.PI*2); ctx.stroke();
  }

  const [pc, pr] = ROOM_GRID[player.room];
  ctx.fillStyle = '#e85870';
  ctx.beginPath(); ctx.arc(ox+pc*MM_CELL+MM_CELL/2, oy+pr*MM_CELL+MM_CELL/2, 3, 0, Math.PI*2); ctx.fill();

  for (const d of dragons) {
    if (!d.alive || !visitedRooms.has(d.room)) continue;
    const [dc, dr2] = ROOM_GRID[d.room];
    ctx.fillStyle = d.color;
    ctx.beginPath(); ctx.arc(ox+dc*MM_CELL+MM_CELL/2+4, oy+dr2*MM_CELL+MM_CELL/2-4, 2.5, 0, Math.PI*2); ctx.fill();
  }

  ctx.textAlign = 'left';
}

// ── Overlays ──────────────────────────────────────────────────────────────────
function drawOverlays() {
  if (state === 'gameover') {
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,W,H);
    const vg = ctx.createRadialGradient(W/2,H/2,50,W/2,H/2,W*0.7);
    vg.addColorStop(0,'rgba(160,20,10,0)'); vg.addColorStop(1,'rgba(160,20,10,0.5)');
    ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff2000'; ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff4422'; ctx.font = 'bold 42px monospace';
    ctx.fillText('GAME OVER', W/2, H/2-20);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffa090'; ctx.font = '19px monospace';
    ctx.fillText(gameOverMsg, W/2, H/2+16);
    ctx.fillStyle = '#887060'; ctx.font = '13px monospace';
    ctx.fillText('Press R to return to title', W/2, H/2+52);
  }

  if (state === 'win') {
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0,0,W,H);
    const vw = ctx.createRadialGradient(W/2,H/2,30,W/2,H/2,W*0.7);
    vw.addColorStop(0,'rgba(220,180,20,0.22)'); vw.addColorStop(1,'rgba(220,180,20,0)');
    ctx.fillStyle = vw; ctx.fillRect(0,0,W,H);
    ctx.textAlign = 'center';
    ctx.shadowColor = '#f0c020'; ctx.shadowBlur = 24;
    ctx.fillStyle = '#f8d840'; ctx.font = 'bold 48px monospace';
    ctx.fillText('YOU WIN!', W/2, H/2-22);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f0e090'; ctx.font = '20px monospace';
    ctx.fillText('The Enchanted Chalice is returned!', W/2, H/2+18);
    ctx.fillStyle = '#888070'; ctx.font = '13px monospace';
    ctx.fillText('Press R to return to title', W/2, H/2+54);
  }
}
