// =====================================================
//  초평 택틱스 - 게임 진행
// =====================================================
'use strict';

const T = 16;      // 한 칸 = 16도트
const S = 3;       // 화면에 그릴 때 3배 확대
const $ = id => document.getElementById(id);

// 📱 빈 곳을 눌렀는데 가까운 버튼이 "대신" 눌리는 것 막기
//    패드는 손가락이 버튼 근처만 눌러도 그 버튼을 눌렀다고 짐작해요(터치 보정).
//    그래서 손가락을 뗀 진짜 위치가 버튼 안쪽일 때만 버튼이 반응하게 해요.
let lastTouch = null;
function rememberTouch(e) {
  const t = (e.changedTouches || [])[0];
  if (t) lastTouch = { x: t.clientX, y: t.clientY, at: performance.now() };
}
document.addEventListener('touchstart', rememberTouch, { capture: true, passive: true });
document.addEventListener('touchend', rememberTouch, { capture: true, passive: true });
function clickableOf(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (n.tagName === 'BUTTON' || n.tagName === 'CANVAS' || n.onclick) return n;
  }
  return null;
}
document.addEventListener('click', e => {
  if (e.detail === 0) return;                                            // 키보드(엔터)
  if (!lastTouch || performance.now() - lastTouch.at > 1000) return;     // 마우스로 누른 경우
  const el = clickableOf(e.target);
  if (!el) return;
  const r = el.getBoundingClientRect(), { x, y } = lastTouch;
  // 눌린 버튼은 2칸 아래로 살짝 내려가 보여요 → 원래 자리로 계산해요
  let tx = 0, ty = 0;
  try { const m = new DOMMatrixReadOnly(getComputedStyle(el).transform); tx = m.m41; ty = m.m42; } catch (err) { /* 무시 */ }
  if (x < r.left - tx || x > r.right - tx || y < r.top - ty || y > r.bottom - ty) {   // 손가락이 버튼 밖 → 무시
    e.stopPropagation(); e.preventDefault();
  }
}, true);
const key = (x, y) => x + ',' + y;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const sleep = ms => new Promise(r => setTimeout(r, ms));

const canvas = $('board');
const ctx = canvas.getContext('2d');
const bg = document.createElement('canvas');
const bgc = bg.getContext('2d');

const G = {
  stageNo: 1, stage: null, map: [], cols: 0, rows: 0,
  units: [], sel: null, origin: null, reach: null, targets: null,
  state: 'title',            // title, dialog, idle, menu, target, busy, over
  phase: 'player', turn: 1,
  floats: [], banner: null, ghost: null,
  stats: { total: 0, correct: 0 },
  defeated: 0, midDone: false
};

// =====================================================
//  저장하기 · 불러오기 (이 컴퓨터의 브라우저에 저장돼요)
// =====================================================
const SAVE_KEY = 'chopyeong-tactics2-gopsem-save-v1';   // 앱제작1과 따로 저장돼요
// 🎲 문제를 틀려도 33% 확률로 공격이 맞아요 (피해는 원래의 절반)
const LUCKY_RATE = 0.33;
const TAP_GUARD_MS = 450;   // 📱 새로 뜬 보기는 0.45초 동안 눌리지 않아요 (패드 연타 방지)
const SLOT_COUNT = 3;
// 지금 진행 상황: 이름, 깬 스테이지 별점, 강화 상태(gear), 남은 강화 기회(points)
let PROG = newProg('');
// 🔥 난이도: 'normal'(보통) / 'hard'(어려움). 두 난이도의 진행 기록은 따로따로 보관돼요.
let MODE = 'normal';
const PROGS = { normal: PROG, hard: null };
function newProg(name, cast = defaultCast(), hard = false) {
  return { name, cleared: {}, slot: null, gear: {}, points: 0, rewarded: {}, tpoints: 0, rewardedT: {},
           hcleared: {}, lv: {}, team: [],   // 히든 스테이지 별점, 레벨·경험치, 마지막으로 고른 팀
           cast,                             // 주인공·동료 배역 (직업 ↔ 이름)
           hard, dead: [], revives: 0, rewardedR: {},     // 어려움: 쓰러진 친구, 살리기 기회
           mid: 0, crowns: [] };                          // 👑 중간보스 별점, 왕관 쓴 친구
}
const isHard = () => MODE === 'hard';
const deadList = () => (isHard() && PROG.dead) ? PROG.dead : [];
// 난이도 바꾸기 (지금 기록은 보관하고, 그 난이도의 기록을 꺼내요)
function setMode(m) {
  if (m === MODE && PROGS[m] === PROG) return;
  const old = PROG;
  PROGS[MODE] = PROG;
  MODE = m;
  if (!PROGS[m]) PROGS[m] = newProg(old.name, old.cast, m === 'hard');
  PROG = PROGS[m];
  PROG.slot = old.slot; if (old.name) PROG.name = old.name;
  applyCast(PROG.cast);
}
// 예전 저장 파일은 학생 id(byungwoo…)로 저장되어 있어서 직업 id(warrior…)로 바꿔요
function remapKeys(obj) {
  const out = {};
  Object.keys(obj || {}).forEach(k => { out[OLD2CLASS[k] || k] = obj[k]; });
  return out;
}
// 예전 저장 파일도 불러올 수 있게 빈 칸을 채워요
function normalizeProg(s, slot) {
  const p = { name: s.name || '', cleared: { ...(s.cleared || {}) }, slot, gear: JSON.parse(JSON.stringify(s.gear || {})),
              points: s.points || 0, rewarded: { ...(s.rewarded || {}) },
              tpoints: s.tpoints || 0, rewardedT: { ...(s.rewardedT || {}) },
              hcleared: { ...(s.hcleared || {}) }, lv: JSON.parse(JSON.stringify(s.lv || {})), team: [...(s.team || [])],
              cast: s.cast ? JSON.parse(JSON.stringify(s.cast)) : defaultCast(),
              hard: !!s.hard, dead: [...(s.dead || [])], revives: s.revives || 0, rewardedR: { ...(s.rewardedR || {}) },
              mid: s.mid || 0, crowns: [...(s.crowns || [])] };
  if (!s.cast) {   // 배역 기능이 생기기 전 저장 → 예전 그대로 (병우=전사 …)
    p.gear = remapKeys(p.gear); p.lv = remapKeys(p.lv); p.team = p.team.map(k => OLD2CLASS[k] || k);
  }
  if (!s.rewardedT) { // 초월 강화가 생기기 전에 깬 스테이지 3·5·7·9 몫을 챙겨 줘요
    TRANSCEND_STAGES.forEach(n => { if (p.cleared[n] && STAGES[n]) { p.rewardedT[n] = true; p.tpoints += pointsFor(STAGES[n].heroes.length); } });
  }
  if (!s.rewarded) { // 강화 기능이 생기기 전에 깬 스테이지 몫의 강화 기회를 챙겨 줘요
    Object.keys(p.cleared).forEach(n => { if (p.cleared[n] && STAGES[n]) { p.rewarded[n] = true; p.points += pointsFor(STAGES[n].heroes.length); } });
  }
  return p;
}

function readSlots() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (Array.isArray(s)) { while (s.length < SLOT_COUNT) s.push(null); return s.slice(0, SLOT_COUNT); }
  } catch (e) { /* 저장소를 쓸 수 없는 경우 */ }
  return Array(SLOT_COUNT).fill(null);
}
function writeSlots(slots) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(slots)); return true; } catch (e) { return false; }
}
function snapshot(P = PROG) {
  return { name: P.name, cleared: { ...P.cleared }, gear: JSON.parse(JSON.stringify(P.gear)),
           points: P.points, rewarded: { ...P.rewarded },
           tpoints: P.tpoints, rewardedT: { ...P.rewardedT },
           hcleared: { ...(P.hcleared || {}) }, lv: JSON.parse(JSON.stringify(P.lv || {})), team: [...(P.team || [])],
           cast: JSON.parse(JSON.stringify(P.cast || defaultCast())),
           hard: !!P.hard, dead: [...(P.dead || [])], revives: P.revives || 0, rewardedR: { ...(P.rewardedR || {}) },
           mid: P.mid || 0, crowns: [...(P.crowns || [])],
           savedAt: Date.now() };
}
// battle: 전투 중에 저장할 때만 전투 상황을 함께 저장해요
// 한 저장 칸에 보통·어려움 기록이 함께 들어가요 (mode: 마지막으로 하던 난이도)
function saveToSlot(i, battle = null) {
  const slots = readSlots();
  PROGS[MODE] = PROG;
  const N = PROGS.normal || newProg(PROG.name, PROG.cast), H = PROGS.hard;
  N.name = H && H.name && !N.name ? H.name : (PROG.name || N.name);
  if (H) H.name = PROG.name || H.name;
  slots[i] = { ...snapshot(N), name: PROG.name || N.name, hard: H ? snapshot(H) : null, mode: MODE, battle };
  if (!writeSlots(slots)) return false;
  [PROGS.normal, PROGS.hard, PROG].forEach(P => { if (P) P.slot = i; });
  return true;
}
const maxCleared = c => Object.keys(c).map(Number).filter(n => c[n]).reduce((a, b) => Math.max(a, b), 0);
const totalStars = c => Object.values(c).reduce((a, b) => a + (b || 0), 0);
// 🔓 한 번이라도 깬 스테이지 기록 (이 컴퓨터·브라우저에 따로 남아요)
//    저장을 안 했거나, 새로 시작해도, 다른 저장 칸이어도 한 번 깼으면 다음 스테이지가 열려요.
const EVER_KEY = SAVE_KEY + '-ever';
function readEver() {
  try { const e = JSON.parse(localStorage.getItem(EVER_KEY) || 'null'); if (e && e.main && e.hidden) { e.hard = e.hard || {}; e.mid = e.mid || {}; return e; } } catch (err) { /* 저장소를 못 쓰면 빈 기록 */ }
  return { main: {}, hidden: {}, hard: {}, mid: {} };
}
function markEver(kind, n) {
  const e = readEver(); e[kind][n] = 1;
  try { localStorage.setItem(EVER_KEY, JSON.stringify(e)); } catch (err) { /* 무시 */ }
}
// 지금 기록 + 한 번이라도 깬 기록 + 저장 칸 기록 중 하나라도 있으면 "깬 적 있음"
function everCleared(n, mode = MODE) {
  const P = mode === MODE ? PROG : PROGS[mode];
  if (mode === 'hard') {
    if ((P && P.cleared[n]) || readEver().hard[n]) return true;
    return readSlots().some(s => s && s.hard && s.hard.cleared && s.hard.cleared[n]);
  }
  if ((P && P.cleared[n]) || readEver().main[n]) return true;
  return readSlots().some(s => s && s.cleared && s.cleared[n]);
}
function everHCleared(n) {
  if ((PROG.hcleared || {})[n] || readEver().hidden[n]) return true;
  return readSlots().some(s => s && s.hcleared && s.hcleared[n]);
}
// 👑 중간보스를 한 번이라도 깼는지 (난이도별)
function everMid(mode = MODE) {
  const P = mode === MODE ? PROG : PROGS[mode];
  if ((P && P.mid) || readEver().mid[mode]) return true;
  return readSlots().some(s => s && (mode === 'hard' ? (s.hard && s.hard.mid) : s.mid));
}
const midUnlocked = () => everCleared(5);
// 스테이지 6은 중간보스를 깨야 열려요 (예전에 이미 6을 깬 기록이 있으면 그대로 열려요)
const isUnlocked = n => n === 1 || (everCleared(n - 1) && (n !== 6 || everMid() || everCleared(6)));
function fmtDate(t) {
  const d = new Date(t), p = v => String(v).padStart(2, '0');
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ---------------- 소리 ----------------
// 효과음은 js/sound.js 에 있어요 (sfx 함수)

// ---------------- 스테이지 준비 ----------------
// opt.hidden: 히든 스테이지, opt.team: 고른 친구 4명
function loadStage(no, opt = {}) {
  const st = opt.hidden ? HIDDEN_STAGES[no] : opt.midboss ? MIDBOSS : STAGES[no];
  G.hidden = !!opt.hidden; G.team = opt.team || null; G.midboss = !!opt.midboss;
  G.stageNo = no; G.stage = st; G.map = st.map;
  G.rows = st.map.length; G.cols = st.map[0].length;
  CUR_MAP = st.map;
  canvas.width = G.cols * T * S; canvas.height = G.rows * T * S;
  if (typeof fitLayout === 'function') fitLayout();
  buildBg();

  G.units = [];
  let heroList = opt.hidden ? opt.team.map((id, i) => ({ id, x: st.starts[i].x, y: st.starts[i].y }))
    : st.heroes.map(h => ({ ...h, id: roleClass(h.id) }));
  // 🔥 어려움: 쓰러진 친구는 다음 스테이지에도 나오지 못해요
  if (!opt.hidden && deadList().length) {
    const alive = heroList.filter(h => !deadList().includes(h.id));
    if (alive.length) heroList = alive;
  }
  heroList.forEach(h => {
    const c = CHARACTERS[h.id], s = statsFor(h.id);   // 강화된 능력치 (👑 왕관 보너스 포함)
    G.units.push({ id: h.id, side: 'hero', name: c.name, role: c.role, look: lookOf(h.id),
      x: h.x, y: h.y, px: h.x * T, py: h.y * T, hp: s.hp, maxHp: s.hp, atk: s.atk, move: s.move, def: s.def,
      rmin: s.rmin, rmax: s.rmax, skill: s.skill, skill2: s.skill2, wName: s.wName, trans: s.trans,
      cd: 0, cd2: 0, acted: false, alive: true, dir: 1, guarding: false });
  });
  const boost = st.boost || { hp: 1, atk: 0 };
  const sc = opt.hidden ? { hp: 1, atk: 0 } : stageScale(no);     // 뒤 스테이지일수록, 어려움일수록 강해져요
  st.enemies.forEach((e, i) => {
    const d = ENEMIES[e.type];
    const bs = e.type === 'dongjin' && !opt.hidden ? BOSS_BOOST[MODE] : { hp: 1, atk: 0, def: 0 };   // 대마왕 동진
    const hp = Math.round((e.hp || d.hp) * boost.hp * sc.hp * bs.hp);
    G.units.push({ id: 'e' + i, side: 'enemy', type: e.type, name: d.name, color: e.color, boss: e.type === 'dongjin' || e.type === 'midboss',
      storm: e.type === 'midboss' ? MIDBOSS.storm : '👑 동진의 소수점 폭풍!',
      x: e.x, y: e.y, px: e.x * T, py: e.y * T, hp, maxHp: hp, atk: d.atk + boost.atk + sc.atk + bs.atk, move: d.move, def: (d.def || 0) + bs.def,
      rmin: d.rmin, rmax: d.rmax, aggro: d.aggro, fly: !!d.fly, alive: true, dir: -1, phaseOff: i * 170 });
  });
  G.kills = {}; G.lastHit = null;
  G.turn = 1; G.phase = 'player'; G.defeated = 0; G.midDone = false;
  G.stats = { total: 0, correct: 0 };
  G.floats = []; G.banner = null; G.ghost = null;
  clearSel();
  $('stageName').textContent = (isHard() && !opt.hidden ? '🔥 ' : '') + st.title + ' · ' + st.name;
  if (opt.midboss) G.stageNo = 5;   // 중간보스는 스테이지 5 다음 (적 강도도 스테이지 5 기준)
  updateTop();
}

const heroes = () => G.units.filter(u => u.alive && u.side === 'hero');
const enemies = () => G.units.filter(u => u.alive && u.side === 'enemy');
function unitAt(x, y) { return G.units.find(u => u.alive && x === u.x && y === u.y); }
function inMap(x, y) { return x >= 0 && y >= 0 && x < G.cols && y < G.rows; }
// 날거나 헤엄치는 적(fly)은 물 위로도 다닐 수 있어요
function walkable(x, y, u) {
  if (!inMap(x, y)) return false;
  const t = G.map[y][x];
  return WALKABLE.has(t) || (!!u && !!u.fly && FLYABLE.has(t));
}
function dist(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }

// 갈 수 있는 칸 찾기 (같은 편은 지나갈 수 있지만, 멈출 수는 없어요)
function computeReach(u) {
  const d = new Map([[key(u.x, u.y), 0]]), prev = new Map(), q = [[u.x, u.y]];
  while (q.length) {
    const [x, y] = q.shift(); const cd = d.get(key(x, y));
    if (cd >= u.move) continue;
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy, k = key(nx, ny);
      if (!walkable(nx, ny, u) || d.has(k)) continue;
      const o = unitAt(nx, ny);
      if (o && o.side !== u.side) continue;
      d.set(k, cd + 1); prev.set(k, key(x, y)); q.push([nx, ny]);
    }
  }
  const tiles = new Map();
  for (const [k, v] of d) { const [x, y] = k.split(',').map(Number); const o = unitAt(x, y); if (!o || o === u) tiles.set(k, v); }
  return { tiles, prev };
}
function pathTo(reach, u, x, y) {
  const path = []; let k = key(x, y); const start = key(u.x, u.y);
  while (k && k !== start) { const [a, b] = k.split(',').map(Number); path.unshift({ x: a, y: b }); k = reach.prev.get(k); }
  return path;
}
function targetsFrom(u, rmin, rmax) {
  return enemies().filter(e => { const d = dist(u, e); return d >= rmin && d <= rmax; });
}
// mode: 'skill'(첫 번째 스킬) / 'skill2'(🔮 히든 스킬)
function skOf(u, mode) { return mode === 'skill2' ? u.skill2 : u.skill; }
function healTargets(u, sk = u.skill) {
  return heroes().filter(h => { const d = dist(u, h); return d >= sk.rmin && d <= sk.rmax && h.hp < h.maxHp; });
}
function skillTargets(u, sk = u.skill) {
  if (!sk) return [];
  if (sk.type === 'guard') return [u];
  return sk.type === 'heal' ? healTargets(u, sk) : targetsFrom(u, sk.rmin, sk.rmax);
}

