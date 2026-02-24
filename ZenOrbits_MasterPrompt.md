# ZEN ORBITS: Castles Fall. Gravity Remains.
## MASTER FULL-STACK DEVELOPER PROMPT
### Architecture, Repository, and Workflow Specification
---

> **Version:** 1.0.0  
> **Tone:** Meditative precision. No ambiguity. No hardcoded values.  
> **Aesthetic directive:** Cosmic, smooth, chunky destruction. Flow, not punishment.  
> **Platform:** Mobile-first SPA. GitHub Pages. Zero server dependencies.

---

## PART 0: ORIENTATION

You are building **Zen Orbits** — a 2D mobile-first brick-breaker where the paddle is a moon, the ball is a comet, and every level destroys a procedurally-structured sky castle. The game is meditative, not twitchy. Destruction is spectacle. Physics is deterministic. Rendering is a pure function of state.

This document is the source of truth for the entire development team. No deviation from the architecture described herein is permitted without lead developer approval.

---

## PART 1: CORE CONCEPT (NON-NEGOTIABLE)

The game achieves its identity through four pillars:

**1. PHYSICAL COHERENCE** — The comet behaves predictably. Players learn the system; the system does not betray them.

**2. VISUAL SPECTACLE** — Destruction produces chunky, weighty, earned crumble. Particles, screen shake, and glows make each brick feel like a small event.

**3. FLOW STATE** — Difficulty ramps gently. Bonuses are abundant. Game over is rare. The player is always in motion.

**4. ARCHITECTURAL PURITY** — Game logic never touches the DOM. The renderer never writes state. All behaviors are parameterized, not hardcoded.

---

## PART 2: REPOSITORY STRUCTURE

```
zen-orbits/
├── index.html                    # SPA entry — single deployable file for MVP
├── README.md                     # Public documentation
├── PROMPT.md                     # This document (internal spec)
├── LICENSE
│
├── src/
│   ├── engine/
│   │   ├── constants.js          # All physics constants, layout fractions
│   │   ├── state.js              # initState(levelIdx) — pure factory
│   │   ├── update.js             # update(state, dt) => newState — pure
│   │   ├── physics.js            # Collision math — pure functions only
│   │   ├── particles.js          # Particle system — state-driven
│   │   └── bonuses.js            # Bonus pickup logic and effects
│   │
│   ├── render/
│   │   ├── renderer.js           # render(state, ctx) — pure, no state writes
│   │   ├── background.js         # Starfield, clouds, nebula
│   │   ├── castle.js             # Brick drawing with crumble states
│   │   ├── moon.js               # Moon paddle renderer
│   │   ├── comet.js              # Comet + trail renderer
│   │   └── particles.js          # Particle renderer
│   │
│   ├── input/
│   │   ├── touch.js              # Touch drag → moon position delta
│   │   ├── mouse.js              # Mouse → moon position delta
│   │   └── keyboard.js           # Arrow keys → moon movement
│   │
│   ├── data/
│   │   ├── levels/
│   │   │   ├── level_01.json     # The First Citadel
│   │   │   ├── level_02.json     # The Twin Towers
│   │   │   ├── level_03.json     # The Granite Keep
│   │   │   ├── level_04.json     # The Crystal Spire
│   │   │   ├── level_05.json     # The Volatile Fortress
│   │   │   ├── level_06.json     # The Gravity Citadel
│   │   │   └── level_07.json     # The Eternal Bastion
│   │   ├── brick_types.json      # Full brick catalog
│   │   ├── bonus_types.json      # Full bonus catalog
│   │   └── themes/
│   │       ├── cosmic.json       # Default theme
│   │       ├── autumn.json       # Seasonal variant
│   │       └── neon.json         # Neon variant
│   │
│   └── ui/
│       ├── overlays.js           # Screen transitions (title, win, lose, pause)
│       ├── hud.js                # Score/lives/level display — reads state only
│       └── bonus-bar.js          # Active bonus indicator pills
│
├── tests/
│   ├── physics/
│   │   ├── collision.test.js     # All collision cases — deterministic
│   │   ├── comet.test.js         # Comet trajectory tests
│   │   └── replay.test.js        # Full replay determinism
│   ├── engine/
│   │   ├── update.test.js        # State transition tests
│   │   ├── bonuses.test.js       # Bonus effect tests
│   │   └── particles.test.js     # Particle lifecycle tests
│   └── fixtures/
│       └── test_level.json       # Minimal level for unit tests
│
├── .github/
│   └── workflows/
│       ├── ci.yml                # Test + validate on every PR
│       ├── deploy.yml            # Deploy to GitHub Pages on main
│       └── leaderboard.yml       # Optional: score aggregation
│
└── docs/
    ├── ARCHITECTURE.md           # System diagram + data flow
    ├── BRICK_TYPES.md            # Full brick catalog documentation
    ├── BONUS_TYPES.md            # Full bonus catalog documentation
    ├── LEVEL_FORMAT.md           # JSON schema for level files
    ├── PHYSICS_SPEC.md           # Collision math specification
    └── REPLAY_SPEC.md            # Determinism contract
```

