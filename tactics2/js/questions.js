// =====================================================
//  소수의 곱셈 문제 만들기 (5학년 2학기 4단원)
//  - 암산으로 바로 풀 수 있는 쉬운 곱셈만 나와요.
//  - 숫자는 모두 "100배 한 정수"로 계산해요. (0.35 → 35, 4 → 400)
//    곱 = a × b ÷ 100 (계산 오차가 생기지 않아요)
//  - 답은 소수 둘째 자리까지만 나오게 만들어요.
// =====================================================

function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

// 35 → "0.35", 150 → "1.5", 300 → "3"
function fmt(v) {
  const i = Math.floor(v / 100), f = v % 100;
  if (f === 0) return String(i);
  if (f % 10 === 0) return i + '.' + (f / 10);
  return i + '.' + String(f).padStart(2, '0');
}
function places(v) { return v % 100 === 0 ? 0 : (v % 10 === 0 ? 1 : 2); }
const OPSYM = { '+': '+', '-': '−', 'x': '×' };

const HINTS = {
  decNat: '소수를 자연수처럼 곱한 다음, 소수점 아래 자리 수만큼 소수점을 찍어요! (0.3 × 4 → 3 × 4 = 12 → 1.2)',
  natDec: '자연수처럼 곱한 다음, 소수점 아래 자리 수만큼 소수점을 찍어요! (3 × 0.4 → 3 × 4 = 12 → 1.2)',
  carry:  '자연수처럼 곱하면 두 자리 수가 나올 수 있어요. 그래도 소수점은 소수 자리 수만큼만 찍어요! (0.6 × 5 → 30 → 3.0 = 3)',
  decDec: '자연수처럼 곱하고, 두 수의 소수점 아래 자리 수를 더한 만큼 소수점을 찍어요! (0.2 × 0.3 → 2 × 3 = 6 → 소수 두 자리 → 0.06)',
  ten:    '10을 곱하면 소수점이 오른쪽으로 한 칸, 100을 곱하면 두 칸 옮겨져요! (1.5 × 10 = 15)',
  tenth:  '0.1을 곱하면 소수점이 왼쪽으로 한 칸, 0.01을 곱하면 두 칸 옮겨져요! (35 × 0.1 = 3.5)'
};

// level 1: 아주 쉬움 (일반 공격)  /  level 2: 쉬움 (스킬)
function genQuestion(level) {
  for (let tries = 0; tries < 100; tries++) {
    let a, b, type;
    const k = rnd(0, 2);
    if (level === 1) {
      if (k === 0) {        // (소수 한 자리) × (자연수), 받아올림 없음: 0.3 × 3, 1.2 × 3
        const i = rnd(0, 2), f = rnd(1, 4), n = rnd(2, 4);
        if (i * n > 9 || f * n > 9) continue;
        a = i * 100 + f * 10; b = n * 100; type = 'decNat';
      } else if (k === 1) { // (자연수) × (소수 한 자리): 3 × 0.2
        const f = rnd(1, 4), n = rnd(2, 4);
        if (f * n > 9) continue;
        a = n * 100; b = f * 10; type = 'natDec';
      } else {              // × 10, × 100: 0.7 × 10, 2.4 × 100
        const i = rnd(0, 3), f = rnd(1, 9);
        a = i * 100 + f * 10; b = pick([1000, 10000]); type = 'ten';
      }
    } else {
      if (k === 0) {        // 받아올림 있는 (소수) × (자연수): 0.4 × 3, 0.6 × 5, 0.25 × 4
        if (Math.random() < 0.75) {
          const f = rnd(2, 9), n = rnd(2, 6);
          if (f * n < 10 || f * n > 54) continue;
          a = f * 10; b = n * 100;
        } else {
          [a, b] = pick([[25, 400], [25, 800], [50, 600], [75, 400], [20, 500], [15, 200], [12, 500]]);
        }
        type = 'carry';
        if (Math.random() < 0.3) { [a, b] = [b, a]; type = 'natDec'; }
      } else if (k === 1) { // (소수) × (소수), 한 자리끼리: 0.2 × 0.3, 0.6 × 0.7
        const x = rnd(1, 9), y = rnd(1, 9);
        if (x * y > 48) continue;
        a = x * 10; b = y * 10; type = 'decDec';
      } else {              // × 0.1, × 0.01: 3.5 × 0.1, 24 × 0.1, 7 × 0.01
        if (Math.random() < 0.6) { a = pick([rnd(11, 99) * 100, rnd(11, 99) * 10]); b = 10; }
        else { a = rnd(2, 99) * 100; b = 1; }
        type = 'tenth';
      }
    }
    if ((a * b) % 100 !== 0) continue;    // 답이 소수 둘째 자리까지만
    return makeQuestion(a, 'x', b, HINTS[type]);
  }
  return makeQuestion(30, 'x', 300, HINTS.decNat);
}

// 문제 객체 만들기 (보기 4개). op: 'x'(곱셈) — 예전 '+', '-'도 그대로 돼요.
function makeQuestion(a, op, b, hint, unit = '', story = '') {
  const ans = op === 'x' ? (a * b) / 100 : op === '+' ? a + b : a - b;
  const cands = [];
  const push = v => { if (Number.isInteger(v) && v > 0 && v !== ans && v < 1000000 && !cands.includes(v)) cands.push(v); };
  // 소수점을 잘못 찍었을 때 나오는 답 (가장 많이 하는 실수)
  push(ans * 10);
  if (ans % 10 === 0) push(ans / 10);
  if (op === 'x') push(a + b);              // 곱하기 대신 더했을 때
  push(ans + 10); push(ans - 10); push(ans * 100); push(ans + 100); push(ans + 1); push(ans - 1);
  const wrong = shuffle(cands.slice(0, 4)).slice(0, 3);
  while (wrong.length < 3) wrong.push(ans + 10 * (wrong.length + 2));
  const opts = shuffle([ans, ...wrong]);
  return { a, op, b, ans, opts, hint, unit, story };
}

// 풀이 그림: 자연수처럼 곱하기 → 소수점 아래 자리 수 → 소수점 찍기
function vcalcHTML(q) {
  if (q.op !== 'x') return `<div class="mcalc"><b>${fmt(q.a)} ${OPSYM[q.op]} ${fmt(q.b)} = <span class="ans">${fmt(q.ans)}</span></b></div>`;
  const A = fmt(q.a), B = fmt(q.b);
  const da = (A.split('.')[1] || '').length, db = (B.split('.')[1] || '').length;
  const ia = Number(A.replace('.', '')), ib = Number(B.replace('.', ''));
  const prod = ia * ib, d = da + db;
  // 소수점을 찍은 모습 (예: 12 → 0.12, 90 → 0.90)
  let s = String(prod).padStart(d + 1, '0');
  const raw = d ? s.slice(0, s.length - d) + '.' + s.slice(s.length - d) : s;
  const tidy = raw !== fmt(q.ans) ? ` = <span class="ans">${fmt(q.ans)}</span>` : '';
  return `<div class="mcalc">` +
    `<div>① 자연수처럼 곱해요: <b>${ia} × ${ib} = ${prod}</b></div>` +
    `<div>② 소수점 아래 자리 수: ${A} → ${da}자리, ${B} → ${db}자리 ⇒ <b>${d}자리</b></div>` +
    `<div>③ 소수점을 찍어요: <b><span class="ans">${raw}</span>${tidy}</b></div></div>`;
}