// ---------------- 움직임 ----------------
function tween(u, tx, ty, ms) {
  return new Promise(r => {
    const sx = u.px, sy = u.py, t0 = performance.now();
    function step(t) {
      const k = Math.min(1, (t - t0) / ms);
      u.px = sx + (tx - sx) * k; u.py = sy + (ty - sy) * k;
      if (k < 1) requestAnimationFrame(step); else r();
    }
    requestAnimationFrame(step);
  });
}
async function walk(u, path) {
  for (const p of path) {
    if (p.x > u.x) u.dir = 1; else if (p.x < u.x) u.dir = -1;
    sfx('move');
    await tween(u, p.x * T, p.y * T, 110);
    u.x = p.x; u.y = p.y;
  }
}
async function lunge(a, t) {
  if (t.x > a.x) a.dir = 1; else if (t.x < a.x) a.dir = -1;
  const dx = Math.sign(t.x - a.x) * 5, dy = Math.sign(t.y - a.y) * 5;
  await tween(a, a.x * T + dx, a.y * T + dy, 90);
  await tween(a, a.x * T, a.y * T, 120);
}
function floatText(u, text, color) { G.floats.push({ x: u.px + 8, y: u.py, text, color, t0: performance.now() }); }
function showBanner(text, color = '#ffe27a') { G.banner = { text, color, t0: performance.now() }; return sleep(1100); }
function shake() { const w = $('boardWrap'); w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); }

async function damage(target, amount, opt = {}) {
  let dmg = Math.max(1, amount - (opt.ignoreDef ? 0 : (target.def || 0)));  // 방어력만큼 덜 받아요 (고원이의 돌진은 무시)
  if (opt.half) dmg = Math.max(1, Math.round(dmg / 2));                         // 🎲 아슬아슬 명중: 원래 피해의 절반
  let guarded = false;
  if (target.side === 'hero') {                              // 영이 형의 방패
    const gs = heroes().filter(g => g.guarding && dist(g, target) <= (g.guardSk || g.skill).grange);
    if (gs.length) {
      const cut = Math.max(...gs.map(g => (g.guardSk || g.skill).cut));
      dmg = Math.max(1, Math.round(dmg * (1 - cut)));
      guarded = true;
    }
  }
  target.hp = Math.max(0, target.hp - dmg);
  target.flash = performance.now() + 250;
  floatText(target, '-' + dmg + (guarded ? ' 🛡' : ''), target.side === 'enemy' ? '#ffe27a' : '#ff7a7a');
  sfx(target.side === 'enemy' ? 'hitEnemy' : 'hurt');   // 맞는 소리
  if (guarded) sfx('guarded');
  if (target.hp <= 0) {
    await sleep(250);
    sfx(target.side === 'enemy' ? 'defeat' : 'heroDown'); // 쓰러지는 소리
    target.fadeStart = performance.now();
    await sleep(500);
    target.alive = false;
    if (target.side === 'enemy') {
      G.defeated++;
      if (G.lastHit) G.kills[G.lastHit] = (G.kills[G.lastHit] || 0) + 1;   // 누가 잡았는지 (경험치)
    }
    else floatText(target, '쓰러짐...', '#ffffff');
  }
}

// ---------------- 적 능력치 (스테이지가 뒤로 갈수록 조금씩 강해져요) ----------------
//  [체력 배수, 공격력 더하기]  보통은 조금만, 어려움은 더 많이 올라가요.
const ENEMY_SCALE = {
  normal: { 1: [1.0, 0], 2: [1.0, 0], 3: [1.05, 0], 4: [1.1, 0], 5: [1.15, 1], 6: [1.2, 1], 7: [1.25, 1], 8: [1.3, 1], 9: [1.35, 2], 10: [1.4, 2] },
  hard:   { 1: [1.35, 1], 2: [1.35, 1], 3: [1.4, 1], 4: [1.45, 2], 5: [1.55, 2], 6: [1.6, 3], 7: [1.65, 3], 8: [1.7, 3], 9: [1.75, 4], 10: [1.8, 4] }
};
function stageScale(n) { const v = (ENEMY_SCALE[MODE] || ENEMY_SCALE.normal)[n] || [1, 0]; return { hp: v[0], atk: v[1] }; }
// 👑 대마왕 동진은 따로 더 강해요 (+ 3턴마다 주변 친구 모두를 공격하는 "소수점 폭풍")
const BOSS_BOOST = { normal: { hp: 1.5, atk: 1, def: 1 }, hard: { hp: 1.7, atk: 2, def: 1 } };
const BOSS_STORM_EVERY = 3, BOSS_STORM_RANGE = 2;
// 💖 어려움: 스테이지 3·6·9를 처음 깨면 쓰러진 친구를 1·2·3명 살릴 수 있어요
const REVIVE_STAGES = { 3: 1, 6: 2, 9: 3 };

// ---------------- 그리기 ----------------
// 지도 배경 그림 만들기 (스테이지 시작할 때, 그리고 패드가 그림을 지웠을 때 다시)
function buildBg() {
  if (!G.map) return;
  bg.width = canvas.width; bg.height = canvas.height;
  bgc.imageSmoothingEnabled = false; ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < G.rows; y++) for (let x = 0; x < G.cols; x++) drawTile(bgc, G.map[y][x], x, y, S);
  if (G.stage && G.stage.night) { bgc.fillStyle = 'rgba(20,20,80,0.38)'; bgc.fillRect(0, 0, bg.width, bg.height); }   // 밤
  bgCheckAt = performance.now() + 1500;
}
// 📱 패드는 메모리가 부족하거나 다른 앱에 다녀오면 그림을 몰래 지울 수 있어요.
//    지워지면 화면이 까매지고 캐릭터가 분신처럼 남아요 → 1.5초마다 확인해서 다시 그려요.
let bgCheckAt = 0;
function bgLost() {
  try {
    if (!G.map || bg.width !== canvas.width || bg.height !== canvas.height) return true;
    const a = bgc.getImageData(Math.floor(bg.width / 2), Math.floor(bg.height / 2), 1, 1).data[3];
    const b = bgc.getImageData(1, 1, 1, 1).data[3];
    return a === 0 || b === 0;          // 지도 타일은 투명한 곳이 없어요 → 투명하면 지워진 것
  } catch (e) { return false; }
}
function repairCanvas() { if (G.map) { buildBg(); } }
bg.addEventListener('contextrestored', repairCanvas);
canvas.addEventListener('contextrestored', repairCanvas);
document.addEventListener('visibilitychange', () => { if (!document.hidden) repairCanvas(); });
window.addEventListener('pageshow', repairCanvas);
window.addEventListener('focus', repairCanvas);

function render(now) {
  try { drawFrame(now); }
  catch (e) { console.error('그리기 오류', e); }      // 한 번 실수해도 그리기는 멈추지 않아요
  requestAnimationFrame(render);
}
function drawFrame(now) {
  if (now > bgCheckAt) { bgCheckAt = now + 1500; if (bgLost()) buildBg(); }
  // 매번 깨끗하게 지우고 그려요 (분신처럼 남는 것 방지)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, 0, 0);
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x * S, y * S, w * S, h * S); };

  // 갈 수 있는 칸 (파랑)
  if (G.reach && G.state === 'menu' && !G.sel.moved) {
    for (const k of G.reach.tiles.keys()) {
      const [x, y] = k.split(',').map(Number);
      R(x * T, y * T, T, T, 'rgba(70,140,255,0.38)');
      ctx.strokeStyle = 'rgba(200,225,255,0.8)'; ctx.lineWidth = 2;
      ctx.strokeRect(x * T * S + 2, y * T * S + 2, T * S - 4, T * S - 4);
    }
  }
  // 고를 수 있는 칸 (공격=빨강, 치유=초록)
  if (G.state === 'target' && G.sel) {
    const heal = G.targetKind === 'heal';
    const { rmin, rmax } = G.targetRange;
    for (let y = 0; y < G.rows; y++) for (let x = 0; x < G.cols; x++) {
      const d = Math.abs(x - G.sel.x) + Math.abs(y - G.sel.y);
      if (d >= rmin && d <= rmax) R(x * T, y * T, T, T, heal ? 'rgba(80,220,110,0.2)' : 'rgba(255,70,70,0.22)');
    }
    const pulse = 0.45 + 0.25 * Math.sin(now / 150);
    for (const e of G.targets) {
      R(e.x * T, e.y * T, T, T, heal ? `rgba(80,230,110,${pulse})` : `rgba(255,60,60,${pulse})`);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
      ctx.strokeRect(e.x * T * S + 2, e.y * T * S + 2, T * S - 4, T * S - 4);
    }
  }
  // 방패로 지키는 범위 (하늘색)
  for (const g of G.units) {
    if (!g.alive || !g.guarding) continue;
    const r = (g.guardSk || g.skill).grange;
    for (let y = g.y - r; y <= g.y + r; y++) for (let x = g.x - r; x <= g.x + r; x++) {
      if (inMap(x, y) && Math.abs(x - g.x) + Math.abs(y - g.y) <= r) R(x * T, y * T, T, T, 'rgba(120,200,255,0.22)');
    }
  }
  // 선택 표시 (노란 모서리)
  if (G.sel) {
    const b = Math.floor(now / 250) % 2;
    const x = G.sel.px * S, y = G.sel.py * S, w = T * S, L = 12;
    ctx.fillStyle = '#ffe27a';
    [[x - b, y - b, 1, 1], [x + w + b, y - b, -1, 1], [x - b, y + w + b, 1, -1], [x + w + b, y + w + b, -1, -1]].forEach(([cx, cy, sx, sy]) => {
      ctx.fillRect(sx > 0 ? cx : cx - L, sy > 0 ? cy : cy - 3, L, 3);
      ctx.fillRect(sx > 0 ? cx : cx - 3, sy > 0 ? cy : cy - L, 3, L);
    });
  }

  // 캐릭터 (아래쪽에 있는 캐릭터를 나중에 그려요)
  const list = G.units.filter(u => u.alive).sort((a, b) => a.py - b.py);
  for (const u of list) {
    const frame = Math.floor((now + (u.phaseOff || 0)) / 450) % 2;
    let alpha = 1;
    if (u.fadeStart) alpha = Math.max(0, 1 - (now - u.fadeStart) / 500);
    if (u.side === 'hero' && u.acted && G.phase === 'player') alpha *= 0.55;
    ctx.globalAlpha = alpha;
    R(u.px + 3, u.py + 14, 10, 2, 'rgba(0,0,0,0.25)');
    const white = u.flash && now < u.flash && Math.floor(now / 60) % 2 === 0;
    const parts = u.side === 'enemy' ? enemyParts(u, frame) : chibiParts(u.look, frame);
    drawParts(ctx, parts, u.px, u.py, S, u.dir, white);
    if (u.stunned > 0 && !u.fadeStart) { // 어질어질 별
      for (let k = 0; k < 2; k++) {
        const a = now / 250 + k * 3.14;
        R(u.px + 7 + Math.cos(a) * 5, u.py - 1 + Math.sin(a) * 1.5, 2, 2, '#ffe27a');
      }
    }
    if (u.trans && !u.fadeStart) { // 🌟 초월한 친구는 금빛 반짝이
      for (let k = 0; k < 3; k++) {
        const a = now / 400 + k * 2.09, sx = u.px + 8 + Math.cos(a) * 8, sy = u.py + 7 + Math.sin(a) * 7;
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now / 150 + k);
        R(sx - 0.5, sy - 1.5, 1, 3, '#ffe27a'); R(sx - 1.5, sy - 0.5, 3, 1, '#ffe27a');
      }
      ctx.globalAlpha = 1;
    }
    if (u.guarding) { // 방패 표시
      ctx.globalAlpha = 0.6 + 0.3 * Math.sin(now / 150);
      ctx.strokeStyle = '#9ad0ff'; ctx.lineWidth = 3;
      ctx.strokeRect(u.px * S + 3, u.py * S + 3, T * S - 6, T * S - 6);
    }
    ctx.globalAlpha = 1;
    if (!u.fadeStart) {
      const w = 14, f = Math.max(0, u.hp / u.maxHp);
      R(u.px + 1, u.py - 4, w, 2.5, '#1a1020');
      R(u.px + 1, u.py - 4, w * f, 2.5, u.side === 'enemy' ? '#ff5a64' : (f > 0.5 ? '#4fd05a' : f > 0.25 ? '#f2c84b' : '#ff5a64'));
    }
  }

  // 동진의 환영
  if (G.ghost) {
    ctx.globalAlpha = 0.55 + 0.25 * Math.sin(now / 120);
    drawParts(ctx, chibiParts(CHARACTERS.dongjin.look, Math.floor(now / 400) % 2), G.ghost.x * T, G.ghost.y * T - 4, S, -1);
    ctx.globalAlpha = 1;
  }

  // 떠오르는 글자
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  G.floats = G.floats.filter(f => now - f.t0 < 1000);
  for (const f of G.floats) {
    const k = (now - f.t0) / 1000;
    ctx.font = `bold ${9 * S}px Galmuri11, 'Malgun Gothic', sans-serif`;
    ctx.globalAlpha = 1 - Math.max(0, k - 0.6) / 0.4;
    ctx.lineWidth = 6; ctx.strokeStyle = '#1a1020';
    ctx.strokeText(f.text, f.x * S, (f.y - 4 - k * 10) * S);
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x * S, (f.y - 4 - k * 10) * S);
    ctx.globalAlpha = 1;
  }

  // 큰 알림 띠
  if (G.banner) {
    const k = (now - G.banner.t0) / 1100;
    if (k > 1) G.banner = null;
    else {
      const a = k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1;
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(16,16,40,0.85)';
      ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
      ctx.fillStyle = G.banner.color; ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 4); ctx.fillRect(0, canvas.height / 2 + 36, canvas.width, 4);
      ctx.font = `${16 * S / 1.5}px Galmuri11, 'Malgun Gothic', sans-serif`;
      ctx.lineWidth = 6; ctx.strokeStyle = '#1a1020';
      ctx.strokeText(G.banner.text, canvas.width / 2, canvas.height / 2 + 2);
      ctx.fillStyle = G.banner.color; ctx.fillText(G.banner.text, canvas.width / 2, canvas.height / 2 + 2);
      ctx.globalAlpha = 1;
    }
  }
}