---

## PART 3: ARCHITECTURE PRINCIPLES

### 3.1 The State Contract

There is exactly one global game state object. It is never mutated in place. `update()` is a pure function that produces a new state snapshot each frame.

```javascript
// state.js — the state schema
const STATE_SCHEMA = {
  phase:         String,    // 'launching'|'playing'|'dying'|'levelwin'|'gameover'|'win'
  levelIdx:      Number,
  lvl:           Object,    // level definition reference
  score:         Number,
  lives:         Number,    // starts at 3; configurable
  multiplier:    Number,    // 1 by default, modified by bonus
  moon: {
    x:           Number,    // center X
    y:           Number,    // center Y (computed from MOON_Y_FRAC * H)
    hw:          Number,    // half-width
    ht:          Number,    // half-height
  },
  comets:        Array,     // [{x,y,vx,vy,trail:[],r,active}]
  bricks:        Array,     // [{id,type,def,x,y,w,h,hp,maxHp,alive,crumble,shake}]
  particles:     Array,     // [{x,y,vx,vy,r,life,decay,color,type,...}]
  bonusDrop:     Array,     // [{x,y,type,vy,r,collected}]
  activeBonuses: Object,    // {BONUS_ID: ticksRemaining}
  tick:          Number,
  shakeT:        Number,
  gravityBricks: Array,     // filtered subset of bricks (cached)
};
```

**The cardinal rules:**
1. `update(state, dt)` returns a new state. It does not write to any external reference.
2. `render(state, ctx)` reads state and writes to canvas. It never modifies state.
3. Input handlers produce a delta (moon position change). They do not call update directly.
4. The game loop mediates all of this. It is the only place that assigns `G = nextState`.

### 3.2 Separation of Concerns — ENFORCED

| Module | Reads State | Writes State | Reads DOM | Writes Canvas |
|--------|-------------|-------------|-----------|---------------|
| `update.js` | ✅ | ✅ (returns new) | ❌ | ❌ |
| `physics.js` | reads args only | returns new values | ❌ | ❌ |
| `renderer.js` | ✅ | ❌ | ❌ | ✅ |
| `hud.js` | ✅ | ❌ | ❌ | ✅ (DOM) |
| `touch.js` | ❌ | ❌ | ✅ | ❌ |
| `state.js` | ❌ | ✅ (init only) | ❌ | ❌ |

### 3.3 Determinism Contract

Given:
- Initial state `S0` from `initState(levelIdx)`
- Input log `[{tick, moonDelta}...]`

The game must reproduce **identical final state** on any device, any frame rate, any run.

**What must be deterministic:**
- All comet physics (velocity, angle, speed normalization)
- All brick collision resolution
- All particle initial conditions (use seeded RNG, not `Math.random()` during physics)
- All bonus drop positions

**What must NOT use `Math.random()` during physics:**
- Comet velocity (use seeded angle derived from launch tick)
- Bounce physics (pure elastic collision math)
- Crumble chunk direction (seeded per brick ID)

**Recommended seeded RNG:**
```javascript
// Mulberry32 — fast, seedable, good distribution
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
// Usage: const rng = mulberry32(levelIdx * 12345 + tick);
```

---

## PART 4: PHYSICS SPECIFICATION

### 4.1 Comet Movement

Per-frame update (dt = elapsed frames, normalized to 60fps):

