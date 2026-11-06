// =====================================================
//  강화 시스템 (무기 바꾸기 · 스킬 바꾸기)
//  - 스테이지를 처음 깨면 "친구 수 × 33%" 만큼 강화 기회를 받아요.
//    (2~4명 → 1번, 5~7명 → 2번, 8~10명 → 3번)
//  - 강화할 친구는 직접 골라요. 한 친구만 여러 번 강화해도 되고, 골고루 해도 돼요.
//  - 새 무기·스킬은 항상 지금보다 더 강해요.
// =====================================================

const UPGRADE_RATE = 0.33;
function pointsFor(partySize) { return Math.max(1, Math.round(partySize * UPGRADE_RATE)); }

// 무기 이름 앞에 붙는 말 (강화할수록 바뀌어요)
const W_PREFIX = {
  sharp:  ['날카로운', '강철', '다이아몬드', '전설의'],
  sturdy: ['튼튼한', '단단한', '철벽', '불멸의'],
  light:  ['가벼운', '바람의', '번개의', '빛나는']
};
// 스킬 이름 앞에 붙는 말
const S_PREFIX = {
  power: ['파워', '슈퍼', '울트라', '레전드'],
  range: ['멀리', '더 멀리', '하늘까지', '끝없는'],
  fast:  ['재빠른', '번개', '순간'],
  wide:  ['회오리', '태풍', '폭풍', '대폭풍'],
  all:   ['모두의', '다 함께', '온 세상의', '무지개']
};
const W_TYPE_LABEL = { sharp: '공격형', sturdy: '튼튼형', light: '날쌘형' };
const S_TYPE_LABEL = { power: '힘 강화', range: '거리 강화', fast: '빨리 쓰기', wide: '넓게 공격', all: '모두 치유' };

// =====================================================
//  🌟 초월 강화
//  - 스테이지 3·5·7·9를 처음 깨면 초월 강화 기회를 받아요 (이것도 친구 수의 1/3).
//  - 친구마다 "초월 무기" 1번, "초월 스킬" 1번을 받을 수 있어요.
//  - 초월 무기·스킬은 이름이 완전히 바뀌고 아주 강해져요.
// =====================================================
const TRANSCEND_STAGES = [3, 5, 7, 9];
const TRANSCEND = {
  warrior: { weapon: { name: '무지개 만년필 대검', atk: 6, hp: 8 },             skill: { name: '천 개의 연필 베기', pow: 1.5, wide: true } },
  archer:   { weapon: { name: '별빛 줄자 활', atk: 5, rmaxB: 1 },                skill: { name: '소수점 유성우', pow: 1, rng: 2, wide: true } },
  healer:   { weapon: { name: '생명의 황금 물뿌리개', atk: 3, hp: 10, def: 1 },   skill: { name: '초평호의 축복', heal: 10, all: true } },
  tank:    { weapon: { name: '농다리 수호 방패', atk: 2, hp: 15, def: 2 },      skill: { name: '절대 방패', cut: 0.2, rng: 1 } },
  stone:     { weapon: { name: '천년 돌 건틀릿', atk: 6, def: 1 },                skill: { name: '대지 쾅쾅', pow: 1.5, wide: true } },
  mage:  { weapon: { name: '지혜의 백과사전 지팡이', atk: 4, rmaxB: 1 },      skill: { name: '천둥 번개 폭풍', pow: 1, rng: 1, cd: 1 } },
  water:      { weapon: { name: '초평호 물의 지팡이', atk: 5, rmaxB: 1 },          skill: { name: '초평호 대해일', pow: 1, rng: 1, wide: true } },
  scout:    { weapon: { name: '바람 날개 운동화', atk: 4, move: 1, hp: 6 },      skill: { name: '돌풍 질주', pow: 1.5, rng: 1 } },
  trick:   { weapon: { name: '요술 무지개 팽이', atk: 5, hp: 6 },              skill: { name: '왕 헷갈리기 회오리', pow: 1, rng: 1, wide: true } },
  knight:    { weapon: { name: '빛의 수호 성창', atk: 6, def: 2 },               skill: { name: '천상의 빛', pow: 1.5, wide: true } }
};
function transcendOf(id) {
  return TRANSCEND[id] || {
    weapon: { name: '초월 ' + CHARACTERS[id].weapon, atk: 5, hp: 8 },
    skill: { name: '초월 ' + CHARACTERS[id].skill.name, pow: 1.5, heal: 10, cut: 0.2, wide: true, all: true }
  };
}

