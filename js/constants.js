// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  black:'#000000', white:'#FFFFFF', red:'#FF0000', cyan:'#00FFFF',
  purple:'#9900FF', green:'#00CC00', blue:'#0000FF', yellow:'#FFFF00',
  orange:'#FF8800', ltblue:'#88CCFF', ltgreen:'#88FF88', pink:'#FF88FF',
  gray:'#888888', ltgray:'#CCCCCC', tan:'#CC8844', gold:'#FFD700'
};

// Stardew-inspired warm earthy palette for rooms
const SDV = {
  // floors
  floorWood:    '#c8a46e',
  floorWoodDk:  '#a07848',
  floorStone:   '#8a8070',
  floorStoneDk: '#6a6055',
  floorGrass:   '#5a9a3c',
  floorGrassDk: '#3e7228',
  floorDirt:    '#9e7248',
  floorDirtDk:  '#7a5230',
  floorCave:    '#4a4050',
  floorCaveDk:  '#362c3e',
  // walls
  wallCastle:   '#7a6850', // warm sandstone
  wallForest:   '#5c7a3c', // mossy green
  wallCave:     '#4a3c58', // dark purple-grey
  wallRed:      '#8a3028', // deep red stone
  wallBlue:     '#2c4870', // deep blue stone
  wallGold:     '#8a7030', // warm gold stone
  wallTeal:     '#2a6458', // teal stone
  wallWhite:    '#8a8878', // pale stone
  // accents
  doorWood:     '#8b5e3c',
  doorFrame:    '#6b3e1e',
  doorDark:     '#2a1a0e',
  torchYellow:  '#ffd060',
  torchOrange:  '#ff8820',
  rug1:         '#8b3a3a',
  rug2:         '#c8a028',
};

// ── Grid ──────────────────────────────────────────────────────────────────────
const GX   = 28;
const COLS = 20;
const ROWS = 15;
const PW   = COLS * GX; // 560
const PH   = ROWS * GX; // 420
const W    = PW;
const H    = PH;

