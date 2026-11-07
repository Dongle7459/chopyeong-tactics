// =====================================================
//  초평 택틱스 - 게임 데이터 (캐릭터, 적, 스테이지, 대사)
//  새 스테이지를 만들 때는 STAGES에 내용을 더하면 돼요.
// =====================================================

// 전체 스테이지 이름 (스테이지 선택 화면에 보여요)
const STAGE_NAMES = [
  '', '초평초등학교 운동장', '학교 텃밭과 뒷산', '초평면 마을 거리', '농다리', '농다리 옆 초롱길',
  '초평호 물가', '초평호 하늘다리', '초평 들판', '두타산 숲', '초평호 위 흑진의 성'
];

// ⭐ 표시 스테이지 (이야기 문제가 조금 더 어려워요)
const STAR_STAGES = [4, 7, 10];

// =====================================================
//  직업(10)과 학생(10)
//  - 새로 시작할 때 주인공 이름(학생)과 직업을 골라요.
//  - 동료는 아래 CLASS_ORDER 순서대로(고른 직업만 빼고) 합류하고,
//    동료 이름은 남은 학생 중에서 무작위로 정해져요.
//  - 게임 안에서 캐릭터 id = 직업 id 예요. (예: CHARACTERS.warrior)
// =====================================================
const CLASS_ORDER = ['warrior', 'archer', 'healer', 'tank', 'stone', 'mage', 'water', 'scout', 'trick', 'knight'];

// 직업: 능력치, 스킬, 옷과 무기 모양
//  skill.type: attack(공격) / heal(치유) / guard(방패)
const CLASS_DATA = {
  warrior: { role: '전사', weapon: '연필 검', hp: 20, atk: 6, move: 4, rmin: 1, rmax: 1,
    skill: { name: '연필 베기', type: 'attack', rmin: 1, rmax: 1, power: 2, cd: 2 },
    look: { shirt: '#3a6ee8', pants: '#23419c', shoes: '#f4f4f4', weapon: 'pencil' },
    intro: '커다란 연필 검으로 가까이 있는 적을 힘껏 베어요.' },
  archer: { role: '궁수', weapon: '자 활', hp: 15, atk: 5, move: 3, rmin: 1, rmax: 3,
    skill: { name: '소수 화살', type: 'attack', rmin: 1, rmax: 4, power: 2, cd: 2 },
    look: { shirt: '#3fae4a', pants: '#5c3a1e', shoes: '#f4f4f4', weapon: 'bow' },
    intro: '30cm 자가 변한 활로 멀리 있는 적을 맞혀요.' },
  healer: { role: '회복', weapon: '물뿌리개', hp: 16, atk: 3, move: 3, rmin: 1, rmax: 1,
    skill: { name: '반짝 치유', type: 'heal', rmin: 0, rmax: 2, amount: 10, cd: 1 },
    look: { shirt: '#2fb0a0', pants: '#2a5a7a', shoes: '#f4f4f4', weapon: 'can' },
    intro: '물뿌리개로 다친 친구의 체력을 채워 줘요.' },
  tank: { role: '방패', weapon: '책가방 방패', hp: 28, atk: 4, move: 3, rmin: 1, rmax: 1, def: 2,
    skill: { name: '든든 방패', type: 'guard', rmin: 0, rmax: 0, grange: 1, cut: 0.5, cd: 2 },
    look: { shirt: '#e0a030', pants: '#3a3a5a', shoes: '#f4f4f4', weapon: 'shield' },
    intro: '책가방 방패로 옆에 있는 친구들을 지켜요. 아주 튼튼해요.' },
  stone: { role: '돌의 힘', weapon: '돌 장갑', hp: 22, atk: 5, move: 3, rmin: 1, rmax: 1, def: 1,
    skill: { name: '바위 쾅', type: 'attack', rmin: 1, rmax: 1, power: 2.5, cd: 2 },
    look: { shirt: '#8a9aa8', pants: '#4a5a6a', shoes: '#f4f4f4', weapon: 'gloves' },
    intro: '돌처럼 단단한 주먹으로 아주 세게 내리쳐요.' },
  mage: { role: '마법사', weapon: '공책 지팡이', hp: 14, atk: 4, move: 3, rmin: 1, rmax: 2,
    skill: { name: '소수 번개', type: 'attack', rmin: 1, rmax: 4, power: 2, cd: 2, wide: true },
    look: { shirt: '#6a4ad0', pants: '#2a2a4a', shoes: '#f4f4f4', weapon: 'staff' },
    intro: '공책 지팡이로 번개를 쏴서 모여 있는 적을 한꺼번에 공격해요.' },
  water: { role: '물 마법', weapon: '물방울 지팡이', hp: 16, atk: 4, move: 3, rmin: 1, rmax: 2,
    skill: { name: '물결 파도', type: 'attack', rmin: 1, rmax: 3, power: 1.5, cd: 2, healAround: 5 },
    look: { shirt: '#3a8ad0', pants: '#1a3a5a', shoes: '#f4f4f4', weapon: 'wand' },
    intro: '물결로 적을 공격하면서 옆 친구들의 체력도 채워 줘요.' },
  scout: { role: '정찰병', weapon: '바람 운동화', hp: 17, atk: 5, move: 6, rmin: 1, rmax: 1,
    skill: { name: '바람 돌진', type: 'attack', rmin: 1, rmax: 2, power: 2, cd: 2, ignoreDef: true },
    look: { shirt: '#ff8a3a', pants: '#3a3a5a', shoes: '#5cc04a' },
    intro: '한 번에 6칸이나 달려요. 돌진은 적의 방어를 무시해요.' },
  trick: { role: '재간둥이', weapon: '무지개 팽이', hp: 18, atk: 4, move: 4, rmin: 1, rmax: 2,
    skill: { name: '헷갈리기 팽이', type: 'attack', rmin: 1, rmax: 3, power: 1, cd: 2, stun: true },
    look: { shirt: '#a0d040', pants: '#4a3a2a', shoes: '#f4f4f4', weapon: 'top' },
    intro: '팽이를 맞은 적은 어질어질해서 한 턴 동안 못 움직여요.' },
  knight: { role: '수호 기사', weapon: '빛의 창', hp: 26, atk: 6, move: 3, rmin: 1, rmax: 1, def: 2,
    skill: { name: '빛의 창 찌르기', type: 'attack', rmin: 1, rmax: 2, power: 2.5, cd: 2 },
    look: { shirt: '#d8dce8', pants: '#3a5aa0', shoes: '#f2c84b', weapon: 'spear' },
    intro: '튼튼한 기사예요. 빛의 창으로 2칸 떨어진 적도 세게 찔러요.' }
};

// 학생: 이름, 머리 모양 (목소리는 game.js의 VOICE_CAST에서 이름별로 달라요)
const STUDENT_ORDER = ['tori', 'dodam', 'boreum', 'byeolbit', 'duri', 'mulgyeol', 'hanui', 'noeul', 'geuneul', 'nunkkot'];
const STUDENTS = {
  tori: { name: '토리', look: { hair: '#2a2030', hairStyle: 'short' } },
  dodam:   { name: '도담', look: { hair: '#7a4a26', hairStyle: 'spiky' } },
  boreum:   { name: '보름', look: { hair: '#4a2a1a', hairStyle: 'short' } },
  byeolbit:    { name: '별빛',   look: { hair: '#1a1a2a', hairStyle: 'short' } },
  duri:     { name: '두리', look: { hair: '#5a3a2a', hairStyle: 'spiky' } },
  mulgyeol:  { name: '물결', look: { hair: '#2a3a6a', hairStyle: 'short', glasses: true } },
  hanui:      { name: '하늬', look: { hair: '#1a3a6a', hairStyle: 'spiky' } },
  noeul:    { name: '노을', look: { hair: '#3a2010', hairStyle: 'ponytail', band: '#ff4a6a', ribbon: '#ff4a6a' } },
  geuneul:   { name: '그늘', look: { hair: '#6a4a2a', hairStyle: 'spiky' } },
  nunkkot:    { name: '눈꽃', look: { hair: '#2a1a10', hairStyle: 'long', ribbon: '#ffd84a' } }
};
// 예전 저장 파일(학생 id로 저장됨) → 직업 id
const OLD2CLASS = { tori: 'warrior', dodam: 'archer', boreum: 'healer', byeolbit: 'tank', duri: 'stone',
  mulgyeol: 'mage', hanui: 'water', noeul: 'scout', geuneul: 'trick', nunkkot: 'knight' };

// 이름 받침 확인 → "도담이·도담아" / "토리·토리야"
function hasBatchim(word) {
  const c = word.charCodeAt(word.length - 1);
  return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0;
}

// 배역(cast): 주인공 직업·이름, 동료 순서와 이름
//  { hero: 'archer', names: { archer: 'nunkkot', warrior: 'dodam', ... }, order: ['warrior', 'healer', ...] }
function makeCast(heroStudent, heroClass, shuffle = true) {
  const order = CLASS_ORDER.filter(c => c !== heroClass);
  const others = STUDENT_ORDER.filter(s => s !== heroStudent);
  if (shuffle) for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
  const names = { [heroClass]: heroStudent };
  order.forEach((c, i) => { names[c] = others[i]; });
  return { hero: heroClass, names, order };
}
// 예전과 똑같은 배역 (토리=전사가 주인공, 도담=궁수 ...)
function defaultCast() {
  const names = {};
  CLASS_ORDER.forEach((c, i) => { names[c] = STUDENT_ORDER[i]; });
  return { hero: 'warrior', names, order: CLASS_ORDER.slice(1) };
}

// 캐릭터 = 직업 + 학생 (배역이 바뀔 때마다 다시 만들어요)
const CHARACTERS = {};
let CAST = null;
function applyCast(cast) {
  CAST = cast;
  CLASS_ORDER.forEach(c => {
    const d = CLASS_DATA[c], st = STUDENTS[cast.names[c]];
    CHARACTERS[c] = { ...d, cls: c, student: cast.names[c], name: st.name, look: { ...d.look, ...st.look } };
  });
}
// 자리 → 직업 id ('hero' 주인공, 'j1'~'j9' 합류 순서대로의 동료)
function roleClass(role) {
  if (!CAST) return role;
  if (role === 'hero') return CAST.hero;
  const m = /^j(\d)$/.exec(role);
  if (m) return CAST.order[Number(m[1]) - 1];
  return role;   // 이미 직업 id
}
applyCast(defaultCast());

// 최종 보스
CHARACTERS.heukjin = {
  name: '대마왕 흑진', role: '최종 보스',
  look: { hair: '#3a2a1a', shirt: '#5a2e8f', pants: '#2a1a40', shoes: '#1a1020', hairStyle: 'short',
          cape: '#a01f3a', crown: true, glasses: true, mustache: true }
};

// 👑 중간보스 (스테이지 5 다음)

// 직업별 합류 장면 ('@' = 지금 합류하는 친구)
const JOIN_LINES = {
  warrior: [
    { who: 'narr', text: '{친근:@}의 연필이 반짝반짝 빛나더니 커다란 검으로 변했어요!', sfx: 'correct' },
    { who: '@', text: '연필이... 커다란 검이 됐어! 이걸로 친구들을 지킬게!' },
    { who: 'narr', text: '【{이름:@} · 전사】 커다란 연필 검으로 가까이 있는 적을 공격해요. [연필 베기]는 공격력 2배!' }
  ],
  archer: [
    { who: 'narr', text: '{친근:@}의 30cm 자가 반짝 빛나더니 활로 변했어요!', sfx: 'correct' },
    { who: '@', text: '내 자가 활이 됐어! 멀리 있는 적도 맞힐 수 있어!' },
    { who: 'narr', text: '【{이름:@} · 궁수】 3칸 떨어진 적까지 화살을 쏠 수 있어요. [소수 화살]은 4칸까지 닿아요!' }
  ],
  healer: [
    { who: 'narr', text: '{친근:@}의 물뿌리개가 초록빛으로 반짝 빛났어요!', sfx: 'correct' },
    { who: '@', text: '물을 뿌리니까... 다친 친구가 낫는 힘이 생겼어!' },
    { who: 'narr', text: '【{이름:@} · 회복】 [💚 치유]로 친구의 체력을 10 채워 줘요. 스킬을 누르고 초록색으로 빛나는 친구를 골라요.' }
  ],
  tank: [
    { who: 'narr', text: '{친근:@}의 책가방이 반짝! 커다란 방패로 변했어요!', sfx: 'correct' },
    { who: '@', text: '친구들을 지키는 건 내가 할 일이지! 다들 내 뒤로 와!' },
    { who: 'narr', text: '【{이름:@} · 방패】 [🛡 방패]를 쓰면, 적의 다음 차례 동안 방패 바로 옆 친구들이 받는 피해가 반으로 줄어요.' }
  ],
  stone: [
    { who: 'narr', text: '{친근:@}의 두 손에 돌처럼 단단한 힘이 들어왔어요!', sfx: 'correct' },
    { who: '@', text: '손이 돌처럼 단단해졌어! 이 돌 장갑이면 무엇이든 부술 수 있어!' },
    { who: 'narr', text: '【{이름:@} · 돌의 힘】 튼튼해서 피해를 1 덜 받아요. [바위 쾅]은 공격력 2.5배!' }
  ],
  mage: [
    { who: 'narr', text: '{친근:@}가 공책을 펼치자, 공책에 쓴 소수 계산식이 빛나기 시작했어요!', sfx: 'correct' },
    { who: '@', text: '내 공책 지팡이로 소수 번개를 쏠 수 있어!' },
    { who: 'narr', text: '【{이름:@} · 마법사】 [소수 번개]는 4칸 떨어진 적까지 닿고, 맞은 적 바로 옆의 적에게도 피해를 줘요!' }
  ],
  water: [
    { who: 'narr', text: '{친근:@}가 두 손을 모으자, 맑은 물이 모여 반짝이는 지팡이가 되었어요!', sfx: 'correct' },
    { who: '@', text: '물의 힘이야! 공격도 하고, 친구들을 시원하게 치료해 줄 수도 있어!' },
    { who: 'narr', text: '【{이름:@} · 물 마법】 [물결 파도]는 3칸 떨어진 적을 공격하고, 바로 옆 친구들의 체력도 5 채워 줘요.' }
  ],
  scout: [
    { who: 'narr', text: '{친근:@}의 운동화에 바람이 휘감기더니, 반짝이는 작은 날개가 돋아났어요!', sfx: 'correct' },
    { who: '@', text: '바람의 운동화야! 이제 누구보다 멀리 달릴 수 있어!' },
    { who: 'narr', text: '【{이름:@} · 정찰병】 한 번에 6칸이나 달릴 수 있어요. [바람 돌진]은 적의 방어를 무시해요!' }
  ],
  trick: [
    { who: 'narr', text: '{친근:@}가 주머니에서 팽이를 꺼내 휙 돌리자, 팽이가 무지갯빛으로 빛났어요!', sfx: 'correct' },
    { who: '@', text: '헷갈리기 팽이! 이걸 맞으면 어질어질해서 한 턴 동안 못 움직여!' },
    { who: 'narr', text: '【{이름:@} · 재간둥이】 [헷갈리기 팽이]를 맞은 적은 다음 적 차례에 움직이지 못해요!' }
  ],
  knight: [
    { who: 'narr', text: '하늘에서 빛줄기가 내려와 {친근:@}의 손에 빛나는 창이 생겼어요!', sfx: 'correct' },
    { who: '@', text: '빛의 창이야! 나는 친구들을 지키는 기사가 될 거야!' },
    { who: 'narr', text: '【{이름:@} · 수호 기사】 아주 튼튼하고, [빛의 창 찌르기]는 2칸 떨어진 적에게 아주 센 공격을 해요!' }
  ]
};