function prefixName(arr, lv) {
  const i = lv - 2;
  return i < arr.length ? arr[i] : arr[arr.length - 1] + '+'.repeat(i - arr.length + 1);
}
function defGear() {
  return { wLv: 1, wType: null, sLv: 1, sType: null, atk: 0, hp: 0, move: 0, def: 0,
           pow: 0, heal: 0, rng: 0, cd: 0, cut: 0, wide: false, all: false, count: 0,
           tW: false, tS: 0, wPlus: 0, sPlus: 0, rmaxB: 0, tcount: 0, hs: false };
}
function gearOf(id) {
  if (!PROG.gear[id]) PROG.gear[id] = defGear();
  const g = PROG.gear[id], d = defGear();
  for (const k in d) if (g[k] === undefined) g[k] = d[k];   // 예전 저장 파일 보완
  if (g.tS === true) g.tS = 1; if (g.tS === false) g.tS = 0; // 초월 스킬은 이제 2단계까지
  return g;
}

// =====================================================
//  🔼 레벨 · 경험치 (히든 스테이지에서 올라요)
//  - 레벨이 오르면 그 친구의 스킬을 1번 강화할 수 있어요 (lvPts)
// =====================================================
function lvOf(id) {
  if (!PROG.lv) PROG.lv = {};
  if (!PROG.lv[id]) PROG.lv[id] = { lv: 1, exp: 0, pts: 0 };
  return PROG.lv[id];
}
function expNeed(lv) { return 60 + (lv - 1) * 30; }   // 다음 레벨까지 필요한 경험치
function lvPtsUsable() {
  return roster().reduce((a, id) => a + (lvOf(id).pts > 0 && skillOptions(id).length ? lvOf(id).pts : 0), 0);
}
function weaponName(id, g) {
  if (g.tW) return '🌟' + transcendOf(id).weapon.name + (g.wPlus ? ' +' + g.wPlus : '');
  const n = CHARACTERS[id].weapon;
  return g.wType ? prefixName(W_PREFIX[g.wType], g.wLv) + ' ' + n : n;
}
function skillName(id, g) {
  if (g.tS >= 2) return '🌟🌟' + transcendOf(id).skill.name + ' Ⅱ' + (g.sPlus ? ' +' + g.sPlus : '');
  if (g.tS) return '🌟' + transcendOf(id).skill.name + (g.sPlus ? ' +' + g.sPlus : '');
  const n = CHARACTERS[id].skill.name;
  return g.sType ? prefixName(S_PREFIX[g.sType], g.sLv) + ' ' + n : n;
}

