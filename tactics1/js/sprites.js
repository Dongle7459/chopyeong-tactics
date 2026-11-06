// =====================================================
//  도트 그림 (캐릭터, 슬라임, 지도 타일)
//  그림 파일 없이 코드로 한 칸씩 그려요.
// =====================================================

const SKIN = '#f5c9a0';
const OUTLINE = '#1a1020';

// 사람 캐릭터(2등신)를 이루는 네모 조각들
// 조각: {x, y, w, h, c, o}  o=false면 테두리 없음
function chibiParts(look, frame) {
  const P = [];
  const b = frame ? 1 : 0; // 숨 쉬듯 위아래로 움직임
  const add = (x, y, w, h, c, o = true) => P.push({ x, y, w, h, c, o });

  if (look.cape) add(3, 8 + b, 10, 6 - b, look.cape);          // 망토
  add(5, 13, 2, 2, look.pants); add(9, 13, 2, 2, look.pants);   // 다리
  add(5, 15, 2, 1, look.shoes, false); add(9, 15, 2, 1, look.shoes, false);
  add(4, 9 + b, 8, 4, look.shirt);                              // 몸
  add(4, 12 + b, 8, 1, look.pants, false);                      // 허리
  add(3, 1 + b, 10, 8, SKIN);                                   // 얼굴
  if (look.hairStyle === 'long') { add(2, 2 + b, 2, 9, look.hair); add(12, 2 + b, 2, 9, look.hair); } // 긴 머리
  if (look.hairStyle === 'bob') { add(2, 2 + b, 2, 6, look.hair); add(12, 2 + b, 2, 6, look.hair); }  // 단발
  if (look.hairStyle === 'ponytail') { add(0, 2 + b, 3, 6, look.hair); add(2, 1 + b, 2, 3, look.hair); } // 묶은 머리
  add(3, 0 + b, 10, 3, look.hair);                              // 머리카락
  if (look.ribbon) { add(10, -1 + b, 4, 2, look.ribbon); add(11, -1 + b, 2, 2, '#ff8ab4', false); }
  if (look.band) add(3, 2 + b, 10, 1, look.band, false);   // 머리띠
  add(3, 3 + b, 1, 3, look.hair, false); add(12, 3 + b, 1, 3, look.hair, false);
  add(4, 3 + b, 1, 1, look.hair, false); add(6, 3 + b, 2, 1, look.hair, false); add(10, 3 + b, 1, 1, look.hair, false);
  if (look.hairStyle === 'spiky') {
    add(4, -1 + b, 2, 1, look.hair); add(7, -1 + b, 2, 1, look.hair); add(10, -1 + b, 2, 1, look.hair);
  }
  if (look.crown) {
    add(4, -2 + b, 8, 2, '#f2c84b');
    add(4, -3 + b, 1, 1, '#f2c84b', false); add(7, -3 + b, 2, 1, '#f2c84b', false); add(11, -3 + b, 1, 1, '#f2c84b', false);
    add(7, -2 + b, 2, 1, '#d8424a', false);
  }
  // 눈과 볼
  if (look.glasses) {
    add(4, 4 + b, 3, 2, OUTLINE, false); add(9, 4 + b, 3, 2, OUTLINE, false); add(7, 4 + b, 2, 1, OUTLINE, false);
    add(5, 4 + b, 1, 1, '#9ad0ff', false); add(10, 4 + b, 1, 1, '#9ad0ff', false);
  } else {
    add(5, 5 + b, 1, 2, OUTLINE, false); add(10, 5 + b, 1, 2, OUTLINE, false);
    add(5, 5 + b, 1, 1, '#ffffff', false); add(10, 5 + b, 1, 1, '#ffffff', false);
  }
  add(4, 7 + b, 1, 1, '#f08a8a', false); add(11, 7 + b, 1, 1, '#f08a8a', false);
  if (look.mustache) add(5, 7 + b, 6, 1, look.hair, false);
  else add(7, 7 + b, 2, 1, '#c0605a', false);
  // 팔
  add(3, 9 + b, 1, 3, SKIN); add(12, 9 + b, 1, 3, SKIN);
  // 무기
  if (look.weapon === 'pencil') {
    add(13, 4 + b, 2, 8, '#f2c84b');
    add(13, 3 + b, 2, 1, '#f5c9a0', false); add(13, 2 + b, 2, 1, '#2a2030', false);
    add(13, 12 + b, 2, 1, '#e88a9a', false);
  } else if (look.weapon === 'bow') {
    add(14, 4 + b, 1, 9, '#e8d27a');
    add(13, 3 + b, 1, 1, '#e8d27a', false); add(13, 13 + b, 1, 1, '#e8d27a', false);
    add(13, 4 + b, 1, 9, '#ffffff', false);
    for (let i = 0; i < 4; i++) add(14, 5 + i * 2 + b, 1, 1, '#5c3a1e', false); // 자 눈금
  } else if (look.weapon === 'shield') { // 책가방 방패
    add(11, 7 + b, 5, 7, '#d8424a');
    add(12, 8 + b, 3, 1, '#f2c84b', false);
    add(12, 10 + b, 3, 3, '#a02a3a', false);
  } else if (look.weapon === 'gloves') { // 돌 장갑
    add(1, 10 + b, 3, 3, '#8a8a98'); add(12, 10 + b, 3, 3, '#8a8a98');
    add(2, 10 + b, 1, 1, '#c0c0cc', false); add(13, 10 + b, 1, 1, '#c0c0cc', false);
  } else if (look.weapon === 'staff') { // 공책 지팡이
    add(14, 4 + b, 1, 10, '#8a5a32');
    add(12, 1 + b, 4, 3, '#ffffff');
    add(12, 2 + b, 4, 1, '#5ab0e8', false);
    add(13, 0 + b, 2, 1, '#ffe27a', false);
  } else if (look.weapon === 'wand') { // 물방울 지팡이
    add(14, 4 + b, 1, 10, '#3a80b8');
    add(13, 1 + b, 3, 3, '#7ac8ff');
    add(14, 0 + b, 1, 1, '#7ac8ff', false); add(13, 2 + b, 1, 1, '#ffffff', false);
  } else if (look.weapon === 'top') { // 무지개 팽이
    add(12, 10 + b, 4, 2, '#e0503a');
    add(13, 9 + b, 2, 1, '#f2c84b', false); add(13, 12 + b, 2, 1, '#5cc04a', false); add(14, 13 + b, 1, 1, '#3a6ee8', false);
  } else if (look.weapon === 'spear') { // 빛의 창
    add(14, 3 + b, 1, 11, '#e8f4ff');
    add(13, 1 + b, 3, 2, '#ffe27a'); add(14, 0 + b, 1, 1, '#ffffff', false);
    add(13, 9 + b, 3, 1, '#f2c84b', false);
  } else if (look.weapon === 'can') { // 물뿌리개
    add(12, 9 + b, 3, 3, '#5ab0e8');
    add(15, 8 + b, 1, 1, '#5ab0e8');
    add(13, 8 + b, 1, 1, '#3a80b8', false);
    add(13, 10 + b, 1, 1, '#9ad8ff', false);
  }
  return P;
}

