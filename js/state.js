// ── Mutable game state ────────────────────────────────────────────────────────
let state       = 'title'; // 'title' | 'playing' | 'gameover' | 'win'
let gameNumber  = 1;
let showNames   = false;
let showMinimap = true;
let visitedRooms = new Set();
let won         = false;
let gameOverMsg = '';

let player;        // { x, y, room, w, h, facing }
let carrying;      // item id string or null
let dragons;       // array of dragon objects
let roomItems;     // roomIndex -> [itemId, ...]
let flashTimer  = 0;
let stepCount   = 0; // drives walk animation
