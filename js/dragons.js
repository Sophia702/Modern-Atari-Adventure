// ── Dragon AI ─────────────────────────────────────────────────────────────────
function updateDragon(d) {
  if (!d.alive) return;
  d.timer--;

  const hasSword  = carrying === 'sword';
  const sameRoom  = d.room === player.room;

  if (sameRoom && hasSword && d.fearsSword) {
    // Flee
    const dx = d.x - player.x, dy = d.y - player.y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    d.x = Math.max(GX, Math.min(PW-GX*2, d.x + (dx/len)*d.speed*1.5));
    d.y = Math.max(GX, Math.min(PH-GX*2, d.y + (dy/len)*d.speed*1.5));
    return;
  }

  if (sameRoom) {
    // Chase player
    const dx = player.x - d.x, dy = player.y - d.y;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    d.x += (dx/len) * d.speed;
    d.y += (dy/len) * d.speed;

    if (rectOverlap(d.x, d.y, GX*1.5, GX*1.5, player.x, player.y, player.w, player.h)) {
      if (d.carrying) { roomItems[d.room].push(d.carrying); d.carrying = null; }
      gameOverMsg = `${d.name} ate you!`;
      state = 'gameover';
    }

    if (hasSword && rectOverlap(player.x, player.y, player.w, player.h, d.x, d.y, GX*1.5, GX*1.5)) {
      d.alive = false;
      if (d.carrying) { roomItems[d.room].push(d.carrying); d.carrying = null; }
    }
  } else {
    if (d.timer <= 0) {
      d.timer = 60 + Math.random() * 120;
      if (Math.random() < 0.3) {
        d.room = player.room;
        d.x = PW/2; d.y = PH/2;
      } else {
        d.targetX = GX + Math.random() * (PW - GX*3);
        d.targetY = GX + Math.random() * (PH - GX*3);
      }
    }
    if (d.targetX !== undefined) {
      const dx = d.targetX - d.x, dy = d.targetY - d.y;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      if (len > 2) { d.x += (dx/len)*d.speed*0.5; d.y += (dy/len)*d.speed*0.5; }
    }
    const items = roomItems[d.room];
    if (items.length && !d.carrying && Math.random() < 0.005) d.carrying = items.pop();
  }
}