```javascript
// Apply gravity brick influence
bricks
  .filter(b => b.alive && b.type === 'GRAVITY')
  .forEach(b => {
    const dx = (b.x + b.w/2) - comet.x;
    const dy = (b.y + b.h/2) - comet.y;
    const d  = Math.sqrt(dx*dx + dy*dy);
    if (d < GRAVITY_INFLUENCE_RADIUS && d > 1) {
      const f = GRAVITY_BRICK_PULL / (d * GRAVITY_FALLOFF);
      comet.vx += (dx/d) * f;
      comet.vy += (dy/d) * f;
    }
  });

// Speed normalization: enforce min/max bounds
const spd = Math.sqrt(comet.vx**2 + comet.vy**2);
const targetSpd = BASE_SPEED * levelSpeedMult;
if (spd > targetSpd * MAX_SPEED_RATIO) { ... }
if (spd < targetSpd * MIN_SPEED_RATIO) { ... }

// Integrate
comet.x += comet.vx * spdMod * dt;
comet.y += comet.vy * spdMod * dt;
```

### 4.2 Moon Collision — Edge Effect

The moon paddle imparts angular deflection based on normalized hit position:

```javascript
function moonBounce(comet, moon, activeBonuses) {
  const hw = moon.hw * (activeBonuses.BIG_MOON ? BIG_MOON_MULT : 1);
  const hitNorm = (comet.x - moon.x) / hw;   // -1.0 (left edge) to 1.0 (right edge)
  const deflect  = hitNorm * EDGE_DEFLECT_MAX; // configurable max angle shift (radians)

  const spd   = Math.sqrt(comet.vx**2 + comet.vy**2);
  const angle = Math.atan2(comet.vy, comet.vx) + deflect * EDGE_DEFLECT_WEIGHT;

  return {
    vx: Math.cos(angle) * spd,
    vy: -Math.abs(Math.sin(angle) * spd),   // always bounce upward
  };
}
```

### 4.3 Brick Collision — AABB + Circle

```javascript
function brickCollide(comet, brick) {
  // Find nearest point on brick rectangle to comet center
  const nearX = Math.max(brick.x, Math.min(comet.x, brick.x + brick.w));
  const nearY = Math.max(brick.y, Math.min(comet.y, brick.y + brick.h));
  const dx = comet.x - nearX;
  const dy = comet.y - nearY;

  if (dx*dx + dy*dy > comet.r * comet.r) return null; // no collision

  // Determine collision axis by smallest overlap
  const overlapL = (comet.x + comet.r) - brick.x;
  const overlapR = (brick.x + brick.w) - (comet.x - comet.r);
  const overlapT = (comet.y + comet.r) - brick.y;
  const overlapB = (brick.y + brick.h) - (comet.y - comet.r);

  const horizontal = Math.min(overlapL, overlapR) < Math.min(overlapT, overlapB);

  return {
    axis: horizontal ? 'x' : 'y',
    vx: horizontal ? -comet.vx : comet.vx,
    vy: horizontal ? comet.vy  : -comet.vy,
  };
}
```

**Guaranteed: exactly one brick collision resolved per comet per frame.** This prevents tunneling at high speeds. If multiple bricks are hit simultaneously, resolve the closest (by center distance).

---

## PART 5: BRICK TYPE CATALOG (DATA-DRIVEN)

All brick types live in `/src/data/brick_types.json`. No brick behavior is hardcoded.

```json
{
  "STONE": {
    "hp": 1,
    "color": "#8878a8",
    "glow": "#c0b0e0",
    "score": 10,
    "symbol": "🧱",
    "dropChance": 0.08,
    "crumbleStyle": "standard"
  },
  "REINFORCE": {
    "hp": 3,
    "color": "#5566aa",
    "glow": "#8899dd",
    "score": 30,
    "symbol": "🛡",
    "dropChance": 0.15,
    "crumbleStyle": "chunky",
    "hitFlash": true
  },
  "CRYSTAL": {
    "hp": 1,
    "color": "#44ddcc",
    "glow": "#88ffee",
    "score": 50,
    "symbol": "💎",
    "dropChance": 0.9,
    "crumbleStyle": "shatter",
    "alwaysDrop": true
  },
  "VOLATILE": {
    "hp": 1,
    "color": "#ee6644",
    "glow": "#ff9977",
    "score": 20,
    "symbol": "🔥",
    "dropChance": 0.1,
    "crumbleStyle": "explode",
    "explodes": true,
    "explosionRadius": 120
  },
  "GRAVITY": {
    "hp": 2,
    "color": "#9944cc",
    "glow": "#cc88ff",
    "score": 25,
    "symbol": "🌀",
    "dropChance": 0.1,
    "crumbleStyle": "dissolve",
    "gravityField": true,
    "gravityRadius": 150,
    "gravityStrength": 0.12
  }
}
```

