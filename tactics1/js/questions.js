// =====================================================
//  소수의 덧셈과 뺄셈 문제 만들기 (4학년)
//  숫자는 모두 "100배 한 정수"로 계산해요. (0.35 → 35)
//  그래야 컴퓨터 계산 오차가 생기지 않아요.
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

const HINTS = {
  basic: '소수점끼리 줄을 맞추고, 같은 자리 숫자끼리 계산해요. 답에도 소수점을 꼭 찍어요!',
  carry: '소수 첫째 자리끼리 더해서 10이 넘으면, 0.1이 10개 = 1이니까 일의 자리로 1을 올려 줘요!',
  borrow: '소수 첫째 자리에서 뺄 수 없으면, 일의 자리에서 1을 빌려 와요. 1은 0.1이 10개예요!',
  two: '소수 둘째 자리는 둘째 자리끼리, 첫째 자리는 첫째 자리끼리 계산해요.',
  mixed: '자릿수가 달라도 소수점끼리 줄을 맞춰요! 빈 자리는 0이 있다고 생각해요. (1.2 = 1.20)'
};

// level 1: 아주 쉬움 (일반 공격)  /  level 2: 쉬움 (스킬)  /  level 3: 조금 어려움 (중요 장면)
function genQuestion(level) {
  for (let tries = 0; tries < 100; tries++) {
    let a, b, op, type;
    if (level === 1) {
      // 소수 한 자리, 받아올림·받아내림 없음
      if (Math.random() < 0.55) {
        op = '+'; type = 'basic';
        const af = rnd(1, 8), bf = rnd(1, 9 - af);
        a = rnd(0, 3) * 100 + af * 10; b = rnd(0, 2) * 100 + bf * 10;
      } else {
        op = '-'; type = 'basic';
        const ai = rnd(0, 4), af = rnd(2, 9), bi = rnd(0, ai), bf = rnd(1, af - 1);
        a = ai * 100 + af * 10; b = bi * 100 + bf * 10;
      }
    } else if (level === 2) {
      const k = rnd(0, 2);
      if (k === 0) { // 한 자리 받아올림
        op = '+'; type = 'carry';
        const af = rnd(2, 9), bf = rnd(10 - af, 9);
        a = rnd(0, 2) * 100 + af * 10; b = rnd(0, 2) * 100 + bf * 10;
      } else if (k === 1) { // 한 자리 받아내림
        op = '-'; type = 'borrow';
        const ai = rnd(1, 4), af = rnd(1, 7), bi = rnd(0, ai - 1), bf = rnd(af + 1, 9);
        a = ai * 100 + af * 10; b = bi * 100 + bf * 10;
      } else { // 두 자리, 받아올림 없음
        type = 'two';
        const a1 = rnd(1, 8), a2 = rnd(1, 8);
        if (Math.random() < 0.5) {
          op = '+';
          const b1 = rnd(0, 9 - a1), b2 = rnd(1, 9 - a2);
          a = rnd(0, 3) * 100 + a1 * 10 + a2; b = rnd(0, 2) * 100 + b1 * 10 + b2;
        } else {
          op = '-';
          const ai = rnd(1, 4), b1 = rnd(0, a1), b2 = rnd(0, a2 - 1);
          a = ai * 100 + a1 * 10 + a2; b = rnd(0, ai) * 100 + b1 * 10 + b2;
        }
      }
    } else {
      // 자릿수가 다른 소수 (예: 1.2 + 0.35, 3.4 − 1.25)
      type = 'mixed';
      if (Math.random() < 0.5) {
        op = '+';
        const af = rnd(1, 8), b1 = rnd(0, 9 - af), b2 = rnd(1, 9);
        a = rnd(1, 4) * 100 + af * 10; b = rnd(0, 2) * 100 + b1 * 10 + b2;
        if (Math.random() < 0.5) [a, b] = [b, a];
      } else {
        op = '-';
        const ai = rnd(2, 5), af = rnd(2, 9), b1 = rnd(0, af - 1), b2 = rnd(1, 9);
        a = ai * 100 + af * 10; b = rnd(0, ai - 1) * 100 + b1 * 10 + b2;
      }
    }
    const ans = op === '+' ? a + b : a - b;
    if (ans <= 0 || a <= 0 || b <= 0) continue;
    if (places(a) === 0 || places(b) === 0) continue; // 둘 다 소수로
    return makeQuestion(a, op, b, HINTS[type]);
  }
  return makeQuestion(30, '+', 40, HINTS.basic);
}

// 문제 객체 만들기 (보기 4개)
function makeQuestion(a, op, b, hint, unit = '', story = '') {
  const ans = op === '+' ? a + b : a - b;
  const cands = [];
  const push = v => { if (Number.isInteger(v) && v > 0 && v !== ans && !cands.includes(v)) cands.push(v); };
  // 소수점 줄을 잘못 맞췄을 때 나오는 답
  const pa = places(a), pb = places(b);
  if (pa !== pb) {
    const big = pa < pb ? a : b; // 자릿수가 적은 수를 0.1배로 잘못 본 경우
    const wrongBig = big / 10;
    if (Number.isInteger(wrongBig)) push(op === '+' ? (big === a ? wrongBig + b : a + wrongBig) : (big === a ? wrongBig - b : a - wrongBig));
  }
  if (ans % 10 === 0) push(ans * 10 > 9999 ? ans + 100 : ans * 10);
  if (ans % 100 === 0 || ans % 10 === 0) push(ans / 10);
  push(ans + 10); push(ans - 10); push(ans + 100); push(ans - 100); push(ans + 1); push(ans - 1);
  push(op === '+' ? Math.abs(a - b) : a + b); // 덧셈·뺄셈을 바꿔 한 경우
  const wrong = shuffle(cands.slice(0, 4)).slice(0, 3);
  while (wrong.length < 3) wrong.push(ans + 10 * (wrong.length + 2));
  const opts = shuffle([ans, ...wrong]);
  return { a, op, b, ans, opts, hint, unit, story };
}

// 세로셈 그림(HTML) 만들기
function vcalcHTML(q) {
  const rows = [fmt(q.a), fmt(q.b), fmt(q.ans)].map(s => { const [i, f = ''] = s.split('.'); return { i, f }; });
  const I = Math.max(...rows.map(r => r.i.length)) , F = Math.max(...rows.map(r => r.f.length));
  const cols = 1 + I + (F > 0 ? 1 + F : 0);
  const cell = (t, cls = '') => `<span class="${cls}">${t}</span>`;
  const rowHTML = (r, opSign, cls) => {
    let h = cell(opSign || '');
    for (let k = 0; k < I; k++) { const d = r.i.padStart(I, ' ')[k]; h += cell(d === ' ' ? '' : d, cls); }
    if (F > 0) {
      h += cell(r.f ? '.' : '', 'dot');
      for (let k = 0; k < F; k++) h += cell(r.f[k] || '', cls);
    }
    return h;
  };
  return `<div class="vcalc" style="grid-template-columns: repeat(${cols}, 1.1em)">` +
    rowHTML(rows[0], '') + rowHTML(rows[1], q.op === '+' ? '+' : '−') +
    '<div class="line"></div>' + rowHTML(rows[2], '', 'ans') + '</div>';
}