// 숫자 두더지 (노란 안전모를 쓴 두더지)
function moleParts(frame) {
  const P = [];
  const b = frame ? 1 : 0;
  const add = (x, y, w, h, c, o = true) => P.push({ x, y, w, h, c, o });
  add(1, 13, 14, 3, '#3a2a1a');                         // 구멍
  add(3, 5 + b, 10, 9 - b, '#8a5a3a');                  // 몸
  add(4, 4 + b, 8, 1, '#8a5a3a', false);
  add(5, 9 + b, 6, 4 - b, '#c89a70', false);           // 배
  add(5, 6 + b, 1, 1, OUTLINE, false); add(10, 6 + b, 1, 1, OUTLINE, false); // 눈
  add(7, 7 + b, 2, 1, '#ff8ab4', false);               // 코
  add(4, 8 + b, 1, 1, '#f08a8a', false); add(11, 8 + b, 1, 1, '#f08a8a', false);
  add(1, 9 + b, 2, 2, '#f5e0c0'); add(13, 9 + b, 2, 2, '#f5e0c0'); // 발톱
  add(4, 2 + b, 8, 2, '#f2c84b'); add(3, 4 + b, 10, 1, '#f2c84b'); // 안전모
  add(7, 2 + b, 2, 1, '#ffffff', false);
  return P;
}