// 적
const ENEMIES = {
  slime: { name: '숫자 슬라임', hp: 12, atk: 3, move: 3, rmin: 1, rmax: 1, aggro: 7 },
  mole:  { name: '숫자 두더지', hp: 10, atk: 4, move: 3, rmin: 1, rmax: 1, aggro: 6 },
  king:  { name: '왕슬라임',   hp: 16, atk: 5, move: 2, rmin: 1, rmax: 1, aggro: 4 },
  crow:  { name: '숫자 까마귀', hp: 8,  atk: 3, move: 5, rmin: 1, rmax: 1, aggro: 8 },
  calc:  { name: '계산기 골렘', hp: 20, atk: 5, move: 2, rmin: 1, rmax: 2, aggro: 4 },
  crab:  { name: '돌 게',       hp: 12, atk: 4, move: 3, rmin: 1, rmax: 1, aggro: 7, def: 1 },
  turtle:{ name: '거북 대장',   hp: 24, atk: 5, move: 2, rmin: 1, rmax: 1, aggro: 4, def: 1 },
  wisp:  { name: '도깨비불',    hp: 9,  atk: 4, move: 4, rmin: 1, rmax: 2, aggro: 7 },
  goblin:{ name: '초롱 도깨비', hp: 26, atk: 6, move: 3, rmin: 1, rmax: 1, aggro: 4 },
  // fly: true → 물 위로도 날거나 헤엄쳐서 다녀요
  fish:  { name: '붕어 병사',   hp: 10, atk: 4, move: 3, rmin: 1, rmax: 1, aggro: 7 },
  eel:   { name: '뱀장어',      hp: 12, atk: 4, move: 4, rmin: 1, rmax: 1, aggro: 7, fly: true },
  catfish:{ name: '큰 메기 장군', hp: 28, atk: 6, move: 2, rmin: 1, rmax: 1, aggro: 5, def: 1, fly: true },
  bat:   { name: '바람 박쥐',   hp: 9,  atk: 4, move: 5, rmin: 1, rmax: 1, aggro: 8, fly: true },
  eagle: { name: '번개 독수리', hp: 30, atk: 6, move: 3, rmin: 1, rmax: 2, aggro: 5, fly: true },
  scarecrow:{ name: '허수아비 병정', hp: 12, atk: 4, move: 2, rmin: 1, rmax: 1, aggro: 6, def: 1 },
  hopper:{ name: '점프 메뚜기', hp: 8,  atk: 3, move: 5, rmin: 1, rmax: 1, aggro: 8 },
  goldscare:{ name: '황금 허수아비 왕', hp: 30, atk: 6, move: 2, rmin: 1, rmax: 2, aggro: 5, def: 1 },
  fox:   { name: '꾀돌이 여우', hp: 12, atk: 5, move: 4, rmin: 1, rmax: 1, aggro: 7 },
  mushroom:{ name: '포자 버섯', hp: 10, atk: 4, move: 2, rmin: 1, rmax: 2, aggro: 6 },
  wolf:  { name: '그림자 늑대', hp: 34, atk: 7, move: 4, rmin: 1, rmax: 1, aggro: 5, def: 1 },
  heukjin:{ name: '대마왕 흑진', hp: 50, atk: 7, move: 2, rmin: 1, rmax: 2, aggro: 6, def: 1 }
};

