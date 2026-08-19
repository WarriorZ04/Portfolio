"use strict";

/* =========================================================================
   PRAIRIE BLASTER — top-down shooter infinito, estilo arcade.
   Todos los gráficos son formas genéricas dibujadas por código (placeholder).
   Para usar sprites reales: soltá archivos PNG en assets/img/ con los
   nombres listados en assets/img/README.txt — SPRITES los carga solo y,
   si un archivo existe, se dibuja la imagen en vez de la forma genérica.
   ========================================================================= */

// ---------------------------------------------------------------- CONFIG --
const W = 900, H = 600;
const ARENA = { x: 24, y: 24, w: W - 48, h: H - 48 };
const HIGHSCORE_KEY = "prairieBlaster_highscore";
const POINTS_PER_KILL = 10;
const BOSS_EVERY = 500;

const COLORS = {
  ground: "#233016",
  groundLine: "#2b3a1b",
  wall: "#4a3826",
  wallEdge: "#2c2015",
  player: "#3aa6ff",
  playerNose: "#eaf6ff",
  bulletPlayer: "#ffe86b",
  bulletEnemy: "#ff5d5d",
  grunt: "#7a4bd8",
  runner: "#e0703a",
  shooter: "#2fbf7d",
  boss: "#c22b2b",
  bossDetail: "#7a1010",
  pickupHeart: "#ff4d6d",
  pickupSpread: "#4dd6ff",
  text: "#f4f1e8"
};

// ------------------------------------------------------------- ASSETS ----
// Generic swappable sprite loader: tries to load an image; if missing,
// rendering code falls back to a drawn placeholder shape automatically.
const SPRITES = {};
function tryLoadSprite(name, file) {
  const img = new Image();
  const entry = { img, ready: false };
  img.onload = () => { entry.ready = true; };
  img.onerror = () => { entry.ready = false; };
  img.src = `assets/img/${file}`;
  SPRITES[name] = entry;
}
[
  ["player", "player.png"],
  ["grunt", "enemy_grunt.png"],
  ["runner", "enemy_runner.png"],
  ["shooter", "enemy_shooter.png"],
  ["boss", "boss.png"],
  ["bulletPlayer", "bullet_player.png"],
  ["bulletEnemy", "bullet_enemy.png"],
  ["pickupHeart", "pickup_heart.png"],
  ["pickupSpread", "pickup_spread.png"],
  ["obstacle", "obstacle.png"],
  ["ground", "ground_tile.png"]
].forEach(([n, f]) => tryLoadSprite(n, f));

function drawSprite(ctx, name, x, y, w, h, angle, fallback) {
  const s = SPRITES[name];
  if (s && s.ready) {
    ctx.save();
    ctx.translate(x, y);
    if (angle !== undefined) ctx.rotate(angle);
    ctx.drawImage(s.img, -w / 2, -h / 2, w, h);
    ctx.restore();
  } else {
    fallback();
  }
}

// --------------------------------------------------------------- SETUP ---
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hud = document.getElementById("hud");
const livesEl = document.getElementById("lives");
const scoreEl = document.getElementById("score");
const highscoreEl = document.getElementById("highscore");
const bossBarWrap = document.getElementById("bossBarWrap");
const bossBarFill = document.getElementById("bossBarFill");
const bossBanner = document.getElementById("bossBanner");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreEl = document.getElementById("finalScore");
const newRecordEl = document.getElementById("newRecord");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let highscore = Number(localStorage.getItem(HIGHSCORE_KEY) || 0);
highscoreEl.textContent = highscore;

// --------------------------------------------------------------- INPUT ---
const keys = new Set();
let mouseFiring = false;
let touchMove = { x: 0, y: 0 };
let touchFiring = false;

window.addEventListener("keydown", (e) => {
  keys.add(e.code);
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
});
window.addEventListener("keyup", (e) => keys.delete(e.code));

canvas.addEventListener("mousedown", () => (mouseFiring = true));
window.addEventListener("mouseup", () => (mouseFiring = false));
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