// ---------------- 위·아래 패널 ----------------
function updateTop() {
  $('turnInfo').textContent = `${G.turn}턴 · ${G.phase === 'player' ? '우리 편 차례' : '적의 차례'}`;
  $('endTurnBtn').disabled = !(G.phase === 'player' && G.state === 'idle');
  $('homeTopBtn').disabled = !(G.state === 'idle' || G.state === 'over' || G.state === 'title');
  $('saveTopBtn').disabled = !(G.state === 'idle' && G.phase === 'player');
  $('loadTopBtn').disabled = !(G.state === 'idle' && G.phase === 'player');
}
function hpBar(u) {
  return `<span class="hpbar ${u.side === 'enemy' ? 'enemy' : ''}"><i style="width:${(u.hp / u.maxHp) * 100}%"></i></span>${u.hp}/${u.maxHp}`;
}
// 📱 화면 높이에 맞추기: 위쪽 메뉴 + 아래 정보창(가장 컸던 높이) 만큼을 빼고 지도를 보여 줘요
let panelMaxH = 0;
function fitLayout(reset) {
  if (reset) panelMaxH = 0;
  panelMaxH = Math.max(panelMaxH, $('panel').offsetHeight || 0, 128);
  const ui = $('topbar').offsetHeight + panelMaxH + 46;
  document.documentElement.style.setProperty('--ui-h', ui + 'px');
  // 지도 크기: 가로(화면 폭)와 세로(남은 높이) 중 더 좁은 쪽에 맞춰 비율 그대로 키우거나 줄여요
  const availW = $('game').clientWidth - 22, availH = Math.max(200, window.innerHeight - ui);
  const k = Math.min(availW / canvas.width, availH / canvas.height);
  if (k > 0 && isFinite(k)) { canvas.style.width = Math.floor(canvas.width * k) + 'px'; canvas.style.height = Math.floor(canvas.height * k) + 'px'; }
}
window.addEventListener('resize', () => fitLayout(true));
window.addEventListener('orientationchange', () => setTimeout(() => fitLayout(true), 300));
function setPanel(u, html, buttons = []) {
  drawPortrait($('mini'), u ? (u.side === 'enemy' ? { enemy: u } : { look: u.look }) : null);
  $('uinfo').innerHTML = html;
  const box = $('actions'); box.innerHTML = '';
  for (const b of buttons) {
    const el = document.createElement('button');
    el.className = 'btn' + (b.cls ? ' ' + b.cls : '');
    el.textContent = b.label; el.disabled = !!b.disabled;
    // 📱 연타 방지 + 캐릭터가 움직이거나 문제를 푸는 중(busy)에는 명령 버튼이 눌리지 않아요 (이야기 중 [건너뛰기]는 눌려요)
    safeTap(el, e => { e.stopPropagation(); if (!el.disabled && G.state !== 'busy') b.fn(); }, PANEL_GUARD_MS, 0);
    box.appendChild(el);
  }
  updateTop();
  if (($('panel').offsetHeight || 0) > panelMaxH) fitLayout();
}
function unitHTML(u) {
  if (u.side === 'enemy') {
    return `<div><span class="uname">${u.name}</span><span class="urole">적</span></div>
      <div>체력 ${hpBar(u)}</div><div>공격력 ${u.atk}${u.def ? ' · 방어 ' + u.def : ''} · 이동 ${u.move}칸 · 사거리 ${u.rmax}칸</div>`;
  }
  const cdTxt = u.cd > 0 ? ` <span style="color:#ff9aa0">(${u.cd}턴 뒤 사용 가능)</span>` : ' <span style="color:#7cff8a">(사용 가능)</span>';
  return `<div><span class="uname">${u.name}</span><span class="urole">${u.role}</span></div>
    <div>체력 ${hpBar(u)}</div>
    <div>공격력 ${u.atk}${u.def ? ' · 방어 ' + u.def : ''} · 이동 ${u.move}칸 · 사거리 ${u.rmax}칸 · 🗡 ${u.wName}</div>
    <div>✨ ${u.skill.name}: ${skillDesc(u.skill)}${cdTxt}</div>` +
    (u.skill2 ? `<div>${u.skill2.name}: ${skillDesc(u.skill2)}${u.cd2 > 0 ? ` <span style="color:#ff9aa0">(${u.cd2}턴 뒤 사용 가능)</span>` : ' <span style="color:#7cff8a">(사용 가능)</span>'}</div>` : '');
}
function idlePanel() {
  const left = heroes().filter(h => !h.acted).length;
  setPanel(null, `<div class="tip">👆 움직일 친구를 눌러 주세요!</div>
    <div class="tip" style="color:#b8c4ff">남은 친구 ${left}명 · 남은 적 ${enemies().length}마리</div>`);
}

function clearSel() { G.sel = null; G.reach = null; G.targets = null; G.origin = null; }

// ---------------- 우리 편 조작 ----------------
// 📱 패드 안정성: 손가락을 '뗄 때(click)' 반응해요.
//    (누르는 순간 반응하면, 손을 뗄 때 생기는 클릭이 새로 뜬 문제 창의 보기를 대신 눌러 버려요)
canvas.addEventListener('click', e => {
  if (G.phase !== 'player') return;
  const r = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left) / r.width * G.cols);
  const y = Math.floor((e.clientY - r.top) / r.height * G.rows);
  if (!inMap(x, y)) return;
  onTile(x, y);
});

function onTile(x, y) {
  const u = unitAt(x, y);
  if (G.state === 'idle') {
    if (u && u.side === 'hero' && !u.acted) selectHero(u);
    else if (u) setPanel(u, unitHTML(u));
  } else if (G.state === 'menu') {
    const s = G.sel;
    if (!s.moved && G.reach.tiles.has(key(x, y)) && !(x === s.x && y === s.y)) moveHero(x, y);
    else if (u && u.side === 'hero' && !u.acted && u !== s && !s.moved) selectHero(u);
    else if (u && u.side === 'enemy' && targetsFrom(s, s.rmin, s.rmax).includes(u)) {
      chooseTarget('attack'); attack(s, u, 'attack');
    }
  } else if (G.state === 'target') {
    if (u && G.targets.includes(u)) {
      if (G.targetKind === 'heal') doHeal(G.sel, u, G.mode);
      else attack(G.sel, u, G.mode);
    }
  }
}

function selectHero(u) {
  sfx('select');
  G.sel = u; G.origin = { x: u.x, y: u.y }; u.moved = false;
  G.reach = computeReach(u);
  G.state = 'menu';
  heroMenu();
}
function heroMenu() {
  const u = G.sel;
  const canAtk = targetsFrom(u, u.rmin, u.rmax).length > 0;
  const canSkill = u.cd === 0 && skillTargets(u).length > 0;
  const tip = u.moved ? '' : '<div class="tip" style="color:#9ad0ff">파란 칸을 누르면 움직여요.</div>';
  const btns = [
    { label: '⚔ 공격', fn: () => chooseTarget('attack'), disabled: !canAtk },
    { label: u.skill.type === 'heal' ? '💚 치유' : u.skill.type === 'guard' ? '🛡 방패' : '✨ 스킬',
      fn: () => u.skill.type === 'guard' ? doGuard(u, 'skill') : chooseTarget('skill'), disabled: !canSkill, cls: 'gold' }
  ];
  if (u.skill2) {   // 🔮 히든 스킬 (두 번째 스킬)
    const can2 = (u.cd2 || 0) === 0 && skillTargets(u, u.skill2).length > 0;
    btns.push({ label: '🔮 히든', fn: () => u.skill2.type === 'guard' ? doGuard(u, 'skill2') : chooseTarget('skill2'), disabled: !can2, cls: 'purple' });
  }
  btns.push({ label: '대기', fn: () => endHeroAction(u) }, { label: '취소', fn: cancelHero, cls: 'red' });
  setPanel(u, unitHTML(u) + tip, btns);
}
async function moveHero(x, y) {
  const u = G.sel;
  G.state = 'busy'; updateTop();
  setPanel(u, unitHTML(u) + '<div class="tip">🚶 이동 중...</div>');   // 걷는 동안에는 버튼을 숨겨요
  await walk(u, pathTo(G.reach, u, x, y));
  u.moved = true;
  G.state = 'menu';
  heroMenu();
}
function cancelHero() {
  const u = G.sel;
  if (u.moved) { u.x = G.origin.x; u.y = G.origin.y; u.px = u.x * T; u.py = u.y * T; u.moved = false; }
  clearSel(); G.state = 'idle'; idlePanel();
}
function chooseTarget(mode) {
  const u = G.sel;
  G.mode = mode;
  const isSk = mode !== 'attack', sk = skOf(u, mode);
  const heal = isSk && sk.type === 'heal';
  G.targetKind = heal ? 'heal' : 'attack';
  G.targetRange = isSk ? { rmin: sk.rmin, rmax: sk.rmax } : { rmin: u.rmin, rmax: u.rmax };
  G.targets = isSk ? skillTargets(u, sk) : targetsFrom(u, u.rmin, u.rmax);
  G.state = 'target';
  const msg = heal ? '<div class="tip" style="color:#7cff8a">치료할 친구를 눌러 주세요! (초록 칸)</div>'
    : `<div class="tip" style="color:#ff9aa0">${isSk ? '스킬을 쓸' : '공격할'} 적을 눌러 주세요! (빨간 칸)</div>`;
  setPanel(u, unitHTML(u) + msg,
    [{ label: '뒤로', fn: () => { G.state = 'menu'; G.targets = null; heroMenu(); }, cls: 'red' }]);
}

async function attack(a, t, mode) {
  G.state = 'busy'; updateTop();
  const isSkill = mode !== 'attack', sk = skOf(a, mode);
  const q = genQuestion(isSkill ? 2 : 1);
  const ok = await askQuestion(q, isSkill ? `${mode === 'skill2' ? '🔮' : '✨'} ${a.name}의 스킬! [${sk.name}]` : `⚔ ${a.name}의 공격!`, false, isSkill ? '스킬 공격이 들어가요!' : '공격 성공!',
    '3번 중 1번은 약하게 맞아요');
  G.targets = null;
  // 🎲 틀렸어도 33% 확률로 맞아요 (피해는 절반, 스킬의 추가 효과는 없어요)
  const lucky = !ok && Math.random() < LUCKY_RATE;
  if (ok && isSkill) { sfx(mode === 'skill2' ? 'transcend' : 'charge'); floatText(a, mode === 'skill2' ? '🔮' : '✨', '#ffe27a'); await sleep(380); } // 힘 모으기
  sfx(ok || lucky ? (ATTACK_SFX[a.id] || 'slash') : 'miss');                                // 친구별 공격 소리
  await lunge(a, t);
  if (ok) {
    G.lastHit = a.id;
    const dmg = isSkill ? Math.round(a.atk * sk.power) : a.atk;
    // 넓게 공격: 맞은 적 바로 옆의 적들도 절반만큼
    const near = isSkill && sk.wide ? enemies().filter(e => e !== t && dist(e, t) === 1) : [];
    if (isSkill) { if (mode === 'skill2') a.cd2 = sk.cd; else a.cd = sk.cd; shake(); }
    await damage(t, dmg, { ignoreDef: isSkill && sk.ignoreDef });
    for (const e of near) if (e.alive) await damage(e, Math.ceil(dmg / 2));
    // 인성이의 팽이: 맞은 적은 다음 적 차례에 쉬어요
    if (isSkill && sk.stun && t.alive) { t.stunned = 1; floatText(t, '어질어질 💫', '#ffe27a'); sfx('spin'); await sleep(350); }
    // 지오의 물결 파도: 바로 옆 친구들 체력 회복
    if (isSkill && sk.healAround) {
      const near2 = heroes().filter(h => dist(h, a) <= 1);
      near2.forEach(h => { const b0 = h.hp; h.hp = Math.min(h.maxHp, h.hp + sk.healAround); if (h.hp > b0) floatText(h, '+' + (h.hp - b0), '#7cff8a'); });
      if (near2.length) { sfx('heal'); await sleep(350); }
    }
  } else if (lucky) {
    G.lastHit = a.id;
    const full = isSkill ? Math.round(a.atk * sk.power) : a.atk;
    floatText(a, '아슬아슬 명중!', '#ffe27a');
    await damage(t, full, { ignoreDef: isSkill && sk.ignoreDef, half: true });
    await sleep(200);
  } else {
    floatText(t, '빗나감!', '#ffffff');
    await sleep(500);
  }
  await endHeroAction(a);
}

