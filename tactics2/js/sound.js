// =====================================================
//  효과음 (음원 파일 없이 브라우저가 직접 만들어요)
//  sfx('이름') 으로 소리를 내요.
// =====================================================
let AC = null, master = null, noiseBuf = null, muted = false;

function audio() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = 1.4;
    const comp = AC.createDynamicsCompressor();
    master.connect(comp).connect(AC.destination);
    noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

// 삑! 같은 소리 (f → f2 로 음이 변해요)
function tone(t, { f = 440, f2 = null, type = 'square', dur = 0.1, vol = 0.2, attack = 0.005 }) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + dur + 0.03);
}
// 쉭! 슉! 같은 바람·충격 소리
function noise(t, { dur = 0.2, vol = 0.3, type = 'bandpass', f = 1000, f2 = null, q = 1, attack = 0.005 }) {
  const s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
  const fl = AC.createBiquadFilter(); fl.type = type; fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
  const g = AC.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl).connect(g).connect(master);
  s.start(t); s.stop(t + dur + 0.03);
}
// 음 이름 → 주파수
const NOTE = { C3: 131, G3: 196, C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494,
  C5: 523, D5: 587, E5: 659, F5: 698, G5: 784, A5: 880, B5: 988, C6: 1047, E6: 1319, G6: 1568 };
function melody(t, notes, opt = {}) {
  let at = t;
  for (const [n, len] of notes) {
    if (n) tone(at, { f: NOTE[n], type: opt.type || 'square', dur: len * 0.95, vol: opt.vol || 0.12 });
    at += len;
  }
  return at;
}

// 친구별 공격 소리
const ATTACK_SFX = { warrior: 'slash', archer: 'arrow', healer: 'splash', tank: 'bash', stone: 'smash', mage: 'magic',
  water: 'splash', scout: 'dash', trick: 'spin', knight: 'holy' };