function moveInputVector() {
  if (touchMove.x || touchMove.y) return { x: touchMove.x, y: touchMove.y };
  let x = 0, y = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) x -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) x += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) y -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) y += 1;
  const len = Math.hypot(x, y);
  if (len > 0) { x /= len; y /= len; }
  return { x, y };
}

function isFiring() {
  return keys.has("Space") || mouseFiring || touchFiring;
}

// Touch controls
const stickZone = document.getElementById("stickZone");
const stickNub = document.getElementById("stickNub");
const fireBtn = document.getElementById("fireBtn");
let stickTouchId = null;
let stickCenter = { x: 0, y: 0 };

stickZone.addEventListener("touchstart", (e) => {
  const t = e.changedTouches[0];
  stickTouchId = t.identifier;
  const r = stickZone.getBoundingClientRect();
  stickCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  e.preventDefault();
}, { passive: false });

stickZone.addEventListener("touchmove", (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier !== stickTouchId) continue;
    let dx = t.clientX - stickCenter.x;
    let dy = t.clientY - stickCenter.y;
    const max = 40;
    const len = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(len, max);
    dx = (dx / len) * clamped;
    dy = (dy / len) * clamped;
    stickNub.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    touchMove = { x: dx / max, y: dy / max };
  }
  e.preventDefault();
}, { passive: false });

function stickEnd(e) {
  for (const t of e.changedTouches) {
    if (t.identifier !== stickTouchId) continue;
    stickTouchId = null;
    touchMove = { x: 0, y: 0 };
    stickNub.style.transform = "translate(-50%, -50%)";
  }
}
stickZone.addEventListener("touchend", stickEnd);
stickZone.addEventListener("touchcancel", stickEnd);

fireBtn.addEventListener("touchstart", (e) => { touchFiring = true; e.preventDefault(); }, { passive: false });
fireBtn.addEventListener("touchend", (e) => { touchFiring = false; e.preventDefault(); }, { passive: false });
fireBtn.addEventListener("touchcancel", () => (touchFiring = false));

// --------------------------------------------------------------- STATE ---
let state = "start"; // start | playing | gameover
let score = 0;
let nextBossScore = BOSS_EVERY;
let bossActive = null;
let bossesDefeated = 0;

let player, bullets, enemyBullets, enemies, pickups, particles, obstacles;
let spawnTimer = 0;
let elapsed = 0;
let bannerTimer = 0;

function makeObstacles() {
  // A handful of static blocks scattered in the arena for cover/tactics.
  const spots = [
    { x: 200, y: 140, w: 70, h: 46 },
    { x: 630, y: 140, w: 70, h: 46 },
    { x: 200, y: 414, w: 70, h: 46 },
    { x: 630, y: 414, w: 70, h: 46 }
  ];
  return spots;
}

function resetGame() {
  score = 0;
  nextBossScore = BOSS_EVERY;
  bossActive = null;
  bossesDefeated = 0;
  spawnTimer = 0;
  elapsed = 0;

  player = {
    x: W / 2, y: H / 2,
    r: 14,
    speed: 210,
    lives: 3,
    maxLives: 5,
    facing: { x: 0, y: 1 },
    fireCooldown: 0,
    fireRate: 0.16,
    invuln: 0,
    spreadTimer: 0,
    dead: false
  };
  bullets = [];
  enemyBullets = [];
  enemies = [];
  pickups = [];
  particles = [];
  obstacles = makeObstacles();

  updateHud();
  bossBarWrap.hidden = true;
}

// ----------------------------------------------------------- UTILITIES ---
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function circlesHit(a, b) { return dist(a, b) < a.r + b.r; }

function rectsOverlap(cx, cy, r, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  return Math.hypot(cx - nx, cy - ny) < r;
}

function resolveObstacles(entity, prevX, prevY) {
  for (const o of obstacles) {
    if (rectsOverlap(entity.x, entity.y, entity.r, o)) {
      entity.x = prevX;
      if (!rectsOverlap(entity.x, entity.y, entity.r, o)) continue;
      entity.y = prevY;
    }
  }
}