// 숫자 까마귀
function crowParts(f) {
  const P = [], add = (x, y, w, h, c, o = true) => P.push({ x, y, w, h, c, o });
  add(6, 12, 1, 3, '#f2a020', false); add(9, 12, 1, 3, '#f2a020', false);
  add(3, 6, 9, 6, '#2a2a3a');
  add(2, 8, 1, 3, '#2a2a3a');
  add(9, 3, 5, 5, '#2a2a3a');
  add(14, 5, 2, 2, '#f2c84b');
  add(11, 4, 2, 2, '#ffffff', false); add(12, 5, 1, 1, OUTLINE, false);
  if (f) add(3, 3, 6, 3, '#4a4a64'); else add(3, 9, 6, 3, '#4a4a64');
  add(5, 8, 3, 2, '#ffe27a', false); // 훔친 소수점
  return P;
}
// 계산기 골렘
function calcParts(f) {
  const b = f ? 1 : 0, P = [], add = (x, y, w, h, c, o = true) => P.push({ x, y, w, h, c, o });
  add(5, 14, 2, 2, '#5a5a68'); add(9, 14, 2, 2, '#5a5a68');
  add(1, 8 + b, 2, 4, '#8a90a0'); add(13, 8 + b, 2, 4, '#8a90a0');
  add(3, 1 + b, 10, 13 - b, '#8a90a0');
  add(4, 2 + b, 8, 4, '#a8d870', false);
  add(5, 3 + b, 2, 1, OUTLINE, false); add(9, 3 + b, 2, 1, OUTLINE, false);
  add(6, 5 + b, 4, 1, OUTLINE, false);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++)
    add(4 + c * 2, 7 + r * 2 + b, 1, 1, c === 3 ? '#f2a020' : '#f4f4f4', false);
  return P;
}
// 돌 게
function crabParts(f) {
  const b = f ? 1 : 0, P = [], add = (x, y, w, h, c, o = true) => P.push({ x, y, w, h, c, o });
  add(2, 13, 2, 1, '#b03a2a'); add(5, 13, 1, 2, '#b03a2a'); add(10, 13, 1, 2, '#b03a2a'); add(12, 13, 2, 1, '#b03a2a');
  add(5, 5, 1, 3, '#e0503a'); add(10, 5, 1, 3, '#e0503a');
  add(4, 3, 2, 2, '#ffffff'); add(10, 3, 2, 2, '#ffffff');
  add(5, 4, 1, 1, OUTLINE, false); add(10, 4, 1, 1, OUTLINE, false);
  add(3, 8 + b, 10, 5 - b, '#e0503a'); add(4, 7 + b, 8, 1, '#e0503a', false);
  add(5, 9 + b, 2, 1, '#ff9a80', false); add(9, 9 + b, 2, 1, '#ff9a80', false);
  add(7, 11, 2, 1, OUTLINE, false);
  add(0, 5 + b, 3, 3, '#e0503a'); add(13, 5 + b, 3, 3, '#e0503a');
  add(1, 5 + b, 1, 1, '#ffb0a0', false); add(14, 5 + b, 1, 1, '#ffb0a0', false);
  return P;
}
// 거북 대장
function turtleParts(f) {
  const b = f ? 1 : 0, P = [], add = (x, y, w, h, c, o = true) => P.push({ x, y, w, h, c, o });
  add(3, 12, 2, 3, '#8ac06a'); add(10, 12, 2, 3, '#8ac06a');
  add(12, 7 + b, 4, 4, '#8ac06a');
  add(14, 8 + b, 1, 1, OUTLINE, false);
  add(2, 5 + b, 11, 7, '#3a8a4a'); add(4, 4 + b, 7, 1, '#3a8a4a', false);
  add(4, 6 + b, 2, 2, '#6ac06a', false); add(8, 6 + b, 2, 2, '#6ac06a', false); add(6, 9 + b, 2, 2, '#6ac06a', false);
  add(2, 11 + b, 11, 1, '#d8c070', false);
  add(5, 2 + b, 5, 2, '#f2c84b'); add(5, 1 + b, 1, 1, '#f2c84b', false); add(7, 1 + b, 1, 1, '#f2c84b', false); add(9, 1 + b, 1, 1, '#f2c84b', false);
  return P;
}
// 도깨비불
function wispParts(f) {
  const P = [], add = (x, y, w, h, c, o = true) => P.push({ x, y, w, h, c, o });
  const u = f ? 1 : 0;
  add(4, 6, 8, 8, '#4ab0ff');
  add(5, 4 - u, 6, 2, '#4ab0ff');
  add(7, 2 - u, 2, 2, '#4ab0ff');
  add(5 + u, 1 - u, 1, 2, '#4ab0ff', false);
  add(6, 7, 4, 6, '#b8ecff', false);
  add(6, 9, 1, 2, OUTLINE, false); add(9, 9, 1, 2, OUTLINE, false);
  add(7, 12, 2, 1, OUTLINE, false);
  return P;
}
// 초롱 도깨비
function goblinParts(f) {
  const b = f ? 1 : 0, P = [], add = (x, y, w, h, c, o = true) => P.push({ x, y, w, h, c, o });
  add(5, 13, 2, 3, '#e05a4a'); add(9, 13, 2, 3, '#e05a4a');
  add(4, 9 + b, 8, 4, '#f2c84b');
  add(5, 10 + b, 1, 3, OUTLINE, false); add(8, 10 + b, 1, 3, OUTLINE, false); add(10, 10 + b, 1, 2, OUTLINE, false);
  add(2, 9 + b, 2, 3, '#e05a4a'); add(12, 9 + b, 1, 3, '#e05a4a');
  add(3, 1 + b, 10, 8, '#e05a4a');
  add(3, 0 + b, 10, 2, '#2a2030');
  add(7, -2 + b, 2, 2, '#f2c84b');
  add(5, 4 + b, 2, 2, '#ffffff', false); add(9, 4 + b, 2, 2, '#ffffff', false);
  add(6, 5 + b, 1, 1, OUTLINE, false); add(9, 5 + b, 1, 1, OUTLINE, false);
  add(6, 7 + b, 4, 1, OUTLINE, false);
  add(6, 8 + b, 1, 1, '#ffffff', false); add(9, 8 + b, 1, 1, '#ffffff', false);
  add(13, 6 + b, 3, 5, '#ff7a3a');
  add(13, 8 + b, 3, 1, '#c8402a', false); add(14, 5 + b, 1, 1, '#2a2030', false); add(14, 7 + b, 1, 1, '#ffe0a0', false);
  return P;
}