// 기본 능력치 + 강화 = 실제 능력치
function statsFor(id, g = gearOf(id)) {
  const c = CHARACTERS[id], b = c.skill;
  const sk = { ...b, name: skillName(id, g), cd: Math.max(1, b.cd - g.cd), wide: !!(b.wide || g.wide), all: !!(b.all || g.all) };
  if (b.type === 'attack') { sk.power = Math.round((b.power + g.pow) * 10) / 10; sk.rmax = b.rmax + g.rng; }
  if (b.type === 'heal') { sk.amount = b.amount + g.heal; sk.rmax = b.rmax + g.rng; }
  if (b.type === 'guard') { sk.grange = b.grange + g.rng; sk.cut = Math.min(g.tS ? 0.9 : 0.8, Math.round((b.cut + g.cut) * 100) / 100); }
  // 🔮 히든 스킬 (두 번째 스킬)
  const h = g.hs && HIDDEN_SKILLS[id] ? { ...HIDDEN_SKILLS[id], name: '🔮' + HIDDEN_SKILLS[id].name } : null;
  const cr = hasCrown(id) ? CROWN_BONUS : { hp: 0, atk: 0 };   // 👑 중간보스 왕관 보너스
  const jb = joinBonus(id);                                       // 늦게 합류한 친구일수록 기본 능력이 높아요
  return { hp: c.hp + g.hp + cr.hp + jb.hp, atk: c.atk + g.atk + cr.atk + jb.atk, move: c.move + g.move, def: (c.def || 0) + g.def,
           rmin: c.rmin, rmax: c.rmax + (g.rmaxB || 0), skill: sk, skill2: h, wName: weaponName(id, g), trans: !!(g.tW || g.tS) };
}
// 초월 강화 선택지 (아직 받지 않은 것만)
function transcendOptions(id) {
  const g = gearOf(id), T = transcendOf(id), o = [];
  if (!g.tW) o.push({ kind: 'tw', label: '🌟 초월 무기', name: '🌟' + T.weapon.name,
    apply: x => { const w = T.weapon; x.atk += w.atk || 0; x.hp += w.hp || 0; x.def += w.def || 0; x.rmaxB += w.rmaxB || 0; x.move += w.move || 0; },
    finish: x => { x.tW = true; x.wPlus = 0; } });
  if (!g.tS) o.push({ kind: 'ts', label: '🌟 초월 스킬 1단계', name: '🌟' + T.skill.name,
    apply: x => { const s = T.skill; x.pow += s.pow || 0; x.heal += s.heal || 0; x.cut = Math.round((x.cut + (s.cut || 0)) * 100) / 100;
                  x.rng += s.rng || 0; x.cd += s.cd || 0; if (s.wide) x.wide = true; if (s.all) x.all = true; },
    finish: x => { x.tS = 1; x.sPlus = 0; } });
  else if (g.tS < 2) {   // 같은 스킬을 한 번 더 초월! (2단계)
    const type = CHARACTERS[id].skill.type;
    o.push({ kind: 'ts', label: '🌟🌟 초월 스킬 2단계', name: '🌟🌟' + T.skill.name + ' Ⅱ',
      apply: x => {
        if (type === 'attack') { x.pow += 1; if (x.rng < 3) x.rng += 1; }
        if (type === 'heal') { x.heal += 8; if (x.rng < 3) x.rng += 1; }
        if (type === 'guard') { x.cut = Math.round((x.cut + 0.1) * 100) / 100; if (x.rng < 3) x.rng += 1; }
      },
      finish: x => { x.tS = 2; x.sPlus = 0; } });
  }
  return o;
}
// 남은 강화 (초월은 받을 수 있는 친구가 있을 때만 셈)
function transcendUsable() { return PROG.tpoints > 0 && roster().some(id => transcendOptions(id).length > 0); }
function leftToSpend() { return PROG.points + (transcendUsable() ? PROG.tpoints : 0) + lvPtsUsable(); }
function skillDesc(sk) {
  if (sk.type === 'heal') return `체력 ${sk.amount} 회복 · ${sk.rmax}칸까지${sk.all ? ' · 범위 안 친구 모두' : ''} · ${sk.cd}턴마다`;
  if (sk.type === 'guard') return `${sk.grange}칸 안 친구 피해 ${Math.round(sk.cut * 100)}% 줄이기 · ${sk.cd}턴마다`;
  return `공격력 ×${sk.power} · ${sk.rmax}칸까지${sk.wide ? ' · 옆의 적도 공격' : ''}` +
    `${sk.stun ? ' · 맞은 적 한 턴 멈춤' : ''}${sk.healAround ? ` · 옆 친구 체력 +${sk.healAround}` : ''}${sk.ignoreDef ? ' · 방어 무시' : ''} · ${sk.cd}턴마다`;
}