async function doHeal(a, t, mode = 'skill') {
  G.state = 'busy'; updateTop();
  const sk = skOf(a, mode);
  const q = genQuestion(2);
  const ok = await askQuestion(q, `💚 ${a.name}의 스킬! [${sk.name}]`, false, `${t.name}의 체력이 ${sk.amount} 회복돼요!`, '치유는 조금만 돼요');
  G.targets = null;
  const amount = ok ? sk.amount : 3;
  if (ok) { if (mode === 'skill2') a.cd2 = sk.cd; else a.cd = sk.cd; }
  const list = ok && sk.all ? healTargets(a, sk) : [t];   // 모두 치유
  if (!list.includes(t)) list.push(t);
  for (const h of list) {
    const before = h.hp;
    h.hp = Math.min(h.maxHp, h.hp + amount);
    floatText(h, '+' + (h.hp - before), '#7cff8a');
  }
  sfx('heal');
  await sleep(600);
  await endHeroAction(a);
}

// 영이 형의 방패: 다음 적 차례 동안 주변 친구가 받는 피해를 줄여요
async function doGuard(a, mode = 'skill') {
  G.state = 'busy'; updateTop();
  const sk = skOf(a, mode);
  const q = genQuestion(2);
  const ok = await askQuestion(q, `🛡 ${a.name}의 스킬! [${sk.name}]`, false,
    `${sk.grange}칸 안 친구들이 받는 피해가 ${Math.round(sk.cut * 100)}% 줄어요!`, '방패를 놓쳤어요');
  if (ok) {
    // 이미 더 센 방패를 쓰고 있으면 그대로 둬요
    if (!a.guarding || (a.guardSk && sk.cut >= a.guardSk.cut)) a.guardSk = sk;
    a.guarding = true; if (mode === 'skill2') a.cd2 = sk.cd; else a.cd = sk.cd;
    floatText(a, '🛡 방패!', '#9ad0ff'); sfx('shield');
  }
  else { floatText(a, '앗, 놓쳤다!', '#ffffff'); sfx('miss'); }
  await sleep(500);
  await endHeroAction(a);
}

async function endHeroAction(u) {
  u.acted = true; u.moved = false;
  clearSel();
  G.state = 'busy';
  if (await checkEvents()) return;
  if (heroes().every(h => h.acted)) { await sleep(300); await enemyTurn(); }
  else { G.state = 'idle'; idlePanel(); }
}

// 이야기 사건 확인 (끝났으면 true)
async function checkEvents() {
  const st = G.stage;
  if (enemies().length === 0) { await stageClear(); return true; }
  if (!G.midDone && st.mid && G.defeated >= st.mid.after) {
    G.midDone = true;
    await storyScene(st.mid);
  }
  return false;
}

async function storyScene(scene) {
  if (scene.before) await showDialog(scene.before);
  const sq = scene.question;
  if (sq) {
    const q = makeQuestion(sq.a, sq.op, sq.b, fillText(sq.hint), sq.unit, fillText(sq.story));
    await askQuestion(q, '📜 이야기 문제', true);
  }
  if (scene.after2) await showDialog(scene.after2);
}

// ---------------- 적의 차례 ----------------
async function enemyTurn() {
  G.phase = 'enemy';
  G.state = 'busy'; clearSel();
  setPanel(null, '<div class="tip">적들이 움직이고 있어요...</div>');
  await showBanner('적의 차례!', '#ff9aa0');
  for (const e of enemies()) {
    if (!e.alive) continue;
    if (e.stunned > 0) {   // 어질어질해서 이번 차례는 쉬어요
      e.stunned--; floatText(e, '어질어질~ 💫', '#ffe27a'); await sleep(450); continue;
    }
    const hs = heroes(); if (!hs.length) break;
    // 👑 대마왕 동진: 3턴마다 가까운 친구 모두에게 "소수점 폭풍"
    if (e.boss && G.turn % BOSS_STORM_EVERY === 0) {
      const near = hs.filter(h => dist(e, h) <= BOSS_STORM_RANGE + 1);
      if (near.length) {
        await showBanner(e.storm || '👑 동진의 소수점 폭풍!', '#c89aff');
        shake(); sfx('enemyAtk');
        for (const h of near) if (h.alive) await damage(h, Math.round(e.atk * 0.7));
        await sleep(300);
        continue;
      }
    }
    hs.sort((a, b) => dist(e, a) - dist(e, b) || a.hp - b.hp);
    const target = hs[0];
    if (dist(e, target) > e.aggro) continue;
    if (dist(e, target) > e.rmax) {
      const reach = computeReach(e);
      // 공격할 수 있는 칸을 먼저 찾고(멀리서 쏘는 적은 거리를 두고), 없으면 가장 가까이
      let best = null, bestD = Infinity;
      for (const k of reach.tiles.keys()) {
        const [x, y] = k.split(',').map(Number);
        const d = Math.abs(x - target.x) + Math.abs(y - target.y);
        const score = (d >= e.rmin && d <= e.rmax) ? -100 - d : d;
        const steps = reach.tiles.get(k);
        if (score < bestD || (score === bestD && steps < best.steps)) { bestD = score; best = { x, y, steps }; }
      }
      if (best && (best.x !== e.x || best.y !== e.y)) { await walk(e, pathTo(reach, e, best.x, best.y)); await sleep(120); }
    }
    if (dist(e, target) <= e.rmax && dist(e, target) >= e.rmin) {
      sfx('enemyAtk');
      await lunge(e, target);
      await damage(target, e.atk + rnd(0, 1));
      await sleep(250);
    }
  }
  if (heroes().length === 0) { await gameOver(); return; }
  G.turn++; G.phase = 'player';
  for (const h of heroes()) { h.acted = false; h.guarding = false; h.guardSk = null; if (h.cd > 0) h.cd--; if (h.cd2 > 0) h.cd2--; }
  await showBanner(`${G.turn}턴 · 우리 편 차례!`);
  G.state = 'idle'; idlePanel();
}

$('endTurnBtn').onclick = async () => {
  if (G.phase !== 'player' || G.state !== 'idle') return;
  heroes().forEach(h => h.acted = true);
  await enemyTurn();
};