---

## PART 6: BONUS TYPE CATALOG (DATA-DRIVEN)

All bonus types live in `/src/data/bonus_types.json`.

```json
[
  {
    "id": "EXTRA_COMET",
    "emoji": "☄️",
    "label": "Extra Comet",
    "duration": 0,
    "effect": "spawn_comet",
    "description": "Launches an additional comet from the moon's current position."
  },
  {
    "id": "BIG_MOON",
    "emoji": "🌕",
    "label": "Big Moon",
    "duration": 600,
    "effect": "scale_moon",
    "scaleFactor": 1.6,
    "description": "Enlarges the moon paddle for duration ticks."
  },
  {
    "id": "MULTIPLIER",
    "emoji": "✨",
    "label": "Score ×2",
    "duration": 500,
    "effect": "multiply_score",
    "multiplier": 2,
    "description": "Doubles all score gains for duration ticks."
  },
  {
    "id": "MAGNET",
    "emoji": "🧲",
    "label": "Auto-Aim",
    "duration": 400,
    "effect": "attract_comet",
    "description": "Gently pulls comets toward the moon X position."
  },
  {
    "id": "SLOW",
    "emoji": "🕰",
    "label": "Slow Motion",
    "duration": 350,
    "speedMod": 0.45,
    "effect": "time_scale",
    "description": "Reduces all comet speed to 45% for duration ticks."
  },
  {
    "id": "SHOCKWAVE",
    "emoji": "💥",
    "label": "Shockwave",
    "duration": 0,
    "effect": "shockwave",
    "radius": 120,
    "description": "Instantly damages all bricks within radius of moon."
  },
  {
    "id": "MULTIBALL",
    "emoji": "🌈",
    "label": "Comet Split",
    "duration": 0,
    "effect": "split_comet",
    "splitAngle": 0.4,
    "description": "Splits the first active comet into three trajectories."
  }
]
```

---

## PART 7: LEVEL JSON SCHEMA

Each level lives in `/src/data/levels/level_XX.json`.

```json
{
  "$schema": "../level_schema.json",
  "id": 1,
  "name": "The First Citadel",
  "roman": "I",
  "speedMult": 1.0,
  "layout": [
    "  SSSSSSSS  ",
    " SSRSSRSS  ",
    "SSSSSSSSSSS",
    "SRRRSSRRRSS",
    "SSCSSSCSSSS",
    " SSSSSSSSS ",
    "  SSSSSSS  "
  ],
  "brickMap": {
    "S": "STONE",
    "R": "REINFORCE",
    "C": "CRYSTAL",
    "V": "VOLATILE",
    "G": "GRAVITY",
    " ": null
  },
  "environment": {
    "theme": "cosmic",
    "windStrength": 0,
    "debrisEnabled": false
  }
}
```

### Layout Rules
- Each character in `layout` maps to a brick type via `brickMap`
- Spaces are empty cells
- All rows must be the same length (pad with spaces)
- Maximum 7 rows, 12 columns in base game (configurable)
- `speedMult` scales base comet speed (1.0 = 5.5px/frame at 60fps)

---

## PART 8: LEVEL DESIGN GUIDE

| Level | Name | Theme | Speed | New Mechanic |
|-------|------|-------|-------|-------------|
| 1 | The First Citadel | cosmic | 1.00× | None (tutorial) |
| 2 | The Twin Towers | cosmic | 1.15× | Dual structure |
| 3 | The Granite Keep | cosmic | 1.30× | Reinforced walls |
| 4 | The Crystal Spire | crystal | 1.45× | Crystal density |
| 5 | The Volatile Fortress | volcanic | 1.60× | Chain explosions |
| 6 | The Gravity Citadel | graviton | 1.75× | Comet curvature |
| 7 | The Eternal Bastion | chaos | 2.00× | All types active |