function spawnParticles(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 60 + Math.random() * 140;
    particles.push({
      x, y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      life: 0.35 + Math.random() * 0.25,
      t: 0,
      color
    });
  }
}

// ------------------------------------------------------------- SPAWNING --
function edgeSpawnPoint() {
  const side = Math.floor(Math.random() * 4);
  const pad = 20;
  if (side === 0) return { x: ARENA.x + Math.random() * ARENA.w, y: ARENA.y - pad };
  if (side === 1) return { x: ARENA.x + Math.random() * ARENA.w, y: ARENA.y + ARENA.h + pad };
  if (side === 2) return { x: ARENA.x - pad, y: ARENA.y + Math.random() * ARENA.h };
  return { x: ARENA.x + ARENA.w + pad, y: ARENA.y + Math.random() * ARENA.h };
}

function difficultyFactor() {
  return clamp(score / 2500, 0, 1); // 0 -> 1 over the first ~2500 pts, infinite plateau after
}

function spawnEnemy() {
  const df = difficultyFactor();
  const p = edgeSpawnPoint();
  const roll = Math.random();
  let type = "grunt";
  if (roll < 0.15 + df * 0.15) type = "shooter";
  else if (roll < 0.5 + df * 0.15) type = "runner";

  const base = {
    grunt:   { hp: 1, speed: 70,  r: 13, color: COLORS.grunt,   sprite: "grunt" },
    runner:  { hp: 1, speed: 130, r: 11, color: COLORS.runner,  sprite: "runner" },
    shooter: { hp: 2, speed: 55,  r: 14, color: COLORS.shooter, sprite: "shooter" }
  }[type];

  enemies.push({
    type,
    x: p.x, y: p.y,
    r: base.r,
    hp: base.hp + Math.floor(df * 2 * (type !== "grunt" ? 1 : 0.5)),
    speed: base.speed * (1 + df * 0.5),
    color: base.color,
    sprite: base.sprite,
    shootCooldown: 1 + Math.random(),
    hitFlash: 0
  });
}

function trySpawnBoss() {
  bossesDefeated++;
  const level = bossesDefeated;
  bossActive = {
    x: W / 2, y: ARENA.y + 90,
    r: 42,
    hp: 40 + level * 20,
    maxHp: 40 + level * 20,
    speed: 60 + level * 4,
    dir: 1,
    shootCooldown: 1.2,
    burstCooldown: 3,
    hitFlash: 0
  };
  bossBarWrap.hidden = false;
  bossBanner.hidden = false;
  bannerTimer = 1.6;
  enemies.length = 0; // clear the field for the boss fight
}

// -------------------------------------------------------------- UPDATE ---
function updatePlayer(dt) {
  if (player.dead) return;

  const mv = moveInputVector();
  const prevX = player.x, prevY = player.y;
  player.x = clamp(player.x + mv.x * player.speed * dt, ARENA.x + player.r, ARENA.x + ARENA.w - player.r);
  player.y = clamp(player.y + mv.y * player.speed * dt, ARENA.y + player.r, ARENA.y + ARENA.h - player.r);
  resolveObstacles(player, prevX, prevY);

  if (mv.x || mv.y) player.facing = { x: mv.x, y: mv.y };

  player.fireCooldown -= dt;
  if (isFiring() && player.fireCooldown <= 0) {
    player.fireCooldown = player.fireRate;
    fireBullet();
  }

  if (player.invuln > 0) player.invuln -= dt;
  if (player.spreadTimer > 0) player.spreadTimer -= dt;
}

function fireBullet() {
  const speed = 480;
  const dirs = [];
  if (player.spreadTimer > 0) {
    const base = Math.atan2(player.facing.y, player.facing.x);
    [-0.28, 0, 0.28].forEach((off) => dirs.push(base + off));
  } else {
    dirs.push(Math.atan2(player.facing.y, player.facing.x));
  }
  for (const a of dirs) {
    bullets.push({
      x: player.x + Math.cos(a) * (player.r + 6),
      y: player.y + Math.sin(a) * (player.r + 6),
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      r: 4
    });
  }
}