// ---------- 스테이지 6~10 적 ----------
const mk = () => { const P = []; return [P, (x, y, w, h, c, o = true) => P.push({ x, y, w, h, c, o })]; };
function fishParts(f, color = '#e0a03a') { // 붕어 병사
  const b = f ? 1 : 0, [P, add] = mk();
  add(5, 12, 1, 3, '#c8803a'); add(9, 12, 1, 3, '#c8803a');
  add(13, 5 + b, 3, 7, color);
  add(2, 6 + b, 11, 6, color); add(4, 5 + b, 7, 1, color, false);
  add(6, 4 + b, 3, 1, '#c8803a');
  add(4, 7 + b, 2, 2, '#ffffff', false); add(4, 8 + b, 1, 1, OUTLINE, false);
  add(2, 9 + b, 1, 1, OUTLINE, false);
  add(6, 8 + b, 5, 1, '#f8d080', false); add(7, 10 + b, 4, 1, '#f8d080', false);
  add(0, 1, 1, 13, '#8a5a32'); add(0, 0, 1, 2, '#c8c8d8', false);
  return P;
}
function eelParts(f) { // 뱀장어
  const u = f ? 1 : 0, [P, add] = mk(), c = '#4a7a4a';
  add(1, 10 - u, 3, 3, c); add(4, 9 + u, 3, 3, c); add(7, 10 - u, 3, 3, c);
  add(10, 6, 5, 5, c);
  add(10, 9, 5, 1, '#c8d080', false);
  add(12, 7, 2, 1, '#ffe27a', false); add(13, 7, 1, 1, OUTLINE, false);
  add(14, 9, 1, 1, OUTLINE, false);
  return P;
}
function catfishParts(f) { // 큰 메기 장군
  const b = f ? 1 : 0, [P, add] = mk();
  add(14, 6 + b, 2, 6, '#4a3a30');
  add(1, 5 + b, 13, 8, '#6a5a4a'); add(3, 4 + b, 9, 1, '#6a5a4a', false);
  add(3, 11 + b, 9, 2, '#c8b898', false);
  add(3, 7 + b, 2, 2, '#ffffff', false); add(3, 8 + b, 1, 1, OUTLINE, false);
  add(1, 10 + b, 4, 1, OUTLINE, false);
  add(0, 9 + b, 1, 4, '#2a2020'); add(5, 10 + b, 1, 4, '#2a2020');
  add(6, 1 + b, 5, 3, '#f2c84b'); add(6, 0 + b, 1, 1, '#f2c84b', false); add(8, 0 + b, 1, 1, '#f2c84b', false); add(10, 0 + b, 1, 1, '#f2c84b', false);
  return P;
}
function batParts(f) { // 바람 박쥐
  const [P, add] = mk(), w = '#6a5a7a';
  if (f) { add(0, 3, 5, 5, w); add(11, 3, 5, 5, w); } else { add(0, 7, 5, 5, w); add(11, 7, 5, 5, w); }
  add(5, 6, 6, 6, '#4a3a5a');
  add(5, 4, 1, 2, '#4a3a5a'); add(10, 4, 1, 2, '#4a3a5a');
  add(6, 8, 1, 1, '#ff5a5a', false); add(9, 8, 1, 1, '#ff5a5a', false);
  add(7, 10, 1, 1, '#ffffff', false); add(8, 10, 1, 1, '#ffffff', false);
  return P;
}
function eagleParts(f) { // 번개 독수리
  const [P, add] = mk();
  add(5, 13, 2, 2, '#f2c84b'); add(9, 13, 2, 2, '#f2c84b');
  if (f) add(0, 3, 5, 6, '#6a4422'); else add(0, 7, 5, 6, '#6a4422');
  add(4, 6, 8, 7, '#8a5a32');
  add(11, 8, 4, 4, '#6a4422');
  add(8, 2, 5, 5, '#f4f4f4');
  add(13, 4, 2, 2, '#f2c84b');
  add(10, 3, 1, 1, OUTLINE, false);
  add(6, 8, 2, 1, '#ffe27a', false); add(7, 9, 2, 1, '#ffe27a', false); add(6, 10, 2, 1, '#ffe27a', false);
  add(9, 0, 3, 2, '#f2c84b');
  return P;
}
function scarecrowParts(f, gold) { // 허수아비 (gold: 황금 허수아비 왕)
  const b = f ? 1 : 0, [P, add] = mk();
  add(7, 12, 2, 4, '#8a5a32');
  add(1, 8 + b, 14, 2, '#8a5a32');
  add(0, 8 + b, 1, 3, '#e8c860', false); add(15, 8 + b, 1, 3, '#e8c860', false);
  add(4, 9 + b, 8, 5, gold ? '#f2c84b' : '#c8503a');
  add(5, 11 + b, 2, 2, gold ? '#ffe27a' : '#3a6ab8', false);
  add(4, 2 + b, 8, 7, '#e8d8a0');
  add(5, 4 + b, 2, 2, OUTLINE, false); add(9, 4 + b, 2, 2, OUTLINE, false);
  add(5, 7 + b, 6, 1, OUTLINE, false);
  if (gold) { add(4, 0 + b, 8, 2, '#f2c84b'); add(4, -1 + b, 1, 1, '#f2c84b', false); add(7, -1 + b, 2, 1, '#f2c84b', false); add(11, -1 + b, 1, 1, '#f2c84b', false); add(7, 0 + b, 2, 1, '#d8424a', false); }
  else { add(3, 1 + b, 10, 2, '#6a4422'); add(5, 0 + b, 6, 1, '#6a4422'); }
  return P;
}
function hopperParts(f) { // 점프 메뚜기
  const [P, add] = mk(), u = f ? 1 : 0;
  add(6, 12, 1, 3, '#3a8a34'); add(9, 12, 1, 3, '#3a8a34');
  add(2, 4 + u, 2, 7, '#3a8a34'); add(3, 4 + u, 5, 2, '#3a8a34');
  add(3, 8, 9, 4, '#5cc04a');
  add(10, 5, 5, 5, '#5cc04a');
  add(12, 6, 2, 2, '#ffffff', false); add(13, 7, 1, 1, OUTLINE, false);
  add(13, 2, 1, 3, '#3a8a34'); add(14, 1, 1, 2, '#3a8a34', false);
  return P;
}
function foxParts(f) { // 꾀돌이 여우
  const [P, add] = mk(), u = f ? 1 : 0, c = '#e0703a';
  add(4, 13, 2, 2, '#a04a2a'); add(9, 13, 2, 2, '#a04a2a');
  add(0, 5 - u, 4, 6, c); add(0, 5 - u, 2, 2, '#f4f4f4', false);
  add(3, 8, 9, 5, c);
  add(9, 4, 6, 6, c);
  add(9, 2, 2, 2, c); add(13, 2, 2, 2, c);
  add(12, 8, 3, 2, '#f4f4f4', false);
  add(11, 6, 1, 1, OUTLINE, false); add(13, 6, 1, 1, OUTLINE, false);
  add(15, 7, 1, 1, OUTLINE);
  return P;
}
function mushroomParts(f) { // 포자 버섯
  const b = f ? 1 : 0, [P, add] = mk();
  add(4, 14, 3, 2, '#c8b898'); add(9, 14, 3, 2, '#c8b898');
  add(5, 8, 6, 6, '#f0e0c0');
  add(6, 10, 1, 2, OUTLINE, false); add(9, 10, 1, 2, OUTLINE, false);
  add(2, 3 + b, 12, 5, '#d8424a'); add(4, 2 + b, 8, 1, '#d8424a', false);
  add(4, 4 + b, 2, 2, '#ffffff', false); add(9, 3 + b, 2, 2, '#ffffff', false); add(7, 6 + b, 2, 1, '#ffffff', false);
  return P;
}
function wolfParts(f) { // 그림자 늑대
  const [P, add] = mk(), u = f ? 1 : 0, c = '#4a4a6a';
  add(3, 13, 2, 3, '#3a3a50'); add(9, 13, 2, 3, '#3a3a50');
  add(0, 4 - u, 3, 5, c);
  add(2, 7, 10, 6, c);
  add(5, 5, 5, 2, '#3a3a50');
  add(10, 4, 6, 6, c);
  add(10, 2, 2, 2, c); add(14, 2, 2, 2, c);
  add(14, 8, 2, 2, '#6a6a8a', false);
  add(12, 6, 1, 1, '#ff3a3a', false); add(14, 6, 1, 1, '#ff3a3a', false);
  add(14, 10, 1, 1, '#ffffff', false);
  return P;
}