**Design principles:**
- One dominant new mechanic per level
- Crystal bricks never block level completion (bonus only)
- Volatile bricks never cluster more than 3 adjacent (prevents unplayable chain reactions)
- Gravity bricks placed to create interesting, learnable deflection patterns

---

## PART 9: RENDERING SPECIFICATION

### 9.1 Render Pipeline Order

```
render(state, ctx):
  1. drawBackground(theme)          // space gradient + starfield + nebula
  2. drawClouds(clouds)             // parallax cloud layers
  3. drawBricks(bricks)             // castle with crumble states
  4. drawBonusDrops(bonusDrop)      // falling emoji power-ups
  5. drawComets(comets)             // comet + glowing trail
  6. drawMoon(moon, activeBonuses)  // crescent paddle + halo
  7. drawParticles(particles)       // chunks, sparks, rings
  8. drawScorePopups(scorePopups)   // floating +score text
  9. drawHUD(state)                 // score, lives, level, bonuses
```

**Invariant:** No step modifies state. All steps are pure visual reads.

### 9.2 Brick Visual States

Each brick renders with 4 visual states based on `crumble` (0.0 to 1.0):

| crumble | Visual |
|---------|--------|
| 0.0 | Perfect brick, full glow, rounded corners |
| 0.3 | Single crack diagonal, corner chipping begins |
| 0.6 | Multiple cracks, darker tint, visible damage |
| 0.9 | Heavy fragmentation visual, pre-collapse state |
| 1.0 | Destroyed — emit crumble particles, remove from alive |

### 9.3 Comet Trail

Trail is a ring buffer of the last `TRAIL_LEN` positions. Each trail point renders as a radial gradient circle scaled by `(index / trailLength)`. The head renders with a full white-hot glow; the tail fades to transparent deep blue.

### 9.4 Screen Shake

```javascript
// Applied as canvas translate before all render calls
const shakeX = rng() * shakeT * SHAKE_INTENSITY;
const shakeY = rng() * shakeT * SHAKE_INTENSITY;
ctx.translate(shakeX, shakeY);
// shakeT decays by dt each frame
```

Shake magnitudes by event:
- Brick hit: `shakeT = 4`
- Volatile explosion: `shakeT = 14`
- Shockwave bonus: `shakeT = 12`
- Last comet lost: `shakeT = 8`

---

## PART 10: PARTICLE SYSTEM SPECIFICATION

All particles live in `state.particles[]`. Particles are updated in `update()` and rendered in `render()`.

### Particle Types

**Spark** — small circular glowing particle:
```json
{ "type": "spark", "x": 0, "y": 0, "vx": 0, "vy": 0, "r": 2, "life": 1.0, "decay": 0.04, "color": "#ffffff" }
```

**Chunk** — square rotating debris from brick crumble:
```json
{ "type": "chunk", "x": 0, "y": 0, "vx": 0, "vy": 0, "gy": 0.15, "r": 6, "life": 1.0, "decay": 0.015, "color": "#887878", "rot": 0, "rspd": 0.1 }
```

**Ring** — expanding shockwave circle:
```json
{ "type": "ring", "x": 0, "y": 0, "r": 5, "maxR": 120, "life": 1.0, "decay": 0.03, "color": "rgba(255,150,50,0.6)" }
```

### Per-event particle counts

| Event | Type | Count |
|-------|------|-------|
| Brick hit (stone) | spark | 6 |
| Brick destroyed | spark + chunk | 6 + 14 |
| Volatile explosion | spark + ring | 30 + 1 |
| Moon hit | spark | 5 |
| Wall bounce | spark | 3 |
| Bonus collected | spark | 12 |

Maximum particles: 300. Oldest removed when limit reached.

---

## PART 11: FRONT-END ARCHITECTURE

### 11.1 Single Page Application

One HTML file. Zero page reloads. Zero server dependencies. All state in memory. All assets embedded or CDN-loaded.

### 11.2 Game Loop