const SFX = {
  // ---------- 화면 ----------
  select: t => tone(t, { f: 880, dur: 0.05, vol: 0.08 }),
  move:   t => tone(t, { f: 520, dur: 0.03, vol: 0.05 }),
  correct: t => { melody(t, [['E5', 0.07], ['G5', 0.07], ['C6', 0.16]], { vol: 0.12 });
                  tone(t + 0.14, { f: 2093, type: 'triangle', dur: 0.25, vol: 0.06 }); },
  wrong: t => { tone(t, { f: 300, f2: 250, type: 'sawtooth', dur: 0.14, vol: 0.1 });
                tone(t + 0.15, { f: 220, f2: 170, type: 'sawtooth', dur: 0.22, vol: 0.1 }); },

  // ---------- 공격 ----------
  charge: t => { tone(t, { f: 200, f2: 1400, type: 'sine', dur: 0.35, vol: 0.18, attack: 0.05 });
                 tone(t, { f: 400, f2: 2800, type: 'triangle', dur: 0.35, vol: 0.06, attack: 0.05 });
                 noise(t, { f: 2000, f2: 8000, dur: 0.35, vol: 0.06, q: 3, attack: 0.1 }); },
  slash: t => { noise(t, { f: 6000, f2: 700, dur: 0.18, vol: 0.55, q: 2 });           // 슉!
                tone(t + 0.02, { f: 1900, f2: 1300, type: 'triangle', dur: 0.15, vol: 0.07 }); }, // 챙
  arrow: t => { noise(t, { f: 1200, f2: 5000, dur: 0.22, vol: 0.3, q: 4 });           // 휘익
                tone(t + 0.2, { f: 190, f2: 80, type: 'square', dur: 0.07, vol: 0.14 }); },  // 탁
  splash: t => { noise(t, { type: 'lowpass', f: 2500, f2: 300, dur: 0.32, vol: 0.45 }); // 촤악
                 [0.05, 0.11, 0.18].forEach((d, i) => tone(t + d, { f: 500 + i * 200, f2: 1200 + i * 200, type: 'sine', dur: 0.06, vol: 0.1 })); },
  bash: t => { tone(t, { f: 150, f2: 55, type: 'sine', dur: 0.22, vol: 0.55 });         // 쿵
               noise(t, { type: 'lowpass', f: 1400, dur: 0.12, vol: 0.35 });
               tone(t, { f: 920, type: 'square', dur: 0.08, vol: 0.05 }); },
  smash: t => { tone(t, { f: 120, f2: 38, type: 'sine', dur: 0.4, vol: 0.75 });         // 쾅!
                noise(t, { type: 'lowpass', f: 900, f2: 90, dur: 0.45, vol: 0.55 });
                noise(t + 0.02, { f: 3000, dur: 0.08, vol: 0.25, q: 2 }); },
  magic: t => { tone(t, { f: 1400, f2: 180, type: 'square', dur: 0.28, vol: 0.12 });    // 지지직 번개
                tone(t, { f: 1700, f2: 120, type: 'sawtooth', dur: 0.28, vol: 0.06 });
                for (let i = 0; i < 6; i++) noise(t + i * 0.04 + Math.random() * 0.02, { type: 'highpass', f: 3000, dur: 0.03, vol: 0.3 });
                noise(t + 0.1, { type: 'lowpass', f: 220, dur: 0.6, vol: 0.45, attack: 0.03 }); },
  dash: t => { noise(t, { f: 400, f2: 6000, dur: 0.14, vol: 0.35, q: 2 });              // 휙! (고원)
               tone(t + 0.12, { f: 260, f2: 80, type: 'sine', dur: 0.14, vol: 0.45 }); },
  spin: t => { tone(t, { f: 300, f2: 1600, type: 'triangle', dur: 0.35, vol: 0.12 });    // 위잉~ (인성 팽이)
               tone(t + 0.05, { f: 600, f2: 2400, type: 'square', dur: 0.3, vol: 0.04 });
               tone(t + 0.3, { f: 1600, f2: 400, type: 'triangle', dur: 0.25, vol: 0.08 }); },
  holy: t => { noise(t, { f: 7000, f2: 1500, dur: 0.16, vol: 0.4, q: 2 });              // 슉! 띵~ (예린)
               ['E6', 'G6'].forEach((n, i) => tone(t + 0.05 + i * 0.06, { f: NOTE[n], type: 'triangle', dur: 0.4, vol: 0.08 })); },
  miss: t => noise(t, { f: 700, f2: 2600, dur: 0.22, vol: 0.22, q: 3 }),

  // ---------- 맞음 · 쓰러짐 ----------
  hitEnemy: t => { tone(t, { f: 330, f2: 70, type: 'sine', dur: 0.16, vol: 0.5 });     // 퍽!
                   noise(t, { f: 1600, dur: 0.07, vol: 0.32, q: 1.5 }); },
  hurt: t => { tone(t, { f: 190, f2: 60, type: 'sine', dur: 0.2, vol: 0.5 });          // 아얏!
               tone(t + 0.02, { f: 520, f2: 260, type: 'square', dur: 0.16, vol: 0.09 });
               noise(t, { type: 'lowpass', f: 1500, dur: 0.09, vol: 0.3 }); },
  guarded: t => { tone(t, { f: 1046, type: 'square', dur: 0.25, vol: 0.06 });           // 팅! (방패로 막음)
                  tone(t, { f: 1108, type: 'square', dur: 0.25, vol: 0.05 }); },
  enemyAtk: t => { tone(t, { f: 210, f2: 120, type: 'sawtooth', dur: 0.14, vol: 0.09 });
                   noise(t, { f: 1000, f2: 400, dur: 0.12, vol: 0.12, q: 2 }); },
  defeat: t => { tone(t, { f: 880, f2: 110, type: 'square', dur: 0.35, vol: 0.09 });    // 뿅~ 펑
                 noise(t + 0.15, { f: 700, dur: 0.3, vol: 0.28, q: 0.8 });
                 tone(t + 0.4, { f: 1760, type: 'triangle', dur: 0.15, vol: 0.07 });
                 tone(t + 0.48, { f: 2349, type: 'triangle', dur: 0.2, vol: 0.06 }); },
  heroDown: t => melody(t, [['E4', 0.14], ['C4', 0.14], ['G3', 0.3]], { type: 'triangle', vol: 0.18 }),

  // ---------- 회복 · 방패 ----------
  heal: t => { [['G5', 0], ['B5', 0.07], ['D5', 0.14], ['G6', 0.21]].forEach(([n, d]) => tone(t + d, { f: NOTE[n] || 1568, type: 'triangle', dur: 0.3, vol: 0.12 }));
               noise(t + 0.1, { f: 6000, dur: 0.4, vol: 0.05, q: 6, attack: 0.1 }); },
  shield: t => { tone(t, { f: 523, f2: 1046, type: 'triangle', dur: 0.3, vol: 0.14 });
                 tone(t + 0.25, { f: 1046, type: 'square', dur: 0.45, vol: 0.06 });
                 tone(t + 0.25, { f: 1100, type: 'square', dur: 0.45, vol: 0.05 }); },

  // ---------- 이야기 · 결과 ----------
  hit: t => { tone(t, { f: 110, f2: 40, type: 'sine', dur: 0.5, vol: 0.6 });            // 쿠궁 (이야기 효과)
              noise(t, { type: 'lowpass', f: 500, f2: 80, dur: 0.6, vol: 0.45 }); },
  win: t => melody(t, [['C5', 0.1], ['E5', 0.1], ['G5', 0.1], ['C6', 0.3]], { vol: 0.12 }),
  // 스테이지 클리어 팡파르 🎺
  clear: t => {
    const end = melody(t, [['G4', 0.12], ['C5', 0.12], ['E5', 0.12], ['G5', 0.24], ['E5', 0.12], ['G5', 0.6]], { vol: 0.13 });
    melody(t, [['E4', 0.12], ['G4', 0.12], ['C5', 0.12], ['E5', 0.24], ['C5', 0.12], ['E5', 0.6]], { vol: 0.07, type: 'triangle' });
    melody(t, [['C3', 0.36], ['G3', 0.36], ['C4', 0.6]], { vol: 0.15, type: 'triangle' });
    for (let i = 0; i < 4; i++) noise(t + i * 0.24, { type: 'highpass', f: 7000, dur: 0.06, vol: 0.08 });
    noise(end - 0.6, { type: 'highpass', f: 5000, dur: 0.8, vol: 0.12 });
  },
  // 별 하나마다 반짝
  stars: (t, n = 3) => { for (let i = 0; i < n; i++) { tone(t + i * 0.22, { f: 1568 + i * 262, type: 'square', dur: 0.12, vol: 0.08 });
                                                       tone(t + i * 0.22 + 0.05, { f: 2093 + i * 262, type: 'triangle', dur: 0.2, vol: 0.05 }); } },
  lose: t => melody(t, [['G4', 0.25], ['F4', 0.25], ['E4', 0.25], ['D4', 0.25], ['C4', 0.6]], { type: 'triangle', vol: 0.16 }),
  // 🌟 초월 강화: 웅장한 화음 + 반짝반짝
  transcend: t => {
    tone(t, { f: 130, f2: 520, type: 'sine', dur: 0.5, vol: 0.25, attack: 0.1 });
    noise(t, { f: 1000, f2: 9000, dur: 0.5, vol: 0.1, q: 2, attack: 0.2 });
    ['C5', 'E5', 'G5', 'C6'].forEach(n => tone(t + 0.5, { f: NOTE[n], type: 'square', dur: 0.9, vol: 0.07, attack: 0.02 }));
    ['C4', 'G4'].forEach(n => tone(t + 0.5, { f: NOTE[n], type: 'triangle', dur: 1.0, vol: 0.12 }));
    for (let i = 0; i < 8; i++) tone(t + 0.6 + i * 0.07, { f: 1568 + i * 180, type: 'triangle', dur: 0.12, vol: 0.05 });
  },
  levelup: t => { melody(t, [['C5', 0.07], ['E5', 0.07], ['G5', 0.07], ['C6', 0.07], ['E6', 0.25]], { vol: 0.11 });
                  noise(t + 0.25, { f: 7000, dur: 0.4, vol: 0.06, q: 5 }); }
};

function sfx(name, arg) {
  if (muted || !SFX[name]) return;
  try { audio(); SFX[name](AC.currentTime + 0.01, arg); } catch (e) { /* 소리가 안 나도 게임은 계속 */ }
}