// 무기 선택지 (모두 지금보다 강해져요)
function weaponOptions(id) {
  const g = gearOf(id), lv = g.wLv + 1, n = CHARACTERS[id].weapon;
  const o = [
    { type: 'sharp',  apply: x => { x.atk += 3; } },
    { type: 'sturdy', apply: x => { x.atk += 1; x.hp += 6; x.def += (lv % 2 === 0 ? 1 : 0); } }
  ];
  if (g.move < 2) o.push({ type: 'light', apply: x => { x.atk += 1; x.move += 1; } });
  // 초월 무기를 받은 뒤에는 "초월 무기 +1, +2..." 로 더 강해져요
  if (g.tW) return o.map(op => ({ ...op, kind: 'weapon', label: W_TYPE_LABEL[op.type],
    name: '🌟' + transcendOf(id).weapon.name + ' +' + (g.wPlus + 1),
    finish: x => { x.wPlus += 1; x.wLv = lv; } }));
  return o.map(op => ({ ...op, kind: 'weapon', label: W_TYPE_LABEL[op.type],
    name: prefixName(W_PREFIX[op.type], lv) + ' ' + n,
    finish: x => { x.wLv = lv; x.wType = op.type; } }));
}
// 스킬 선택지
function skillOptions(id) {
  const g = gearOf(id), b = CHARACTERS[id].skill, cur = statsFor(id).skill, lv = g.sLv + 1, o = [];
  if (b.type === 'attack') {
    o.push({ type: 'power', apply: x => { x.pow += 0.5; } });
    if (g.rng < 2) o.push({ type: 'range', apply: x => { x.rng += 1; } });
    if (!cur.wide) o.push({ type: 'wide', apply: x => { x.wide = true; } });
  } else if (b.type === 'heal') {
    o.push({ type: 'power', apply: x => { x.heal += 5; } });
    if (g.rng < 2) o.push({ type: 'range', apply: x => { x.rng += 1; } });
    if (!cur.all) o.push({ type: 'all', apply: x => { x.all = true; } });
  } else if (b.type === 'guard') {
    if (cur.cut < 0.8) o.push({ type: 'power', apply: x => { x.cut = Math.round((x.cut + 0.1) * 100) / 100; } });
    if (g.rng < 2) o.push({ type: 'range', apply: x => { x.rng += 1; } });
  }
  if (cur.cd > 1) o.push({ type: 'fast', apply: x => { x.cd += 1; } });
  if (g.tS) return o.map(op => ({ ...op, kind: 'skill', label: S_TYPE_LABEL[op.type],
    name: '🌟' + transcendOf(id).skill.name + ' +' + (g.sPlus + 1),
    finish: x => { x.sPlus += 1; x.sLv = lv; } }));
  return o.map(op => ({ ...op, kind: 'skill', label: S_TYPE_LABEL[op.type],
    name: prefixName(S_PREFIX[op.type], lv) + ' ' + b.name,
    finish: x => { x.sLv = lv; x.sType = op.type; } }));
}
// 미리 보기: 바꾸면 무엇이 좋아지는지
function previewChange(id, op) {
  const before = statsFor(id);
  const g2 = JSON.parse(JSON.stringify(gearOf(id)));
  op.apply(g2); op.finish(g2);
  const after = statsFor(id, g2);
  const lines = [];
  const cmp = (label, a, b) => { if (a !== b) lines.push(`${label} ${a} → <b>${b}</b>`); };
  cmp('공격력', before.atk, after.atk);
  cmp('체력', before.hp, after.hp);
  cmp('방어', before.def, after.def);
  cmp('이동', before.move + '칸', after.move + '칸');
  cmp('공격 거리', before.rmax + '칸', after.rmax + '칸');
  if (op.kind === 'skill' || op.kind === 'ts') {
    const s1 = before.skill, s2 = after.skill;
    if (s1.type === 'attack') { cmp('스킬 공격력', '×' + s1.power, '×' + s2.power); cmp('스킬 거리', s1.rmax + '칸', s2.rmax + '칸'); }
    if (s1.type === 'heal') { cmp('회복량', s1.amount, s2.amount); cmp('치유 거리', s1.rmax + '칸', s2.rmax + '칸'); }
    if (s1.type === 'guard') { cmp('피해 줄이기', Math.round(s1.cut * 100) + '%', Math.round(s2.cut * 100) + '%'); cmp('지키는 범위', s1.grange + '칸', s2.grange + '칸'); }
    if (!s1.wide && s2.wide) lines.push('<b>맞은 적 바로 옆의 적도 함께 공격!</b>');
    if (!s1.all && s2.all) lines.push('<b>범위 안의 친구 모두 한 번에 치유!</b>');
    cmp('사용', s1.cd + '턴마다', s2.cd + '턴마다');
  }
  return lines;
}