```javascript
const FIXED_STEP = 1 / 60; // 60fps logic
let accumulator = 0;
let lastT = 0;

function loop(ts) {
  const elapsed = (ts - lastT) / 1000;
  lastT = ts;
  accumulator += Math.min(elapsed, 0.1); // cap at 100ms

  // Fixed timestep update (decoupled from render rate)
  while (accumulator >= FIXED_STEP) {
    const input = inputQueue.shift() || null;
    G = update(G, FIXED_STEP * 60, input); // dt in frames at 60fps
    accumulator -= FIXED_STEP;
  }

  render(G, ctx);
  updateHUD(G);
  requestAnimationFrame(loop);
}
```

**Fixed timestep** ensures physics is frame-rate independent and deterministic across devices.

### 11.3 Input Pipeline

```javascript
// All input handlers write to inputQueue only — never touch G directly
const inputQueue = [];

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  inputQueue.push({ type: 'moon', deltaX: computeDelta(e) });
}, { passive: false });

// In update():
function update(state, dt, input) {
  let moon = state.moon;
  if (input?.type === 'moon') {
    moon = { ...moon, x: clamp(moon.x + input.deltaX, moon.hw, W - moon.hw) };
  }
  // ... rest of update
  return { ...state, moon, /* ... */ };
}
```

---

## PART 12: GITHUB PAGES DEPLOYMENT

### 12.1 Required Workflows

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run validate-levels  # validate all level JSON against schema
```

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/upload-pages-artifact@v1
        with: { path: '.' }
      - uses: actions/deploy-pages@v1
```

### 12.2 Optional Leaderboard (GitHub Actions)

```yaml
# .github/workflows/leaderboard.yml
name: Process Score
on:
  repository_dispatch:
    types: [score_submission]
jobs:
  update-leaderboard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate replay and update leaderboard
        run: node scripts/validate-replay.js
      - name: Commit leaderboard
        run: |
          git config user.email "bot@github.com"
          git config user.name "ZenOrbitsBot"
          git add leaderboard.json
          git commit -m "Update leaderboard [skip ci]"
          git push
```

Leaderboard entry format:
```json
{
  "player": "handle",
  "score": 48720,
  "level": 7,
  "seed": "level_07_v1.0",
  "input_log": [...],
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## PART 13: TESTING HARNESS

### 13.1 Physics Unit Tests

```javascript
// tests/physics/collision.test.js

test('comet bounces off left wall', () => {
  const comet = { x: 5, y: 200, vx: -3, vy: -2, r: 7, trail: [], active: true };
  const result = resolveWalls(comet, 480, 900);
  expect(result.vx).toBeGreaterThan(0);
  expect(result.x).toBeGreaterThanOrEqual(result.r);
});

test('comet bounces off right wall', () => { ... });
test('comet bounces off top wall', () => { ... });
test('comet lost when passing below H', () => { ... });

test('moon center hit produces vertical bounce', () => {
  const comet = { x: 240, y: 790, vx: 1, vy: 3, r: 7 };
  const moon  = { x: 240, y: 800, hw: 70, ht: 14 };
  const result = moonBounce(comet, moon, {});
  expect(result.vy).toBeLessThan(0);        // bounced upward
  expect(Math.abs(result.vx)).toBeLessThan(0.5); // minimal lateral change
});

test('moon left edge hit produces left-curving bounce', () => { ... });
test('moon right edge hit produces right-curving bounce', () => { ... });

test('brick collision on top face reflects Y velocity', () => { ... });
test('brick collision on left face reflects X velocity', () => { ... });
test('one brick collision per comet per frame', () => { ... });
```

### 13.2 Determinism Tests

```javascript
// tests/physics/replay.test.js

test('same input log produces identical final state', () => {
  const INPUT_LOG = [
    { type: 'moon', deltaX: 5 },
    { type: 'moon', deltaX: -3 },
    // ... 200 inputs
  ];

  function replay(inputs) {
    let state = initState(0);
    for (const input of inputs) {
      state = update(state, 1, input);
    }
    return state;
  }

  const run1 = replay(INPUT_LOG);
  const run2 = replay(INPUT_LOG);
  expect(run1.score).toBe(run2.score);
  expect(run1.comets[0].x).toBeCloseTo(run2.comets[0].x, 8);
  expect(run1.comets[0].y).toBeCloseTo(run2.comets[0].y, 8);
});

test('determinism holds across 500 ticks with no input', () => { ... });
test('brick destruction order is deterministic', () => { ... });
```

### 13.3 Engine Unit Tests

```javascript
// tests/engine/update.test.js