// ── Rooms ─────────────────────────────────────────────────────────────────────
// Each room has: wallColor, floorA, floorB (tile alternates), floorStyle
const rooms = [
  // 0: Yellow Castle (start) — warm wood & sandstone
  { name:'Yellow Castle',
    wallColor: SDV.wallGold, floorA: SDV.floorWood, floorB: SDV.floorWoodDk, floorStyle:'wood',
    color: '#d4a820',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ E:1 }, locked:{}, items:[] },
  // 1: Field — grassy outdoor
  { name:'Field',
    wallColor: SDV.wallForest, floorA: SDV.floorGrass, floorB: SDV.floorGrassDk, floorStyle:'grass',
    color: '#5a9a3c',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ W:0, E:2, N:5 }, locked:{}, items:[] },
  // 2: Blue Maze — blue stone dungeon
  { name:'Blue Maze',
    wallColor: SDV.wallBlue, floorA: SDV.floorCave, floorB: SDV.floorCaveDk, floorStyle:'stone',
    color: '#3a6aaa',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15},
            {x:3,y:2,w:6,h:1},{x:3,y:2,w:1,h:5},{x:9,y:2,w:1,h:3},{x:3,y:7,w:7,h:1},
            {x:12,y:4,w:6,h:1},{x:12,y:4,w:1,h:4},{x:18,y:4,w:1,h:4},{x:12,y:8,w:6,h:1},
            {x:5,y:10,w:8,h:1},{x:5,y:10,w:1,h:3},{x:13,y:10,w:1,h:3} ],
    exits:{ W:1, E:3, S:7 }, locked:{}, items:[] },
  // 3: Copper Room — warm orange stone
  { name:'Copper Room',
    wallColor: '#7a4e28', floorA: SDV.floorDirt, floorB: SDV.floorDirtDk, floorStyle:'dirt',
    color: '#c87830',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ W:2, N:8 }, locked:{}, items:['copperKey'] },
  // 4: Gold Castle — rich golden hall
  { name:'Gold Castle',
    wallColor: SDV.wallGold, floorA: SDV.floorWood, floorB: SDV.floorWoodDk, floorStyle:'wood',
    color: '#c8a020',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ S:0 }, locked:{ S:'goldKey' }, items:['chalice'] },
  // 5: North Field — outdoor grass
  { name:'North Field',
    wallColor: SDV.wallForest, floorA: SDV.floorGrass, floorB: SDV.floorGrassDk, floorStyle:'grass',
    color: '#3e8a28',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ S:1, E:6, N:9 }, locked:{}, items:[] },
  // 6: Jade Room — teal stone
  { name:'Jade Room',
    wallColor: SDV.wallTeal, floorA: '#3a6858', floorB: '#2c5045', floorStyle:'stone',
    color: '#38a878',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ W:5 }, locked:{}, items:['jadeKey'] },
  // 7: Catacombs — dark cave
  { name:'Catacombs',
    wallColor: SDV.wallCave, floorA: SDV.floorCave, floorB: SDV.floorCaveDk, floorStyle:'stone',
    color: '#5a5068',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15},
            {x:2,y:3,w:16,h:1},{x:2,y:3,w:1,h:4},{x:18,y:3,w:1,h:4},{x:2,y:7,w:16,h:1},
            {x:2,y:11,w:16,h:1},{x:2,y:11,w:1,h:2},{x:18,y:11,w:1,h:2} ],
    exits:{ N:2, S:11, W:10 }, locked:{}, items:[] },
  // 8: Gold Key Room — sandstone hall
  { name:'Gold Key Room',
    wallColor: SDV.wallCastle, floorA: SDV.floorWood, floorB: SDV.floorWoodDk, floorStyle:'wood',
    color: '#c8a020',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ S:3, E:12 }, locked:{ E:'copperKey' }, items:['goldKey'] },
  // 9: Northwest Pass — teal outdoor pass
  { name:'Northwest Pass',
    wallColor: SDV.wallTeal, floorA: SDV.floorGrass, floorB: SDV.floorGrassDk, floorStyle:'grass',
    color: '#2a8878',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ S:5, E:13 }, locked:{}, items:[] },
  // 10: Sword Chamber — pale stone armory
  { name:'Sword Chamber',
    wallColor: SDV.wallWhite, floorA: SDV.floorStone, floorB: SDV.floorStoneDk, floorStyle:'stone',
    color: '#8a8878',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ E:7 }, locked:{}, items:['sword'] },
  // 11: Red Labyrinth — red stone maze
  { name:'Red Labyrinth',
    wallColor: SDV.wallRed, floorA: SDV.floorCave, floorB: '#3a2028', floorStyle:'stone',
    color: '#9a3028',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15},
            {x:4,y:2,w:1,h:10},{x:8,y:2,w:1,h:5},{x:8,y:9,w:1,h:4},
            {x:12,y:4,w:1,h:7},{x:16,y:2,w:1,h:10} ],
    exits:{ N:7, E:14 }, locked:{}, items:[] },
  // 12: White Castle — bright castle hall
  { name:'White Castle',
    wallColor: SDV.wallCastle, floorA: SDV.floorWood, floorB: SDV.floorWoodDk, floorStyle:'wood',
    color: '#b0a890',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ W:8 }, locked:{ W:'jadeKey' }, items:['bridge'] },
  // 13: Dragon Lair — deep red cave
  { name:'Dragon Lair',
    wallColor: SDV.wallRed, floorA: '#3a1818', floorB: '#2a1010', floorStyle:'stone',
    color: '#882020',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ W:9, S:14 }, locked:{}, items:[] },
  // 14: East Keep — purple stone
  { name:'East Keep',
    wallColor: '#5a3878', floorA: '#3a2850', floorB: '#2c1e40', floorStyle:'stone',
    color: '#7a4898',
    walls:[ {x:0,y:0,w:20,h:1},{x:0,y:14,w:20,h:1},{x:0,y:0,w:1,h:15},{x:19,y:0,w:1,h:15} ],
    exits:{ W:11, N:13 }, locked:{}, items:['magnet'] },
];

// ── Items ─────────────────────────────────────────────────────────────────────
const ITEMS = {
  sword:     { name:'Sword',      color:'#c8d8f0', shape:'sword'   },
  goldKey:   { name:'Gold Key',   color:'#f0c030', shape:'key'     },
  copperKey: { name:'Copper Key', color:'#d07830', shape:'key'     },
  jadeKey:   { name:'Jade Key',   color:'#40c880', shape:'key'     },
  bridge:    { name:'Bridge',     color:'#c8924a', shape:'bridge'  },
  chalice:   { name:'Chalice',    color:'#f0c030', shape:'chalice' },
  magnet:    { name:'Magnet',     color:'#80b8f0', shape:'magnet'  },
  dot:       { name:'Dot',        color:'#f0f0ff', shape:'dot'     },
};

// ── Dragon definitions ────────────────────────────────────────────────────────
const DRAGON_DEFS = [
  { name:'Yorgle',  color:'#e8c820', homeRoom:13, fearsSword:true,  speed:1.5 },
  { name:'Grundle', color:'#48b840', homeRoom:7,  fearsSword:false, speed:1.2 },
  { name:'Rhindle', color:'#d83820', homeRoom:11, fearsSword:true,  speed:1.8 },
];

// ── Minimap layout ────────────────────────────────────────────────────────────
const ROOM_GRID = [
  [2,3],[3,3],[4,3],[5,3],[2,2],[3,2],[4,2],[4,4],
  [5,2],[3,1],[3,4],[4,5],[6,2],[3,0],[4,5.8],
];
const MM_CELL = 14;
const MM_PAD  = 6;
const MM_COLS = 8;
const MM_ROWS = 7;
const MM_W = MM_COLS * MM_CELL + MM_PAD * 2;
const MM_H = MM_ROWS * MM_CELL + MM_PAD * 2 + 14;