// 지금까지 동료가 된 친구들 (깬 스테이지에 나온 친구)
function roster() {
  const ids = [];
  Object.keys(STAGES).map(Number).sort((a, b) => a - b).forEach(n => {
    if (PROG.cleared[n]) STAGES[n].heroes.forEach(h => { const c = roleClass(h.id); if (!ids.includes(c)) ids.push(c); });
  });
  // 🔥 어려움: 쓰러진 친구는 강화하거나 히든에 데려갈 수 없어요
  const dead = typeof deadList === 'function' ? deadList() : [];
  return ids.filter(id => !dead.includes(id));
}

// ---------------- 강화 화면 ----------------
let upView = { id: null, tab: 'weapon', pick: null }, upReturn = 'title', upMust = false;

// from: 'title'(메인 화면) / 'end'(결과 화면) / 함수(강화가 끝나면 실행, 예: 스테이지 시작)
// must: true면 강화 기회를 다 써야 창을 닫을 수 있어요
function openUpgrade(from, must = false) {
  upReturn = from; upMust = must;
  upView = { id: null, tab: 'weapon', pick: null };
  ['titleLayer', 'endLayer', 'selectLayer', 'slotLayer'].forEach(id => $(id).classList.add('hidden'));
  $('upMsg').textContent = '';
  drawUpgrade();
  $('upLayer').classList.remove('hidden');
}
function closeUpgrade() {
  if (upMust && leftToSpend() > 0) return;   // 강화를 다 해야 닫을 수 있어요
  $('upLayer').classList.add('hidden');
  if (typeof upReturn === 'function') upReturn();
  else if (upReturn === 'end') { refreshEndUpgrade(); $('endLayer').classList.remove('hidden'); }
  else openTitle();
}
// 🤝 합류 보너스: 스테이지 k에 합류하는 친구는 그 스테이지 적이 강해진 만큼 기본 능력이 올라요
//    (보통 난이도 적 강도 표 기준: 체력은 같은 비율, 공격력은 같은 만큼)
const JOIN_SCALE = { 1: [1.0, 0], 2: [1.05, 0], 3: [1.1, 0], 4: [1.15, 1], 5: [1.2, 1], 6: [1.3, 1], 7: [1.35, 2], 8: [1.4, 2], 9: [1.45, 2], 10: [1.5, 3] };
function joinStageOf(id) {
  if (typeof CAST === 'undefined' || !CAST) return 1;
  if (CAST.hero === id) return 1;
  const i = (CAST.order || []).indexOf(id);
  return i < 0 ? 1 : i + 1;   // 첫 번째 동료는 스테이지 1, k번째 동료는 스테이지 k
}
function joinBonus(id) {
  const v = JOIN_SCALE[joinStageOf(id)] || [1, 0], c = CHARACTERS[id];
  return { hp: Math.round(c.hp * (v[0] - 1)), atk: v[1] };
}
// 👑 왕관을 쓴 친구인지, 왕관을 씌운 모습
function hasCrown(id) { return typeof PROG !== 'undefined' && PROG && (PROG.crowns || []).includes(id); }
function lookOf(id) { const l = CHARACTERS[id].look; return hasCrown(id) ? { ...l, crown: true } : l; }
function miniCanvas(id, size = 56) {
  const c = document.createElement('canvas'); c.width = size; c.height = size; c.className = 'upface';
  drawPortrait(c, { look: lookOf(id) });
  return c;
}