// =====================================================
//  대사 읽어 주기 (브라우저 음성)
// =====================================================
let ttsOn = true;
try { ttsOn = localStorage.getItem('cpt-tts') !== 'off'; } catch (e) { /* 기본은 켜짐 */ }
const HAS_TTS = 'speechSynthesis' in window;
// 목소리 배역
//  g: narr(해설) / m(남자아이) / f(여자아이) / boss(근엄한 남자 어른)
//  d: 학생마다 조금씩 다른 목소리 높이,  r: 말 빠르기
const VOICE_CAST = {
  narr:     { g: 'narr', r: 1.0 },
  ayun:     { g: 'f', d: 0,     r: 1.05 },   // 아윤 (여)
  yeonu:    { g: 'm', d: 0.08,  r: 1.05 },   // 연우
  tan:      { g: 'm', d: -0.08, r: 1.1 },    // 탄
  taehu:    { g: 'm', d: 0.15,  r: 1.0 },    // 태후
  jongseo:  { g: 'm', d: 0.04,  r: 0.93 },   // 종서
  eunseong: { g: 'm', d: -0.15, r: 0.97 },   // 은성
  juseong:  { g: 'm', d: 0.2,   r: 1.08 },   // 주성
  hyeseong: { g: 'm', d: -0.03, r: 1.12 },   // 혜성
  donggeon: { g: 'm', d: -0.22, r: 0.95 },   // 동건
  haul:     { g: 'f', d: 0.13,  r: 1.0 },    // 하울 (여)
  dongjin:  { g: 'boss', r: 0.8 }            // 낮고 느리게, 근엄하게
};
const MALE_RE = /InJoon|Hyunsu|BongJin|GookMin|Jihun|Minsu|male|남자|남성/i;
const FEMALE_RE = /SunHi|Heami|JiMin|SeoHyeon|YuJin|Seoyeon|Yuna|Sora|female|여자|여성|Google/i;
let narrVoice = null, maleVoice = null, femaleVoice = null;
function pickVoice() {
  if (!HAS_TTS) return;
  const vs = speechSynthesis.getVoices().filter(v => /^ko/i.test(v.lang));
  narrVoice = vs.find(v => /Google|Natural|Online|SunHi|InJoon/i.test(v.name)) || vs[0] || null;
  maleVoice = vs.find(v => MALE_RE.test(v.name) && !/female/i.test(v.name)) || null;
  femaleVoice = vs.find(v => FEMALE_RE.test(v.name) && v !== narrVoice) || vs.find(v => FEMALE_RE.test(v.name)) || narrVoice;
}
if (HAS_TTS) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
// 컴퓨터에 남자 목소리가 있으면 그 목소리를 아이처럼 높여 쓰고,
// 없으면 기본 목소리의 높이를 바꿔서 남자아이·여자아이·보스를 구분해요
function voiceFor(who) {
  const sid = CHARACTERS[who] && CHARACTERS[who].student ? CHARACTERS[who].student : who;   // 직업 → 그 직업을 맡은 학생
  const c = (sid === 'midboss' && typeof MIDBOSS_VOICE !== 'undefined' ? MIDBOSS_VOICE : VOICE_CAST[sid]) || VOICE_CAST.narr, d = c.d || 0;
  if (c.g === 'm')    return maleVoice ? { v: maleVoice, p: 1.4 + d, r: c.r } : { v: narrVoice, p: 0.75 + d, r: c.r };
  if (c.g === 'f')    return { v: femaleVoice, p: 1.45 + d, r: c.r };
  if (c.g === 'boss') return maleVoice ? { v: maleVoice, p: 0.55, r: c.r } : { v: narrVoice, p: 0.2, r: c.r };
  return { v: narrVoice, p: 1.0, r: c.r };
}
// 그림 문자는 빼고, 단위는 우리말로 읽게 바꿔요
function speechText(s) {
  return s.replace(/\p{Extended_Pictographic}/gu, ' ')
    .replace(/[【】\[\]"“”]/g, ' ')
    .replace(/(\d)\s*km/g, '$1킬로미터').replace(/(\d)\s*kg/g, '$1킬로그램')
    .replace(/(\d)\s*cm/g, '$1센티미터').replace(/(\d)\s*m(?![a-zA-Z])/g, '$1미터')
    .replace(/(\d)\s*L/g, '$1리터').replace(/−/g, ' 빼기 ').replace(/\+/g, ' 더하기 ').replace(/×/g, ' 곱하기 ')
    .replace(/\s+/g, ' ').trim();
}
function makeUtter(text, who) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  const v = voiceFor(who);
  if (v.v) u.voice = v.v;
  u.pitch = Math.max(0, Math.min(2, v.p)); u.rate = v.r;
  return u;
}
function speak(text, who = 'narr') {
  if (!ttsOn || !HAS_TTS) return;
  stopSpeak();
  const t = speechText(text); if (!t) return;
  try { speechSynthesis.speak(makeUtter(t, who)); } catch (e) { /* 읽기가 안 돼도 게임은 계속 */ }
}
// 메인 화면: 목소리 미리 듣기
function previewVoices() {
  if (!HAS_TTS) return;
  stopSpeak();
  const lines = [
    ['narr', '안녕하세요. 저는 이야기를 읽어 주는 해설이에요.'],
    ...[CAST.hero, ...CAST.order]
      .map(id => [id, `안녕! 나는 ${CHARACTERS[id].role} ${CHARACTERS[id].name}${hasBatchim(CHARACTERS[id].name) ? '이야' : '야'}!`]),
    ['dongjin', '으하하하! 나는 대마왕 동진이다!']
  ];
  lines.forEach(([who, t]) => { try { speechSynthesis.speak(makeUtter(t, who)); } catch (e) { /* 무시 */ } });
}
function stopSpeak() { if (HAS_TTS) try { speechSynthesis.cancel(); } catch (e) { /* 무시 */ } }
function refreshTtsBtn() {
  const b = $('ttsBtn');
  if (!HAS_TTS) { b.textContent = '🗣 읽기 없음'; b.disabled = true; return; }
  b.textContent = ttsOn ? '🗣 읽기 켬' : '🗣 읽기 끔';
  b.classList.toggle('off', !ttsOn);
}
$('ttsBtn').onclick = () => {
  ttsOn = !ttsOn;
  try { localStorage.setItem('cpt-tts', ttsOn ? 'on' : 'off'); } catch (e) { /* 무시 */ }
  if (!ttsOn) stopSpeak();
  else if (G.state === 'dialog') speak($('dtext').dataset.full || '', $('dtext').dataset.who || 'narr');
  refreshTtsBtn();
};

// ---------------- 대화창 ----------------
function applyLineEffects(L, quiet) {
  if (L.ghost === 'show') G.ghost = { x: Math.floor(G.cols / 2), y: 5 };
  if (L.ghost === 'hide') G.ghost = null;
  if (L.heal) heroes().forEach(h => { h.hp = h.maxHp; floatText(h, '회복!', '#7cff8a'); });
  if (quiet) return;
  if (L.shake) shake();
  if (L.sfx) sfx(L.sfx);
}
// ---------------- 이름 넣기 ----------------
//  {이름:j3} → "영",  {친근:j3} → "영이"(받침 있으면 '이'),  {부름:j3} → "영아" / "병우야"
//  자리: hero(주인공), j1~j9(합류 순서), t0~t3(히든 팀), @(지금 합류하는 친구), 또는 직업 id
function resolveWho(key, at) {
  if (key === '@') return at;
  const m = /^t(\d)$/.exec(key);
  if (m) return (G.team || [])[Number(m[1])] || CAST.hero;
  return roleClass(key);
}
function fillText(text, at) {
  if (!text) return text;
  return text.replace(/\{(이름|친근|부름):([a-z0-9@]+)\}/g, (all, kind, key) => {
    const ch = CHARACTERS[resolveWho(key, at)];
    if (!ch) return all;
    const n = ch.name, b = hasBatchim(n);
    return kind === '이름' ? n : kind === '친근' ? n + (b ? '이' : '') : n + (b ? '아' : '야');
  });
}
// { join: 'j3' } → 그 자리 친구의 직업에 맞는 합류 장면으로 바꿔요
function expandLines(lines) {
  const out = [];
  for (const L of lines) {
    if (L.join) {
      const cls = roleClass(L.join);
      (JOIN_LINES[cls] || []).forEach(J => out.push({ ...J, who: J.who === '@' ? cls : J.who, text: fillText(J.text, cls) }));
    } else {
      if (L.who === 'twin') {   // 중간보스와 이름이 같은 친구가 이번 전투에 있을 때만 말해요
        const tw = typeof MIDBOSS !== 'undefined' ? Object.keys(CAST.names || {}).find(c => CAST.names[c] === MIDBOSS.twin) : null;
        if (tw && G.units.some(u => u.side === 'hero' && u.alive && u.id === tw)) out.push({ ...L, who: tw, text: fillText(L.text) });
        continue;
      }
      const who = (L.who === 'narr' || L.who === 'dongjin' || L.who === 'midboss') ? L.who : resolveWho(L.who);
      out.push({ ...L, who, text: fillText(L.text) });
    }
  }
  return out;
}

function showDialog(lines) {
  lines = expandLines(lines);
  // 🔥 어려움: 쓰러진 친구의 대사는 건너뛰어요 (회복·동진 등장 같은 효과는 그대로)
  if (deadList().length && !G.hidden) {
    const keep = [];
    for (const L of lines) {
      const cls = L.who && !['narr', 'dongjin', 'midboss'].includes(L.who) ? resolveWho(L.who) : null;
      if (cls && deadList().includes(cls)) { applyLineEffects(L, true); continue; }
      keep.push(L);
    }
    if (!keep.length) return Promise.resolve();
    lines = keep;
  }
  return new Promise(resolve => {
    G.state = 'dialog'; updateTop();
    const layer = $('dialogLayer'), box = $('dialog'), txt = $('dtext');
    layer.classList.remove('hidden');
    let i = 0, timer = null, typing = false, full = '';
    // 아래 패널: 건너뛰기 버튼
    setPanel(null, '<div class="tip">💬 이야기 창을 누르면 다음으로 넘어가요.</div>' +
      '<div class="tip" style="color:#b8c4ff">이야기를 이미 읽었다면 [⏭ 건너뛰기]를 눌러요.</div>',
      [{ label: '⏭ 이야기 건너뛰기', fn: skipAll, cls: 'gold' }]);
    function show() {
      const L = lines[i];
      const ch = L.who === 'narr' ? null : CHARACTERS[L.who];
      $('dname').textContent = ch ? ch.name : '';
      box.classList.toggle('narr', !ch);
      drawPortrait($('portrait'), ch ? { look: ch.look } : null);
      applyLineEffects(L, false);
      full = L.text; let n = 0; txt.textContent = ''; typing = true;
      txt.dataset.full = full; txt.dataset.who = L.who;
      speak(full, L.who);
      clearInterval(timer);
      timer = setInterval(() => {
        n++; txt.textContent = full.slice(0, n);
        if (n >= full.length) { clearInterval(timer); typing = false; }
      }, 30);
    }
    function finish() {
      clearInterval(timer); stopSpeak();
      layer.classList.add('hidden'); layer.onclick = null;
      setPanel(null, '');
      resolve();
    }
    function next() {
      if (typing) { clearInterval(timer); txt.textContent = full; typing = false; return; }
      i++;
      if (i >= lines.length) finish();
      else show();
    }
    // 남은 대사를 모두 건너뛰어요 (회복·동진 등장 같은 효과는 그대로 적용)
    function skipAll() {
      for (let k = i + 1; k < lines.length; k++) applyLineEffects(lines[k], true);
      sfx('select');
      finish();
    }
    layer.onclick = next;
    show();
  });
}

// ---------------- 📱 안전한 터치 버튼 ----------------
// 버튼이 나타나고 잠깐(보기 0.45초, 확인·명령 0.3초, 마우스 0.25초) 동안은 눌리지 않고,
// 그 버튼 위에서 손가락을 "직접 눌렀다 뗀" 경우에만 반응해요.
// → 앞에서 두드린 손가락 때문에 보기가 저절로 선택되는 일을 막아요.
// guard: 버튼이 새로 나타난 뒤 눌리지 않는 시간 (손가락은 연타 방지로 조금 길게, 마우스는 짧게)
//  보기: 손가락 0.45초 / 마우스 0.25초,  확인: 0.3초 / 0.15초,  명령 버튼: 0.1초 / 바로
const MOUSE_GUARD_MS = 250, PANEL_GUARD_MS = 100, FEED_GUARD_MS = 300;
function safeTap(el, fn, guard = TAP_GUARD_MS, mouseGuard = Math.min(guard, MOUSE_GUARD_MS)) {
  const born = performance.now(); el._down = false;
  el.onpointerdown = e => {
    const g = e.pointerType === 'mouse' ? mouseGuard : guard;
    el._down = performance.now() - born >= g;
  };
  el.onpointercancel = () => { el._down = false; };
  el.onclick = e => {
    const ok = e.detail === 0 || el._down;   // detail 0 = 키보드(엔터)로 누른 경우
    el._down = false;
    if (ok) fn(e);
  };
}

// ---------------- 문제 창 ----------------
// story=true 이면 맞힐 때까지 다시 풀어요. 결과: 처음에 맞혔는지
function askQuestion(q, title, story, okMsg = '', missMsg = '공격이 빗나가요') {
  return new Promise(resolve => {
    const layer = $('qLayer');
    layer.classList.remove('hidden');
    $('qTitle').textContent = title;
    $('qStory').textContent = q.story || '';
    if (q.story) speak(q.story, 'narr');   // 이야기 문제도 읽어 줘요
    $('qStory').classList.toggle('hidden', !q.story);
    $('qText').textContent = `${fmt(q.a)} ${OPSYM[q.op] || q.op} ${fmt(q.b)} = ?`;
    let first = true;

    function drawOpts() {
      const box = $('qOpts'); box.innerHTML = '';
      $('qFeed').classList.add('hidden');
      for (const v of q.opts) {
        const b = document.createElement('button');
        b.className = 'btn'; b.textContent = fmt(v) + (q.unit ? ' ' + q.unit : '');
        safeTap(b, () => choose(v, b));
        box.appendChild(b);
      }
    }
    let answered = false;
    function choose(v, btn) {
      if (answered) return;          // 한 번 고르면 끝 (두 번 눌림 방지)
      answered = true;
      const ok = v === q.ans;
      [...$('qOpts').children].forEach(b => b.disabled = true);
      btn.classList.add(ok ? 'right' : 'wrong');
      const feed = $('qFeed'); feed.classList.remove('hidden');
      const head = $('fHead');
      if (ok) {
        sfx('correct');
        head.className = 'ok'; head.textContent = first ? '정답! 🎉' : '이번엔 정답! 잘했어요 👍';
        $('fCalc').innerHTML = vcalcHTML(q);
        $('fHint').textContent = story ? '' : okMsg;
        $('fBtn').textContent = '계속하기 ▶';
        safeTap($('fBtn'), () => finish(true), FEED_GUARD_MS, 150);
      } else {
        sfx('wrong');
        head.className = 'no'; head.textContent = '아쉬워요! 😢';
        if (story) {
          $('fCalc').innerHTML = '';
          $('fHint').textContent = '💡 힌트: ' + q.hint;
          $('fBtn').textContent = '다시 풀기 ↺';
          safeTap($('fBtn'), () => { first = false; answered = false; shuffle(q.opts); drawOpts(); }, FEED_GUARD_MS, 150);
        } else {
          $('fCalc').innerHTML = vcalcHTML(q);
          $('fHint').textContent = `정답은 ${fmt(q.ans)}예요. 💡 ${q.hint}`;
          $('fBtn').textContent = `확인 (${missMsg})`;
          safeTap($('fBtn'), () => finish(false), FEED_GUARD_MS, 150);
        }
      }
    }
    let done = false;
    function finish(ok) {
      if (done) return;
      done = true;
      layer.classList.add('hidden');
      stopSpeak();
      G.stats.total++;
      if (ok && first) G.stats.correct++;
      resolve(ok && first ? true : ok);
    }
    drawOpts();
  });
}

// ---------------- 클리어 / 실패 ----------------
// 👑 중간보스 클리어: 함께 싸운(살아 있는) 친구에게 왕관 (공격력·체력 상승)
async function midClear() {
  G.state = 'busy';
  sfx('clear');
  await showBanner('👑 중간보스 격파!', '#ffd84a');
  await sleep(900);
  await storyScene(G.stage.ending);
  const rate = G.stats.total ? G.stats.correct / G.stats.total : 1;
  const stars = rate >= 0.9 ? 3 : rate >= 0.7 ? 2 : 1;
  const first = !PROG.mid;
  PROG.mid = Math.max(PROG.mid || 0, stars);
  const e = readEver(); e.mid[MODE] = 1; try { localStorage.setItem(EVER_KEY, JSON.stringify(e)); } catch (err) { /* 무시 */ }
  let reward = '';
  const winners = heroes().map(h => h.id), newCrowns = winners.filter(id => !PROG.crowns.includes(id));
  newCrowns.forEach(id => PROG.crowns.push(id));
  if (newCrowns.length) reward += `<span style="color:#ffd84a">👑 왕관을 쓴 친구: ${newCrowns.map(id => CHARACTERS[id].name).join(', ')} — 공격력 +${CROWN_BONUS.atk}, 체력 +${CROWN_BONUS.hp}!</span><br>`;
  else if (!first) reward += '👑 왕관은 이미 모두 썼어요!<br>';
  G.units.forEach(u => { if (u.side === 'hero') u.look = lookOf(u.id); });   // 지도에서도 바로 왕관이 보여요
  if (isHard()) {
    const fallen = G.units.filter(u => u.side === 'hero' && !u.alive).map(u => u.id);
    fallen.forEach(id => { if (!PROG.dead.includes(id)) PROG.dead.push(id); });
    if (fallen.length) reward += `<span style="color:#ff9aa0">💀 쓰러진 친구: ${fallen.map(id => CHARACTERS[id].name).join(', ')} — 다음 스테이지부터 함께하지 못해요.</span><br>`;
  }
  let saveMsg = '💡 메인 화면의 [💾 저장하기]로 진행 상황을 저장할 수 있어요.';
  if (PROG.slot !== null) saveMsg = saveToSlot(PROG.slot) ? `💾 ${PROG.slot + 1}번 칸에 자동 저장했어요!` : '⚠ 저장하지 못했어요.';
  $('endTitle').textContent = `👑 ${isHard() ? '🔥 ' : ''}중간보스 ${MIDBOSS.short} 격파! 👑`;
  $('endStars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('endStats').innerHTML = `푼 문제: ${G.stats.total}개<br>한 번에 맞힌 문제: ${G.stats.correct}개<br>걸린 턴: ${G.turn}턴`;
  $('endSave').innerHTML = reward + saveMsg;
  G.endKind = 'clear'; G.hasNext = true;
  $('endNext').innerHTML = `다음 이야기 ▶ 스테이지 6 · ${STAGE_NAMES[6]}`;
  refreshEndUpgrade();
  $('endLayer').classList.remove('hidden');
  setTimeout(() => sfx('stars', stars), 1500);
  G.state = 'over'; updateTop();
  if (!mustUpgrade() && canRevive()) setTimeout(() => { if (G.state === 'over' && !$('endLayer').classList.contains('hidden')) openRevive('end'); }, 2600);
}
async function stageClear() {
  if (G.hidden) return hiddenClear();
  if (G.midboss) return midClear();
  G.state = 'busy';
  sfx('clear');                                   // 🎺 클리어 팡파르
  await showBanner('스테이지 클리어!', '#7cff8a');
  await sleep(900);
  await storyScene(G.stage.ending);
  const rate = G.stats.total ? G.stats.correct / G.stats.total : 1;
  const stars = rate >= 0.9 ? 3 : rate >= 0.7 ? 2 : 1;
  const n = G.stageNo;
  PROG.cleared[n] = Math.max(PROG.cleared[n] || 0, stars);
  markEver(isHard() ? 'hard' : 'main', n);   // 🔓 한 번 깬 기록은 계속 남아요

  // 처음 깬 스테이지라면 강화 기회 (친구 수 × 33%)
  let reward = '';
  // 🔥 어려움: 이번에 쓰러진 친구는 다음 스테이지부터 나올 수 없어요
  if (isHard()) {
    const fallen = G.units.filter(u => u.side === 'hero' && !u.alive).map(u => u.id);
    fallen.forEach(id => { if (!PROG.dead.includes(id)) PROG.dead.push(id); });
    if (fallen.length) reward += `<span style="color:#ff9aa0">💀 쓰러진 친구: ${fallen.map(id => CHARACTERS[id].name).join(', ')} — 다음 스테이지부터 함께하지 못해요.</span><br>`;
    const rv = REVIVE_STAGES[n];
    if (rv && !PROG.rewardedR[n]) {
      PROG.rewardedR[n] = true; PROG.revives += rv;
      reward += `<span style="color:#ff9ad0">💖 동료 살리기 기회 +${rv}번!</span><br>`;
    }
  }
  const isFinal = !!G.stage.final;
  if (isFinal) PROG.rewarded[n] = true;   // 마지막 스테이지는 강화 대신 엔딩!
  if (!PROG.rewarded[n]) {
    const size = G.stage.heroes.length, pts = pointsFor(size);
    PROG.rewarded[n] = true; PROG.points += pts;
    reward = `⚔ 강화 기회 +${pts}번! (친구 ${size}명의 1/3)<br>`;
  }
  // 스테이지 3·5·7·9를 처음 깨면 🌟 초월 강화 기회 (친구 수 × 1/3)
  if (TRANSCEND_STAGES.includes(n) && !PROG.rewardedT[n]) {
    const size = G.stage.heroes.length, tp = pointsFor(size);
    PROG.rewardedT[n] = true; PROG.tpoints += tp;
    reward += `<span style="color:#ffd84a">🌟 초월 강화 기회 +${tp}번! 전설의 무기·스킬을 얻을 수 있어요!</span><br>`;
  }

  // 저장 슬롯을 쓰고 있으면 자동 저장
  let saveMsg = '💡 메인 화면의 [💾 저장하기]로 진행 상황을 저장할 수 있어요.';
  if (PROG.slot !== null) saveMsg = saveToSlot(PROG.slot) ? `💾 ${PROG.slot + 1}번 칸에 자동 저장했어요!` : '⚠ 저장하지 못했어요.';
  saveMsg = reward + saveMsg;

  $('endTitle').textContent = isFinal ? (isHard() ? '🔥🏆 어려움 모드까지 모두 클리어! 🏆🔥' : '🏆 모든 소수점을 되찾았어요! 🏆') : `🎉 ${isHard() ? '🔥 ' : ''}${G.stage.title} 클리어! 🎉`;
  $('endStars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('endStats').innerHTML = `푼 문제: ${G.stats.total}개<br>한 번에 맞힌 문제: ${G.stats.correct}개<br>걸린 턴: ${G.turn}턴`;
  $('endSave').innerHTML = saveMsg;
  const hasNext = !!STAGES[n + 1];
  G.endKind = 'clear'; G.hasNext = hasNext;
  const total = Object.values(PROG.cleared).reduce((a, b) => a + (b || 0), 0);
  $('endNext').innerHTML = isFinal
    ? `🎉 초평 택틱스 - 사라진 소수점 · 끝 🎉<br>열 명의 친구와 함께 초평면을 지켜 냈어요! 모은 별: ★ ${total}개<br>끝까지 소수 문제를 풀어 줘서 정말 고마워요!`
    : n === 5 && !everMid() ? `다음 이야기 ▶ 👑 중간보스 · ${MIDBOSS.name}`
    : hasNext ? `다음 이야기 ▶ 스테이지 ${n + 1} · ${STAGE_NAMES[n + 1]}`
    : (STAGE_NAMES[n + 1] ? `다음 이야기 ▶ 스테이지 ${n + 1} · ${STAGE_NAMES[n + 1]} — 준비 중이에요!` : '');
  refreshEndUpgrade();
  $('endLayer').classList.remove('hidden');
  sfx('clear');                                   // 결과 화면 팡파르
  setTimeout(() => sfx('stars', stars), 1500);    // 별 개수만큼 반짝
  G.state = 'over'; updateTop();
  // 💖 살리기 기회가 있고 쓰러진 친구가 있으면 (강화가 없을 때) 살리기 창을 열어요
  if (!mustUpgrade() && canRevive()) setTimeout(() => { if (G.state === 'over' && !$('endLayer').classList.contains('hidden')) openRevive('end'); }, 2600);
  // 강화 기회가 있으면 별을 보여 준 뒤 강화 창을 자동으로 열어요 (강화를 해야 넘어갈 수 있어요)
  if (mustUpgrade()) setTimeout(() => {
    if (G.state === 'over' && !$('endLayer').classList.contains('hidden') && mustUpgrade()) openUpgrade('end', true);
  }, 2800);
}
// 클리어 후 강화 기회가 남아 있으면 꼭 강화해야 해요
function mustUpgrade() { return roster().length > 0 && leftToSpend() > 0; }

// ---------------- 🔮 히든 스테이지 클리어: 경험치 · 레벨업 · 히든 스킬 ----------------
const EXP_CLEAR = 30, EXP_KILL = 20;   // 깨면 30, 적 1마리 잡을 때마다 20
async function hiddenClear() {
  G.state = 'busy';
  sfx('clear');
  await showBanner('🔮 히든 스테이지 클리어!', '#c89aff');
  await sleep(700);
  if (G.stage.ending) await storyScene(G.stage.ending);
  const rate = G.stats.total ? G.stats.correct / G.stats.total : 1;
  const stars = rate >= 0.9 ? 3 : rate >= 0.7 ? 2 : 1;
  const n = G.stageNo;
  PROG.hcleared[n] = Math.max(PROG.hcleared[n] || 0, stars);
  markEver('hidden', n);

  // 경험치: 함께 싸운 친구 모두 (쓰러진 친구도 받아요)
  const rows = [];
  let anyUp = false;
  G.team.forEach(id => {
    const kills = G.kills[id] || 0, gain = EXP_CLEAR + EXP_KILL * kills;
    const L = lvOf(id), before = L.lv;
    L.exp += gain;
    while (L.exp >= expNeed(L.lv)) { L.exp -= expNeed(L.lv); L.lv++; L.pts++; }
    const up = L.lv - before; if (up) anyUp = true;
    rows.push(`<tr><td>${CHARACTERS[id].name}</td><td>${kills}마리</td><td>+${gain}</td>` +
      `<td>${up ? `<b style="color:#7cff8a">Lv.${before} → Lv.${L.lv} ⬆</b>` : `Lv.${L.lv}`}</td>` +
      `<td><span class="expbar"><i style="width:${Math.round(L.exp / expNeed(L.lv) * 100)}%"></i></span></td></tr>`);
  });

  // 히든 스테이지 5: 함께 싸운 친구가 🔮 히든 스킬을 배워요
  const learned = [];
  if (G.stage.giveHidden) G.team.forEach(id => {
    const g = gearOf(id);
    if (!g.hs && HIDDEN_SKILLS[id]) { g.hs = true; learned.push(`${CHARACTERS[id].name} [🔮${HIDDEN_SKILLS[id].name}]`); }
  });

  let saveMsg = '';
  if (PROG.slot !== null) saveMsg = saveToSlot(PROG.slot) ? `💾 ${PROG.slot + 1}번 칸에 자동 저장했어요!` : '⚠ 저장하지 못했어요.';

  $('endTitle').textContent = `${G.stage.title} · ${G.stage.name} 클리어!`;
  $('endStars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('endStats').innerHTML = `<table class="exptable"><tr><th>친구</th><th>잡은 적</th><th>경험치</th><th>레벨</th><th></th></tr>${rows.join('')}</table>`;
  $('endSave').innerHTML = (anyUp ? '<b style="color:#7cff8a">🔼 레벨업! 레벨이 오른 친구는 스킬을 강화할 수 있어요!</b><br>' : '') +
    (learned.length ? `<b style="color:#c89aff">🔮 히든 스킬을 배웠어요: ${learned.join(', ')}</b><br>` : '') + saveMsg;
  $('endNext').textContent = n < 5 && !PROG.hcleared[n + 1] ? `다음 히든 스테이지가 열렸어요: 🔮 ${HIDDEN_NAMES[n + 1]}` : '';
  G.endKind = 'clear'; G.hasNext = false;
  refreshEndUpgrade();
  $('endLayer').classList.remove('hidden');
  if (learned.length) sfx('transcend'); else sfx('clear');
  setTimeout(() => sfx(anyUp ? 'levelup' : 'stars', stars), 1500);
  G.state = 'over'; updateTop();
  if (mustUpgrade()) setTimeout(() => {
    if (G.state === 'over' && !$('endLayer').classList.contains('hidden') && mustUpgrade()) openUpgrade('end', true);
  }, 3200);
}
async function gameOver() {
  G.state = 'over';
  sfx('lose');
  await showBanner('앗, 모두 쓰러졌어요...', '#ff9aa0');
  $('endTitle').textContent = '다시 도전해 볼까요? 💪';
  $('endStars').textContent = '';
  $('endStats').innerHTML = `푼 문제: ${G.stats.total}개<br>한 번에 맞힌 문제: ${G.stats.correct}개`;
  $('endSave').textContent = '';
  $('endNext').textContent = G.hidden
    ? '💡 팁: 앞선 히든 스테이지에서 레벨을 올리고 스킬을 강화해 봐요! 친구 조합을 바꿔 보는 것도 좋아요.'
    : (G.stage.tip || '💡 팁: 멀리서 공격하는 친구는 뒤에서, 튼튼한 친구는 앞에서 싸우게 해 봐요!');
  G.endKind = 'lose'; G.hasNext = false;
  refreshEndUpgrade();
  $('endLayer').classList.remove('hidden');
  updateTop();
}

// ---------------- 스테이지 시작 ----------------
function hideLayers() {
  ['titleLayer', 'selectLayer', 'slotLayer', 'endLayer', 'qLayer', 'upLayer', 'hiddenLayer', 'charLayer', 'reviveLayer'].forEach(id => $(id).classList.add('hidden'));
}
// 결과 화면 버튼
//  클리어: [다시 하기] 없음. 강화 기회가 남아 있으면 [강화하기]만 보이고, 강화를 마쳐야 [다음 스테이지]/[메인 화면]이 나와요.
//  실패:   [다시 하기] [메인 화면]
function refreshEndUpgrade() {
  const clear = G.endKind === 'clear', must = clear && mustUpgrade();
  const tTxt = (transcendUsable() ? ` + 🌟초월 ${PROG.tpoints}번` : '') + (lvPtsUsable() ? ` + 🔼레벨업 ${lvPtsUsable()}번` : '');
  $('upEndBtn').textContent = must ? `⚔ 강화하기 (${PROG.points}번${tTxt} 남음) — 강화를 해야 다음으로 넘어가요!` : `⚔ 강화하기 (${PROG.points}번${tTxt})`;
  $('upEndBtn').classList.toggle('hidden', !mustUpgrade());
  $('upEndBtn').classList.toggle('glow', must);
  $('retryBtn').classList.toggle('hidden', clear);
  // 히든 스테이지에서는 [다음 스테이지] 대신 [히든 스테이지 목록]
  $('nextBtn').textContent = G.hidden ? '🔮 히든 스테이지 목록' : '다음 스테이지 ▶';
  $('nextBtn').classList.toggle('hidden', !((clear && (G.hasNext || G.hidden) && !must) || (!clear && G.hidden)));
  $('homeBtn').classList.toggle('hidden', must);
  $('reviveEndBtn').classList.toggle('hidden', !(clear && !G.hidden && canRevive()));
  $('reviveEndBtn').textContent = `💖 동료 살리기 (${PROG.revives}번)`;
  updateTop();
}
// 스테이지를 시작하기 전에 남은 강화 기회가 있으면 먼저 강화해요
function goStage(n, skipIntro = false) {
  if (mustUpgrade()) openUpgrade(() => startStage(n, skipIntro), true);
  else startStage(n, skipIntro);
}
async function startStage(n, skipIntro = false, opt = {}) {
  hideLayers();
  loadStage(n, opt);
  if (!skipIntro) {
    await showDialog(G.stage.intro);
  }
  await showBanner('1턴 · 우리 편 차례!');
  G.state = 'idle'; idlePanel();
}

$('retryBtn').onclick = () => G.hidden ? goHidden(G.stageNo, G.team, true) : G.midboss ? goMid(true) : goStage(G.stageNo, true);
$('nextBtn').onclick = () => {
  if (G.hidden) return openHidden();
  if (G.midboss) return goStage(6);
  if (G.stageNo === 5 && !everMid()) return goMid();   // 👑 스테이지 5 다음은 중간보스!
  if (STAGES[G.stageNo + 1]) goStage(G.stageNo + 1);
};
// 👑 중간보스 시작 (남은 강화가 있으면 먼저 강화)
function goMid(skipIntro = false) {
  const start = () => startStage(5, skipIntro, { midboss: true });
  if (mustUpgrade()) openUpgrade(start, true);
  else start();
}
$('homeBtn').onclick = () => { if (G.endKind === 'clear' && mustUpgrade()) return openUpgrade('end', true); openTitle(); };
$('upEndBtn').onclick = () => { sfx('select'); openUpgrade('end', G.endKind === 'clear'); };
$('upBtn').onclick = () => { sfx('select'); openUpgrade('title'); };
$('upBack').onclick = () => upBackClick();

// 위쪽 🏠 버튼: 한 번 더 눌러야 메인으로 (실수 방지)
let homeArm = null;
$('homeTopBtn').onclick = () => {
  if (!(G.state === 'idle' || G.state === 'over')) return;
  if (G.state === 'over' && G.endKind === 'clear' && mustUpgrade()) return openUpgrade('end', true);
  const b = $('homeTopBtn');
  if (G.state === 'over' || homeArm) { clearTimeout(homeArm); homeArm = null; b.textContent = '🏠'; openTitle(); return; }
  b.textContent = '🏠 메인으로? 한 번 더!';
  homeArm = setTimeout(() => { homeArm = null; b.textContent = '🏠'; }, 2500);
};

// =====================================================
//  메인 화면
// =====================================================
function openTitle() {
  hideLayers();
  clearSel();
  G.state = 'title'; G.ghost = null;
  setPanel(null, '<div class="tip">메인 화면이에요. 메뉴를 골라 주세요!</div>');
  refreshTitle();
  $('titleLayer').classList.remove('hidden');
}
function nextPlayable() {
  let n = 1;
  while (STAGES[n + 1] && PROG.cleared[n]) n++;
  return n;
}
function refreshTitle() {
  // 지금까지 모인 동료 보여 주기
  const box = $('tHeroes'); box.innerHTML = '';
  STAGES[nextPlayable()].heroes.forEach(h => {
    const c = document.createElement('canvas'); c.width = 72; c.height = 72;
    c.title = CHARACTERS[roleClass(h.id)].name;
    drawPortrait(c, { look: lookOf(roleClass(h.id)) }); box.appendChild(c);
  });
  const m = maxCleared(PROG.cleared);
  const who = PROG.name ? `<b style="color:#ffe27a">${escapeHTML(PROG.name)}</b> · ` : '';
  const slot = PROG.slot !== null ? ` · 💾 ${PROG.slot + 1}번 칸` : '';
  const modeTxt = isHard() ? '<b style="color:#ff8a5a">🔥 어려움</b> · ' : '<b style="color:#7cff8a">😊 보통</b> · ';
  const hardTxt = isHard() ? `<br><span class="small">💀 쓰러진 친구 ${PROG.dead.length}명${PROG.revives ? ` · 💖 살리기 기회 ${PROG.revives}번` : ''}</span>` : '';
  $('tProgress').innerHTML = modeTxt + (m === 0
    ? `${who}스테이지 1 · ${STAGE_NAMES[1]}부터 시작해요${slot}`
    : `${who}스테이지 ${m}까지 클리어 · ★ ${totalStars(PROG.cleared)}개${slot}`) + hardTxt;
  [...box.children].forEach((c, i) => { const id = roleClass(STAGES[nextPlayable()].heroes[i].id); if (deadList().includes(id)) { c.style.opacity = '0.3'; c.style.filter = 'grayscale(1)'; c.title += ' (쓰러짐)'; } });
  $('newBtn').textContent = NEW_LABEL.normal;
  $('hardBtn').textContent = NEW_LABEL.hard;
  $('modeN').classList.toggle('on', !isHard());
  $('modeH').classList.toggle('on', isHard());
  $('modeH').textContent = PROGS.hard || isHard() ? '🔥 어려움' : '🔥 어려움 (새로 시작)';
  $('reviveBtn').classList.toggle('hidden', !canRevive());
  $('reviveBtn').textContent = `💖 동료 살리기 (기회 ${PROG.revives}번 · 쓰러진 친구 ${PROG.dead ? PROG.dead.length : 0}명)`;
  const r = roster().length;
  $('upBtn').disabled = r === 0;
  $('upBtn').textContent = r === 0 ? '⚔ 강화하기 (스테이지 1을 깨면 열려요)'
    : `⚔ 강화하기 (남은 기회 ${PROG.points}번${PROG.tpoints ? ` · 🌟초월 ${PROG.tpoints}번` : ''})`;
  $('upBtn').classList.toggle('glow', r > 0 && leftToSpend() > 0);
  // 🔮 히든 스테이지 버튼 (스테이지 10을 깨면 열려요)
  const hOpen = hiddenOpen();
  $('hidBtn').disabled = !hOpen;
  const hc = Object.keys(PROG.hcleared || {}).length;
  $('hidBtn').textContent = hOpen ? `🔮 히든 스테이지 (${hc}/5 클리어)` : '🔮 히든 스테이지 (스테이지 10을 깨면 열려요)';
  $('hidBtn').classList.toggle('glow', hOpen && hc === 0);
}
function escapeHTML(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// 새로 시작 (진행 상황이 있으면 한 번 더 눌러야 해요)
//  ▶ 보통 새로 시작 / 🔥 어려움 새로 시작 — 두 난이도는 기록이 따로예요
const NEW_LABEL = { normal: '▶ 새로 시작 (보통)', hard: '🔥 어려움 새로 시작' };
const newArm = { normal: null, hard: null };
function startNew(mode) {
  const btn = $(mode === 'hard' ? 'hardBtn' : 'newBtn');
  const P = mode === MODE ? PROG : PROGS[mode];
  const has = !!P && maxCleared(P.cleared) > 0;
  if (has && !newArm[mode]) {
    btn.textContent = mode === 'hard' ? '🔥 어려움 처음부터? 한 번 더!' : '처음부터? 한 번 더!';
    newArm[mode] = setTimeout(() => { newArm[mode] = null; btn.textContent = NEW_LABEL[mode]; }, 2500);
    return;
  }
  clearTimeout(newArm[mode]); newArm[mode] = null;
  sfx('select');
  // 아직 클리어 기록이 없으면 지금 쓰는 저장 칸을 그대로 사용해요
  const keepSlot = has ? null : PROG.slot;
  openCreate(keepSlot, mode);   // 주인공 이름·직업 고르기
}
$('newBtn').onclick = () => startNew('normal');
$('hardBtn').onclick = () => startNew('hard');
$('modeN').onclick = () => { sfx('select'); setMode('normal'); refreshTitle(); };
$('modeH').onclick = () => {
  if (!PROGS.hard && !isHard()) return startNew('hard');
  sfx('select'); setMode('hard'); refreshTitle();
};
$('reviveBtn').onclick = () => { sfx('select'); openRevive('title'); };
$('reviveEndBtn').onclick = () => { sfx('select'); openRevive('end'); };

// =====================================================
//  🧒 새로 시작: 주인공 고르기
//  1) 이름(학생 10명 중) → 2) 직업(10개 중) → 3) 동료 확인 (이름은 무작위, 다시 섞기 가능) → 시작
// =====================================================
let create = { step: 'name', student: null, cls: null, cast: null, keepSlot: null, mode: 'normal' };
const SCHOOL_LOOK = { shirt: '#f4f4f4', pants: '#3a4a7a', shoes: '#f4f4f4' };   // 아직 직업이 없을 때 옷
function previewLook(sid, cls) {
  return cls ? { ...CLASS_DATA[cls].look, ...STUDENTS[sid].look } : { ...SCHOOL_LOOK, ...STUDENTS[sid].look };
}
function faceCanvas(look, size = 56) {
  const c = document.createElement('canvas'); c.width = size; c.height = size; c.className = 'upface';
  drawPortrait(c, { look });
  return c;
}
function openCreate(keepSlot, mode = 'normal') {
  hideLayers();
  create = { step: 'name', student: null, cls: null, cast: null, keepSlot, mode };
  drawCreate();
  $('charLayer').classList.remove('hidden');
}
function drawCreate() {
  const body = $('charBody'); body.innerHTML = '';
  const grid = document.createElement('div'); grid.className = 'upgrid chargrid';
  if (create.step === 'name') {
    $('charTitle').textContent = (create.mode === 'hard' ? '🔥 어려움 모드 · ' : '') + '🧒 1. 주인공 고르기';
    $('charInfo').innerHTML = '나는 누구일까요? <b>주인공 이름</b>을 골라 주세요!';
    STUDENT_ORDER.forEach(sid => {
      const b = document.createElement('button'); b.className = 'btn upcard charcard';
      b.appendChild(faceCanvas(previewLook(sid, null)));
      const t = document.createElement('div'); t.innerHTML = `<b>${STUDENTS[sid].name}</b>`;
      b.appendChild(t);
      b.onclick = () => { sfx('select'); create.student = sid; create.step = 'class'; drawCreate(); };
      grid.appendChild(b);
    });
    body.appendChild(grid);
    $('charBack').textContent = '← 메인 화면';
    return;
  }
  if (create.step === 'class') {
    const nm = STUDENTS[create.student].name;
    $('charTitle').textContent = (create.mode === 'hard' ? '🔥 어려움 모드 · ' : '') + '⚔ 2. 직업 고르기';
    $('charInfo').innerHTML = `<b style="color:#ffe27a">${nm}</b>${hasBatchim(nm) ? '이' : '가'} 어떤 친구가 될까요? <b>직업</b>을 골라 주세요!<br>` +
      '<span class="small">직업을 누르면 바로 모험이 시작돼요! 누가 동료가 될지는 모험하면서 알게 돼요.</span>';
    CLASS_ORDER.forEach(cls => {
      const d = CLASS_DATA[cls];
      const b = document.createElement('button'); b.className = 'btn upcard charcard';
      b.appendChild(faceCanvas(previewLook(create.student, cls)));
      const t = document.createElement('div');
      t.innerHTML = `<b>${d.role}</b> <span class="small">🗡 ${d.weapon}</span><br>` +
        `<span class="small">체력 ${d.hp} · 공격 ${d.atk}${d.def ? ' · 방어 ' + d.def : ''} · 이동 ${d.move} · 거리 ${d.rmax}</span><br>` +
        `<span class="small" style="color:#e6ecff">✨ ${d.skill.name}: ${d.intro}</span>`;
      b.appendChild(t);
      // 직업을 고르면 바로 시작! (동료 이름은 몰래 무작위로 정해져요)
      b.onclick = () => {
        sfx('win');
        const keep = create.keepSlot, nm = PROG.name;
        PROGS[MODE] = PROG;
        MODE = create.mode;
        PROG = newProg(nm, makeCast(create.student, cls), MODE === 'hard');
        PROGS[MODE] = PROG;
        [PROGS.normal, PROGS.hard].forEach(P => { if (P) P.slot = keep; });
        applyCast(PROG.cast);
        startStage(1);
      };
      grid.appendChild(b);
    });
    body.appendChild(grid);
    $('charBack').textContent = '← 이름 다시 고르기';
    return;
  }
  // 3) 동료 확인
  const cast = create.cast, hero = cast.hero;
  $('charTitle').textContent = '👫 3. 함께할 친구들';
  const hn = STUDENTS[cast.names[hero]].name;
  const head = document.createElement('div'); head.className = 'uphead';
  head.appendChild(faceCanvas(previewLook(cast.names[hero], hero), 72));
  const ht = document.createElement('div');
  ht.innerHTML = `<b class="big">${hn}</b> <span class="small">주인공 · ${CLASS_DATA[hero].role}</span><br>` +
    `<span class="small">${CLASS_DATA[hero].intro}</span>`;
  head.appendChild(ht);
  body.appendChild(head);
  $('charInfo').innerHTML = '모험을 하면서 이 친구들이 차례대로 동료가 돼요! <span class="small">(이름은 무작위로 정해져요)</span>';
  cast.order.forEach((cls, i) => {
    const sid = cast.names[cls];
    const b = document.createElement('div'); b.className = 'btn upcard charcard teamrow';
    b.appendChild(faceCanvas(previewLook(sid, cls), 48));
    const t = document.createElement('div');
    t.innerHTML = `<span class="small">스테이지 ${i === 0 ? 1 : i + 1}</span> <b>${STUDENTS[sid].name}</b> <span class="small">· ${CLASS_DATA[cls].role}</span>`;
    b.appendChild(t);
    grid.appendChild(b);
  });
  body.appendChild(grid);
  const row = document.createElement('div'); row.className = 'charbtns';
  const mix = document.createElement('button'); mix.className = 'btn';
  mix.textContent = '🎲 동료 이름 다시 섞기';
  mix.onclick = () => { sfx('select'); create.cast = makeCast(create.student, create.cls); drawCreate(); };
  const go = document.createElement('button'); go.className = 'btn big gold';
  go.textContent = '▶ 모험 시작!';
  go.onclick = () => {
    sfx('win');
    PROG = newProg(PROG.name, create.cast); PROG.slot = create.keepSlot;
    applyCast(PROG.cast);
    startStage(1);
  };
  row.appendChild(mix); row.appendChild(go);
  body.appendChild(row);
  $('charBack').textContent = '← 직업 다시 고르기';
}
$('charBack').onclick = () => {
  if (create.step === 'team') create.step = 'class';
  else if (create.step === 'class') create.step = 'name';
  else return openTitle();
  drawCreate();
};

// ---------------- 스테이지 선택 ----------------
$('selectBtn').onclick = () => { sfx('select'); openSelect(); };
$('selBack').onclick = () => openTitle();
function openSelect() {
  const grid = $('stageGrid'); grid.innerHTML = '';
  for (let n = 1; n <= 10; n++) {
    const b = document.createElement('button');
    const ready = !!STAGES[n], open = isUnlocked(n);
    const stars = PROG.cleared[n] ? '★'.repeat(PROG.cleared[n]) + '☆'.repeat(3 - PROG.cleared[n]) : '';
    let right = stars;
    if (!ready) right = '준비 중';
    else if (!open) right = '🔒';
    b.className = 'btn stagebtn' + (ready && open ? '' : ' locked');
    b.innerHTML = `<b>${n}.</b> ${STAGE_NAMES[n]}${STAR_STAGES.includes(n) ? ' ⭐' : ''}${TRANSCEND_STAGES.includes(n) ? ' <span style="color:#ffd84a;font-size:12px">🌟초월</span>' : ''} <span class="st">${right}</span>`;
    b.disabled = !(ready && open);
    b.onclick = () => { sfx('select'); goStage(n); };
    grid.appendChild(b);
    if (n === 5) {   // 👑 중간보스
      const m = document.createElement('button'), mo = midUnlocked(), ms = PROG.mid || 0;
      m.className = 'btn stagebtn midstage' + (mo ? '' : ' locked');
      m.innerHTML = `<b>👑</b> 중간보스 · ${MIDBOSS.name} <span class="st">${!mo ? '🔒' : ms ? '★'.repeat(ms) + '☆'.repeat(3 - ms) : ''}</span>`;
      m.disabled = !mo;
      m.onclick = () => { sfx('select'); goMid(); };
      grid.appendChild(m);
    }
  }
  $('titleLayer').classList.add('hidden');
  $('selectLayer').classList.remove('hidden');
}

// ---------------- 저장하기 · 불러오기 창 ----------------
let slotMode = 'save', slotArm = null;
$('saveBtn').onclick = () => { sfx('select'); openSlots('save'); };
$('loadBtn').onclick = () => { sfx('select'); openSlots('load'); };
$('slotBack').onclick = () => { if (slotFrom === 'game') closeGameSave(); else openTitle(); };
$('slotName').addEventListener('keydown', e => e.stopPropagation());
let slotFrom = 'title';   // 저장 창을 연 곳: 메인 화면(title) 또는 전투 중(game)

function openSlots(mode, from = 'title') {
  slotMode = mode; slotArm = null; slotFrom = from;
  const inGame = from === 'game';
  $('slotTitle').textContent = mode === 'save' ? (inGame ? '💾 전투 중 저장하기' : '💾 저장하기') : (inGame ? '📂 불러오기 (다른 기록으로 이동)' : '📂 불러오기');
  $('slotNameRow').classList.toggle('hidden', mode !== 'save');
  $('slotName').value = PROG.name || '';
  $('slotMsg').textContent = mode === 'save'
    ? (inGame ? `지금 전투(${G.stage.title} · ${G.turn}턴)를 그대로 저장해요. 이름을 쓰고 칸을 눌러 주세요.` : '이름을 쓰고, 저장할 칸을 눌러 주세요.')
    : (inGame ? '다른 저장 칸으로 이동해요. 지금 전투를 남기려면 먼저 [💾 저장]을 해 주세요!' : '불러올 칸을 눌러 주세요.');
  $('slotMsg').style.color = '#b8c4ff';
  $('slotBack').textContent = inGame ? '← 게임으로 돌아가기' : '← 메인 화면';
  drawSlots();
  if (!inGame) $('titleLayer').classList.add('hidden');
  $('slotLayer').classList.remove('hidden');
}
function slotInfo(s) {
  const m = maxCleared(s.cleared);
  const bst = s.battle ? (s.battle.hidden ? HIDDEN_STAGES[s.battle.stage] : s.battle.midboss ? MIDBOSS : STAGES[s.battle.stage]) : null;
  const bt = s.battle ? `<br><span style="color:#ff9aa0">⚔ ${bst ? bst.title : ''} 전투 중 (${s.battle.turn}턴) — 불러오면 이어서 싸워요</span>` : '';
  const hm = s.hard ? maxCleared(s.hard.cleared || {}) : 0;
  const ht = s.hard ? `<br><span style="color:#ff8a5a">🔥 어려움: ${hm ? `스테이지 ${hm}까지 클리어 · 💀 ${(s.hard.dead || []).length}명` : '시작함'}${s.mode === 'hard' ? ' (마지막으로 한 난이도)' : ''}</span>` : '';
  return `<b>${s.name ? escapeHTML(s.name) : '(이름 없음)'}</b><br>` +
    (m ? `😊 보통: 스테이지 ${m}까지 클리어 · ★ ${totalStars(s.cleared)}개` : '😊 보통: 아직 클리어한 스테이지 없음') + ht +
    (s.gear ? ` · 강화 ${Object.values(s.gear).reduce((a, g) => a + (g.count || 0), 0)}번` : '') + bt +
    `<br><span style="color:#b8c4ff">${fmtDate(s.savedAt)} 저장</span>`;
}

// ---------------- 전투 중 저장 ----------------
function battleSnapshot() {
  return {
    stage: G.stageNo, hidden: !!G.hidden, midboss: !!G.midboss, team: G.team ? [...G.team] : null, kills: { ...(G.kills || {}) },
    turn: G.turn, defeated: G.defeated, midDone: G.midDone, stats: { ...G.stats },
    units: G.units.map(u => ({ id: u.id, x: u.x, y: u.y, hp: u.hp, alive: u.alive, cd: u.cd || 0, cd2: u.cd2 || 0,
      acted: !!u.acted, guarding: !!u.guarding, stunned: u.stunned || 0, dir: u.dir }))
  };
}
function openGameSave() {
  if (G.state !== 'idle' || G.phase !== 'player') return;
  sfx('select');
  G.state = 'paused'; updateTop();
  openSlots('save', 'game');
}
function closeGameSave() {
  $('slotLayer').classList.add('hidden');
  slotFrom = 'title';
  G.state = 'idle'; idlePanel();
}
$('saveTopBtn').onclick = openGameSave;
// 게임 중 불러오기: 다른 저장 칸으로 이동
$('loadTopBtn').onclick = () => {
  if (G.state !== 'idle' || G.phase !== 'player') return;
  sfx('select');
  G.state = 'paused'; updateTop();
  openSlots('load', 'game');
};

// 저장한 전투를 그대로 이어서 시작
async function resumeBattle(b) {
  hideLayers();
  loadStage(b.stage, b.hidden ? { hidden: true, team: b.team } : b.midboss ? { midboss: true } : {});
  G.turn = b.turn; G.defeated = b.defeated; G.midDone = b.midDone; G.stats = { ...b.stats }; G.kills = { ...(b.kills || {}) };
  for (const s of b.units) {
    const u = G.units.find(x => x.id === s.id); if (!u) continue;
    u.x = s.x; u.y = s.y; u.px = s.x * T; u.py = s.y * T;
    u.hp = Math.min(u.maxHp, s.hp); u.alive = s.alive && s.hp > 0;
    u.cd = s.cd; u.cd2 = s.cd2 || 0; u.acted = s.acted; u.guarding = s.guarding; u.stunned = s.stunned || 0;
    if (s.dir) u.dir = s.dir;
  }
  updateTop();
  await showBanner(`이어서 시작! ${G.turn}턴 · 우리 편 차례`);
  if (heroes().every(h => h.acted)) { G.state = 'busy'; await enemyTurn(); return; }
  G.state = 'idle'; idlePanel();
}
function drawSlots() {
  const list = $('slotList'); list.innerHTML = '';
  const slots = readSlots();
  slots.forEach((s, i) => {
    const row = document.createElement('div'); row.className = 'slot';
    const main = document.createElement('button');
    const armedHere = slotArm && slotArm.i === i && (slotArm.kind === 'over' || slotArm.kind === 'load');
    main.className = 'btn slotmain' + (armedHere ? ' confirm' : '');
    if (armedHere && slotArm.kind === 'over') main.innerHTML = `<b>${i + 1}번 칸</b><br>여기에 덮어쓸까요? 한 번 더 누르세요!`;
    else if (armedHere) main.innerHTML = `<b>${i + 1}번 칸으로 이동할까요?</b><br>지금 하던 전투는 저장하지 않았다면 사라져요. 한 번 더 누르세요!`;
    else main.innerHTML = `<span style="color:#b8c4ff">${i + 1}번 칸</span>` + (PROG.slot === i ? ' <span style="color:#7cff8a">(지금 사용 중)</span>' : '') + '<br>' + (s ? slotInfo(s) : '<span style="color:#8890b8">— 비어 있어요 —</span>');
    main.disabled = slotMode === 'load' && !s;
    main.onclick = () => onSlot(i, s);
    row.appendChild(main);
    if (s) {
      const del = document.createElement('button');
      const armed = slotArm && slotArm.i === i && slotArm.kind === 'del';
      del.className = 'btn red slotdel';
      del.textContent = armed ? '정말\n지울까요?' : '지우기';
      del.style.whiteSpace = 'pre';
      del.onclick = () => {
        if (armed) {
          const all = readSlots(); all[i] = null; writeSlots(all);
          if (PROG.slot === i) PROG.slot = null;
          slotArm = null; msg(`${i + 1}번 칸을 지웠어요.`, '#ff9aa0');
        } else slotArm = { i, kind: 'del' };
        drawSlots();
      };
      row.appendChild(del);
    }
    list.appendChild(row);
  });
}
function msg(t, color = '#7cff8a') { $('slotMsg').textContent = t; $('slotMsg').style.color = color; }
function onSlot(i, s) {
  if (slotMode === 'save') {
    const name = $('slotName').value.trim();
    if (!name) { msg('먼저 이름을 써 주세요! ✏', '#ffe27a'); $('slotName').focus(); return; }
    if (s && PROG.slot !== i && !(slotArm && slotArm.i === i && slotArm.kind === 'over')) {
      slotArm = { i, kind: 'over' }; drawSlots(); return;
    }
    PROG.name = name;
    const inGame = slotFrom === 'game';
    if (saveToSlot(i, inGame ? battleSnapshot() : null)) {
      sfx('correct');
      msg(inGame ? `💾 ${i + 1}번 칸에 지금 전투를 저장했어요! 나중에 [📂 불러오기]로 이어서 할 수 있어요.`
                 : `💾 ${i + 1}번 칸에 저장했어요! 다음부터는 스테이지를 깰 때마다 자동으로 저장돼요.`);
    } else msg('⚠ 저장하지 못했어요. 브라우저 설정을 확인해 주세요.', '#ff9aa0');
    slotArm = null; drawSlots();
    if (!inGame) refreshTitle();
  } else {
    if (!s) return;
    // 게임 중에 불러올 때는 한 번 더 눌러야 해요 (지금 전투가 사라지니까)
    if (slotFrom === 'game' && !(slotArm && slotArm.i === i && slotArm.kind === 'load')) {
      slotArm = { i, kind: 'load' }; drawSlots(); return;
    }
    slotArm = null; slotFrom = 'title'; G.state = 'title'; G.ghost = null; clearSel();
    PROGS.normal = normalizeProg(s, i);
    PROGS.hard = s.hard ? normalizeProg({ ...s.hard, name: s.hard.name || s.name }, i) : null;
    MODE = s.mode === 'hard' && PROGS.hard ? 'hard' : 'normal';
    PROG = PROGS[MODE];
    applyCast(PROG.cast);   // 저장된 배역(주인공·동료 이름)으로 바꿔요
    sfx('correct');
    if (s.battle && (s.battle.hidden ? HIDDEN_STAGES[s.battle.stage] : STAGES[s.battle.stage])) {
      msg(`📂 ${i + 1}번 칸을 불러왔어요! 저장한 전투를 이어서 시작해요.`);
      setTimeout(() => resumeBattle(s.battle), 800);
      return;
    }
    msg(`📂 ${i + 1}번 칸을 불러왔어요! 스테이지를 골라 주세요.`);
    refreshTitle();
    setTimeout(() => { $('slotLayer').classList.add('hidden'); openSelect(); }, 700);
  }
}

// =====================================================
//  🔮 히든 스테이지 창 (스테이지 10을 깨면 열려요)
//  1) 히든 스테이지 고르기 → 2) 친구 4명 고르기 → 출발!
// =====================================================
const TEAM_SIZE = 4;
let hidView = { stage: null, team: [] };
const hiddenBuildOk = m => (m === MODE || PROGS[m]) && everCleared(10, m);
const hiddenOpen = () => hiddenBuildOk('normal') || hiddenBuildOk('hard');
const hiddenUnlocked = n => n === 1 || everHCleared(n - 1);

function openHidden() {
  if (!hiddenOpen()) return;
  hideLayers();
  clearSel(); G.state = 'title'; G.ghost = null;
  const both = hiddenBuildOk('normal') && hiddenBuildOk('hard');
  if (!both) setMode(hiddenBuildOk('hard') ? 'hard' : 'normal');
  hidView = { stage: null, build: both ? null : MODE, team: (PROG.team || []).filter(id => roster().includes(id)).slice(0, TEAM_SIZE) };
  drawHidden();
  $('hiddenLayer').classList.remove('hidden');
}
function drawHidden() {
  const body = $('hidBody'); body.innerHTML = '';
  // 0) 어느 난이도에서 키운 친구들로 도전할까요?
  if (!hidView.build) {
    $('hidInfo').innerHTML = '어느 난이도에서 강화한 친구들로 도전할까요?<br><span class="small">고른 난이도의 강화·레벨·히든 기록으로 싸워요.</span>';
    [['normal', '😊 보통 모드에서 키운 친구들'], ['hard', '🔥 어려움 모드에서 키운 친구들']].forEach(([m, label]) => {
      const P = m === MODE ? PROG : PROGS[m];
      const b = document.createElement('button');
      b.className = 'btn stagebtn hidstage';
      const cnt = P ? Object.values(P.gear || {}).reduce((a, g) => a + (g.count || 0), 0) : 0;
      b.innerHTML = `<b>${label}</b><br><span class="small">강화 ${cnt}번 · 히든 ${Object.keys((P && P.hcleared) || {}).length}/5 클리어${m === 'hard' && P ? ` · 💀 ${P.dead.length}명은 함께 못 가요` : ''}</span>`;
      b.onclick = () => { sfx('select'); setMode(m); hidView.build = m; hidView.team = (PROG.team || []).filter(id => roster().includes(id)).slice(0, TEAM_SIZE); drawHidden(); };
      body.appendChild(b);
    });
    $('hidBack').textContent = '← 메인 화면';
    return;
  }
  const buildTxt = `<span class="small" style="color:${hidView.build === 'hard' ? '#ff8a5a' : '#7cff8a'}">${hidView.build === 'hard' ? '🔥 어려움' : '😊 보통'} 모드에서 키운 친구들로 도전해요</span><br>`;
  if (!hidView.stage) {
    $('hidInfo').innerHTML = buildTxt + '친구 <b>4명</b>을 골라서 도전하는 숨겨진 스테이지예요!<br>' +
      `<span class="small">적을 잡을수록 경험치를 많이 받아요 (깨면 ${EXP_CLEAR} + 1마리당 ${EXP_KILL}). 레벨이 오르면 그 친구의 스킬을 강화할 수 있어요.<br>` +
      '히든 5를 깨면 함께 싸운 친구가 🔮 히든 스킬(두 번째 스킬)을 배워요!</span>';
    for (let n = 1; n <= 5; n++) {
      const st = HIDDEN_STAGES[n], open = hiddenUnlocked(n), s = (PROG.hcleared || {})[n];
      const b = document.createElement('button');
      b.className = 'btn stagebtn hidstage' + (open ? '' : ' locked');
      b.innerHTML = `<b>🔮 ${n}.</b> ${st.name}${st.giveHidden ? ' <span style="color:#c89aff;font-size:12px">히든 스킬</span>' : ''}` +
        `<span class="st">${!open ? '🔒' : s ? '★'.repeat(s) + '☆'.repeat(3 - s) : ''}</span>` +
        `<br><span class="small">적 체력 ×${st.boost.hp} · 공격 +${st.boost.atk}${st.night ? ' · 🌙 밤' : ''}</span>`;
      b.disabled = !open;
      b.onclick = () => { sfx('select'); hidView.stage = n; drawHidden(); };
      body.appendChild(b);
    }
    $('hidBack').textContent = '← 메인 화면';
    return;
  }
  // 친구 4명 고르기
  const n = hidView.stage, st = HIDDEN_STAGES[n], NEED = teamSize();
  $('hidInfo').innerHTML = buildTxt + `<b style="color:#c89aff">🔮 ${n}. ${st.name}</b><br>함께 싸울 친구를 <b>${NEED}명</b> 골라 주세요! ` +
    `(<b style="color:${hidView.team.length === NEED ? '#7cff8a' : '#ffe27a'}">${hidView.team.length}/${NEED}명</b>)`;
  const grid = document.createElement('div'); grid.className = 'upgrid teamgrid';
  roster().forEach(id => {
    const sel = hidView.team.includes(id), s = statsFor(id), L = lvOf(id);
    const b = document.createElement('button');
    b.className = 'btn upcard teamcard' + (sel ? ' picked' : '');
    b.appendChild(miniCanvas(id, 48));
    const t = document.createElement('div');
    t.innerHTML = `<b>${sel ? '✔ ' : ''}${CHARACTERS[id].name}</b> <span class="small">Lv.${L.lv} · ${CHARACTERS[id].role}</span><br>` +
      `<span class="small">공격 ${s.atk} · 체력 ${s.hp} · 이동 ${s.move}${s.skill2 ? ' · 🔮' : ''}</span>` +
      `<br><span class="expbar"><i style="width:${Math.round(L.exp / expNeed(L.lv) * 100)}%"></i></span>`;
    b.appendChild(t);
    b.onclick = () => {
      sfx('select');
      if (sel) hidView.team = hidView.team.filter(x => x !== id);
      else if (hidView.team.length < NEED) hidView.team.push(id);
      drawHidden();
    };
    grid.appendChild(b);
  });
  body.appendChild(grid);
  const go = document.createElement('button');
  go.className = 'btn big gold upok';
  const ready = hidView.team.length === NEED;
  go.textContent = ready ? '🔮 이 친구들과 출발!' : `친구를 ${NEED - hidView.team.length}명 더 골라 주세요`;
  go.disabled = !ready;
  go.onclick = () => { PROG.team = [...hidView.team]; goHidden(n, PROG.team); };
  body.appendChild(go);
  $('hidBack').textContent = '← 히든 스테이지 목록';
}
$('hidBack').onclick = () => {
  if (hidView.stage) { hidView.stage = null; drawHidden(); }
  else if (hidView.build && hiddenBuildOk('normal') && hiddenBuildOk('hard')) { hidView.build = null; drawHidden(); }
  else openTitle();
};
// 어려움에서 쓰러진 친구가 많아 4명이 안 되면, 남은 친구 수만큼만 골라요
const teamSize = () => Math.max(1, Math.min(TEAM_SIZE, roster().length));

// =====================================================
//  💖 동료 살리기 (어려움 모드)
// =====================================================
let reviveFrom = 'title';
const canRevive = () => isHard() && PROG.revives > 0 && PROG.dead && PROG.dead.length > 0;
function openRevive(from) {
  reviveFrom = from;
  ['titleLayer', 'endLayer'].forEach(id => $(id).classList.add('hidden'));
  drawRevive();
  $('reviveLayer').classList.remove('hidden');
}
function drawRevive() {
  const body = $('reviveBody'); body.innerHTML = '';
  $('reviveInfo').innerHTML = PROG.dead.length
    ? `쓰러진 친구를 골라 다시 함께해요! 남은 살리기 기회: <b style="color:#ff9ad0">${PROG.revives}번</b><br><span class="small">살리지 않은 기회는 남겨 두었다가 나중에 써도 돼요.</span>`
    : '쓰러진 친구가 없어요! 💪 살리기 기회는 남겨 둘게요.';
  const grid = document.createElement('div'); grid.className = 'upgrid teamgrid';
  PROG.dead.forEach(id => {
    const b = document.createElement('button');
    b.className = 'btn upcard teamcard';
    b.appendChild(miniCanvas(id, 48));
    const t = document.createElement('div');
    t.innerHTML = `<b>${CHARACTERS[id].name}</b> <span class="small">${CHARACTERS[id].role}</span><br><span class="small">${PROG.revives > 0 ? '💖 눌러서 살리기' : '살리기 기회가 없어요'}</span>`;
    b.appendChild(t);
    b.disabled = PROG.revives <= 0;
    b.onclick = () => {
      if (PROG.revives <= 0) return;
      PROG.dead = PROG.dead.filter(x => x !== id); PROG.revives--;
      sfx('heal');
      if (PROG.slot !== null) saveToSlot(PROG.slot);
      drawRevive();
      $('reviveInfo').innerHTML = `💖 <b>${CHARACTERS[id].name}</b>${hasBatchim(CHARACTERS[id].name) ? '이' : '가'} 다시 함께해요!<br>` + $('reviveInfo').innerHTML;
    };
    grid.appendChild(b);
  });
  body.appendChild(grid);
}
$('reviveBack').onclick = () => {
  $('reviveLayer').classList.add('hidden');
  if (reviveFrom === 'end') { refreshEndUpgrade(); $('endLayer').classList.remove('hidden'); }
  else openTitle();
};
$('hidBtn').onclick = () => { sfx('select'); openHidden(); };

// 히든 스테이지 시작 (남은 강화가 있으면 먼저 강화)
function goHidden(n, team, skipIntro = false) {
  const start = () => startStage(n, skipIntro, { hidden: true, team: [...team] });
  if (mustUpgrade()) openUpgrade(start, true);
  else start();
}

// ---------------- 처음 실행 ----------------
$('soundBtn').onclick = () => { muted = !muted; $('soundBtn').textContent = muted ? '🔇' : '🔊'; };
refreshTtsBtn();
$('voiceTestBtn').onclick = () => {
  if (!HAS_TTS) { $('voiceTestBtn').textContent = '이 브라우저는 읽어 주기를 지원하지 않아요'; return; }
  previewVoices();
};
loadStage(1);
openTitle();
requestAnimationFrame(render);