test('score increases on brick hit', () => { ... });
test('score multiplied when MULTIPLIER active', () => { ... });
test('lives decrease when comet lost', () => { ... });
test('game over when lives reach 0', () => { ... });
test('level win when all non-crystal bricks destroyed', () => { ... });
test('crystal bricks do not block level completion', () => { ... });
test('volatile brick destroys neighbors within radius', () => { ... });
test('BIG_MOON bonus scales paddle width by 1.6', () => { ... });
test('SLOW bonus reduces speed multiplier to 0.45', () => { ... });
test('SHOCKWAVE damages bricks within 120px of moon', () => { ... });
test('bonus timer decrements each tick', () => { ... });
test('bonus expires when timer reaches 0', () => { ... });
```

---

## PART 14: EXTENSIBILITY REQUIREMENTS

### New Castle Themes

Add a JSON file to `/src/data/themes/`. Theme file format:

```json
{
  "id": "autumn",
  "name": "Autumn Citadel",
  "background": {
    "gradient": ["#1a0a00", "#2d1505", "#0a0500"],
    "starColor": "#ffddaa",
    "nebulaColor": "rgba(180,80,20,0.06)"
  },
  "cloudColor": "rgba(200,150,80,0.06)",
  "brickPalette": {
    "STONE": { "color": "#8b5a2b", "glow": "#d4a066" }
  }
}
```

### New Brick Types

Add to `brick_types.json`. Any brick that requires new physics behavior must also add a handler function to `physics.js` and register in the `BRICK_BEHAVIORS` map.

### Endless Mode

Set `levelIdx` to cycle indefinitely:
```javascript
function nextLevel(state) {
  const nextIdx = (state.levelIdx + 1); // no modulo — just keep going
  const lvl = LEVELS[nextIdx % LEVELS.length];
  const speedMult = lvl.speedMult * (1 + Math.floor(nextIdx / LEVELS.length) * 0.15);
  return initState(nextIdx, { ...lvl, speedMult });
}
```

### Boss Castles

Boss levels are standard level JSON with a `"boss": true` flag and an added `"bossCore"` brick definition. The boss core has high HP, respawns non-boss bricks after a delay, and requires the shockwave bonus to expose. Boss behavior hooks into `update.js` via a registered `BOSS_BEHAVIORS` map.

### Accessibility Options

All configurable in a `settings` object attached to `state`:
```json
{
  "settings": {
    "reducedMotion": false,
    "highContrast": false,
    "largeMoon": false,
    "slowBaseSpeed": false,
    "screenShakeIntensity": 1.0
  }
}
```

Renderer checks `state.settings` before applying shake, particles, and parallax effects.

---

## PART 15: TEAM WORKFLOW PROTOCOL

### Branch Strategy
```
main          — production. Auto-deploys. CI must pass.
dev           — integration. All features merge here.
feature/PHY-* — physics / engine changes
feature/LVL-* — level data
feature/RND-* — renderer improvements
feature/UI-*  — HUD / overlay changes
fix/*         — bug fixes
```

### Commit Convention
```
[PHY]   Implement fixed timestep game loop
[LVL]   Add level_05 - The Volatile Fortress
[RND]   Add comet trail radial gradient
[UI]    Animate bonus pill fade-in
[FIX]   Resolve comet tunneling at high speed
[TEST]  Add volatile chain reaction tests
[DOCS]  Update PHYSICS_SPEC.md
```

### PR Requirements
1. Physics changes require determinism test to pass
2. New brick types require entry in `brick_types.json` and unit tests
3. Level JSON must validate against schema (CI enforces)
4. No PR modifies more than one concern layer
5. Lead developer reviews all `main` merges

---

## PART 16: THE FOUR LAWS

1. **`update()` is a pure function.** It takes state and dt. It returns new state. No side effects. No DOM. No canvas. No `Math.random()` in physics paths.

2. **`render()` never writes state.** It reads. It draws. It returns nothing of consequence.

3. **Physics constants have no hardcoded values.** Every number lives in a config object or JSON file. If you're typing a raw number into physics code, you're doing it wrong.

4. **The castle must look progressively ruined, not simply erased.** Visual crumble is not optional. The spectacle is the product.

---

*zen-orbits v1.0.0 — Castles Fall. Gravity Remains.*