function enemyParts(e, frame) {
  if (/^boss\d+$/.test(e.type)) return chibiParts(CHARACTERS[e.type].look, frame);   // 👑 스테이지 보스 (학생 모습)
  switch (e.type) {
    case 'fish': return fishParts(frame, e.color);
    case 'eel': return eelParts(frame);
    case 'catfish': return catfishParts(frame);
    case 'bat': return batParts(frame);
    case 'eagle': return eagleParts(frame);
    case 'scarecrow': return scarecrowParts(frame, false);
    case 'goldscare': return scarecrowParts(frame, true);
    case 'hopper': return hopperParts(frame);
    case 'fox': return foxParts(frame);
    case 'mushroom': return mushroomParts(frame);
    case 'wolf': return wolfParts(frame);
    case 'dongjin': return chibiParts(CHARACTERS.dongjin.look, frame);
    case 'midboss': return chibiParts(CHARACTERS.boss5.look, frame);
    case 'shadow': return chibiParts(CHARACTERS.shadow.look, frame);
    case 'mole': return moleParts(frame);
    case 'crow': return crowParts(frame);
    case 'calc': return calcParts(frame);
    case 'crab': return crabParts(frame);
    case 'turtle': return turtleParts(frame);
    case 'wisp': return wispParts(frame);
    case 'goblin': return goblinParts(frame);
    default: return slimeParts(e.color, frame, e.type === 'king');
  }
}

// 숫자 슬라임
function slimeParts(color, frame, crown) {
  const P = [];
  const s = frame ? 1 : 0; // 말랑말랑
  const add = (x, y, w, h, c, o = true) => P.push({ x, y, w, h, c, o });
  add(2 - s, 8 + s, 12 + s * 2, 7 - s, color);
  add(3, 6 + s, 10, 2, color);
  add(5, 5 + s, 6, 1, color);
  add(4, 7 + s, 2, 2, 'rgba(255,255,255,0.55)', false);
  add(5, 9 + s, 2, 2, '#ffffff', false); add(9, 9 + s, 2, 2, '#ffffff', false);
  add(6, 10 + s, 1, 1, OUTLINE, false); add(10, 10 + s, 1, 1, OUTLINE, false);
  add(7, 12 + s, 2, 1, OUTLINE, false);
  // 소수점을 잃어버린 숫자 표시 (머리 위 작은 점선)
  if (crown) {
    add(4, 2 + s, 8, 3, '#f2c84b');
    add(4, 1 + s, 1, 1, '#f2c84b', false); add(7, 1 + s, 2, 1, '#f2c84b', false); add(11, 1 + s, 1, 1, '#f2c84b', false);
    add(7, 3 + s, 2, 1, '#d8424a', false);
    add(5, 12 + s, 6, 1, OUTLINE, false); // 화난 입
  } else add(7, 3 + s, 2, 2, '#ffe27a');
  return P;
}

// 조각들을 그리기 (먼저 테두리, 그다음 색)
// ox, oy: 왼쪽 위 위치(도트 단위), s: 확대 배율, dir: 1=오른쪽 보기, -1=왼쪽 보기
function drawParts(c, parts, ox, oy, s, dir = 1, white = false) {
  const X = p => (dir === 1 ? p.x : 16 - p.x - p.w);
  c.fillStyle = OUTLINE;
  for (const p of parts) if (p.o) c.fillRect((ox + X(p) - 1) * s, (oy + p.y - 1) * s, (p.w + 2) * s, (p.h + 2) * s);
  for (const p of parts) {
    c.fillStyle = white ? '#ffffff' : p.c;
    c.fillRect((ox + X(p)) * s, (oy + p.y) * s, p.w * s, p.h * s);
  }
}

// 얼굴 그림(대화창, 정보창, 시작 화면)
function drawPortrait(canvas, who) {
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, canvas.width, canvas.height);
  if (!who) return;
  const s = Math.floor(canvas.width / 20);
  const off = (canvas.width / s - 16) / 2;
  if (who.enemy) drawParts(c, enemyParts(who.enemy, 0), off, off - 1, s);
  else drawParts(c, chibiParts(who.look, 0), off, off + 1, s);
}

// ---------- 지도 타일 ----------
const WALKABLE = new Set(['.', '_', '=', 's', 'f', ',', '-', 'z', 'k', 'b', 'r', 'd', 'e', 'p', 'c', 'a']);
const FLYABLE = new Set(['~']);   // 하늘을 날거나 헤엄치는 적만 지나갈 수 있어요

let CUR_MAP = null; // 지금 그리는 지도 (다리 밑이 물인지 확인할 때 써요)
function G_TILE_ROW(y) { return CUR_MAP && CUR_MAP[y] ? CUR_MAP[y][0] : '.'; }
function nearWater(x, y) {
  const at = (a, b) => (CUR_MAP && CUR_MAP[b] ? CUR_MAP[b][a] : '');
  return G_TILE_ROW(y) === '~' || at(x, y - 1) === '~' || at(x, y + 1) === '~' || at(x - 1, y) === '~' || at(x + 1, y) === '~';
}