function drawUpgrade() {
  const ids = roster();
  const n = ids.length, left = leftToSpend();
  $('upInfo').innerHTML =
    `남은 강화 기회: <b class="pts">${PROG.points}번</b>` +
    ` &nbsp;·&nbsp; 🌟 초월 강화: <b class="tpts">${PROG.tpoints}번</b><br>` +
    `<span class="small">스테이지를 처음 깰 때마다 친구 수의 1/3(33%)만큼 강화 기회를 받아요. (지금 동료 ${n}명 → ${pointsFor(n)}번)<br>` +
    `스테이지 3·5·7·9를 처음 깨면 🌟 초월 강화 기회도 친구 수의 1/3만큼 받아요. 초월은 친구마다 무기 1번·스킬 2단계까지!<br>` +
    (lvPtsUsable() ? `<b style="color:#7cff8a">🔼 레벨업 강화 ${lvPtsUsable()}번</b> — 레벨이 오른 친구의 스킬을 강화할 수 있어요!<br>` : '') +
    `한 친구를 여러 번 강화해도 되고, 여러 친구를 골고루 강화해도 돼요!</span>`;
  const body = $('upBody'); body.innerHTML = '';

  if (!upView.id) {
    // 1단계: 강화할 친구 고르기
    const tip = document.createElement('div'); tip.className = 'uptip';
    tip.textContent = left > 0
      ? (upMust ? `👆 강화할 친구를 골라 주세요. 강화 기회 ${left}번을 모두 써야 다음으로 넘어갈 수 있어요!` : '👆 강화할 친구를 골라 주세요.')
      : '✨ 강화를 모두 마쳤어요! 친구들의 능력을 확인해 보세요.';
    body.appendChild(tip);
    const grid = document.createElement('div'); grid.className = 'upgrid';
    ids.forEach(id => {
      const st = statsFor(id), g = gearOf(id);
      const b = document.createElement('button'); b.className = 'btn upcard' + (st.trans ? ' trans' : '');
      b.appendChild(miniCanvas(id));
      const t = document.createElement('div'); t.className = 'uptext';
      const L = lvOf(id);
      t.innerHTML = `<b>${CHARACTERS[id].name}</b> <span class="small">Lv.${L.lv} · ${CHARACTERS[id].role}${g.count ? ` · 강화 ${g.count}번` : ''}${g.tcount ? ` · 🌟초월 ${g.tcount}번` : ''}</span>` +
        (L.pts > 0 ? ` <span class="lvbadge">🔼 레벨업 강화 ${L.pts}번</span>` : '') + '<br>' +
        `🗡 ${st.wName}<br>✨ ${st.skill.name}` + (st.skill2 ? `<br>${st.skill2.name}` : '') + '<br>' +
        `<span class="small">공격 ${st.atk} · 체력 ${st.hp} · 방어 ${st.def} · 이동 ${st.move}</span>`;
      b.appendChild(t);
      const firstTab = L.pts > 0 ? 'skill' : PROG.points <= 0 && transcendUsable() && transcendOptions(id).length ? 'trans' : 'weapon';
      b.onclick = () => { sfx('select'); upView = { id, tab: firstTab, pick: null }; $('upMsg').textContent = ''; drawUpgrade(); };
      grid.appendChild(b);
    });
    body.appendChild(grid);
    const back = $('upBack');
    if (upMust && left > 0) {
      back.textContent = `🔒 강화를 ${left}번 더 하면 넘어갈 수 있어요`;
      back.disabled = true; back.className = 'btn';
    } else if (upMust || typeof upReturn === 'function') {
      back.textContent = typeof upReturn === 'function' ? '✔ 강화 끝! 모험 시작 ▶' : '✔ 강화 끝! 계속하기 ▶';
      back.disabled = false; back.className = 'btn big gold glow';
    } else {
      back.textContent = upReturn === 'end' ? '← 결과 화면' : '← 메인 화면';
      back.disabled = false; back.className = 'btn';
    }
    return;
  }

  // 2단계: 무기 또는 스킬 바꾸기
  const id = upView.id, st = statsFor(id), L = lvOf(id);
  const head = document.createElement('div'); head.className = 'uphead';
  head.appendChild(miniCanvas(id, 72));
  const ht = document.createElement('div');
  ht.innerHTML = `<b class="big">${CHARACTERS[id].name}</b> <span class="small">Lv.${L.lv} (경험치 ${L.exp}/${expNeed(L.lv)}) · ${CHARACTERS[id].role}</span><br>` +
    `🗡 무기: ${st.wName} <span class="small">(공격 ${st.atk} · 체력 ${st.hp} · 방어 ${st.def} · 이동 ${st.move}칸)</span><br>` +
    `✨ 스킬: ${st.skill.name} <span class="small">(${skillDesc(st.skill)})</span>` +
    (st.skill2 ? `<br>🔮 히든 스킬: ${st.skill2.name} <span class="small">(${skillDesc(st.skill2)})</span>` : '');
  head.appendChild(ht);
  body.appendChild(head);

  const tabs = document.createElement('div'); tabs.className = 'uptabs three';
  [['weapon', `🗡 무기 바꾸기 (${PROG.points})`], ['skill', `✨ 스킬 바꾸기 (${PROG.points + L.pts})`], ['trans', `🌟 초월 강화 (${PROG.tpoints})`]].forEach(([k, label]) => {
    const t = document.createElement('button');
    t.className = 'btn' + (upView.tab === k ? ' gold' : '') + (k === 'trans' ? ' transtab' : '');
    t.textContent = label;
    t.onclick = () => { upView.tab = k; upView.pick = null; drawUpgrade(); };
    tabs.appendChild(t);
  });
  body.appendChild(tabs);

  const isT = upView.tab === 'trans', isS = upView.tab === 'skill';
  // 스킬 바꾸기는 이 친구의 레벨업 강화도 쓸 수 있어요
  const pool = isT ? PROG.tpoints : isS ? PROG.points + L.pts : PROG.points;
  if (isS && L.pts > 0) {
    const n = document.createElement('div'); n.className = 'uptip';
    n.innerHTML = `🔼 레벨업 강화 <b style="color:#7cff8a">${L.pts}번</b>이 있어요! (${CHARACTERS[id].name}의 스킬만 강화할 수 있어요)`;
    body.appendChild(n);
  }
  const opts = isT ? transcendOptions(id) : upView.tab === 'weapon' ? weaponOptions(id) : skillOptions(id);
  const list = document.createElement('div'); list.className = 'upopts';
  if (isT && PROG.tpoints <= 0) list.innerHTML = '<div class="uptip">🌟 초월 강화 기회가 없어요. 스테이지 3·5·7·9를 처음 깨면 받을 수 있어요!</div>';
  if (!opts.length) list.innerHTML += `<div class="uptip">${isT ? '이 친구는 초월 무기와 초월 스킬 2단계를 모두 받았어요! 🌟🌟' : '더 이상 바꿀 수 있는 것이 없어요!'}</div>`;
  opts.forEach((op, i) => {
    const b = document.createElement('button');
    b.className = 'btn upopt' + (isT ? ' transopt' : '') + (upView.pick === i ? ' picked' : '');
    b.innerHTML = `<span class="tag">${op.label}</span> <b>${op.name}</b><br>` + previewChange(id, op).join('<br>');
    b.disabled = pool <= 0;
    b.onclick = () => { sfx('select'); upView.pick = i; drawUpgrade(); };
    list.appendChild(b);
  });
  body.appendChild(list);

  const ok = document.createElement('button');
  ok.className = 'btn big gold upok';
  ok.textContent = pool <= 0 ? (isT ? '초월 강화 기회가 없어요' : '강화 기회가 없어요')
    : (upView.pick === null ? '위에서 하나를 골라 주세요' : (isT ? '🌟 초월 강화할래요!' : '✔ 이걸로 바꿀래요!'));
  ok.disabled = pool <= 0 || upView.pick === null;
  ok.onclick = () => {
    const op = opts[upView.pick]; if (!op || pool <= 0) return;
    const g = gearOf(id);
    op.apply(g); op.finish(g);
    if (isT) { g.tcount++; PROG.tpoints--; sfx('transcend'); }
    else if (isS && L.pts > 0) { g.count++; L.pts--; sfx('levelup'); }   // 레벨업 강화를 먼저 써요
    else { g.count++; PROG.points--; sfx('levelup'); }
    let m = `🎉 ${CHARACTERS[id].name}의 ${op.kind === 'weapon' || op.kind === 'tw' ? '무기가' : '스킬이'} "${op.name}"(으)로 바뀌었어요!`;
    if (isT) m = '🌟 초월! ' + m;
    if (PROG.slot !== null) m += saveToSlot(PROG.slot) ? ' 💾 자동 저장!' : '';
    $('upMsg').textContent = m;
    upView = { id: null, tab: 'weapon', pick: null };
    drawUpgrade();
  };
  body.appendChild(ok);
  $('upBack').textContent = '← 친구 고르기';
  $('upBack').disabled = false; $('upBack').className = 'btn';
}

function upBackClick() {
  if (upView.id) { upView = { id: null, tab: 'weapon', pick: null }; drawUpgrade(); }
  else closeUpgrade();
}