// 지도 기호
//  지나갈 수 없음: R 지붕  W 학교 벽  D 현관문  T 나무  G 축구 골대  H 철봉  F 울타리  C 텃밭 작물  M 바위
//                 h 집 지붕  n 집 벽  S 가게 좌판  L 가로등  ~ 물  l 초롱  P 정자 지붕  Q 정자 기둥
//  지나갈 수 있음: . 풀밭  _ 흙 운동장  = 트랙  s 모래  f 꽃밭  , 흙길
//                 - 찻길  z 횡단보도  k 인도  b 농다리 돌  r 갈대  d 나무 데크
//                 e 물 위 다리  p 논  c 성 바닥  a 붉은 양탄자
//  지나갈 수 없음(추가): O 다리 기둥  Y 볏짚  N 소나무  K 성벽  I 성 기둥  J 왕좌
//  ※ 동료가 늘어날수록 지도가 조금씩 커져요:
//     14×10 → 15×11 → 16×11 → 17×12 → 18×12 → 19×12 → 19×13 → 20×13 → 20×14 → 21×14
const STAGES = {
  // ---------------------------------------------------------- 스테이지 1
  1: {
    title: '스테이지 1',
    name: STAGE_NAMES[1],
    map: [
      'RRRRRRRRRRRRRR',
      'WWWWWDDWWWWWWW',
      'T..f......f..T',
      '..==========..',
      'G.=________=.G',
      '..=________=..',
      'T.=________=.T',
      '..==========..',
      'Hs..ff..ff..sH',
      'Hss.T....T.ssH'
    ],
    heroes: [
      { id: 'hero', x: 5, y: 2 },
      { id: 'j1',   x: 6, y: 2 }
    ],
    enemies: [
      { type: 'slime', x: 5,  y: 5, color: '#8a4fd0' },
      { type: 'slime', x: 9,  y: 4, color: '#d0508a' },
      { type: 'slime', x: 2,  y: 8, color: '#4f8ad0' },
      { type: 'slime', x: 11, y: 8, color: '#e08a2f' }
    ],
    intro: [
      { who: 'narr', text: '어느 맑은 가을 아침, 초평초등학교 운동장.' },
      { who: 'hero', text: '{부름:j1}! 오늘 체육 시간에 50m 달리기 기록을 잰대!' },
      { who: 'j1', text: '좋아! 지난번 내 기록은 9.5초였어. 이번엔 꼭 너를 이길 거야!' },
      { who: 'narr', text: '그때, 하늘이 갑자기 보라색으로 변하더니... 쿠구궁!', shake: true, sfx: 'hit' },
      { who: 'j1', text: '어? 기록판이 이상해! 내 기록이 9.5초가 아니라 95초래!' },
      { who: 'hero', text: '네 기록만이 아니야! 학교 시계 숫자도 뒤죽박죽이야!' },
      { who: 'heukjin', text: '으하하하! 초평면의 소수점은 이제 모두 내 것이다!', ghost: 'show', shake: true },
      { who: 'heukjin', text: '나는 대마왕 흑진! 소수점이 사라지면 9.5는 95가 되지. 세상이 엉망진창이 될 거다!' },
      { who: 'hero', text: '소수점을 돌려줘!' },
      { who: 'heukjin', text: '돌려받고 싶으면 내 부하, 숫자 슬라임들을 이겨 보시지! 으하하하!' },
      { who: 'narr', text: '흑진은 보라색 연기와 함께 사라졌어요.', ghost: 'hide' },
      { who: 'narr', text: '그때, 두 친구의 손에 있던 물건이 반짝반짝 빛나기 시작했어요!', sfx: 'correct' },
      { join: 'hero' },
      { join: 'j1' },
      { who: 'j1', text: '소수 문제를 맞히면 힘이 생기나 봐!' },
      { who: 'hero', text: '좋아! 슬라임을 물리치고 소수점을 되찾자!' },
      { who: 'narr', text: '【게임 방법 1】 내 캐릭터를 누르면 갈 수 있는 칸이 파랗게 빛나요. 파란 칸을 누르면 움직여요.' },
      { who: 'narr', text: '【게임 방법 2】 적이 가까이 있으면 [공격]을 누르고 적을 골라요. 문제를 맞히면 공격 성공!' },
      { who: 'narr', text: '【게임 방법 3】 [스킬]은 아주 센 기술이에요. 문제가 조금 더 어렵고, 쓰고 나면 몇 턴 쉬어요.' },
      { who: 'narr', text: '【게임 방법 4】 두 친구가 모두 움직이면 적의 차례가 돼요. 그럼 시작해 볼까요?' }
    ],
    mid: {
      after: 2,
      before: [
        { who: 'heukjin', text: '뭐야? 내 슬라임을 벌써 2마리나 이겼다고?', ghost: 'show', shake: true },
        { who: 'heukjin', text: '그럼 이 문제도 풀 수 있을까? 으하하!' }
      ],
      question: {
        story: '숫자 슬라임 2마리의 무게는 각각 0.7kg, 0.6kg이에요. 두 슬라임의 무게를 더하면 모두 몇 kg일까요?',
        a: 70, op: '+', b: 60, unit: 'kg',
        hint: '0.7은 0.1이 7개, 0.6은 0.1이 6개예요. 0.1이 모두 몇 개인지 세어 봐요. 0.1이 10개 모이면 1이에요!'
      },
      after2: [
        { who: 'heukjin', text: '으윽! 정답이잖아?! 두고 보자!', ghost: 'hide' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
    },
    ending: {
      before: [
        { who: 'narr', text: '마지막 슬라임이 사라지자, 반짝이는 작은 점 하나가 하늘에서 내려왔어요.', sfx: 'correct' },
        { who: 'j1', text: '이게... 사라진 소수점이야!' },
        { who: 'hero', text: '기록판에 소수점을 다시 붙여 주자! 95초는 9.5초, 87초는 8.7초!' },
        { who: 'j1', text: '잠깐! 그럼 우리 둘 기록은 몇 초 차이 나는 거지?' }
      ],
      question: {
        story: '{친근:j1}의 달리기 기록은 9.5초, {친근:hero}의 기록은 8.7초예요. 두 사람의 기록은 몇 초 차이일까요?',
        a: 950, op: '-', b: 870, unit: '초',
        hint: '소수 첫째 자리에서 5에서 7을 뺄 수 없어요. 일의 자리에서 1을 빌려 오면 0.1이 10개 더 생겨요! (15 − 7)'
      },
      after2: [
        { who: 'narr', text: '기록판의 숫자가 반짝이며 원래대로 돌아왔어요!', sfx: 'win' },
        { who: 'hero', text: '와! 내가 0.8초 더 빨랐네!' },
        { who: 'j1', text: '칫, 다음엔 꼭 내가 이길 거야!' },
        { who: 'heukjin', text: '흥! 소수점 하나 찾았다고 좋아하지 마라! 다음은 학교 텃밭이다! 으하하!', ghost: 'show' },
        { who: 'hero', text: '텃밭이라고? 거기엔 {친근:j2}가 있을 텐데...!', ghost: 'hide' },
        { who: 'j1', text: '{친근:j2}가 위험해! 얼른 가 보자!' }
      ]
    }
  },

  // ---------------------------------------------------------- 스테이지 2
  2: {
    title: '스테이지 2',
    name: STAGE_NAMES[2],
    map: [
      'TTMMTTTTTTTMMTT',
      'T.....,,,.....T',
      '..T...,.,...T..',
      '.FFFF.,.,.FFFF.',
      '.CCCC.,.,.CCCC.',
      '.CCCC.,.,.CCCC.',
      '.FFFF.,.,.FFFF.',
      '......,,,......',
      '.f...........f.',
      'T....,,,,,....T',
      'TT.f..,,,..f.TT'
    ],
    heroes: [
      { id: 'hero', x: 7, y: 9 },
      { id: 'j1',   x: 6, y: 10 },
      { id: 'j2',   x: 8, y: 10 }
    ],
    enemies: [
      { type: 'slime', x: 2,  y: 7, color: '#3fae8a' },
      { type: 'slime', x: 12, y: 7, color: '#d0508a' },
      { type: 'mole',  x: 0,  y: 4 },
      { type: 'mole',  x: 14, y: 5 },
      { type: 'king',  x: 7,  y: 1, color: '#4fc04a' }
    ],
    intro: [
      { who: 'narr', text: '{친근:hero}와 {친근:j1}는 숨을 헉헉 쉬며 학교 텃밭에 도착했어요.' },
      { who: 'j1', text: '저기 봐! 텃밭에 슬라임이 잔뜩이야!' },
      { who: 'j2', text: '얘들아, 도와줘! 슬라임들이 우리 반 고구마를 다 먹으려고 해!' },
      { who: 'hero', text: '{부름:j2}! 괜찮아?' },
      { who: 'j2', text: '응... 그런데 이상해. 고구마 무게표가 2.4kg에서 24kg으로 바뀌었어!' },
      { who: 'heukjin', text: '으하하! 텃밭의 소수점도 내가 가져갔다! 내 부하 왕슬라임이 뒷산 앞을 지키고 있지!', ghost: 'show', shake: true },
      { who: 'heukjin', text: '게다가 땅속에는 숫자 두더지들도 숨어 있다고! 으하하하!' },
      { who: 'narr', text: '흑진은 또다시 보라색 연기와 함께 사라졌어요.', ghost: 'hide' },
      { who: 'j2', text: '나도 같이 싸울래! 우리 반 고구마는 내가 지킬 거야!' },
      { join: 'j2' },
      { who: 'narr', text: '✨ {친근:j2}가 동료가 되었어요! ✨', sfx: 'win' },
      { who: 'narr', text: '【적 정보】 숫자 두더지는 슬라임보다 조금 더 세요. 왕슬라임은 뒷산 앞을 지키고 있어요.' },
      { who: 'narr', text: '【작전 팁】 튼튼한 친구가 앞에서 막고, 약한 친구는 뒤에서 도와주면 좋아요!' }
    ],
    mid: {
      after: 2,
      before: [
        { who: 'heukjin', text: '뭐라고? 이번에도 2마리나 물리쳤다고?', ghost: 'show', shake: true },
        { who: 'heukjin', text: '그럼 고구마 문제다! 소수점이 없으면 못 풀걸? 으하하!' }
      ],
      question: {
        story: '{친근:j2}네 반은 고구마를 2.4kg 캤고, 옆 반은 1.8kg 캤어요. 두 반이 캔 고구마는 모두 몇 kg일까요?',
        a: 240, op: '+', b: 180, unit: 'kg',
        hint: '소수 첫째 자리 4 + 8 = 12예요. 0.1이 12개면 1.2니까, 일의 자리로 1을 올려 줘요!'
      },
      after2: [
        { who: 'heukjin', text: '으아악! 또 맞혔잖아! 왕슬라임, 정신 차려!', ghost: 'hide' },
        { who: 'j2', text: '고구마 무게가 원래대로 돌아오기 시작했어!' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
    },
    ending: {
      before: [
        { who: 'narr', text: '왕슬라임이 "퐁!" 하고 터지더니, 반짝이는 소수점이 하나 튀어나왔어요.', sfx: 'correct' },
        { who: 'j2', text: '고구마 무게표가 다시 2.4kg이 됐어! 고마워, 얘들아!' },
        { who: 'hero', text: '이제 소수점 두 개를 되찾았어!' },
        { who: 'j1', text: '쉿! 마을 쪽에서 큰 소리가 들려!', shake: true, sfx: 'hit' },
        { who: 'j2', text: '학교에서 마을까지는 2.3km야. 우리는 벌써 0.8km를 왔으니까...' }
      ],
      question: {
        story: '학교에서 초평면 마을까지는 2.3km예요. 지금까지 0.8km를 걸어왔어요. 마을까지 몇 km를 더 가야 할까요?',
        a: 230, op: '-', b: 80, unit: 'km',
        hint: '소수 첫째 자리에서 3에서 8을 뺄 수 없어요. 일의 자리에서 1을 빌려 오면 13 − 8을 할 수 있어요!'
      },
      after2: [
        { who: 'hero', text: '1.5km만 더 가면 돼! 서두르자!', sfx: 'win' },
        { who: 'j2', text: '마을에는 {친근:j3}가 살잖아. {친근:j3}도 위험할지 몰라!' },
        { who: 'heukjin', text: '으하하! 다음은 초평면 마을 거리다! 가게 가격표의 소수점을 몽땅 가져가 주지!', ghost: 'show' },
        { who: 'j1', text: '그렇게 둘 순 없어! 가자, 얘들아!', ghost: 'hide' }
      ]
    },
    tip: '💡 팁: 체력이 줄어든 친구는 [💚 치유]를 가진 친구가 채워 줄 수 있어요!'
  },

  // ---------------------------------------------------------- 스테이지 3
  3: {
    title: '스테이지 3',
    name: STAGE_NAMES[3],
    map: [
      'hhhhh.hhhhhh.hhh',
      'nnnnn.nnnnnn.nnn',
      'kkkkkkkkkkkkkkkk',
      '-------zz-------',
      '-------zz-------',
      'kkLkkkkkkkkkLkkk',
      '..S..T....T..S..',
      '................',
      'hhh..f....f..hhh',
      'nnn..........nnn',
      'T....kkkkkk....T'
    ],
    heroes: [
      { id: 'hero', x: 7, y: 9 },
      { id: 'j3',    x: 8, y: 9 },
      { id: 'j1',   x: 6, y: 10 },
      { id: 'j2',   x: 9, y: 10 }
    ],
    enemies: [
      { type: 'crow',  x: 3,  y: 3 },
      { type: 'crow',  x: 12, y: 4 },
      { type: 'crow',  x: 14, y: 7 },
      { type: 'slime', x: 1,  y: 7, color: '#e08a2f' },
      { type: 'calc',  x: 8,  y: 2 }
    ],
    intro: [
      { who: 'narr', text: '친구들은 숨을 고르며 초평면 마을 거리에 도착했어요.' },
      { who: 'j1', text: '마을이 왜 이렇게 시끄럽지?' },
      { who: 'narr', text: '까악! 까악! 까마귀들이 가게 가격표에서 소수점을 콕콕 쪼아 먹고 있었어요!', shake: true, sfx: 'hit' },
      { who: 'j2', text: '빵집 우유가 1.8L가 아니라 18L래! 이렇게 큰 우유는 아무도 못 마셔!' },
      { who: 'j3', text: '이 녀석들! 할머니 가게에서 떨어져!' },
      { who: 'hero', text: '{부름:j3}!' },
      { who: 'j3', text: '{친근:hero}구나! 마침 잘 왔어. 혼자서는 까마귀들을 다 막을 수가 없었어.' },
      { who: 'heukjin', text: '으하하! 마을의 소수점은 내 까마귀들이 다 가져간다!', ghost: 'show', shake: true },
      { who: 'heukjin', text: '그리고 저기, 고장 난 계산기 골렘이 길을 지키고 있지! 으하하하!' },
      { who: 'narr', text: '흑진은 또 보라색 연기와 함께 사라졌어요.', ghost: 'hide' },
      { who: 'j3', text: '나도 같이 싸울게! 할머니 가게는 내가 지킬 거야!' },
      { join: 'j3' },
      { who: 'narr', text: '✨ {친근:j3}가 동료가 되었어요! ✨', sfx: 'win' },
      { who: 'narr', text: '【적 정보】 숫자 까마귀는 아주 빠르게 날아와요. 계산기 골렘은 2칸 떨어진 곳에서도 숫자를 던져요!' },
      { who: 'narr', text: '【작전 팁】 친구들이 서로 붙어 다니면 까마귀에게 둘러싸이지 않아요!' }
    ],
    mid: {
      after: 2,
      before: [
        { who: 'heukjin', text: '내 까마귀들을 벌써 2마리나?!', ghost: 'show', shake: true },
        { who: 'heukjin', text: '그럼 빵집 문제다! 소수점 없이 풀어 보시지!' }
      ],
      question: {
        story: '빵집에서 우유 1.8L와 주스 1.5L를 샀어요. 산 음료는 모두 몇 L일까요?',
        a: 180, op: '+', b: 150, unit: 'L',
        hint: '소수 첫째 자리 8 + 5 = 13이에요. 0.1이 13개면 1.3이니까, 일의 자리로 1을 올려 줘요!'
      },
      after2: [
        { who: 'heukjin', text: '끄응... 계산기 골렘, 힘을 내라!', ghost: 'hide' },
        { who: 'j3', text: '빵집 가격표가 원래대로 돌아왔어!' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
    },
    ending: {
      before: [
        { who: 'narr', text: '계산기 골렘의 화면에 "0.0"이 뜨더니 털썩 주저앉았어요.', sfx: 'hit' },
        { who: 'narr', text: '골렘의 화면 속에서 반짝이는 소수점이 하나 튀어나왔어요!', sfx: 'correct' },
        { who: 'j3', text: '마을 가격표가 모두 제자리로 돌아왔어! 고마워, 얘들아.' },
        { who: 'j2', text: '이제 소수점을 세 개나 되찾았어!' },
        { who: 'j3', text: '그런데 할머니 선물을 포장할 끈이 얼마나 남았더라...?' }
      ],
      question: {
        story: '{친근:j3}는 끈 2.5m를 가지고 있었어요. 방패 손잡이를 만드느라 0.7m를 썼어요. 남은 끈은 몇 m일까요?',
        a: 250, op: '-', b: 70, unit: 'm',
        hint: '소수 첫째 자리에서 5에서 7을 뺄 수 없어요. 일의 자리에서 1을 빌려 오면 15 − 7을 할 수 있어요!'
      },
      after2: [
        { who: 'j3', text: '1.8m 남았네. 선물 포장은 충분하겠다!', sfx: 'win' },
        { who: 'narr', text: '그때, 강 쪽에서 쿵! 쿵! 커다란 소리가 들려왔어요.', shake: true, sfx: 'hit' },
        { who: 'heukjin', text: '다음은 농다리다! 천 년 된 돌다리를 덜컹덜컹 흔들어 주지! 으하하!', ghost: 'show' },
        { who: 'hero', text: '농다리라고? 거기엔 {친근:j4}가 할아버지랑 산책 간다고 했는데!', ghost: 'hide' },
        { who: 'j3', text: '서두르자, 얘들아! 내가 앞장설게!' }
      ]
    },
    tip: '💡 팁: [🛡 방패]를 가진 친구 옆에 붙어 있으면 피해가 줄어요!'
  },

  // ---------------------------------------------------------- 스테이지 4 ⭐
  4: {
    title: '스테이지 4 ⭐',
    name: STAGE_NAMES[4],
    map: [
      'TTT.M.......M.TTT',
      'T...,,,,,,,,,...T',
      '.r....,...,....r.',
      'ssssssssbssssssss',
      '~~b~~~~~b~~~~~b~~',
      '~~b~~~~~b~~~~~b~~',
      '~~b~~~~~b~~~~~b~~',
      'ssssssssbssssssss',
      '.r.....,,,.....r.',
      '..T....,,,....T..',
      '.f.....,,,.....f.',
      'TTT....,,,....TTT'
    ],
    heroes: [
      { id: 'hero', x: 8,  y: 9 },
      { id: 'j3',    x: 7,  y: 9 },
      { id: 'j1',   x: 7,  y: 10 },
      { id: 'j2',   x: 9,  y: 10 },
      { id: 'j4',     x: 9,  y: 9 }
    ],
    enemies: [
      { type: 'crab',   x: 4,  y: 3 },
      { type: 'crab',   x: 12, y: 3 },
      { type: 'slime',  x: 2,  y: 1, color: '#4f8ad0' },
      { type: 'slime',  x: 14, y: 1, color: '#8a4fd0' },
      { type: 'turtle', x: 8,  y: 1 }
    ],
    intro: [
      { who: 'narr', text: '미호천 위에 놓인 오래된 돌다리, 농다리.' },
      { who: 'narr', text: '농다리는 아주 먼 옛날, 돌을 하나하나 쌓아서 만든 천 년도 더 된 다리예요.' },
      { who: 'j4', text: '할아버지! 다리가 흔들려요!' },
      { who: 'narr', text: '덜컹! 덜컹! 집게발을 든 돌 게들이 다리를 마구 흔들고 있었어요!', shake: true, sfx: 'hit' },
      { who: 'j4', text: '안 돼! 농다리는 우리 고장의 소중한 문화유산이야!' },
      { who: 'heukjin', text: '으하하! 농다리 돌의 무게표에서도 소수점을 빼 버렸다!', ghost: 'show', shake: true },
      { who: 'heukjin', text: '거북 대장! 다리 건너편을 단단히 막아라!' },
      { who: 'hero', text: '{부름:j4}! 우리가 도와줄게!', ghost: 'hide' },
      { who: 'narr', text: '{친근:j4}가 농다리의 돌을 두 손으로 꼭 잡자, 천 년 된 돌다리의 힘이 전해졌어요!' },
      { join: 'j4' },
      { who: 'narr', text: '✨ {친근:j4}가 동료가 되었어요! ✨', sfx: 'win' },
      { who: 'narr', text: '【⭐ 중요한 스테이지】 이번 이야기 문제는 조금 더 어려워요. 자릿수가 다른 소수가 나와요. 소수점끼리 줄을 맞추는 것, 잊지 마세요!' },
      { who: 'narr', text: '【적 정보】 돌 게와 거북 대장은 껍데기가 단단해서 피해를 1 덜 받아요.' },
      { who: 'narr', text: '【작전 팁】 강물은 건널 수 없어요. 가운데 농다리와 양쪽 징검다리로 건너요!' }
    ],
    mid: {
      after: 2,
      before: [
        { who: 'heukjin', text: '흥, 제법이군! 그렇다면 이번엔 어려운 문제다!', ghost: 'show', shake: true },
        { who: 'heukjin', text: '자릿수가 다른 소수! 이건 절대 못 풀걸? 으하하!' }
      ],
      question: {
        story: '농다리 돌 하나의 높이는 1.2m예요. 그 위에 0.35m짜리 돌을 하나 더 올리면 높이는 모두 몇 m가 될까요?',
        a: 120, op: '+', b: 35, unit: 'm',
        hint: '1.2는 1.20과 같아요! 소수점끼리 줄을 맞추고 1.20 + 0.35를 계산해요. 소수 둘째 자리 0 + 5 = 5예요.'
      },
      after2: [
        { who: 'heukjin', text: '말도 안 돼! 이 문제까지 풀다니!', ghost: 'hide' },
        { who: 'j4', text: '다리 돌이 다시 단단하게 자리를 잡았어!' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
    },
    ending: {
      before: [
        { who: 'narr', text: '거북 대장이 "엉엉" 울며 껍데기 속으로 쏙 숨었어요. 사실은 흑진에게 속았던 거래요.' },
        { who: 'narr', text: '거북 등에서 반짝이는 소수점이 하나 떨어졌어요!', sfx: 'correct' },
        { who: 'j4', text: '고마워, 얘들아! 농다리가 다시 튼튼해졌어.' },
        { who: 'j3', text: '이제 소수점이 네 개야! 절반 가까이 찾았어.' },
        { who: 'j1', text: '그런데 흑진은 대체 어디 있는 거지?' },
        { who: 'j4', text: '농다리를 건너면 초평호 옆으로 초롱길이 이어져. 거기로 가 보자!' }
      ],
      question: {
        story: '농다리에서 초롱길 끝까지는 3.4km예요. 지금까지 1.25km를 걸었어요. 앞으로 몇 km를 더 가야 할까요?',
        a: 340, op: '-', b: 125, unit: 'km',
        hint: '3.4는 3.40과 같아요! 3.40 − 1.25를 계산해요. 소수 둘째 자리 0에서 5를 뺄 수 없으니, 소수 첫째 자리에서 1을 빌려 와요.'
      },
      after2: [
        { who: 'hero', text: '2.15km! 조금만 더 가면 돼!', sfx: 'win' },
        { who: 'heukjin', text: '초롱길의 초롱불도 내가 뒤죽박죽으로 만들어 놨지! 도깨비불들아, 모여라! 으하하!', ghost: 'show' },
        { who: 'j2', text: '초롱길에는 {친근:j5}가 책 읽으러 자주 가잖아!', ghost: 'hide' },
        { who: 'j4', text: '나도 같이 갈게! 돌의 힘으로 친구들을 지킬 거야!' }
      ]
    },
    tip: '💡 팁: 좁은 다리 위에서는 한 명씩만 지나갈 수 있어요. 멀리서 공격하는 친구를 활용해요!'
  },

  // ---------------------------------------------------------- 스테이지 5
  5: {
    title: '스테이지 5',
    name: STAGE_NAMES[5],
    map: [
      'TTTTTTTT.TTT~~~~~~',
      'T..f...dddd.l~~~~~',
      'T.T....d..dd.~~~~~',
      '..T..l.d...dl~~~~~',
      '.......d....dd~~~~',
      'T.PP...d.....d~~~~',
      '..QQ..ld.....dl~~~',
      '.......ddddddd.~~~',
      'T.T........f...~~~',
      '..f...l........~~~',
      'TT.....dddd.....~~',
      'TTT....d..d....T~~'
    ],
    heroes: [
      { id: 'hero', x: 8,  y: 10 },
      { id: 'j3',    x: 9,  y: 10 },
      { id: 'j5',  x: 7,  y: 10 },
      { id: 'j1',   x: 7,  y: 11 },
      { id: 'j2',   x: 10, y: 11 },
      { id: 'j4',     x: 10, y: 10 }
    ],
    enemies: [
      { type: 'wisp',   x: 4,  y: 4 },
      { type: 'wisp',   x: 11, y: 3 },
      { type: 'wisp',   x: 12, y: 5 },
      { type: 'mole',   x: 1,  y: 7 },
      { type: 'mole',   x: 14, y: 7 },
      { type: 'goblin', x: 9,  y: 1 }
    ],
    intro: [
      { who: 'narr', text: '해가 뉘엿뉘엿 지는 초평호 초롱길. 호숫가를 따라 나무 데크 길이 이어져 있어요.' },
      { who: 'narr', text: '그런데 길가의 초롱불이 하나둘 이상한 파란빛으로 바뀌고 있었어요...' },
      { who: 'j5', text: '으악! 책 속 숫자가 다 뒤죽박죽이 됐어! 3.14가 314로 바뀌었잖아!' },
      { who: 'j4', text: '{부름:j5}! 괜찮아?' },
      { who: 'j5', text: '얘들아! 정자에서 책을 읽는데 도깨비불이 날아와서 소수점을 다 먹어 버렸어!' },
      { who: 'heukjin', text: '으하하! 초롱 도깨비야! 이 꼬마들을 혼내 줘라!', ghost: 'show', shake: true },
      { who: 'narr', text: '길 끝에서 커다란 초롱을 든 도깨비가 나타났어요!', ghost: 'hide', shake: true, sfx: 'hit' },
      { who: 'j5', text: '책에서 읽었어. 도깨비는 꾀가 많지만 사실 겁도 많대!' },
      { join: 'j5' },
      { who: 'narr', text: '✨ {친근:j5}가 동료가 되었어요! ✨', sfx: 'win' },
      { who: 'narr', text: '【적 정보】 도깨비불은 2칸 떨어진 곳에서도 공격해요. 초롱 도깨비는 길 끝에서 기다리고 있어요.' }
    ],
    mid: {
      after: 2,
      before: [
        { who: 'heukjin', text: '도깨비불이 벌써?! 그럼 초롱길 문제다!', ghost: 'show', shake: true }
      ],
      question: {
        story: '초롱길 첫째 구간은 1.6km, 둘째 구간은 0.9km예요. 두 구간을 합하면 모두 몇 km일까요?',
        a: 160, op: '+', b: 90, unit: 'km',
        hint: '소수 첫째 자리 6 + 9 = 15예요. 0.1이 15개면 1.5니까, 일의 자리로 1을 올려 줘요!'
      },
      after2: [
        { who: 'heukjin', text: '으으, 이번엔 꼭 이길 줄 알았는데!', ghost: 'hide' },
        { who: 'j5', text: '초롱불이 다시 따뜻한 주황빛으로 돌아오고 있어!' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
    },
    ending: {
      before: [
        { who: 'narr', text: '초롱 도깨비가 "항복! 항복!" 하며 초롱을 내려놓았어요.' },
        { who: 'narr', text: '초롱 속에서 반짝이는 소수점이 나왔어요!', sfx: 'correct' },
        { who: 'j5', text: '책 속 숫자가 다시 3.14가 됐어! 고마워, 얘들아!' },
        { who: 'hero', text: '소수점을 벌써 다섯 개나 찾았어! 이제 절반이야!' },
        { who: 'j5', text: '도깨비가 떨어뜨린 지도를 봐. 초평호 물가까지 가는 길이 적혀 있어.' }
      ],
      question: {
        story: '지도에는 초평호 물가까지 4.2km라고 적혀 있어요. 오늘 1.6km를 걸었다면 몇 km가 남았을까요?',
        a: 420, op: '-', b: 160, unit: 'km',
        hint: '소수 첫째 자리에서 2에서 6을 뺄 수 없어요. 일의 자리에서 1을 빌려 와서 12 − 6을 해요. 일의 자리는 3 − 1이 돼요!'
      },
      after2: [
        { who: 'j5', text: '2.6km! 계산 끝!', sfx: 'win' },
        { who: 'heukjin', text: '흥! 아직 소수점은 다섯 개나 남았다! 다음은 초평호 물가! 물고기들의 숫자까지 바꿔 주마!', ghost: 'show' },
        { who: 'j4', text: '초평호에는 {친근:j6}가 있잖아!', ghost: 'hide' },
        { who: 'j1', text: '좋아, 다음 모험도 가 보자!' }
      ]
    },
    tip: '💡 팁: "옆의 적도 공격" 스킬은 적이 모여 있을 때 쓰면 한꺼번에 여러 마리를 공격할 수 있어요!'
  },

  // ---------------------------------------------------------- 스테이지 6
  6: {
    title: '스테이지 6',
    name: STAGE_NAMES[6],
    map: [
      '~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~',
      '~~~dd~~~~~~~~~dd~~~',
      '~~~dd~~~~~~~~~dd~~~',
      'sssddssssssssssddss',
      'ssrssssssssssssrsss',
      '..r....T.....T..r..',
      '.........,,........',
      'T..f....,,,....f..T',
      '.......,,,,,.......',
      'TT....,,,,,,,....TT',
      'TTT...,,,,,,,...TTT'
    ],
    heroes: [
      { id: 'hero', x: 9,  y: 9 },
      { id: 'j3',    x: 8,  y: 9 },
      { id: 'j4',     x: 10, y: 9 },
      { id: 'j1',   x: 7,  y: 10 },
      { id: 'j5',  x: 11, y: 10 },
      { id: 'j2',   x: 9,  y: 10 },
      { id: 'j6',      x: 9,  y: 11 }
    ],
    enemies: [
      { type: 'fish',    x: 3,  y: 5, color: '#e0a03a' },
      { type: 'fish',    x: 15, y: 5, color: '#d0803a' },
      { type: 'fish',    x: 9,  y: 6, color: '#e0b04a' },
      { type: 'eel',     x: 3,  y: 3 },
      { type: 'eel',     x: 15, y: 3 },
      { type: 'catfish', x: 9,  y: 4 }
    ],
    intro: [
      { who: 'narr', text: '친구들은 초평호 물가에 도착했어요. 넓은 호수 위로 낚시터 데크가 길게 뻗어 있어요.' },
      { who: 'narr', text: '그런데 물속에서 첨벙첨벙! 창을 든 물고기들이 걸어 나왔어요!', shake: true, sfx: 'hit' },
      { who: 'j6', text: '저리 가! 수심 팻말에 2.4m라고 써 있어야 하는데 24m가 됐잖아!' },
      { who: 'j1', text: '{부름:j6}!' },
      { who: 'j6', text: '얘들아! 물고기들이 이상해. 흑진이라는 녀석이 호수에 마법을 걸었대!' },
      { who: 'heukjin', text: '으하하! 초평호의 물고기들은 이제 내 부하다! 큰 메기 장군, 저 꼬마들을 혼내 줘라!', ghost: 'show', shake: true },
      { who: 'narr', text: '흑진은 물안개 속으로 사라졌어요.', ghost: 'hide' },
      { who: 'j6', text: '내가 제일 좋아하는 초평호를 엉망으로 만들다니, 용서 못 해!' },
      { join: 'j6' },
      { who: 'narr', text: '✨ {친근:j6}가 동료가 되었어요! ✨', sfx: 'win' },
      { who: 'narr', text: '【적 정보】 뱀장어와 큰 메기 장군은 물속을 헤엄쳐 다녀요! 물가에서 기다렸다가 공격해요.' }
    ],
    mid: {
      after: 2,
      before: [
        { who: 'heukjin', text: '물고기 부하들을 벌써?! 그럼 낚시 문제다!', ghost: 'show', shake: true }
      ],
      question: {
        story: '{친근:j6} 할아버지는 아침에 붕어 1.7kg, 점심에 2.6kg을 잡았어요. 모두 몇 kg을 잡았을까요?',
        a: 170, op: '+', b: 260, unit: 'kg',
        hint: '소수 첫째 자리 7 + 6 = 13이에요. 0.1이 13개면 1.3이니까, 일의 자리로 1을 올려 줘요!'
      },
      after2: [
        { who: 'heukjin', text: '으윽, 메기 장군! 정신 차려!', ghost: 'hide' },
        { who: 'j6', text: '호수 물이 다시 맑아지고 있어!' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
    },
    ending: {
      before: [
        { who: 'narr', text: '큰 메기 장군이 "꾸르륵~" 하더니 물속으로 쏙 들어갔어요.' },
        { who: 'narr', text: '물방울 속에서 반짝이는 소수점이 떠올랐어요!', sfx: 'correct' },
        { who: 'j6', text: '수심 팻말이 다시 2.4m가 됐어! 고마워, 얘들아!' },
        { who: 'hero', text: '이제 소수점을 여섯 개나 찾았어!' },
        { who: 'j5', text: '그런데 저 멀리 하늘다리 쪽에서 바람이 세게 불어...' },
        { who: 'j6', text: '하늘다리까지 얼마나 남았는지 계산해 보자!' }
      ],
      question: {
        story: '초평호 물가에서 하늘다리까지는 5.3km예요. 지금까지 2.8km를 걸었어요. 몇 km가 남았을까요?',
        a: 530, op: '-', b: 280, unit: 'km',
        hint: '소수 첫째 자리에서 3에서 8을 뺄 수 없어요. 일의 자리에서 1을 빌려 와서 13 − 8을 해요!'
      },
      after2: [
        { who: 'j6', text: '2.5km! 내가 물가 지름길도 알아!', sfx: 'win' },
        { who: 'heukjin', text: '다음은 하늘다리다! 바람 박쥐들아, 다리를 흔들어라! 으하하!', ghost: 'show' },
        { who: 'j1', text: '하늘다리엔 {친근:j7}가 매일 달리기 연습을 하러 가잖아!', ghost: 'hide' },
        { who: 'j6', text: '나도 같이 갈게! 가자!' }
      ]
    },
    tip: '💡 팁: 물속의 적은 물가에서 기다렸다가, 멀리서 공격하는 친구로 상대해요!'
  },

  // ---------------------------------------------------------- 스테이지 7 ⭐
  7: {
    title: '스테이지 7 ⭐',
    name: STAGE_NAMES[7],
    map: [
      'TT..~~~~~~~~~~~..TT',
      'T...~~~~~~~~~~~...T',
      '..f.~~~~~~~~~~~.f..',
      '....~~~~~~~~~~~....',
      '...O~~~~~~~~~~~O...',
      ',,,,eeeeeeeeeee,,,,',
      ',,,,eeeeeeeeeee,,,,',
      '...O~~~~~~~~~~~O...',
      '....~~~~~~~~~~~....',
      '..f.~~~~~~~~~~~.f..',
      'T...~~~~~~~~~~~...T',
      'TT..~~~~~~~~~~~..TT',
      'TTT.~~~~~~~~~~~.TTT'
    ],
    heroes: [
      { id: 'hero', x: 3, y: 5 },
      { id: 'j3',    x: 3, y: 6 },
      { id: 'j4',     x: 2, y: 5 },
      { id: 'j1',   x: 1, y: 5 },
      { id: 'j5',  x: 1, y: 6 },
      { id: 'j2',   x: 0, y: 6 },
      { id: 'j6',      x: 2, y: 6 },
      { id: 'j7',    x: 2, y: 4 }
    ],
    enemies: [
      { type: 'bat',   x: 9,  y: 2 },
      { type: 'bat',   x: 9,  y: 10 },
      { type: 'bat',   x: 12, y: 8 },
      { type: 'crow',  x: 16, y: 3 },
      { type: 'crow',  x: 16, y: 8 },
      { type: 'eagle', x: 17, y: 6 }
    ],
    intro: [
      { who: 'narr', text: '초평호 위에 길게 놓인 하늘다리. 바람이 휘잉휘잉 불어요.' },
      { who: 'narr', text: '다리 건너편에서 누군가 박쥐들에게 둘러싸여 있었어요!', shake: true, sfx: 'hit' },
      { who: 'j7', text: '저리 가! 내 달리기 기록판 건드리지 마!' },
      { who: 'hero', text: '{부름:j7}!' },
      { who: 'j7', text: '{부름:hero}! 박쥐들이 내 기록을 12.4초에서 124초로 바꿔 놨어!' },
      { who: 'heukjin', text: '으하하! 번개 독수리와 바람 박쥐들이 하늘다리를 지키고 있다! 이 다리는 절대 못 건넌다!', ghost: 'show', shake: true },
      { who: 'narr', text: '흑진은 회오리바람과 함께 사라졌어요.', ghost: 'hide' },
      { who: 'j7', text: '흥, 나는 우리 학교에서 제일 빠르다고!' },
      { join: 'j7' },
      { who: 'narr', text: '✨ {친근:j7}가 동료가 되었어요! ✨', sfx: 'win' },
      { who: 'narr', text: '【⭐ 중요한 스테이지】 이번 이야기 문제는 조금 더 어려워요. 자릿수가 다른 소수가 나와요!' },
      { who: 'narr', text: '【적 정보】 박쥐와 독수리는 하늘을 날아서 호수 위로도 다녀요. 다리가 좁으니 조심해요!' }
    ],
    mid: {
      after: 2,
      before: [
        { who: 'heukjin', text: '하늘다리 문제다! 이번엔 자릿수가 다르지! 으하하!', ghost: 'show', shake: true }
      ],
      question: {
        story: '하늘다리의 첫째 칸은 1.3m, 둘째 칸은 0.85m예요. 두 칸을 이으면 모두 몇 m일까요?',
        a: 130, op: '+', b: 85, unit: 'm',
        hint: '1.3은 1.30과 같아요! 1.30 + 0.85를 계산해요. 소수 첫째 자리 3 + 8 = 11이니까 일의 자리로 1을 올려 줘요.'
      },
      after2: [
        { who: 'heukjin', text: '이럴 수가! 자릿수가 달라도 풀다니!', ghost: 'hide' },
        { who: 'j7', text: '바람이 잦아들고 있어!' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
    },
    ending: {
      before: [
        { who: 'narr', text: '번개 독수리가 "끼이익!" 소리를 내며 구름 속으로 날아갔어요.' },
        { who: 'narr', text: '독수리 깃털 사이에서 반짝이는 소수점이 떨어졌어요!', sfx: 'correct' },
        { who: 'j7', text: '내 기록이 다시 12.4초가 됐어! 고마워!' },
        { who: 'j3', text: '소수점이 일곱 개! 이제 세 개 남았어.' },
        { who: 'j7', text: '내가 달려서 재 봤는데, 다리 끝에서 들판까지 꽤 멀어.' }
      ],
      question: {
        story: '하늘다리에서 초평 들판까지는 4.5km예요. 지금까지 1.75km를 왔어요. 몇 km가 남았을까요?',
        a: 450, op: '-', b: 175, unit: 'km',
        hint: '4.5는 4.50과 같아요! 4.50 − 1.75를 계산해요. 소수 둘째 자리 0에서 5를 뺄 수 없으니 받아내림을 해요.'
      },
      after2: [
        { who: 'j7', text: '2.75km! 내가 먼저 달려가서 길을 볼게!', sfx: 'win' },
        { who: 'heukjin', text: '들판의 허수아비들아, 일어나라! 황금 벼의 무게를 몽땅 바꿔 버려라!', ghost: 'show' },
        { who: 'j2', text: '들판에는 {친근:j8}네 할머니 논이 있잖아!', ghost: 'hide' },
        { who: 'j7', text: '좋아, 들판으로 출발!' }
      ]
    },
    tip: '💡 팁: 날아다니는 적은 물 위에서도 공격해요. 다리 위에서는 [🛡 방패]로 친구들을 지켜 줘요!'
  },

  // ---------------------------------------------------------- 스테이지 8
  8: {
    title: '스테이지 8',
    name: STAGE_NAMES[8],
    map: [
      'TTTT..pppp,pppp..TTT',
      'T....Ypppp,ppppY...T',
      '......pppp,pppp.....',
      ',,,,,,,,,,,,,,,,,,,,',
      '.pppp.pppp,pppp.ppp.',
      '.pppp.pppp,pppp.ppp.',
      '.pppp.Y...,...Y.ppp.',
      ',,,,,,,,,,,,,,,,,,,,',
      '.pppp.pppp,pppp.ppp.',
      '.pppp.pppp,pppp.ppp.',
      'Y.....f...,...f....Y',
      'TT.......,,,......TT',
      'TTT......,,,.....TTT'
    ],
    heroes: [
      { id: 'hero', x: 10, y: 10 },
      { id: 'j3',    x: 9,  y: 11 },
      { id: 'j4',     x: 11, y: 11 },
      { id: 'j1',   x: 8,  y: 10 },
      { id: 'j5',  x: 12, y: 10 },
      { id: 'j2',   x: 10, y: 11 },
      { id: 'j6',      x: 10, y: 12 },
      { id: 'j7',    x: 9,  y: 12 },
      { id: 'j8',   x: 11, y: 12 }
    ],
    enemies: [
      { type: 'scarecrow', x: 3,  y: 4 },
      { type: 'scarecrow', x: 17, y: 5 },
      { type: 'scarecrow', x: 7,  y: 8 },
      { type: 'hopper',    x: 2,  y: 7 },
      { type: 'hopper',    x: 16, y: 7 },
      { type: 'goldscare', x: 10, y: 1 }
    ],
    intro: [
      { who: 'narr', text: '황금빛 벼가 출렁이는 초평 들판.' },
      { who: 'narr', text: '그런데 허수아비들이 저벅저벅 논 사이를 걸어 다니고 있었어요!', shake: true, sfx: 'hit' },
      { who: 'j8', text: '에헤헤, 허수아비 아저씨들! 나 잡아 봐라~' },
      { who: 'hero', text: '{부름:j8}! 뭐 하는 거야?' },
      { who: 'j8', text: '허수아비들이 할머니 논의 쌀 무게표를 바꾸고 있어서 놀리는 중이야! 3.6kg이 36kg이 됐다니까!' },
      { who: 'heukjin', text: '으하하! 황금 허수아비 왕이 이 들판을 다스린다! 메뚜기 부대도 있지!', ghost: 'show', shake: true },
      { who: 'narr', text: '흑진은 지푸라기 회오리와 함께 사라졌어요.', ghost: 'hide' },
      { who: 'j8', text: '흥, 장난이라면 내가 최고지!' },
      { join: 'j8' },
      { who: 'narr', text: '✨ {친근:j8}가 동료가 되었어요! ✨', sfx: 'win' },
      { who: 'narr', text: '【적 정보】 허수아비는 단단해서 피해를 1 덜 받아요. 메뚜기는 아주 멀리 뛰어와요.' }
    ],
    mid: {
      after: 2,
      before: [
        { who: 'heukjin', text: '내 허수아비들이! 그럼 쌀 문제다!', ghost: 'show', shake: true }
      ],
      question: {
        story: '할머니 논에서 아침에 쌀 3.6kg, 오후에 2.7kg을 거두었어요. 모두 몇 kg을 거두었을까요?',
        a: 360, op: '+', b: 270, unit: 'kg',
        hint: '소수 첫째 자리 6 + 7 = 13이에요. 0.1이 13개면 1.3이니까, 일의 자리로 1을 올려 줘요!'
      },
      after2: [
        { who: 'heukjin', text: '으으, 황금 허수아비 왕이여! 힘을 내라!', ghost: 'hide' },
        { who: 'j8', text: '쌀 무게표가 돌아오고 있어! 에헤헤.' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
    },
    ending: {
      before: [
        { who: 'narr', text: '황금 허수아비 왕이 털썩 쓰러지며 지푸라기가 흩날렸어요.' },
        { who: 'narr', text: '지푸라기 속에서 반짝이는 소수점을 찾았어요!', sfx: 'correct' },
        { who: 'j8', text: '할머니 쌀이 다시 3.6kg이 됐다! 고마워, 얘들아!' },
        { who: 'j5', text: '소수점 여덟 개! 이제 두 개 남았어.' },
        { who: 'j8', text: '아, 그런데 할머니가 쌀로 떡을 만드셨대!' }
      ],
      question: {
        story: '할머니는 쌀 6.1kg 중에서 3.4kg으로 떡을 만들었어요. 남은 쌀은 몇 kg일까요?',
        a: 610, op: '-', b: 340, unit: 'kg',
        hint: '소수 첫째 자리에서 1에서 4를 뺄 수 없어요. 일의 자리에서 1을 빌려 와서 11 − 4를 해요. 일의 자리는 5 − 3이 돼요!'
      },
      after2: [
        { who: 'j8', text: '2.7kg! 떡 먹으러 가자... 가 아니고, 흑진을 찾으러 가자!', sfx: 'win' },
        { who: 'heukjin', text: '두타산 숲으로 와 봐라! 그림자 늑대가 기다리고 있다! 으하하!', ghost: 'show' },
        { who: 'j4', text: '두타산엔 {친근:j9}가 있어. 숲을 지키는 게 꿈이라고 했잖아!', ghost: 'hide' },
        { who: 'j8', text: '좋아, 숲으로 출발!' }
      ]
    },
    tip: '💡 팁: [헷갈리기 팽이]로 센 적을 멈춰 두고, 그동안 다른 친구들이 공격해요!'
  },

  // ---------------------------------------------------------- 스테이지 9
  9: {
    title: '스테이지 9',
    name: STAGE_NAMES[9],
    map: [
      'TTTTTTTTM,,MTTTTTTTT',
      'TTT.....,,.....N.TTT',
      'TN..T...,,...T....NT',
      'T......,,..M.......T',
      '..N...,,.....~~~..N.',
      '......,......~~~....',
      'T.M..,,...N..~~~.T..',
      '.....,.......bbb....',
      'TN...,,......~~~..NT',
      '......,,.....~~~....',
      'T.f....,,..f.......T',
      '..N.....,,......N...',
      'TT......,,,.......TT',
      'TTTT....,,,......TTT'
    ],
    heroes: [
      { id: 'hero', x: 8,  y: 10 },
      { id: 'j3',    x: 7,  y: 10 },
      { id: 'j4',     x: 9,  y: 11 },
      { id: 'j7',    x: 8,  y: 11 },
      { id: 'j1',   x: 8,  y: 12 },
      { id: 'j2',   x: 9,  y: 12 },
      { id: 'j5',  x: 10, y: 12 },
      { id: 'j9',    x: 8,  y: 13 },
      { id: 'j6',      x: 9,  y: 13 },
      { id: 'j8',   x: 10, y: 13 }
    ],
    enemies: [
      { type: 'fox',      x: 3,  y: 3 },
      { type: 'fox',      x: 16, y: 3 },
      { type: 'fox',      x: 12, y: 5 },
      { type: 'mushroom', x: 4,  y: 7 },
      { type: 'mushroom', x: 17, y: 9 },
      { type: 'wolf',     x: 9,  y: 1 }
    ],
    intro: [
      { who: 'narr', text: '초평면 뒤에 우뚝 솟은 두타산. 울창한 숲속으로 오솔길이 이어져요.' },
      { who: 'narr', text: '숲은 이상하게 어둡고, 어디선가 늑대 울음소리가 들렸어요. 아우우~', shake: true, sfx: 'hit' },
      { who: 'j9', text: '거기 멈춰! 이 숲은 내가 지킨다!' },
      { who: 'j1', text: '{부름:j9}!' },
      { who: 'j9', text: '얘들아! 여우랑 버섯들이 숲의 나무 높이표를 바꿨어. 1.9m 나무가 19m가 됐어!' },
      { who: 'heukjin', text: '으하하! 그림자 늑대는 내 가장 강한 부하다! 이번엔 어림없지!', ghost: 'show', shake: true },
      { who: 'narr', text: '흑진은 검은 그림자 속으로 사라졌어요.', ghost: 'hide' },
      { who: 'j9', text: '나는 언젠가 친구들을 지키는 멋진 사람이 될 거야!' },
      { who: 'narr', text: '그때, 산꼭대기 바위에서 신비한 빛이 {친근:j9}에게 쏟아졌어요!' },
      { join: 'j9' },
      { who: 'narr', text: '✨ {친근:j9}가 동료가 되었어요! 이제 열 명이 모두 모였어요! ✨', sfx: 'win' },
      { who: 'narr', text: '【적 정보】 포자 버섯은 2칸 떨어진 곳에서 공격해요. 그림자 늑대는 아주 세니까 조심해요!' },
      { who: 'narr', text: '【작전 팁】 개울은 건널 수 없어요. 가운데 징검다리로 건너요.' }
    ],
    mid: {
      after: 2,
      before: [
        { who: 'heukjin', text: '여우들까지?! 그럼 숲 문제다!', ghost: 'show', shake: true }
      ],
      question: {
        story: '두타산 오솔길의 첫째 길은 1.9km, 둘째 길은 2.6km예요. 두 길을 합하면 모두 몇 km일까요?',
        a: 190, op: '+', b: 260, unit: 'km',
        hint: '소수 첫째 자리 9 + 6 = 15예요. 0.1이 15개면 1.5니까, 일의 자리로 1을 올려 줘요!'
      },
      after2: [
        { who: 'heukjin', text: '그림자 늑대야, 힘을 내라!', ghost: 'hide' },
        { who: 'j9', text: '숲이 다시 밝아지고 있어!' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
    },
    ending: {
      before: [
        { who: 'narr', text: '그림자 늑대가 "깨갱!" 하더니 작은 강아지로 변했어요. 흑진의 마법이 풀린 거예요!' },
        { who: 'narr', text: '강아지 목걸이에서 반짝이는 소수점이 떨어졌어요!', sfx: 'correct' },
        { who: 'j9', text: '나무 높이표도 다시 1.9m가 됐어!' },
        { who: 'hero', text: '소수점 아홉 개! 마지막 하나만 남았어!' },
        { who: 'j9', text: '산꼭대기에서 보니까, 초평호 한가운데에 보라색 성이 있었어. 거기가 흑진의 성이야!' },
        { who: 'j5', text: '성까지 거리를 계산해 보자.' }
      ],
      question: {
        story: '두타산에서 흑진의 성까지는 7.2km예요. 이미 4.5km를 내려왔어요. 몇 km가 남았을까요?',
        a: 720, op: '-', b: 450, unit: 'km',
        hint: '소수 첫째 자리에서 2에서 5를 뺄 수 없어요. 일의 자리에서 1을 빌려 와서 12 − 5를 해요. 일의 자리는 6 − 4가 돼요!'
      },
      after2: [
        { who: 'j9', text: '2.7km! 이제 마지막 싸움이야!', sfx: 'win' },
        { who: 'heukjin', text: '좋다! 내 성으로 와라! 마지막 소수점은 절대 못 돌려준다!', ghost: 'show', shake: true },
        { who: 'hero', text: '얘들아, 열 명이 다 모였어. 우리 함께 가자!', ghost: 'hide' },
        { who: 'narr', text: '모두 함께: "좋아!"' }
      ]
    },
    tip: '💡 팁: 그림자 늑대는 아주 세요. 팽이로 멈추고, 방패로 친구들을 지켜요!'
  },

  // ---------------------------------------------------------- 스테이지 10 ⭐ (마지막)
  10: {
    title: '스테이지 10 ⭐',
    name: STAGE_NAMES[10],
    final: true,
    map: [
      '~~~~~~~~~~~~~~~~~~~~~',
      '~KKKKKKKKKKKKKKKKKKK~',
      '~KccccccIcJcIccccccK~',
      '~KcIccccccaccccccIcK~',
      '~KccccccccaccccccccK~',
      '~KccIcccccacccccIccK~',
      '~KccccccccaccccccccK~',
      '~KKKKcccccacccccKKKK~',
      '~cccccccccaccccccccc~',
      '~cIcccccccacccccccIc~',
      '~cccccccccaccccccccc~',
      '~~~~~~~~~eee~~~~~~~~~',
      '...T...,,,,,,,...T...',
      'TT.....,,,,,,,.....TT'
    ],
    heroes: [
      { id: 'hero', x: 10, y: 12 },
      { id: 'j3',    x: 9,  y: 12 },
      { id: 'j4',     x: 11, y: 12 },
      { id: 'j9',    x: 8,  y: 12 },
      { id: 'j7',    x: 12, y: 12 },
      { id: 'j1',   x: 9,  y: 13 },
      { id: 'j5',  x: 11, y: 13 },
      { id: 'j2',   x: 10, y: 13 },
      { id: 'j6',      x: 8,  y: 13 },
      { id: 'j8',   x: 12, y: 13 }
    ],
    enemies: [
      { type: 'slime',   x: 5,  y: 9, color: '#3a2a5a' },
      { type: 'calc',    x: 15, y: 9 },
      { type: 'crab',    x: 3,  y: 8 },
      { type: 'wisp',    x: 17, y: 8 },
      { type: 'wisp',    x: 7,  y: 5 },
      { type: 'fox',     x: 13, y: 5 },
      { type: 'heukjin', x: 10, y: 3 }
    ],
    intro: [
      { who: 'narr', text: '초평호 한가운데, 보라색 안개에 둘러싸인 흑진의 성.' },
      { who: 'narr', text: '성 안쪽 왕좌 앞에 대마왕 흑진이 서 있었어요.' },
      { who: 'heukjin', text: '드디어 왔구나, 꼬마들! 하지만 마지막 소수점은 절대 못 돌려준다!', shake: true, sfx: 'hit' },
      { who: 'hero', text: '흑진! 도대체 왜 소수점을 훔쳐 간 거야?' },
      { who: 'heukjin', text: '흥! 소수는 어렵고 귀찮잖아! 아무도 소수를 좋아하지 않아! 그러니 내가 다 없애 버리겠다!' },
      { who: 'j1', text: '아니야! 우리는 소수 문제를 풀면서 여기까지 왔어!' },
      { who: 'j9', text: '소수는 어렵지 않아. 소수점끼리 줄을 맞추고 차근차근 계산하면 돼!' },
      { who: 'heukjin', text: '시끄럽다! 나의 마지막 부하들아, 모두 나와라!', shake: true, sfx: 'hit' },
      { who: 'narr', text: '【⭐ 마지막 스테이지】 열 명의 친구가 모두 함께 싸워요! 이야기 문제는 조금 더 어려워요.' },
      { who: 'narr', text: '【적 정보】 대마왕 흑진은 2칸 떨어진 곳에서도 공격하고, 아주 튼튼해요. 힘을 합쳐요!' }
    ],
    mid: {
      after: 3,
      before: [
        { who: 'heukjin', text: '이럴 수가... 내 부하들이 쓰러지다니!', shake: true },
        { who: 'heukjin', text: '그렇다면 마지막으로 어려운 문제다! 자릿수가 다른 소수!' }
      ],
      question: {
        story: '흑진의 성 탑은 2.75m짜리 돌탑 위에 1.5m짜리 깃발을 꽂았어요. 탑의 높이는 모두 몇 m일까요?',
        a: 275, op: '+', b: 150, unit: 'm',
        hint: '1.5는 1.50과 같아요! 2.75 + 1.50을 계산해요. 소수 첫째 자리 7 + 5 = 12니까 일의 자리로 1을 올려 줘요.'
      },
      after2: [
        { who: 'heukjin', text: '으윽... 너희들, 정말 소수를 잘하는구나...' },
        { who: 'hero', text: '모두 힘내! 조금만 더!' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
    },
    ending: {
      before: [
        { who: 'narr', text: '흑진이 털썩 주저앉았어요. 왕관이 데구루루 굴러떨어졌어요.' },
        { who: 'heukjin', text: '...졌다. 너희들이 이겼어.' },
        { who: 'heukjin', text: '사실... 나는 소수가 너무 어려워서, 친구들이 0.5 + 0.5도 모른다고 놀릴까 봐 무서웠어.' },
        { who: 'heukjin', text: '그래서 소수를 세상에서 없애 버리면 아무도 틀리지 않을 거라고 생각했어...' },
        { who: 'j2', text: '흑진아, 틀려도 괜찮아. 우리도 처음엔 많이 틀렸어.' },
        { who: 'j5', text: '맞아. 틀리면 힌트를 보고 다시 풀면 돼!' },
        { who: 'hero', text: '우리랑 같이 마지막 문제를 풀어 보자!' }
      ],
      question: {
        story: '흑진의 성에서 초평초등학교까지는 5.2km예요. 배를 타고 2.45km를 건넜어요. 몇 km를 더 가면 학교에 도착할까요?',
        a: 520, op: '-', b: 245, unit: 'km',
        hint: '5.2는 5.20과 같아요! 5.20 − 2.45를 계산해요. 소수 둘째 자리 0에서 5를 뺄 수 없으니 받아내림을 해요.'
      },
      after2: [
        { who: 'narr', text: '정답을 외치는 순간, 흑진의 품에서 마지막 소수점이 반짝이며 날아올랐어요!', sfx: 'win' },
        { who: 'narr', text: '열 개의 소수점이 하늘로 올라가 초평면 곳곳으로 퍼져 나갔어요!' },
        { who: 'narr', text: '9.5초는 다시 9.5초, 2.4kg은 다시 2.4kg! 초평면이 원래대로 돌아왔어요!' },
        { who: 'heukjin', text: '고마워... 그리고 미안해. 나도... 너희랑 같이 소수 공부를 해도 될까?' },
        { who: 'hero', text: '당연하지! 오늘부터 너도 우리 친구야!' },
        { who: 'j1', text: '내일 체육 시간에 50m 달리기 같이 하자! 기록은 소수로 재는 거다!' },
        { who: 'heukjin', text: '좋아! 이번엔 소수점 찍는 거 절대 안 까먹을게!' },
        { who: 'narr', text: '그렇게 초평면에는 다시 평화가 찾아왔어요.' },
        { who: 'narr', text: '🎉 초평 택틱스 - 사라진 소수점 · 끝 🎉 끝까지 함께해 줘서 고마워요!', sfx: 'win' }
      ]
    },
    tip: '💡 팁: 흑진은 아주 튼튼해요. 팽이로 멈추고, 초월한 친구들의 스킬을 모아서 공격해요!'
  }
};

// =====================================================
//  🔮 히든 스킬 (두 번째 스킬) — 히든 스테이지 5를 깨면 함께 싸운 친구가 배워요
// =====================================================
const HIDDEN_SKILLS = {
  warrior: { name: '연필 회오리 베기', type: 'attack', rmin: 1, rmax: 1, power: 1.8, cd: 3, wide: true },
  archer:   { name: '소수점 저격',     type: 'attack', rmin: 2, rmax: 6, power: 3, cd: 3 },
  healer:   { name: '물안개 치유',     type: 'heal', rmin: 0, rmax: 3, amount: 8, cd: 3, all: true },
  tank:    { name: '방패 밀치기',     type: 'attack', rmin: 1, rmax: 1, power: 1.5, cd: 3, stun: true },
  stone:     { name: '바위 성벽',       type: 'guard', rmin: 0, rmax: 0, grange: 1, cut: 0.6, cd: 3 },
  mage:  { name: '소수 유성우',     type: 'attack', rmin: 1, rmax: 5, power: 2.5, cd: 3, wide: true },
  water:      { name: '치유의 물방울',   type: 'heal', rmin: 0, rmax: 3, amount: 12, cd: 2 },
  scout:    { name: '번개 연속 차기',  type: 'attack', rmin: 1, rmax: 1, power: 3, cd: 3, ignoreDef: true },
  trick:   { name: '깜짝 함정',       type: 'attack', rmin: 1, rmax: 4, power: 1, cd: 3, stun: true, wide: true },
  knight:    { name: '수호의 빛',       type: 'guard', rmin: 0, rmax: 0, grange: 2, cut: 0.5, cd: 3 }
};

// 히든 스테이지 보스: 그림자 대마왕 (흑진의 악몽)
CHARACTERS.shadow = {
  name: '그림자 대마왕', role: '히든 보스',
  look: { hair: '#1a1020', shirt: '#2a1a40', pants: '#1a1020', shoes: '#000000', hairStyle: 'spiky',
          cape: '#4a1a6a', crown: true, glasses: true }
};
ENEMIES.shadow = { name: '그림자 대마왕', hp: 40, atk: 7, move: 3, rmin: 1, rmax: 2, aggro: 7, def: 1 };

// =====================================================
//  🔮 히든 스테이지 (스테이지 10을 깨면 열려요)
//  - 친구 4명을 직접 골라서 싸워요. starts: 친구 4명이 서는 자리
//  - boost: 적이 더 세져요 (hp 배수, atk 더하기)
//  - 깨면 함께 싸운 친구가 경험치를 받아요 (적을 많이 잡을수록 많이!)
// =====================================================
const HIDDEN_NAMES = ['', '학교 옥상 정원', '초평 붕어마을', '달밤의 농다리', '두타산 비밀 동굴', '그림자 대마왕의 꿈'];
const HIDDEN_STAGES = {
  1: {
    title: '🔮 히든 1', name: HIDDEN_NAMES[1], boost: { hp: 1.5, atk: 1 },
    map: [
      'FFFFFFFFFFFFFFF',
      'FkkkkkkkkkkkkkF',
      'FkkMkkkkkkkMkkF',
      'FkkkkkkkkkkkkkF',
      'FkkkkkMkMkkkkkF',
      'FkkkkkkkkkkkkkF',
      'FkkMkkkkkkkMkkF',
      'FkkkkkkkkkkkkkF',
      'FkkkkkkkkkkkkkF',
      'FkkkkkkkkkkkkkF',
      'FFFFFFFkFFFFFFF'
    ],
    starts: [{ x: 6, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 10 }],
    enemies: [
      { type: 'slime', x: 3, y: 3, color: '#3a2a5a' }, { type: 'slime', x: 11, y: 3, color: '#3a2a5a' },
      { type: 'crow', x: 5, y: 5 }, { type: 'crow', x: 9, y: 5 }, { type: 'calc', x: 7, y: 2 }
    ],
    intro: [
      { who: 'narr', text: '【🔮 히든 스테이지 1】 초평초등학교 옥상 정원에 수상한 그림자가 나타났어요!' },
      { who: 'heukjin', text: '얘들아, 미안해! 내 마법이 아직 조금 남아 있었나 봐. 같이 해결해 줄래?' },
      { who: 'narr', text: '히든 스테이지의 적은 더 강해요. 적을 많이 물리친 친구일수록 경험치를 많이 받아요!' }
    ]
  },
  2: {
    title: '🔮 히든 2', name: HIDDEN_NAMES[2], boost: { hp: 1.7, atk: 2 },
    map: [
      'hhhhh.hhhh.hhhh',
      'nnnnn.nnnn.nnnn',
      'kkkkkkkkkkkkkkk',
      'kS.....~~~...Sk',
      'k......~~~....k',
      'k...f..~~~..f.k',
      'k.............k',
      'kkkkkkkkkkkkkkk',
      '..T..........T.',
      '...............',
      'TT...........TT'
    ],
    starts: [{ x: 6, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 10 }],
    enemies: [
      { type: 'fish', x: 3, y: 4, color: '#e0a03a' }, { type: 'fish', x: 11, y: 4, color: '#d0803a' },
      { type: 'fish', x: 2, y: 6, color: '#e0b04a' }, { type: 'eel', x: 7, y: 5 }, { type: 'catfish', x: 8, y: 3 }
    ],
    intro: [
      { who: 'narr', text: '【🔮 히든 스테이지 2】 붕어 요리로 유명한 초평 붕어마을! 그런데 연못의 물고기들이 화가 났어요.' },
      { who: 't0', text: '큰 메기 장군이 또 나타났어! 이번엔 더 커졌잖아!' }
    ]
  },
  3: {
    title: '🔮 히든 3', name: HIDDEN_NAMES[3], boost: { hp: 1.9, atk: 2 }, night: true,
    map: [
      'TT..M......M..TT',
      'T..............T',
      '..r..........r..',
      'sssssssbssssssss',
      '~~b~~~~b~~~~~b~~',
      '~~b~~~~b~~~~~b~~',
      'sssssssbssssssss',
      '..r....,,....r..',
      '.......,,.......',
      'T......,,......T',
      'TT.....,,.....TT'
    ],
    starts: [{ x: 7, y: 8 }, { x: 8, y: 8 }, { x: 7, y: 9 }, { x: 8, y: 9 }],
    enemies: [
      { type: 'crab', x: 4, y: 3 }, { type: 'crab', x: 11, y: 3 },
      { type: 'wisp', x: 2, y: 1 }, { type: 'wisp', x: 13, y: 1 }, { type: 'turtle', x: 7, y: 2 }
    ],
    intro: [
      { who: 'narr', text: '【🔮 히든 스테이지 3】 보름달이 뜬 밤, 농다리 위로 도깨비불이 둥둥 떠다녀요.' },
      { who: 't1', text: '밤의 농다리는 처음이야... 거북 대장이 다시 다리를 막고 있어!' }
    ]
  },
  4: {
    title: '🔮 히든 4', name: HIDDEN_NAMES[4], boost: { hp: 2.1, atk: 3 }, night: true,
    map: [
      'MMMMMMMMMMMMMMMM',
      'M,,,,,MM,,,,,,,M',
      'M,,,,,,,,,MM,,,M',
      'M,,MM,,,,,,,,,,M',
      'M,,,,,,~~~,,,,,M',
      'M,,,,,,~~~,,MM,M',
      'MM,,,,,,,,,,,,,M',
      'M,,,MM,,,,,,,,,M',
      'M,,,,,,,,,,MM,,M',
      'M,,,,,,,,,,,,,,M',
      'MMMMMMM,,MMMMMMM'
    ],
    starts: [{ x: 7, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 10 }, { x: 8, y: 10 }],
    enemies: [
      { type: 'bat', x: 3, y: 2 }, { type: 'bat', x: 12, y: 2 },
      { type: 'mushroom', x: 2, y: 7 }, { type: 'fox', x: 10, y: 6 }, { type: 'wolf', x: 8, y: 1 }
    ],
    intro: [
      { who: 'narr', text: '【🔮 히든 스테이지 4】 두타산 깊은 곳, 아무도 몰랐던 비밀 동굴을 찾았어요.' },
      { who: 't2', text: '동굴 안쪽에서 늑대 울음소리가 들려. 모두 조심해!' }
    ]
  },
  5: {
    title: '🔮 히든 5', name: HIDDEN_NAMES[5], boost: { hp: 2.3, atk: 3 }, night: true, giveHidden: true,
    map: [
      'KKKKKKKKKKKKKKKKK',
      'KccccccIJIccccccK',
      'KcIcccccacccccIcK',
      'KcccccccacccccccK',
      'KccIccccaccccIccK',
      'KcccccccacccccccK',
      'KcccccccacccccccK',
      'KccIccccaccccIccK',
      'KcccccccacccccccK',
      'KcIcccccacccccIcK',
      'KcccccccacccccccK',
      'KKKKKKKcacKKKKKKK'
    ],
    starts: [{ x: 7, y: 10 }, { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 11 }],
    enemies: [
      { type: 'wolf', x: 4, y: 4 }, { type: 'eagle', x: 12, y: 5 },
      { type: 'goldscare', x: 3, y: 8 }, { type: 'calc', x: 13, y: 8 }, { type: 'shadow', x: 8, y: 2 }
    ],
    intro: [
      { who: 'narr', text: '【🔮 히든 스테이지 5】 흑진이 꾸던 무서운 꿈속... 그림자 대마왕이 나타났어요!' },
      { who: 'heukjin', text: '저건 내가 소수를 무서워하던 마음이 만든 그림자야. 얘들아, 부탁해!' },
      { who: 'narr', text: '이 스테이지를 깨면 함께 싸운 친구들이 🔮 히든 스킬(두 번째 스킬)을 배워요!' }
    ],
    ending: {
      before: [
        { who: 'narr', text: '그림자 대마왕이 빛 속으로 사라졌어요.', sfx: 'win' },
        { who: 'heukjin', text: '고마워! 이제 무서운 꿈을 꾸지 않을 것 같아. 너희에게 내 숨겨진 힘을 나눠 줄게!' }
      ]
    }
  }
};


// =====================================================
//  👑 중간보스 스테이지 (스테이지 5를 깨면 열리고, 깨야 스테이지 6이 열려요)
//  - 스테이지 5와 같은 친구들이 싸워요. 밤의 초롱길.
//  - 깨면 함께 싸운 친구들에게 👑 왕관 (공격력 +2, 체력 +6)
//  - twin: 보스와 이름이 같은 학생 (그 학생이 우리 편이면 "가짜야!" 대사가 나와요)
// =====================================================
const MIDBOSS = {
  title: '👑 중간보스', name: '67에 중독된 어둠의 별빛', short: '별빛', twin: 'byeolbit',
  storm: '🌀 별빛의 67 회오리!', night: true, isMid: true,
  map: STAGES[5].map,
  heroes: STAGES[5].heroes,
  enemies: [
    { type: 'boss5', x: 9,  y: 1 },
    { type: 'wisp',    x: 4,  y: 4 },
    { type: 'wisp',    x: 12, y: 5 },
    { type: 'mole',    x: 1,  y: 7 },
    { type: 'mole',    x: 14, y: 7 }
  ],
  intro: [
      { who: 'narr', text: '초롱길을 지나 초평호로 가던 밤, 어디선가 이상한 노랫소리가 들려왔어요.' },
      { who: 'boss5', text: '식스~ 세븐! 식스~ 세븐! 67! 67! 67!', shake: true, sfx: 'hit' },
      { who: 'hero', text: '저건... 누구지? 온몸에서 보라색 어둠이 일렁이고 있어!' },
      { who: 'boss5', text: '나는 67에 중독된 어둠의 별빛! 흑진 님이 주신 숫자 67만 있으면 다 돼!' },
      { who: 'boss5', text: '소수점? 그런 건 필요 없어! 6.7도 67, 0.67도 67이야! 으하하!' },
      { who: 'twin', text: '뭐야, 저건 나잖아?! 아니야, 흑진이 만든 어둠의 그림자야!' },
      { who: 'j1', text: '소수점이 없으면 6.7이랑 67은 완전히 다른 수인데!' },
      { who: 'narr', text: '【👑 중간보스】 어둠의 별빛을 물리치고 소수점을 지켜요! 별빛은 3턴마다 주변 친구들을 한꺼번에 공격해요.' }
  ],
  mid: {
    after: 2,
      before: [
        { who: 'boss5', text: '67! 67! 내 숫자 회오리를 받아라!', shake: true },
        { who: 'boss5', text: '이 문제는 소수점 없이는 절대 못 풀걸?' }
      ],
      question: {
        story: '별빛의 막대 사탕 하나는 6.7cm, 다른 하나는 0.67cm예요. 두 사탕의 길이를 더하면 몇 cm일까요?',
        a: 670, op: '+', b: 67, unit: 'cm',
        hint: '6.7은 6.70과 같아요! 소수점끼리 줄을 맞추고 6.70 + 0.67을 계산해요.'
      },
      after2: [
        { who: 'boss5', text: '으윽... 6.7이랑 0.67이 다른 수였다니!' },
        { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }
      ]
  },
  ending: {
      before: [
        { who: 'narr', text: '별빛의 몸을 감싸던 어둠이 스르르 사라졌어요.' },
        { who: 'boss5', text: '어... 나 왜 67만 외치고 있었지? 머리가 빙글빙글 돌아...' },
        { who: 'hero', text: '흑진의 마법에 걸렸던 거야! 마지막으로 이 문제를 같이 풀자!' }
      ],
      question: {
        story: '별빛의 주머니에는 67 사탕이 6.7kg 있었어요. 친구들과 0.7kg을 나눠 먹었어요. 남은 사탕은 몇 kg일까요?',
        a: 670, op: '-', b: 70, unit: 'kg',
        hint: '소수 첫째 자리끼리 7 − 7 = 0, 일의 자리는 6이에요. 6.0은 6과 같아요!'
      },
      after2: [
        { who: 'boss5', text: '6kg! 고마워, 얘들아. 이제 6.7과 67이 다르다는 걸 절대 안 잊을게!', sfx: 'win' },
        { who: 'narr', text: '그때, 하늘에서 반짝이는 왕관이 내려와 함께 싸운 친구들의 머리 위에 살포시 앉았어요!' },
        { who: 'narr', text: '👑 왕관을 쓴 친구는 공격력 +2, 체력 +6! 남은 모험에서 계속 강해져요!' },
        { who: 'boss5', text: '조심해! 흑진은 초평호 물가에서 기다리고 있어!' }
      ]
  },
  tip: '💡 팁: 중간보스는 3턴마다 가까이 있는 친구 모두를 공격해요. 그 턴에는 조금 떨어져 있다가 다시 공격해요!'
};
const CROWN_BONUS = { atk: 2, hp: 6 };

// =====================================================
//  👑 스테이지 보스 (스테이지를 깰 때마다 보스 스테이지가 1개씩 나와요)
//  - 보스 k는 스테이지 k를 깨면 열리고, 보스 k를 깨야 스테이지 k+1이 열려요.
//  - 보스 10(눈꽃)은 보스 9 다음, 흑진(스테이지 10) 바로 앞에 나와요: … 보스 9 → 보스 10 → 스테이지 10(흑진) → 엔딩
//  - 스테이지 10(흑진의 성)에서는 보스 10명의 그림자가 흑진의 부하로 나와요.
//  - 스테이지 k와 같은 지도(밤)·같은 친구들로 싸워요. 부하: 보스 1은 1마리, 보스 2는 2마리, 나머지 3마리
//  - twin: 보스와 이름이 같은 학생 (그 학생이 우리 편이면 "가짜야!" 대사가 나와요)
//  - reward: 'crown' 👑 왕관(공격력 +2, 체력 +6) / 'point' ⚔ 강화 기회 +1
//  - 능력치: 뒤 보스일수록 조금씩 강해져요 (+ 스테이지별 적 강해지기 배수)
// =====================================================
const BOSS_DEFS = {
  1: { name: '기록판을 훔친 번개 토리', short: '토리', twin: 'tori', reward: 'point', storm: '⚡ 번개 토리의 번개 질주!',
       look: { hair: '#2a2030', hairStyle: 'spiky', shirt: '#f2c84b', pants: '#2a2a5a', shoes: '#f4f4f4', cape: '#e0a020', weapon: 'pencil' },
       intro: [
         { who: 'narr', text: '숫자 슬라임이 사라진 운동장에, 갑자기 노란 번개가 번쩍! 떨어졌어요.' },
         { who: 'B', text: '하하하! 기록판의 소수점은 내가 가져간다! 나는 기록판을 훔친 번개 토리!', shake: true, sfx: 'hit' },
         { who: 'B', text: '9.5초가 95초가 되면? 아무도 나보다 빠를 수 없지! 번쩍번쩍!' },
         { who: 'twin', text: '저건 내가 아니야! 흑진이 만든 가짜 나라고!' },
         { who: 'hero', text: '소수점을 돌려줘! 기록이 엉망이 되잖아!' },
         { who: 'narr', text: '【👑 보스 1】 번개 토리를 물리쳐요! 보스는 3턴마다 가까이 있는 친구들을 한꺼번에 공격해요.' }
       ],
       mid: { a: 40, op: '+', b: 30, unit: 'm', story: '번개 토리의 운동화 끈은 한쪽이 0.4m, 다른 쪽이 0.3m예요. 두 끈을 이으면 모두 몇 m일까요?',
              hint: '0.4는 0.1이 4개, 0.3은 0.1이 3개예요. 0.1이 모두 7개면 0.7이에요!',
              before: '번쩍! 내 운동화 끈 문제를 풀어 봐!', after: '으윽, 너무 빨리 풀잖아!' },
       end: { a: 90, op: '-', b: 50, unit: 'L', story: '토리의 물통에 물이 0.9L 있었어요. 달리기를 하고 0.5L를 마셨어요. 남은 물은 몇 L일까요?',
              hint: '0.1이 9개에서 5개를 빼면 0.1이 4개 남아요. 0.4예요!',
              redeem: '헉, 나 왜 번개처럼 뛰어다닌 거지? 기록판 소수점 돌려줄게. 미안해!' } },
  2: { name: '고구마에 홀린 배고픈 도담', short: '도담', twin: 'dodam', reward: 'point', storm: '🍠 도담의 고구마 폭탄!',
       look: { hair: '#7a4a26', hairStyle: 'spiky', shirt: '#9a5a2a', pants: '#3a6a2a', shoes: '#5a3a1a', cape: '#c06a3a', weapon: 'can' },
       intro: [
         { who: 'narr', text: '텃밭 한가운데, 커다란 고구마 더미 위에 누군가 앉아 있었어요.' },
         { who: 'B', text: '냠냠... 고구마 무게표의 소수점은 다 내 거야! 나는 고구마에 홀린 배고픈 도담!', shake: true, sfx: 'hit' },
         { who: 'B', text: '2.4kg이 24kg이 되면 고구마를 훨씬 많이 먹을 수 있잖아!' },
         { who: 'twin', text: '나 배 안 고파! 저건 흑진이 만든 가짜 나야!' },
         { who: 'j1', text: '무게표가 틀리면 고구마를 나눌 수가 없어!' },
         { who: 'narr', text: '【👑 보스 2】 배고픈 도담을 물리쳐요! 보스는 3턴마다 가까이 있는 친구들을 한꺼번에 공격해요.' }
       ],
       mid: { a: 120, op: '+', b: 50, unit: 'kg', story: '도담이가 모은 고구마 바구니는 1.2kg과 0.5kg이에요. 두 바구니는 모두 몇 kg일까요?',
              hint: '소수 첫째 자리끼리 2 + 5 = 7, 일의 자리는 1이에요. 1.7이에요!',
              before: '고구마 문제다! 냠냠!', after: '으앗, 내 고구마 계산이...!' },
       end: { a: 260, op: '-', b: 40, unit: 'kg', story: '도담이는 고구마 2.6kg 중에서 0.4kg을 구워 먹었어요. 남은 고구마는 몇 kg일까요?',
              hint: '소수 첫째 자리끼리 6 − 4 = 2, 일의 자리는 2 그대로예요. 2.2예요!',
              redeem: '배불러서 정신이 들었어... 고구마는 다 같이 나눠 먹자!' } },
  3: { name: '가격표를 뒤섞은 장난꾸러기 보름', short: '보름', twin: 'boreum', reward: 'point', storm: '🏷 보름의 가격표 회오리!',
       look: { hair: '#4a2a1a', hairStyle: 'short', shirt: '#e05a8a', pants: '#5a2a6a', shoes: '#2a1a30', cape: '#ff8ab4', weapon: 'wand' },
       intro: [
         { who: 'narr', text: '마을 가게 앞, 가격표들이 빙글빙글 하늘을 날아다니고 있었어요.' },
         { who: 'B', text: '키득키득! 가격표를 몽땅 뒤섞어 놨지! 나는 장난꾸러기 보름!', shake: true, sfx: 'hit' },
         { who: 'B', text: '1.5L 우유가 15L가 되고, 0.8kg 사과가 8kg이 되면 재밌잖아?' },
         { who: 'twin', text: '나는 그런 장난 안 쳐! 저건 가짜 나야!' },
         { who: 'j2', text: '장난이 너무 심해! 가게 아저씨가 곤란하시잖아!' },
         { who: 'narr', text: '【👑 보스 3】 장난꾸러기 보름을 물리쳐요! 보스는 3턴마다 가까이 있는 친구들을 한꺼번에 공격해요.' }
       ],
       mid: { a: 150, op: '+', b: 80, unit: 'kg', story: '빵집 밀가루 봉지는 1.5kg, 설탕 봉지는 0.8kg이에요. 두 봉지는 모두 몇 kg일까요?',
              hint: '소수 첫째 자리 5 + 8 = 13이에요. 0.1이 13개면 1.3이니까 일의 자리로 1을 올려 줘요!',
              before: '가격표 문제! 맞혀 보시지~ 키득!', after: '어라? 받아올림까지 하다니!' },
       end: { a: 320, op: '-', b: 170, unit: 'm', story: '보름이는 리본 끈 3.2m 중에서 1.7m를 가격표에 묶었어요. 남은 끈은 몇 m일까요?',
              hint: '소수 첫째 자리에서 2에서 7을 뺄 수 없어요. 일의 자리에서 1을 빌려 와서 12 − 7을 해요!',
              redeem: '장난이 너무 지나쳤어. 가격표 다시 붙이는 거 내가 도울게!' } },
  4: { name: '돌다리를 흔드는 바위주먹 두리', short: '두리', twin: 'duri', reward: 'point', storm: '🪨 두리의 바위 쿵쾅!',
       look: { hair: '#5a3a2a', hairStyle: 'spiky', shirt: '#7a7a8a', pants: '#3a3a4a', shoes: '#2a2a2a', cape: '#6a5a4a', weapon: 'gloves' },
       intro: [
         { who: 'narr', text: '농다리가 쿵! 쿵! 흔들렸어요. 돌 위에 커다란 주먹을 든 누군가가 서 있었어요.' },
         { who: 'B', text: '쿵쾅! 나는 돌다리를 흔드는 바위주먹 두리! 돌의 무게표 소수점은 내가 다 부숴 버렸지!', shake: true, sfx: 'hit' },
         { who: 'B', text: '2.4m 돌이 24m가 되면 다리가 하늘까지 닿겠지? 으하하!' },
         { who: 'twin', text: '나는 다리를 지키는 사람이야! 저건 가짜야!' },
         { who: 'j3', text: '천 년 된 다리가 무너지면 안 돼!' },
         { who: 'narr', text: '【👑 보스 4 ⭐】 바위주먹 두리를 물리쳐요! 자릿수가 다른 소수 문제가 나와요.' }
       ],
       mid: { a: 240, op: '+', b: 35, unit: 'm', story: '농다리 돌 하나의 높이는 2.4m예요. 그 위에 0.35m짜리 돌을 올리면 모두 몇 m일까요?',
              hint: '2.4는 2.40과 같아요! 소수점끼리 줄을 맞추고 2.40 + 0.35를 계산해요.',
              before: '자릿수가 다른 소수다! 쿵쾅!', after: '내 바위 주먹보다 계산이 더 단단하잖아!' },
       end: { a: 350, op: '-', b: 125, unit: 'km', story: '농다리에서 마을까지는 3.5km예요. 1.25km를 걸었다면 몇 km가 남았을까요?',
              hint: '3.5는 3.50과 같아요! 3.50 − 1.25를 계산해요. 소수 둘째 자리 0에서 5를 뺄 수 없으니 받아내림을 해요.',
              redeem: '주먹이 아파... 다리를 흔들어서 미안해. 이제 돌다리를 지킬게!' } },
  // 5: 중간보스 (아래 MIDBOSS의 이야기를 그대로 써요)
  5: { name: '67에 중독된 어둠의 별빛', short: '별빛', twin: 'byeolbit', reward: 'crown', storm: '🌀 별빛의 67 회오리!',
       voice: { g: 'm', d: -0.3, r: 1.15 },
       look: { hair: '#1a1a2a', hairStyle: 'short', shirt: '#2a1a3a', pants: '#1a1020', shoes: '#0a0a10', cape: '#5a1a8a' } },
  6: { name: '소수점을 낚아챈 낚시왕 물결', short: '물결', twin: 'mulgyeol', reward: 'point', storm: '🎣 물결의 물보라 낚싯대!',
       look: { hair: '#2a3a6a', hairStyle: 'short', glasses: true, shirt: '#3a8ad0', pants: '#1a3a5a', shoes: '#2a2a2a', cape: '#2a6aa0', weapon: 'staff' },
       intro: [
         { who: 'narr', text: '초평호 물가, 커다란 낚싯대가 휙! 하고 하늘을 갈랐어요.' },
         { who: 'B', text: '월척이다! 물고기 무게표의 소수점을 몽땅 낚았지! 나는 낚시왕 물결!', shake: true, sfx: 'hit' },
         { who: 'B', text: '1.7kg 붕어가 17kg이 되면 내가 세계 최고의 낚시왕이야!' },
         { who: 'twin', text: '안경까지 똑같네?! 그래도 저건 가짜 나야!' },
         { who: 'j5', text: '호수 물고기들이 무게를 잃어서 헤엄을 못 치고 있어!' },
         { who: 'narr', text: '【👑 보스 6】 낚시왕 물결을 물리쳐요! 보스는 3턴마다 가까이 있는 친구들을 한꺼번에 공격해요.' }
       ],
       mid: { a: 270, op: '+', b: 160, unit: 'kg', story: '물결이가 낚은 붕어는 2.7kg, 잉어는 1.6kg이에요. 두 마리는 모두 몇 kg일까요?',
              hint: '소수 첫째 자리 7 + 6 = 13이에요. 0.1이 13개면 1.3이니까 일의 자리로 1을 올려 줘요!',
              before: '물고기 문제를 낚아 보시지!', after: '내 낚싯대보다 빠르잖아!' },
       end: { a: 510, op: '-', b: 260, unit: 'm', story: '물결이의 낚싯줄은 5.1m였어요. 2.6m가 끊어졌다면 남은 줄은 몇 m일까요?',
              hint: '소수 첫째 자리에서 1에서 6을 뺄 수 없어요. 일의 자리에서 1을 빌려 와서 11 − 6을 해요!',
              redeem: '안경에 김이 서려서 아무것도 안 보였어... 물고기들 다 놓아 줄게!' } },
  7: { name: '구름 위의 바람술사 하늬', short: '하늬', twin: 'hanui', reward: 'point', storm: '🌪 하늬의 회오리 바람!',
       look: { hair: '#1a3a6a', hairStyle: 'spiky', shirt: '#e8f4ff', pants: '#5a8ad0', shoes: '#f4f4f4', cape: '#9ad0ff', weapon: 'wand' },
       intro: [
         { who: 'narr', text: '하늘다리 위로 하얀 구름이 몰려오더니, 그 위에 누군가 둥실 떠 있었어요.' },
         { who: 'B', text: '휘이잉~ 나는 구름 위의 바람술사 하늬! 바람으로 소수점을 모두 날려 버렸지!', shake: true, sfx: 'hit' },
         { who: 'B', text: '1.45km가 145km가 되면 아무도 하늘다리를 못 건널걸?' },
         { who: 'twin', text: '나는 구름 위에 못 떠! 저건 가짜 나야!' },
         { who: 'j6', text: '바람이 너무 세서 다리가 흔들려!' },
         { who: 'narr', text: '【👑 보스 7 ⭐】 바람술사 하늬를 물리쳐요! 자릿수가 다른 소수 문제가 나와요.' }
       ],
       mid: { a: 145, op: '+', b: 230, unit: 'km', story: '하늘다리 첫째 길은 1.45km, 둘째 길은 2.3km예요. 두 길은 모두 몇 km일까요?',
              hint: '2.3은 2.30과 같아요! 소수점끼리 줄을 맞추고 1.45 + 2.30을 계산해요.',
              before: '자릿수가 다른 바람 문제다! 휘이잉~', after: '바람보다 빠른 계산이라니!' },
       end: { a: 420, op: '-', b: 165, unit: 'km', story: '하늘다리 끝까지는 4.2km예요. 1.65km를 왔다면 몇 km가 남았을까요?',
              hint: '4.2는 4.20과 같아요! 4.20 − 1.65를 계산해요. 소수 둘째 자리 0에서 5를 뺄 수 없으니 받아내림을 해요.',
              redeem: '바람이 멈췄다... 이제 하늘다리를 시원한 바람으로만 지킬게!' } },
  8: { name: '허수아비를 부리는 황금 노을', short: '노을', twin: 'noeul', reward: 'point', storm: '🌾 노을의 황금 벼 폭풍!',
       look: { hair: '#3a2010', hairStyle: 'ponytail', band: '#f2c84b', ribbon: '#f2c84b', shirt: '#f2c84b', pants: '#8a5a10', shoes: '#5a3a1a', cape: '#d8a020', weapon: 'spear' },
       intro: [
         { who: 'narr', text: '황금빛 들판 한가운데, 허수아비들이 줄을 맞춰 서서 누군가에게 인사했어요.' },
         { who: 'B', text: '허수아비들아, 일어나라! 나는 허수아비를 부리는 황금 노을!', shake: true, sfx: 'hit' },
         { who: 'B', text: '쌀 3.8kg이 38kg이 되면 들판의 쌀은 다 내 거야! 반짝반짝!' },
         { who: 'twin', text: '나는 허수아비랑 친하지 않아! 저건 가짜 나야!' },
         { who: 'j7', text: '할머니 논의 쌀 무게를 돌려줘!' },
         { who: 'narr', text: '【👑 보스 8】 황금 노을을 물리쳐요! 보스는 3턴마다 가까이 있는 친구들을 한꺼번에 공격해요.' }
       ],
       mid: { a: 380, op: '+', b: 240, unit: 'kg', story: '황금 노을이 모은 벼는 아침에 3.8kg, 오후에 2.4kg이에요. 모두 몇 kg일까요?',
              hint: '소수 첫째 자리 8 + 4 = 12예요. 0.1이 12개면 1.2니까 일의 자리로 1을 올려 줘요!',
              before: '황금 벼 문제다! 반짝반짝!', after: '내 황금 벼 계산이 들켰어!' },
       end: { a: 730, op: '-', b: 350, unit: 'kg', story: '노을이는 쌀 7.3kg 중에서 3.5kg을 할머니께 돌려드렸어요. 남은 쌀은 몇 kg일까요?',
              hint: '소수 첫째 자리에서 3에서 5를 뺄 수 없어요. 일의 자리에서 1을 빌려 와서 13 − 5를 해요!',
              redeem: '황금빛에 눈이 부셔서 정신이 없었나 봐. 쌀은 모두 할머니께 돌려드릴게!' } },
  9: { name: '그림자 숲의 늑대 그늘', short: '그늘', twin: 'geuneul', reward: 'point', storm: '🐺 그늘의 그림자 울음!',
       look: { hair: '#6a4a2a', hairStyle: 'spiky', shirt: '#2a3a2a', pants: '#1a2a1a', shoes: '#1a1010', cape: '#3a2a4a', weapon: 'top' },
       intro: [
         { who: 'narr', text: '두타산 숲이 갑자기 어두워지더니, 나무 사이에서 늑대 울음소리가 들렸어요.' },
         { who: 'B', text: '아우우~! 나는 그림자 숲의 늑대 그늘! 숲의 소수점은 그림자 속에 숨겨 버렸지!', shake: true, sfx: 'hit' },
         { who: 'B', text: '4.6m 나무가 46m가 되면 숲이 온통 그림자로 덮일 거야!' },
         { who: 'twin', text: '나 늑대 흉내는 잘 내지만... 저건 진짜 가짜 나야!' },
         { who: 'j8', text: '숲이 어두워서 길을 찾을 수가 없어!' },
         { who: 'narr', text: '【👑 보스 9】 그림자 늑대 그늘을 물리쳐요! 보스는 3턴마다 가까이 있는 친구들을 한꺼번에 공격해요.' }
       ],
       mid: { a: 460, op: '+', b: 370, unit: 'm', story: '숲속 소나무는 4.6m, 그 옆 참나무는 3.7m예요. 두 나무의 높이를 더하면 몇 m일까요?',
              hint: '소수 첫째 자리 6 + 7 = 13이에요. 0.1이 13개면 1.3이니까 일의 자리로 1을 올려 줘요!',
              before: '그림자 문제다! 아우우~!', after: '그림자 속에서도 정답을 찾다니!' },
       end: { a: 840, op: '-', b: 580, unit: 'km', story: '숲 입구에서 흑진의 성까지는 8.4km예요. 5.8km를 왔다면 몇 km가 남았을까요?',
              hint: '소수 첫째 자리에서 4에서 8을 뺄 수 없어요. 일의 자리에서 1을 빌려 와서 14 − 8을 해요!',
              redeem: '어둠이 걷혔어... 숲의 길은 내가 잘 알아. 성까지 안내해 줄게!' } },
  10: { name: '흑진의 성을 지키는 얼음 여왕 눈꽃', short: '눈꽃', twin: 'nunkkot', reward: 'point', storm: '❄ 얼음 여왕의 눈보라!',
       look: { hair: '#2a1a10', hairStyle: 'long', ribbon: '#bfe8ff', shirt: '#bfe8ff', pants: '#5a8ad0', shoes: '#e8f8ff', cape: '#e8f8ff', crown: true, weapon: 'spear' },
       intro: [
         { who: 'narr', text: '초평호 한가운데 흑진의 성 앞, 갑자기 차가운 눈보라가 몰아쳤어요.' },
         { who: 'B', text: '후후후... 여기서부터는 못 지나가! 나는 흑진의 성을 지키는 얼음 여왕 눈꽃!', shake: true, sfx: 'hit' },
         { who: 'heukjin', text: '잘한다, 눈꽃아! 저 녀석들을 꽁꽁 얼려 버려라! 으하하!', ghost: 'show' },
         { who: 'twin', text: '얼음 여왕이라니! 저건 흑진이 만든 가짜 나야!', ghost: 'hide' },
         { who: 'hero', text: '흑진의 성이 바로 앞이야! 여기서 멈출 수 없어!' },
         { who: 'narr', text: '【👑 보스 10 ⭐】 얼음 여왕 눈꽃을 물리치고 흑진의 성으로 들어가요! 자릿수가 다른 소수 문제가 나와요.' }
       ],
       mid: { a: 375, op: '+', b: 260, unit: 'm', story: '얼음 여왕의 얼음 기둥은 3.75m예요. 그 위에 2.6m짜리 얼음을 또 쌓았어요. 모두 몇 m일까요?',
              hint: '2.6은 2.60과 같아요! 3.75 + 2.60을 계산해요. 소수 첫째 자리 7 + 6 = 13이니까 일의 자리로 1을 올려 줘요.',
              before: '얼음처럼 차가운 문제다! 후후후...', after: '내 얼음이... 녹고 있어!' },
       end: { a: 620, op: '-', b: 285, unit: 'L', story: '성의 얼음물 6.2L 중에서 2.85L가 녹아서 흘러내렸어요. 남은 얼음물은 몇 L일까요?',
              hint: '6.2는 6.20과 같아요! 6.20 − 2.85를 계산해요. 소수 둘째 자리 0에서 5를 뺄 수 없으니 받아내림을 해요.',
              redeem: '따뜻해... 이제 얼음 대신 반짝이는 눈꽃으로 소수점을 지켜 줄게. 성문을 열어 줄게!' } }
};

// 보스 능력: 뒤 보스일수록 조금씩 강해져요 (보스 5 = 중간보스, 흑진의 절반쯤)
//   체력 16 + 6×번호, 공격 3 + 번호의 절반(올림), 방어 0~2  (+ 스테이지별 적 강해지기 배수)
function bossBase(k) {
  return { hp: 16 + 6 * k, atk: 3 + Math.ceil(k / 2), def: k >= 8 ? 2 : k >= 4 ? 1 : 0,
           move: 3, rmin: 1, rmax: k >= 6 ? 2 : 1, aggro: 7 };
}
const BOSS_STAGES = {};
Object.keys(BOSS_DEFS).forEach(ks => {
  const k = Number(ks), D = BOSS_DEFS[k], key = 'boss' + k, base = STAGES[k];
  ENEMIES[key] = { name: D.name, ...bossBase(k), fly: k === 6 || k === 7 };   // 낚시왕·바람술사는 물 위도 날아다녀요
  CHARACTERS[key] = { name: D.name, role: k === 5 ? '중간보스' : '보스', look: D.look };
  // 보스 자리: 그 스테이지에서 가장 센 적의 자리. 부하: 나머지 중 약한 적 (스테이지 1·2는 2마리, 나머지 3마리)
  const ens = base.enemies.map(e => ({ ...e, hp0: (e.hp || ENEMIES[e.type].hp) }));
  const strong = ens.reduce((a, b) => (b.hp0 > a.hp0 ? b : a));
  const minions = ens.filter(e => e !== strong).sort((a, b) => a.hp0 - b.hp0).slice(0, k === 1 ? 1 : k === 2 ? 2 : 3)
    .map(e => ({ type: e.type, x: e.x, y: e.y, color: e.color }));
  const R = L => ({ ...L, who: L.who === 'B' ? key : L.who });
  const st = {
    title: k === 5 ? '👑 중간보스' : `👑 보스 ${k}`, name: D.name, short: D.short, twin: D.twin, storm: D.storm, night: true, bossNo: k,
    map: base.map, heroes: base.heroes,
    enemies: [{ type: key, x: strong.x, y: strong.y }, ...minions],
    tip: `💡 팁: ${D.short} 보스는 3턴마다 가까이 있는 친구 모두를 공격해요. 그 턴에는 조금 떨어져 있다가 다시 공격해요!`
  };
  if (D.intro) {
    st.intro = D.intro.map(R);
    st.mid = { after: 2,
      before: [{ who: key, text: D.mid.before, shake: true }],
      question: { story: D.mid.story, a: D.mid.a, op: D.mid.op, b: D.mid.b, unit: D.mid.unit, hint: D.mid.hint },
      after2: [{ who: key, text: D.mid.after },
               { who: 'narr', text: '정답의 빛이 반짝! 친구들의 체력이 모두 회복되었어요!', sfx: 'correct', heal: true }] };
    st.ending = {
      before: [{ who: 'narr', text: `${D.short}의 몸을 감싸던 어둠이 스르르 사라졌어요.` },
               { who: key, text: D.end.redeem },
               { who: 'hero', text: '괜찮아! 마지막으로 이 문제를 같이 풀자!' }],
      question: { story: D.end.story, a: D.end.a, op: D.end.op, b: D.end.b, unit: D.end.unit, hint: D.end.hint },
      after2: [{ who: 'narr', text: `정답! 되찾은 소수점이 반짝이며 제자리로 돌아갔어요!`, sfx: 'win' },
               { who: 'narr', text: '⚔ 보스를 물리친 상으로 강화 기회 +1번!' }] };
  }
  BOSS_STAGES[k] = st;
});

// 보스 5(중간보스)는 위 MIDBOSS의 이야기·왕관 장면을 그대로 써요
Object.assign(BOSS_STAGES[5], { intro: MIDBOSS.intro, mid: MIDBOSS.mid, ending: MIDBOSS.ending, tip: MIDBOSS.tip });

// =====================================================
//  👻 스테이지 10: 흑진이 부르는 보스 10명의 그림자 (부하)
//  - 그림자는 진짜 보스보다 약해요: 체력 30%, 공격력 3 + 번호÷3(내림), 특수 공격 없음
//  - 약한 보스는 앞쪽, 센 보스는 흑진 가까이에 서 있어요
// =====================================================
function bossShadow(type) {
  const k = Number(type.replace('boss', '')), b = bossBase(k);
  return { name: BOSS_DEFS[k].short + '의 그림자', hp: Math.round(b.hp * 0.3), atk: 3 + Math.floor(k / 3), def: b.def ? 1 : 0,
           move: 3, rmin: 1, rmax: b.rmax, aggro: 6, fly: k === 6 || k === 7 };
}
STAGES[10].enemies = [
  { type: 'boss1', x: 5,  y: 9, shadow: true }, { type: 'boss2', x: 15, y: 9, shadow: true },
  { type: 'boss3', x: 3,  y: 8, shadow: true }, { type: 'boss4', x: 17, y: 8, shadow: true },
  { type: 'boss5', x: 7,  y: 6, shadow: true }, { type: 'boss6', x: 13, y: 6, shadow: true },
  { type: 'boss7', x: 5,  y: 4, shadow: true }, { type: 'boss8', x: 15, y: 4, shadow: true },
  { type: 'boss9', x: 8,  y: 3, shadow: true }, { type: 'boss10', x: 12, y: 3, shadow: true },
  { type: 'heukjin', x: 10, y: 3 }
];
(() => {   // "나의 마지막 부하들아, 모두 나와라!" → 보스 그림자를 불러내는 장면으로
  const L = STAGES[10].intro, i = L.findIndex(x => x.who === 'heukjin' && x.text.includes('마지막 부하들아'));
  L.splice(i < 0 ? 7 : i, i < 0 ? 0 : 1,
    { who: 'heukjin', text: '시끄럽다! 너희가 물리친 보스들의 그림자야, 모두 나와라!', shake: true, sfx: 'hit' },
    { who: 'narr', text: '흑진이 손을 번쩍 들자, 지금까지 물리친 보스 10명의 그림자가 스르르 나타났어요!' },
    { who: 'hero', text: '그림자는 진짜 보스보다 약해! 하나씩 물리치고 흑진에게 가자!' });
})();