function updateBullets(dt) {
  for (const b of bullets) { b.x += b.vx * dt; b.y += b.vy * dt; }
  bullets = bullets.filter((b) =>
    b.x > ARENA.x - 20 && b.x < ARENA.x + ARENA.w + 20 &&
    b.y > ARENA.y - 20 && b.y < ARENA.y + ARENA.h + 20 &&
    !obstacles.some((o) => rectsOverlap(b.x, b.y, b.r, o))
  );

  for (const b of enemyBullets) { b.x += b.vx * dt; b.y += b.vy * dt; }
  enemyBullets = enemyBullets.filter((b) =>
    b.x > ARENA.x - 20 && b.x < ARENA.x + ARENA.w + 20 &&
    b.y > ARENA.y - 20 && b.y < ARENA.y + ARENA.h + 20 &&
    !obstacles.some((o) => rectsOverlap(b.x, b.y, b.r, o))
  );
}

function updateEnemies(dt) {
  for (const e of enemies) {
    if (e.hitFlash > 0) e.hitFlash -= dt;
    const prevX = e.x, prevY = e.y;

    if (e.type === "shooter") {
      const d = dist(e, player);
      const toP = { x: (player.x - e.x) / (d || 1), y: (player.y - e.y) / (d || 1) };
      if (d < 170) { e.x -= toP.x * e.speed * dt; e.y -= toP.y * e.speed * dt; }
      else if (d > 260) { e.x += toP.x * e.speed * dt; e.y += toP.y * e.speed * dt; }

      e.shootCooldown -= dt;
      if (e.shootCooldown <= 0) {
        e.shootCooldown = 1.6 - difficultyFactor() * 0.6;
        const a = Math.atan2(player.y - e.y, player.x - e.x);
        enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, r: 5 });
      }
    } else {
      const d = dist(e, player) || 1;
      e.x += ((player.x - e.x) / d) * e.speed * dt;
      e.y += ((player.y - e.y) / d) * e.speed * dt;
    }

    resolveObstacles(e, prevX, prevY);
  }
}

function updateBoss(dt) {
  const b = bossActive;
  if (!b) return;
  if (b.hitFlash > 0) b.hitFlash -= dt;

  b.x += b.dir * b.speed * dt;
  if (b.x < ARENA.x + b.r + 20) b.dir = 1;
  if (b.x > ARENA.x + ARENA.w - b.r - 20) b.dir = -1;
  b.y = ARENA.y + 90 + Math.sin(elapsed * 1.3) * 20;

  b.shootCooldown -= dt;
  if (b.shootCooldown <= 0) {
    b.shootCooldown = 0.9;
    const a = Math.atan2(player.y - b.y, player.x - b.x);
    enemyBullets.push({ x: b.x, y: b.y, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240, r: 6 });
  }

  b.burstCooldown -= dt;
  if (b.burstCooldown <= 0) {
    b.burstCooldown = 3.2;
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      enemyBullets.push({ x: b.x, y: b.y, vx: Math.cos(a) * 180, vy: Math.sin(a) * 180, r: 5 });
    }
  }
}

function hurtPlayer() {
  if (player.invuln > 0 || player.dead) return;
  player.lives--;
  player.invuln = 1.4;
  spawnParticles(player.x, player.y, COLORS.player, 16);
  updateHud();
  if (player.lives <= 0) {
    player.dead = true;
    endGame();
  }
}

function addScore(pts) {
  score += pts;
  scoreEl.textContent = score;
  if (!bossActive && score >= nextBossScore) {
    nextBossScore += BOSS_EVERY;
    trySpawnBoss();
  }
}