function hash(x, y, i) {
  let h = (x * 374761393 + y * 668265263 + i * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0);
}

function speckle(c, ox, oy, s, x, y, colors, n) {
  for (let i = 0; i < n; i++) {
    const h = hash(x, y, i + 1);
    c.fillStyle = colors[h % colors.length];
    c.fillRect((ox + (h >>> 4) % 16) * s, (oy + (h >>> 9) % 16) * s, s, s);
  }
}

function drawTile(c, ch, x, y, s) {
  const ox = x * 16, oy = y * 16;
  const R = (dx, dy, w, h, col) => { c.fillStyle = col; c.fillRect((ox + dx) * s, (oy + dy) * s, w * s, h * s); };
  const grass = () => { R(0, 0, 16, 16, '#62b04f'); speckle(c, ox, oy, s, x, y, ['#4e9a3f', '#7cc463', '#56a447'], 10); };
  const sand = () => { R(0, 0, 16, 16, '#ead08e'); speckle(c, ox, oy, s, x, y, ['#d8bb76', '#f4e0a8'], 9); };

  switch (ch) {
    case '.': grass(); break;
    case '_': R(0, 0, 16, 16, '#d9a86a'); speckle(c, ox, oy, s, x, y, ['#c4925a', '#e6bd85'], 9); break;
    case '=': R(0, 0, 16, 16, '#c8604a'); speckle(c, ox, oy, s, x, y, ['#b35240', '#d8765e'], 8); break;
    case 's': sand(); break;
    case 'f':
      grass();
      [[3, 4, '#ff8ab4'], [10, 3, '#ffe27a'], [6, 10, '#ffffff'], [12, 11, '#ff8ab4']].forEach(([fx, fy, col]) => {
        R(fx, fy - 1, 1, 1, col); R(fx - 1, fy, 3, 1, col); R(fx, fy + 1, 1, 1, col); R(fx, fy, 1, 1, '#f2a020');
        R(fx, fy + 2, 1, 2, '#3a8a34');
      });
      break;
    case 'R':
      R(0, 0, 16, 16, '#b5483a');
      for (let r = 0; r < 4; r++) R(0, r * 4 + 3, 16, 1, '#8e3329');
      for (let r = 0; r < 4; r++) R((r % 2) * 4 + 2, r * 4, 1, 3, '#8e3329'), R((r % 2) * 4 + 10, r * 4, 1, 3, '#8e3329');
      R(0, 15, 16, 1, '#5c1f18');
      break;
    case 'W':
      R(0, 0, 16, 16, '#efe4cc');
      R(2, 2, 12, 10, '#7a6a55'); R(3, 3, 10, 8, '#7cc4ef'); R(8, 3, 1, 8, '#7a6a55'); R(3, 7, 10, 1, '#7a6a55');
      R(4, 4, 2, 1, '#d8f0ff'); R(9, 4, 2, 1, '#d8f0ff');
      R(0, 14, 16, 2, '#cbbd9e');
      break;
    case 'D':
      R(0, 0, 16, 16, '#efe4cc');
      R(1, 2, 14, 14, '#6a4a2a'); R(2, 3, 12, 13, '#8a5a32'); R(8, 3, 1, 13, '#6a4a2a');
      R(3, 4, 4, 5, '#9ad0ff'); R(9, 4, 4, 5, '#9ad0ff');
      R(6, 10, 1, 2, '#f2c84b'); R(10, 10, 1, 2, '#f2c84b');
      break;
    case 'T':
      grass();
      R(3, 13, 10, 2, 'rgba(0,0,0,0.25)');
      R(7, 10, 3, 5, '#7a4a26'); R(7, 10, 1, 5, '#5c3a1e');
      R(2, 2, 12, 9, '#1d5428'); R(3, 1, 10, 11, '#1d5428');
      R(3, 2, 10, 9, '#2f7d3a'); R(4, 1, 8, 1, '#2f7d3a');
      R(5, 3, 3, 2, '#46a04a'); R(9, 5, 2, 2, '#46a04a'); R(4, 7, 2, 2, '#46a04a');
      break;
    case 'G':
      grass();
      R(2, 1, 12, 1, '#f4f4f4'); R(2, 1, 1, 14, '#f4f4f4'); R(13, 1, 1, 14, '#f4f4f4');
      for (let i = 3; i < 15; i += 2) R(3, i, 10, 1, 'rgba(220,220,230,0.6)');
      for (let i = 4; i < 13; i += 2) R(i, 2, 1, 13, 'rgba(220,220,230,0.6)');
      break;
    case 'H':
      sand();
      R(2, 4, 2, 11, '#5c6070'); R(12, 4, 2, 11, '#5c6070');
      R(2, 4, 12, 1, '#9aa0b0'); R(2, 3, 12, 1, '#c8ccd8');
      break;
    case ',': // 흙길
      R(0, 0, 16, 16, '#c9a06a'); speckle(c, ox, oy, s, x, y, ['#b88f5c', '#d8b27e'], 8); break;
    case 'F': // 나무 울타리
      grass();
      R(0, 6, 16, 2, '#6a4422'); R(0, 6, 16, 1, '#b8844a');
      R(0, 11, 16, 2, '#6a4422'); R(0, 11, 16, 1, '#b8844a');
      R(2, 3, 3, 12, '#6a4422'); R(3, 3, 1, 11, '#b8844a');
      R(11, 3, 3, 12, '#6a4422'); R(12, 3, 1, 11, '#b8844a');
      break;
    case 'C': // 텃밭 (고구마 잎)
      R(0, 0, 16, 16, '#7a5434');
      R(0, 4, 16, 1, '#5e3f26'); R(0, 9, 16, 1, '#5e3f26'); R(0, 14, 16, 1, '#5e3f26');
      [[3, 1], [8, 1], [13, 1], [5, 6], [10, 6], [3, 11], [8, 11], [13, 11]].forEach(([px, py], i) => {
        R(px, py, 1, 3, '#2f7d3a'); R(px - 1, py, 1, 1, '#5cc04a'); R(px + 1, py + 1, 1, 1, '#5cc04a');
        if ((hash(x, y, i) % 4) === 0) R(px - 1, py + 2, 3, 1, '#a04a7a');
      });
      break;
    case 'M': // 바위
      grass();
      R(2, 13, 13, 2, 'rgba(0,0,0,0.25)');
      R(2, 5, 12, 9, '#5a5a68'); R(3, 4, 10, 1, '#5a5a68'); R(4, 3, 7, 1, '#5a5a68');
      R(3, 5, 10, 7, '#7a7a88'); R(4, 4, 6, 1, '#7a7a88');
      R(4, 6, 4, 2, '#a8a8b8'); R(9, 9, 3, 1, '#4a4a58');
      break;
    // ---------- 마을 ----------
    case '-': R(0, 0, 16, 16, '#5a5a66'); speckle(c, ox, oy, s, x, y, ['#52525e', '#64646f'], 8); break;
    case 'z':
      R(0, 0, 16, 16, '#5a5a66');
      for (let i = 0; i < 4; i++) R(1 + i * 4, 1, 2, 14, '#f4f4f4');
      break;
    case 'k':
      R(0, 0, 16, 16, '#cfc6b4');
      R(0, 7, 16, 1, '#ada592'); R(7, 0, 1, 16, '#ada592'); R(0, 15, 16, 1, '#ada592'); R(15, 0, 1, 16, '#ada592');
      break;
    case 'h': {
      const roofs = [['#3a6ab8', '#2a4a88'], ['#c8503a', '#983a2a'], ['#3a9a6a', '#2a7a4a']];
      const [r1, r2] = roofs[hash(Math.floor(x / 3), 1, 7) % 3];
      R(0, 0, 16, 16, r1);
      for (let r = 0; r < 4; r++) R(0, r * 4 + 3, 16, 1, r2);
      R(0, 15, 16, 1, '#1a2040');
      break;
    }
    case 'n':
      R(0, 0, 16, 16, '#f0e0c0');
      R(3, 2, 10, 8, '#6a5a48'); R(4, 3, 8, 6, '#9ad0ff'); R(8, 3, 1, 6, '#6a5a48');
      R(5, 4, 2, 1, '#d8f0ff');
      R(3, 10, 10, 2, '#c8503a'); R(4, 9, 1, 1, '#ff8ab4'); R(8, 9, 1, 1, '#ffe27a'); R(11, 9, 1, 1, '#ff8ab4');
      R(0, 14, 16, 2, '#c8b898');
      break;
    case 'S':
      grass();
      for (let i = 0; i < 7; i++) R(1 + i * 2, 2, 2, 4, i % 2 ? '#ffffff' : '#e0503a');
      R(2, 6, 1, 8, '#6a4422'); R(13, 6, 1, 8, '#6a4422');
      R(1, 9, 14, 4, '#a8743e'); R(1, 9, 14, 1, '#c8945e');
      R(3, 7, 2, 2, '#e0503a'); R(6, 7, 2, 2, '#f2c84b'); R(9, 7, 2, 2, '#5cc04a'); R(12, 7, 1, 2, '#f2a020');
      R(6, 11, 4, 2, '#ffffff');
      break;
    case 'L':
      R(0, 0, 16, 16, '#cfc6b4'); R(0, 15, 16, 1, '#ada592');
      R(7, 4, 2, 11, '#3a3a48'); R(5, 14, 6, 1, '#3a3a48');
      R(5, 1, 6, 3, '#3a3a48'); R(6, 2, 4, 2, '#ffe27a');
      break;
    // ---------- 강과 농다리 ----------
    case '~':
      R(0, 0, 16, 16, '#3a7ad0'); speckle(c, ox, oy, s, x, y, ['#5a9ae8', '#2a6ac0'], 6);
      [[2, 4], [9, 10]].forEach(([wx, wy], i) => { if (hash(x, y, i + 9) % 2) R(wx, wy, 4, 1, '#9ac8f4'); });
      break;
    case 'b': {
      const water = nearWater(x, y);
      if (water) R(0, 0, 16, 16, '#3a7ad0'); else { R(0, 0, 16, 16, '#ead08e'); }
      R(1, 0, 14, 16, '#4a3a2e');
      const cols = ['#8a7a68', '#7a6a58', '#9a8a78', '#6a5a4a'];
      [[2, 1, 6, 4], [9, 1, 5, 4], [2, 6, 4, 4], [7, 6, 7, 4], [2, 11, 7, 4], [10, 11, 4, 4]].forEach(([sx, sy, w, h], i) => {
        R(sx, sy, w, h, cols[hash(x, y, i) % 4]); R(sx, sy, w, 1, '#b0a090');
      });
      break;
    }
    case 'r':
      grass();
      [[3, 6], [6, 4], [9, 7], [12, 5]].forEach(([rx, ry]) => { R(rx, ry, 1, 9, '#8a9a3a'); R(rx, ry - 2, 1, 3, '#7a5a2a'); });
      break;
    // ---------- 초롱길 ----------
    case 'd':
      R(0, 0, 16, 16, '#b8844a');
      for (let i = 0; i < 4; i++) R(0, i * 4 + 3, 16, 1, '#8a5a32');
      R(2, 1, 1, 1, '#6a4422'); R(13, 5, 1, 1, '#6a4422'); R(4, 9, 1, 1, '#6a4422'); R(11, 13, 1, 1, '#6a4422');
      break;
    case 'l':
      grass();
      R(7, 7, 2, 8, '#5a3a22'); R(5, 14, 6, 1, '#5a3a22');
      R(5, 1, 6, 6, '#ff7a3a'); R(5, 0, 6, 1, '#3a2a1a'); R(6, 7, 4, 1, '#3a2a1a');
      R(6, 2, 4, 1, '#ffd08a'); R(5, 4, 6, 1, '#c8402a');
      break;
    case 'P':
      grass();
      R(0, 4, 16, 12, '#5a6470'); R(2, 2, 12, 2, '#3a4450');
      R(0, 7, 16, 1, '#3a4450'); R(0, 11, 16, 1, '#3a4450');
      R(0, 14, 16, 2, '#2a3440');
      break;
    case 'Q':
      grass();
      R(0, 0, 16, 10, '#8a6a48'); R(0, 0, 16, 2, '#3a3020');
      R(1, 0, 2, 14, '#a83a2a'); R(13, 0, 2, 14, '#a83a2a');
      R(0, 8, 16, 1, '#a83a2a');
      break;
    // ---------- 하늘다리 ----------
    case 'e': // 물 위 나무다리
      R(0, 0, 16, 16, '#3a7ad0'); speckle(c, ox, oy, s, x, y, ['#5a9ae8', '#2a6ac0'], 4);
      R(0, 2, 16, 12, '#b8844a');
      for (let i = 0; i < 4; i++) R(i * 4 + 3, 2, 1, 12, '#8a5a32');
      R(0, 1, 16, 1, '#e8d8a0'); R(0, 14, 16, 1, '#e8d8a0');
      break;
    case 'O': // 다리 기둥
      grass();
      R(5, 0, 6, 16, '#c8c8d8'); R(6, 0, 1, 16, '#ffffff'); R(10, 0, 1, 16, '#9a9aaa');
      R(4, 0, 8, 2, '#e05a4a'); R(4, 14, 8, 2, '#8a8a9a');
      break;
    // ---------- 들판 ----------
    case 'p': // 논 (황금 벼)
      R(0, 0, 16, 16, '#b8a040');
      for (let i = 0; i < 4; i++) { R(1 + i * 4, 3, 2, 10, '#d8b850'); R(1 + i * 4, 2, 2, 2, '#f0d870'); }
      R(0, 15, 16, 1, '#8a7a30');
      break;
    case 'Y': // 볏짚 더미
      grass();
      R(2, 5, 12, 10, '#e8c860'); R(4, 3, 8, 2, '#e8c860');
      R(4, 8, 8, 1, '#c8a040'); R(3, 12, 10, 1, '#c8a040'); R(7, 3, 2, 12, '#d8b050');
      break;
    // ---------- 숲 ----------
    case 'N': // 소나무
      grass();
      R(7, 13, 2, 3, '#6a4422');
      R(6, 0, 4, 4, '#1d5428'); R(4, 3, 8, 5, '#1d5428'); R(2, 7, 12, 6, '#1d5428');
      R(7, 1, 2, 2, '#2f7d3a'); R(6, 4, 4, 2, '#2f7d3a'); R(5, 8, 6, 3, '#2f7d3a');
      break;
    // ---------- 동진의 성 ----------
    case 'K': // 성벽
      R(0, 0, 16, 16, '#3a2a5a');
      R(0, 4, 16, 1, '#2a1a40'); R(0, 9, 16, 1, '#2a1a40'); R(0, 14, 16, 1, '#2a1a40');
      R(5, 0, 1, 4, '#2a1a40'); R(11, 5, 1, 4, '#2a1a40'); R(3, 10, 1, 4, '#2a1a40');
      if (hash(x, y, 3) % 4 === 0) { R(7, 6, 2, 5, '#6a4422'); R(6, 3, 4, 3, '#ff9a3a'); R(7, 2, 2, 2, '#ffe27a'); }
      break;
    case 'c': // 성 바닥
      R(0, 0, 16, 16, '#4a4060');
      R(0, 7, 16, 1, '#3a3050'); R(7, 0, 1, 16, '#3a3050'); R(0, 15, 16, 1, '#3a3050'); R(15, 0, 1, 16, '#3a3050');
      speckle(c, ox, oy, s, x, y, ['#5a5070'], 3);
      break;
    case 'a': // 붉은 양탄자
      R(0, 0, 16, 16, '#a01f3a');
      R(0, 0, 2, 16, '#f2c84b'); R(14, 0, 2, 16, '#f2c84b');
      R(6, 5, 4, 4, '#c83a5a'); R(7, 6, 2, 2, '#f2c84b');
      break;
    case 'I': // 성 기둥
      R(0, 0, 16, 16, '#4a4060');
      R(4, 0, 8, 16, '#6a6080'); R(5, 0, 2, 16, '#8a80a0');
      R(3, 0, 10, 2, '#8a80a0'); R(3, 14, 10, 2, '#5a5070');
      break;
    case 'J': // 왕좌
      R(0, 0, 16, 16, '#4a4060');
      R(3, 1, 10, 14, '#a01f3a'); R(2, 0, 12, 3, '#f2c84b');
      R(3, 9, 10, 3, '#c83a5a');
      R(2, 8, 2, 7, '#f2c84b'); R(12, 8, 2, 7, '#f2c84b');
      R(7, 1, 2, 1, '#d8424a');
      break;
    default: grass();
  }
}