function updateCollisions() {
  // player bullets vs enemies
  for (const bl of bullets) {
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      if (circlesHit(bl, e)) {
        e.hp--; e.hitFlash = 0.1; bl.r = 0;
        if (e.hp <= 0) {
          spawnParticles(e.x, e.y, e.color, 14);
          addScore(POINTS_PER_KILL);
          maybeDropPickup(e.x, e.y);
        }
      }
    }
    if (bossActive && circlesHit(bl, bossActive)) {
      bossActive.hp--; bossActive.hitFlash = 0.1; bl.r = 0;
      bossBarFill.style.width = `${clamp((bossActive.hp / bossActive.maxHp) * 100, 0, 100)}%`;
      if (bossActive.hp <= 0) {
        spawnParticles(bossActive.x, bossActive.y, COLORS.boss, 40);
        addScore(200);
        pickups.push({ x: bossActive.x, y: bossActive.y, type: "heart", r: 12 });
        bossActive = null;
        bossBarWrap.hidden = true;
      }
    }
  }
  bullets = bullets.filter((b) => b.r > 0);
  enemies = enemies.filter((e) => e.hp > 0);

  // enemy bullets vs player
  for (const b of enemyBullets) {
    if (circlesHit(b, player) && player.invuln <= 0) { hurtPlayer(); b.r = 0; }
  }
  enemyBullets = enemyBullets.filter((b) => b.r > 0);

  // enemy contact vs player
  for (const e of enemies) {
    if (circlesHit(e, player)) hurtPlayer();
  }
  if (bossActive && circlesHit(bossActive, player)) hurtPlayer();

  // pickups
  pickups = pickups.filter((p) => {
    if (circlesHit(p, player)) {
      if (p.type === "heart") player.lives = Math.min(player.maxLives, player.lives + 1);
      if (p.type === "spread") player.spreadTimer = 8;
      updateHud();
      return false;
    }
    return true;
  });
}

function maybeDropPickup(x, y) {
  const roll = Math.random();
  if (roll < 0.04) pickups.push({ x, y, type: "heart", r: 10 });
  else if (roll < 0.09) pickups.push({ x, y, type: "spread", r: 10 });
}

function updateParticles(dt) {
  for (const p of particles) {
    p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 0.9; p.vy *= 0.9;
  }
  particles = particles.filter((p) => p.t < p.life);
}

function updateSpawning(dt) {
  if (bossActive) return;
  const df = difficultyFactor();
  const interval = clamp(1.15 - df * 0.8, 0.32, 1.15);
  const maxEnemies = Math.round(5 + df * 25);

  spawnTimer -= dt;
  if (spawnTimer <= 0 && enemies.length < maxEnemies) {
    spawnTimer = interval;
    spawnEnemy();
  }
}

function updateHud() {
  livesEl.innerHTML = "";
  for (let i = 0; i < player.maxLives; i++) {
    const span = document.createElement("span");
    span.className = i < player.lives ? "heart-full" : "heart-empty";
    livesEl.appendChild(span);
  }
  scoreEl.textContent = score;
}

function endGame() {
  state = "gameover";
  finalScoreEl.textContent = score;
  if (score > highscore) {
    highscore = score;
    localStorage.setItem(HIGHSCORE_KEY, String(highscore));
    highscoreEl.textContent = highscore;
    newRecordEl.hidden = false;
  } else {
    newRecordEl.hidden = true;
  }
  gameOverScreen.hidden = false;
}

// -------------------------------------------------------------- RENDER ---
function drawGround() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  const g = SPRITES.ground;
  if (g && g.ready) {
    const tile = 60;
    for (let y = ARENA.y; y < ARENA.y + ARENA.h; y += tile) {
      for (let x = ARENA.x; x < ARENA.x + ARENA.w; x += tile) {
        ctx.drawImage(g.img, x, y, tile, tile);
      }
    }
  } else {
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(ARENA.x, ARENA.y, ARENA.w, ARENA.h);
    ctx.strokeStyle = COLORS.groundLine;
    ctx.lineWidth = 1;
    for (let x = ARENA.x; x <= ARENA.x + ARENA.w; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, ARENA.y); ctx.lineTo(x, ARENA.y + ARENA.h); ctx.stroke();
    }
    for (let y = ARENA.y; y <= ARENA.y + ARENA.h; y += 30) {
      ctx.beginPath(); ctx.moveTo(ARENA.x, y); ctx.lineTo(ARENA.x + ARENA.w, y); ctx.stroke();
    }
  }

  ctx.strokeStyle = COLORS.wallEdge;
  ctx.lineWidth = 8;
  ctx.strokeRect(ARENA.x, ARENA.y, ARENA.w, ARENA.h);
}

function drawObstacles() {
  for (const o of obstacles) {
    drawSprite(ctx, "obstacle", o.x + o.w / 2, o.y + o.h / 2, o.w, o.h, undefined, () => {
      ctx.fillStyle = COLORS.wall;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = COLORS.wallEdge;
      ctx.lineWidth = 3;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    });
  }
}

function drawPlayer() {
  if (player.invuln > 0 && Math.floor(player.invuln * 12) % 2 === 0) return;
  const angle = Math.atan2(player.facing.y, player.facing.x);
  drawSprite(ctx, "player", player.x, player.y, player.r * 2.4, player.r * 2.4, angle, () => {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.arc(0, 0, player.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(angle);
    ctx.fillStyle = COLORS.playerNose;
    ctx.beginPath();
    ctx.moveTo(player.r + 10, 0);
    ctx.lineTo(player.r - 4, -6);
    ctx.lineTo(player.r - 4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

function drawEnemies() {
  for (const e of enemies) {
    const flash = e.hitFlash > 0;
    drawSprite(ctx, e.sprite, e.x, e.y, e.r * 2.4, e.r * 2.4, undefined, () => {
      ctx.fillStyle = flash ? "#fff" : e.color;
      ctx.beginPath();
      if (e.type === "runner") {
        ctx.moveTo(e.x, e.y - e.r);
        ctx.lineTo(e.x + e.r, e.y + e.r);
        ctx.lineTo(e.x - e.r, e.y + e.r);
        ctx.closePath();
      } else if (e.type === "shooter") {
        ctx.rect(e.x - e.r, e.y - e.r, e.r * 2, e.r * 2);
      } else {
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      }
      ctx.fill();
    });
  }
}

function drawBoss() {
  const b = bossActive;
  if (!b) return;
  drawSprite(ctx, "boss", b.x, b.y, b.r * 2.4, b.r * 2.4, undefined, () => {
    ctx.fillStyle = b.hitFlash > 0 ? "#fff" : COLORS.boss;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.bossDetail;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBullets() {
  for (const b of bullets) {
    drawSprite(ctx, "bulletPlayer", b.x, b.y, 10, 10, undefined, () => {
      ctx.fillStyle = COLORS.bulletPlayer;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    });
  }
  for (const b of enemyBullets) {
    drawSprite(ctx, "bulletEnemy", b.x, b.y, 12, 12, undefined, () => {
      ctx.fillStyle = COLORS.bulletEnemy;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    });
  }
}

function drawPickups() {
  for (const p of pickups) {
    const spriteName = p.type === "heart" ? "pickupHeart" : "pickupSpread";
    const color = p.type === "heart" ? COLORS.pickupHeart : COLORS.pickupSpread;
    drawSprite(ctx, spriteName, p.x, p.y, 20, 20, undefined, () => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    });
  }
}

function drawParticles() {
  for (const p of particles) {
    const alpha = 1 - p.t / p.life;
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function render() {
  drawGround();
  drawObstacles();
  drawPickups();
  drawEnemies();
  drawBoss();
  drawPlayer();
  drawBullets();
  drawParticles();
}

// ---------------------------------------------------------------- LOOP ---
let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (state === "playing") {
    elapsed += dt;
    updatePlayer(dt);
    updateBullets(dt);
    updateEnemies(dt);
    updateBoss(dt);
    updateCollisions();
    updateParticles(dt);
    updateSpawning(dt);

    if (bannerTimer > 0) {
      bannerTimer -= dt;
      if (bannerTimer <= 0) bossBanner.hidden = true;
    }
  }

  render();
  requestAnimationFrame(loop);
}

// --------------------------------------------------------------- FLOW ----
function startGame() {
  resetGame();
  state = "playing";
  startScreen.hidden = true;
  gameOverScreen.hidden = true;
  bossBanner.hidden = true;
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

resetGame();
render();
requestAnimationFrame(loop);
