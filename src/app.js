(function () {
  'use strict';
  // ===== 설정: 인스타 계정에 맞게 바꾸세요 =====
  const CONFIG = {
    brand: '글씨결',
    handle: '@ht_bangbang',
    profileUrl: 'https://www.instagram.com/ht_bangbang/',
    hashtag: '#내글씨폰트',
    defaultSample: '오늘도 잘하고 있어. 진짜로.', // CHEER_LINES[0]과 같게 두면 첫 화면과 완성 화면이 이어져요
    defaultName: '내 손글씨',
    defaultNameEn: 'MyHandwriting',
  };
  try { // ?ig=handle 로 테스트 가능
    const q = new URLSearchParams(location.search);
    if (q.get('ig')) { CONFIG.handle = '@' + q.get('ig').replace(/^@/, ''); CONFIG.profileUrl = 'https://www.instagram.com/' + q.get('ig').replace(/^@/, '') + '/'; }
    if (q.get('brand')) CONFIG.brand = q.get('brand');
    if (q.get('tag')) CONFIG.hashtag = '#' + q.get('tag').replace(/^#/, '');
  } catch (e) {}

  const DEMO_GLYPHS = {"1":[[[0.383,0.321],[0.443,0.268],[0.471,0.249],[0.479,0.254],[0.48,0.7]]],"2":[[[0.321,0.318],[0.422,0.246],[0.538,0.291],[0.555,0.311],[0.486,0.468],[0.307,0.696],[0.6,0.7]]],"3":[[[0.321,0.261],[0.553,0.254],[0.426,0.45],[0.573,0.55],[0.497,0.694],[0.3,0.68]]],"ㄱ":[[[0.248,0.25],[0.695,0.245],[0.66,0.8]]],"ㄴ":[[[0.298,0.201],[0.313,0.754],[0.76,0.75]]],"ㄷ":[[[0.702,0.22],[0.283,0.235],[0.288,0.733],[0.301,0.78],[0.72,0.78]]],"ㄹ":[[[0.281,0.199],[0.664,0.2],[0.696,0.205],[0.701,0.225],[0.696,0.466],[0.306,0.503],[0.305,0.775],[0.72,0.78]]],"ㅁ":[[[0.3,0.251],[0.303,0.744],[0.7,0.75]],[[0.3,0.25],[0.695,0.253],[0.7,0.75]]],"ㅂ":[[[0.302,0.2],[0.3,0.767],[0.313,0.778],[0.349,0.781],[0.695,0.775],[0.7,0.2]],[[0.297,0.502],[0.7,0.5]]],"ㅅ":[[[0.5,0.201],[0.25,0.8]],[[0.5,0.349],[0.75,0.8]]],"ㅇ":[[[0.501,0.234],[0.595,0.244],[0.659,0.281],[0.712,0.329],[0.75,0.414],[0.765,0.569],[0.709,0.663],[0.655,0.721],[0.596,0.756],[0.512,0.763],[0.418,0.755],[0.344,0.723],[0.282,0.651],[0.231,0.522],[0.237,0.425],[0.271,0.35],[0.346,0.283],[0.418,0.242],[0.5,0.233]]],"ㅈ":[[[0.253,0.222],[0.75,0.22]],[[0.502,0.219],[0.25,0.8]],[[0.501,0.422],[0.75,0.8]]],"ㅊ":[[[0.4,0.101],[0.6,0.1]],[[0.247,0.302],[0.75,0.3]],[[0.498,0.301],[0.25,0.82]],[[0.5,0.498],[0.75,0.82]]],"ㅋ":[[[0.248,0.253],[0.695,0.246],[0.66,0.8]],[[0.301,0.498],[0.66,0.5]]],"ㅌ":[[[0.703,0.22],[0.285,0.236],[0.289,0.767],[0.302,0.778],[0.337,0.78],[0.72,0.78]],[[0.302,0.501],[0.68,0.5]]],"ㅍ":[[[0.247,0.223],[0.75,0.22]],[[0.381,0.222],[0.36,0.75]],[[0.622,0.22],[0.64,0.75]],[[0.219,0.782],[0.78,0.78]]],"ㅎ":[[[0.402,0.121],[0.6,0.12]],[[0.249,0.281],[0.75,0.28]],[[0.501,0.429],[0.591,0.455],[0.659,0.518],[0.69,0.62],[0.68,0.677],[0.653,0.73],[0.558,0.8],[0.453,0.799],[0.376,0.762],[0.315,0.668],[0.309,0.61],[0.324,0.549],[0.347,0.508],[0.391,0.47],[0.5,0.427]]],"ㅏ":[[[0.399,0.15],[0.4,0.85]],[[0.399,0.499],[0.62,0.5]]],"ㅑ":[[[0.397,0.151],[0.4,0.85]],[[0.402,0.403],[0.62,0.4]],[[0.402,0.6],[0.62,0.6]]],"ㅓ":[[[0.598,0.151],[0.6,0.85]],[[0.381,0.497],[0.6,0.5]]],"ㅕ":[[[0.598,0.148],[0.6,0.85]],[[0.378,0.403],[0.6,0.4]],[[0.378,0.602],[0.6,0.6]]],"ㅗ":[[[0.499,0.353],[0.5,0.6]],[[0.2,0.598],[0.8,0.6]]],"ㅛ":[[[0.401,0.349],[0.4,0.6]],[[0.599,0.35],[0.6,0.6]],[[0.198,0.598],[0.8,0.6]]],"ㅜ":[[[0.199,0.402],[0.8,0.4]],[[0.501,0.401],[0.5,0.68]]],"ㅠ":[[[0.202,0.397],[0.8,0.4]],[[0.398,0.402],[0.4,0.68]],[[0.603,0.398],[0.6,0.68]]],"ㅡ":[[[0.181,0.499],[0.82,0.5]]],"ㅣ":[[[0.499,0.151],[0.5,0.85]]],"a":[[[0.417,0.46],[0.464,0.47],[0.511,0.506],[0.532,0.536],[0.539,0.593],[0.532,0.626],[0.496,0.669],[0.442,0.695],[0.407,0.698],[0.338,0.663],[0.302,0.582],[0.31,0.536],[0.335,0.496],[0.364,0.476],[0.42,0.461]],[[0.54,0.461],[0.54,0.7]]],"n":[[[0.303,0.697],[0.3,0.46]],[[0.298,0.521],[0.382,0.453],[0.496,0.463],[0.519,0.55],[0.52,0.7]]],"h":[[[0.301,0.241],[0.3,0.7]],[[0.302,0.519],[0.381,0.454],[0.495,0.462],[0.518,0.55],[0.52,0.7]]],"e":[[[0.302,0.582],[0.533,0.576],[0.509,0.493],[0.487,0.469],[0.362,0.475],[0.303,0.582],[0.344,0.677],[0.52,0.68]]],"l":[[[0.399,0.243],[0.4,0.7]]],"o":[[[0.448,0.461],[0.497,0.468],[0.535,0.493],[0.559,0.536],[0.568,0.591],[0.554,0.636],[0.525,0.671],[0.473,0.693],[0.404,0.69],[0.363,0.662],[0.346,0.635],[0.334,0.592],[0.337,0.545],[0.372,0.49],[0.45,0.461]]],"g":[[[0.45,0.457],[0.515,0.482],[0.564,0.546],[0.559,0.626],[0.523,0.67],[0.45,0.701],[0.392,0.682],[0.345,0.637],[0.331,0.581],[0.338,0.535],[0.367,0.497],[0.406,0.469],[0.45,0.459]],[[0.567,0.46],[0.566,0.849],[0.4,0.9]]],"w":[[[0.248,0.457],[0.321,0.692],[0.42,0.509],[0.52,0.692],[0.6,0.46]]],"r":[[[0.348,0.46],[0.35,0.7]],[[0.349,0.53],[0.451,0.454],[0.52,0.48]]],"d":[[[0.42,0.459],[0.486,0.482],[0.521,0.523],[0.54,0.578],[0.513,0.653],[0.455,0.69],[0.386,0.693],[0.337,0.663],[0.309,0.612],[0.308,0.556],[0.326,0.514],[0.365,0.476],[0.42,0.46]],[[0.537,0.237],[0.54,0.7]]],".":[[[0.447,0.681],[0.46,0.7]]],"!":[[[0.449,0.239],[0.45,0.58]],[[0.451,0.68],[0.46,0.7]]]};

  const HF = window.HandFont;
  const STAGES = [
    { id: 'ko', name: '한글 기본', chars: 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ', hint: '칸 안에 크게, 평소 쓰던 대로', desc: '자음 14 + 모음 10 → 한글 11,172자', required: true },
    { id: 'en', name: '영문 소문자·숫자', chars: 'abcdefghijklmnopqrstuvwxyz0123456789', hint: '진한 선이 밑줄이에요. 소문자는 가운데 선까지', desc: 'a–z, 0–9 · 36자' },
    { id: 'up', name: '영문 대문자·문장부호', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?\'-~', hint: '대문자는 맨 위 선까지, 부호는 밑줄에 맞춰서', desc: 'A–Z, . , ! ? \' - ~ · 33자' },
    { id: 'ko2', name: '쌍자음·ㅐ·ㅔ', chars: 'ㄲㄸㅃㅆㅉㅐㅔ', hint: '안 써도 자동으로 조합되지만, 직접 쓰면 더 자연스러워요', desc: '까·따·빠·싸·짜·애·에 가 더 예뻐져요 · 7자' },
  ];
  const NAMES = { 'ㄱ': '기역', 'ㄴ': '니은', 'ㄷ': '디귿', 'ㄹ': '리을', 'ㅁ': '미음', 'ㅂ': '비읍', 'ㅅ': '시옷', 'ㅇ': '이응', 'ㅈ': '지읒', 'ㅊ': '치읓', 'ㅋ': '키읔', 'ㅌ': '티읕', 'ㅍ': '피읖', 'ㅎ': '히읗', 'ㅏ': '아', 'ㅑ': '야', 'ㅓ': '어', 'ㅕ': '여', 'ㅗ': '오', 'ㅛ': '요', 'ㅜ': '우', 'ㅠ': '유', 'ㅡ': '으', 'ㅣ': '이', 'ㄲ': '쌍기역', 'ㄸ': '쌍디귿', 'ㅃ': '쌍비읍', 'ㅆ': '쌍시옷', 'ㅉ': '쌍지읒', 'ㅐ': '애', 'ㅔ': '에', '.': '마침표', ',': '쉼표', '!': '느낌표', '?': '물음표', '\'': '작은따옴표', '-': '하이픈', '~': '물결' };
  // 응원 문구 — 첫 화면 예시(탭하면 순환)와 완성 화면 칩에 같이 쓰여요. 쉼표·물음표는 24자 예시 폰트에 없어서 피했어요.
  const CHEER_LINES = [
    '오늘도 잘하고 있어. 진짜로.',
    '졸업 좀 미뤄도 인생 안 망해.',
    '망해도 돼. 다시 하면 되지.',
    '지금 이대로도 충분해!',
    '천천히 가도 도착은 해.',
    '불안한 건 잘하고 싶어서야.',
    '떨어져도 너는 안 떨어져.',
    '오늘 한 것만으로도 대단해.',
    '월요일아 덤벼라!',
    '잘 자고 내일 또 하자.',
    '우리 다 처음이라 서툰 거야.',
    '하고 싶은 거 다 해. 지금.',
  ];
  const SAMPLE_WORDS = ['힘내', '괜찮아', '잘하고 있어', '할 수 있어', '고생했어', '수고했어', '안녕', '사랑해', '오늘', '고마워', '우리', '하루', '행복', '봄날', '커피', '여행', '기록', '마음', '노래', '바다', '하늘', '꿈', '집', '친구', '일기', '선물', '잘자', '좋아', '보고싶다', '나의 글씨'];
  const CARD_BTN = '공유 카드 만들기 (인스타 4:5)';
  const LS_KEY = 'gsg.v1';

  const $ = (id) => document.getElementById(id);
  const state = { glyphs: {}, stage: 0, idx: 0, pen: 30, name: CONFIG.defaultName, nameEn: CONFIG.defaultNameEn, sample: CONFIG.defaultSample };
  let cur = [], drawing = false, built = null, builtStats = null, faceName = null, faceOk = false, faceCounter = 0, demoFace = null;
  let downloadsP = (window.claude && typeof window.claude.use === 'function') ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);

  // ---------- persistence ----------
  function pack(g) { const o = {}; for (const k in g) o[k] = g[k].map(s => s.map(p => [+p.x.toFixed(4), +p.y.toFixed(4)])); return o; }
  function unpack(o) { const g = {}; for (const k in o) g[k] = o[k].map(s => s.map(p => ({ x: p[0], y: p[1] }))); return g; }
  function storageStatus(ok, message) {
    $('storageWarning').hidden = ok;
    $('storageWarning').textContent = ok ? '' : message;
    $('drawSaved').textContent = ok ? '자동 저장됨' : '자동 저장 실패';
  }
  function save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ glyphs: pack(state.glyphs), pen: state.pen, name: state.name, nameEn: state.nameEn, sample: state.sample, stage: state.stage, idx: state.idx }));
      storageStatus(true); return true;
    } catch (e) {
      storageStatus(false, '이 브라우저에 자동 저장하지 못했어요. 지금 쓴 글자는 화면에 남아 있지만, 창을 닫거나 새로고침하면 사라질 수 있어요. 닫기 전에 결과 화면에서 폰트 파일을 받아 주세요.');
      return false;
    }
  }
  function load() {
    try { const raw = localStorage.getItem(LS_KEY); if (!raw) return; const d = JSON.parse(raw); state.glyphs = unpack(d.glyphs || {}); state.pen = d.pen || 30; state.name = d.name || state.name; state.nameEn = d.nameEn || state.nameEn; state.sample = d.sample || state.sample; state.stage = d.stage || 0; state.idx = d.idx || 0; } catch (e) { storageStatus(false, '이전에 저장한 글자를 불러오지 못했어요. 이전 작업이 있다면 사용하던 브라우저에서 다시 확인해 주세요.'); }
  }
  function drawnCount(stage) { let n = 0; for (const ch of stage.chars) if (state.glyphs[ch] && state.glyphs[ch].length) n++; return n; }
  function totalDrawn() { let n = 0; for (const k in state.glyphs) if (state.glyphs[k].length) n++; return n; }
  function koReady() { return HF.BASIC_CONS.split('').some(c => state.glyphs[c] && state.glyphs[c].length) && HF.BASIC_VOW.split('').some(c => state.glyphs[c] && state.glyphs[c].length); }

  function missingKo() { return [...STAGES[0].chars].filter(c => !(state.glyphs[c] && state.glyphs[c].length)); }
  function hangulCount() { return (builtStats ? builtStats.hangul : 0).toLocaleString('ko-KR'); }

  // ---------- screens ----------
  function show(id) { for (const s of ['s-home', 's-draw', 's-done']) $(s).hidden = s !== id; window.scrollTo(0, 0); $('topStep').textContent = id === 's-draw' ? '쓰는 중' : id === 's-done' ? '결과' : ''; }
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200); }

  // ---------- HOME ----------
  function renderHome() {
    const n = totalDrawn();
    $('btnResume').hidden = n === 0;
    $('resumeCount').textContent = n ? `(${n}자)` : '';
    $('btnStart').textContent = n ? '처음부터 새로 쓰기' : '시작하기';
  }
  let demoIdx = Math.floor(Math.random() * CHEER_LINES.length), demoGlyphs = null, demoUseCanvas = false;
  function renderDemoLine() {
    const line = CHEER_LINES[demoIdx];
    if (demoUseCanvas) { const c = $('demoCanvas'); drawOnCanvas(c, demoGlyphs, line, 28); }
    else $('demoText').textContent = line;
  }
  async function demoFont() {
    demoGlyphs = unpack(DEMO_GLYPHS);
    const res = HF.buildFont({ glyphs: demoGlyphs, penRadius: 28, family: 'Demo', familyAscii: 'GsgDemo' });
    const ok = await applyFace('GsgDemo', res.buffer);
    if (ok) { $('demoText').style.fontFamily = `"GsgDemo", "Gaegu", cursive`; }
    else { demoUseCanvas = true; $('demoText').hidden = true; $('demoCanvas').hidden = false; }
    renderDemoLine();
  }
  function nextDemoLine() { demoIdx = (demoIdx + 1) % CHEER_LINES.length; renderDemoLine(); }
  $('demo').addEventListener('click', nextDemoLine);
  $('demo').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextDemoLine(); } });
  async function applyFace(name, buffer) {
    try {
      if (!window.FontFace) return false;
      const face = new FontFace(name, buffer);
      await face.load();
      document.fonts.add(face);
      return true;
    } catch (e) { return false; }
  }
  function drawOnCanvas(c, glyphs, text, pen) {
    const dpr = window.devicePixelRatio || 1; const w = c.clientWidth || 400, h = c.clientHeight || 80;
    c.width = w * dpr; c.height = h * dpr; const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    const size = Math.min(h * 0.8, w / Math.max(1, HF.measureText(glyphs, text, 1000, pen) / 1000) * 0.98);
    HF.drawText(ctx, glyphs, text, 4, h * 0.72, size, pen, getComputedStyle(document.body).color);
  }

  // ---------- DRAW ----------
  const pad = $('pad');
  function stage() { return STAGES[state.stage]; }
  function curChar() { return stage().chars[state.idx]; }
  function isLatin(ch) { return !(ch.codePointAt(0) >= 0x3131 && ch.codePointAt(0) <= 0x3163); }
  function resizePad() { const dpr = window.devicePixelRatio || 1; const w = pad.clientWidth || 340; pad.width = Math.round(w * dpr); pad.height = Math.round(w * dpr); redraw(); }
  function padColor(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function redraw() {
    const ctx = pad.getContext('2d'); const W = pad.width; const ch = curChar();
    ctx.clearRect(0, 0, W, W);
    // guides
    ctx.save();
    ctx.strokeStyle = padColor('--grid'); ctx.lineWidth = Math.max(1, W / 340);
    if (isLatin(ch)) {
      const L = HF.LATIN; const lines = [[0.24, '대문자'], [0.46, '소문자'], [L.base, '밑줄'], [0.90, '']];
      ctx.font = `${Math.round(W * 0.03)}px "IBM Plex Sans KR", sans-serif`; ctx.fillStyle = padColor('--ink-3'); ctx.textBaseline = 'bottom';
      for (const [y, lbl] of lines) {
        ctx.beginPath(); ctx.setLineDash(y === L.base ? [] : [W * 0.012, W * 0.012]); ctx.strokeStyle = y === L.base ? padColor('--pen-line') : padColor('--line'); ctx.lineWidth = y === L.base ? Math.max(1.5, W / 220) : Math.max(1, W / 340);
        ctx.moveTo(W * 0.06, y * W); ctx.lineTo(W * 0.94, y * W); ctx.stroke();
        if (lbl) ctx.fillText(lbl, W * 0.06, y * W - 3);
      }
      ctx.setLineDash([]);
      // ghost letter on the baseline
      ctx.font = `500 ${Math.round(W * 0.6)}px "IBM Plex Sans KR", system-ui, sans-serif`; ctx.fillStyle = padColor('--ghost'); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = 0.55; ctx.fillText(ch, W * 0.5, L.base * W); ctx.globalAlpha = 1;
    } else {
      ctx.setLineDash([W * 0.012, W * 0.012]); ctx.strokeStyle = padColor('--line');
      ctx.strokeRect(W * 0.14, W * 0.14, W * 0.72, W * 0.72);
      ctx.beginPath(); ctx.moveTo(W * 0.5, W * 0.14); ctx.lineTo(W * 0.5, W * 0.86); ctx.moveTo(W * 0.14, W * 0.5); ctx.lineTo(W * 0.86, W * 0.5); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `500 ${Math.round(W * 0.5)}px "IBM Plex Sans KR", "Apple SD Gothic Neo", system-ui, sans-serif`; ctx.fillStyle = padColor('--ghost'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.5; ctx.fillText(ch, W * 0.5, W * 0.52); ctx.globalAlpha = 1;
    }
    ctx.restore();
    // strokes
    ctx.save();
    ctx.strokeStyle = getComputedStyle(document.body).color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = (2 * state.pen) * W / (isLatin(ch) ? HF.LATIN.K : 860); // same pen as the font at this scale
    const strokes = (state.glyphs[ch] || []).concat(cur.length ? [cur] : []);
    for (const s of strokes) {
      if (!s.length) continue; ctx.beginPath(); ctx.moveTo(s[0].x * W, s[0].y * W);
      if (s.length === 1) ctx.lineTo(s[0].x * W + 0.1, s[0].y * W); else for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x * W, s[i].y * W);
      ctx.stroke();
    }
    ctx.restore();
  }
  function ptOf(e) { const r = pad.getBoundingClientRect(); return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) }; }
  pad.addEventListener('pointerdown', e => { e.preventDefault(); try { pad.setPointerCapture(e.pointerId); } catch (x) {} drawing = true; cur = [ptOf(e)]; redraw(); });
  pad.addEventListener('pointermove', e => {
    if (!drawing) return; e.preventDefault();
    const evs = (typeof e.getCoalescedEvents === 'function') ? e.getCoalescedEvents() : [e];
    if (!evs.length) evs.push(e);
    for (const ev of evs) cur.push(ptOf(ev));
    redraw();
  });
  function endStroke(e) {
    if (!drawing) return; drawing = false;
    if (e) cur.push(ptOf(e));
    const ch = curChar(); const clean = HF.cleanStroke(cur);
    if (clean.length) { (state.glyphs[ch] = state.glyphs[ch] || []).push(clean); }
    cur = []; redraw(); save(); renderChips(); renderLive();
  }
  pad.addEventListener('pointerup', endStroke);
  pad.addEventListener('pointercancel', endStroke);
  pad.addEventListener('lostpointercapture', () => { if (drawing) endStroke(); });
  $('btnUndo').addEventListener('click', () => { const ch = curChar(); if (state.glyphs[ch] && state.glyphs[ch].length) { state.glyphs[ch].pop(); if (!state.glyphs[ch].length) delete state.glyphs[ch]; } redraw(); save(); renderChips(); renderLive(); });
  $('btnClear').addEventListener('click', () => { delete state.glyphs[curChar()]; redraw(); save(); renderChips(); renderLive(); });

  function renderDraw() {
    const st = stage(); const ch = curChar();
    $('stageName').textContent = st.name; $('cur').textContent = state.idx + 1; $('total').textContent = st.chars.length;
    $('bar').style.width = (drawnCount(st) / st.chars.length * 100) + '%';
    $('targetCh').textContent = ch; $('targetName').textContent = NAMES[ch] || (isLatin(ch) ? (ch >= 'a' && ch <= 'z' ? '소문자 ' + ch : ch >= 'A' && ch <= 'Z' ? '대문자 ' + ch : /\d/.test(ch) ? '숫자 ' + ch : ch) : ch);
    $('targetHint').textContent = st.hint;
    $('btnPrev').disabled = state.idx === 0;
    $('btnNext').textContent = state.idx === st.chars.length - 1 ? (st.required ? '완성하기' : '결과 보기') : '다음';
    renderChips(); resizePad(); renderLive(); save();
  }
  function renderChips() {
    const st = stage(); const box = $('chips'); box.innerHTML = '';
    [...st.chars].forEach((c, i) => {
      const b = document.createElement('button'); b.className = 'chip' + ((state.glyphs[c] && state.glyphs[c].length) ? ' done' : '') + (i === state.idx ? ' cur' : ''); b.textContent = c; b.type = 'button';
      b.addEventListener('click', () => { state.idx = i; renderDraw(); }); box.appendChild(b);
    });
    const curEl = box.children[state.idx]; if (curEl && curEl.scrollIntoView) { try { curEl.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {} }
    $('bar').style.width = (drawnCount(st) / st.chars.length * 100) + '%';
  }
  function canRender(word) { return HF.canRender(state.glyphs, word); }
  function renderLive() {
    const c = $('live'), hint = $('liveHint');
    let words = SAMPLE_WORDS.filter(canRender);
    if (stage().id === 'en' || stage().id === 'up') { const en = ['hello', 'love', 'today', 'thank you', 'good night', '2026', 'me', 'hi'].filter(canRender); words = en.concat(words); }
    if (!words.length) { c.hidden = true; hint.hidden = false; return; }
    let text = ''; for (const w of words) { const t = text ? text + '  ' + w : w; if ([...t].length > 14) break; text = t; }
    c.hidden = false; hint.hidden = true; drawOnCanvas(c, state.glyphs, text, state.pen);
  }
  $('btnPrev').addEventListener('click', () => { if (state.idx > 0) { state.idx--; renderDraw(); } });
  $('btnNext').addEventListener('click', () => {
    const st = stage();
    if (state.idx < st.chars.length - 1) { state.idx++; renderDraw(); return; }
    // end of stage
    const missing = [...st.chars].filter(c => !(state.glyphs[c] && state.glyphs[c].length));
    if (st.required && missing.length) { toast(`아직 안 쓴 글자가 있어요: ${missing.slice(0, 6).join(' ')}${missing.length > 6 ? ' …' : ''}`); state.idx = st.chars.indexOf(missing[0]); renderDraw(); return; }
    goDone();
  });
  $('btnExitDraw').addEventListener('click', () => { if (koReady()) goDone(); else { toast('자음 하나, 모음 하나는 있어야 폰트가 만들어져요'); } });
  window.addEventListener('resize', () => { if (!$('s-draw').hidden) resizePad(); });

  // ---------- DONE ----------
  async function buildAndApply() {
    const res = HF.buildFont({ glyphs: state.glyphs, penRadius: state.pen, family: state.name, familyAscii: state.nameEn });
    built = res.buffer; builtStats = res.stats;
    const name = 'GsgUser' + (++faceCounter);
    faceOk = await applyFace(name, built.slice(0));
    if (faceOk) { if (faceName) { try { for (const f of document.fonts) if (f.family === faceName) document.fonts.delete(f); } catch (e) {} } faceName = name; }
    renderPreview();
  }
  function renderPreview() {
    resetCard(); // 문장·펜 굵기가 바뀌면 만들어 둔 카드는 옛것이 돼요
    const pv = $('pv'), pc = $('pvCanvas');
    if (faceOk) { pv.hidden = false; pc.hidden = true; pv.style.fontFamily = `"${faceName}", "Gaegu", cursive`; pv.textContent = state.sample || ' '; }
    else { pv.hidden = true; pc.hidden = false; pc.style.height = '120px'; drawOnCanvas(pc, state.glyphs, state.sample, state.pen); }
    const en = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(c => state.glyphs[c]).length; const up = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c => state.glyphs[c]).length; const dg = '0123456789'.split('').filter(c => state.glyphs[c]).length;
    const parts = [`한글 ${hangulCount()}자`]; if (en) parts.push(`영문 소문자 ${en}자`); if (up) parts.push(`대문자 ${up}자`); if (dg) parts.push(`숫자 ${dg}자`);
    $('doneMeta').textContent = `${parts.join(' · ')} — 직접 쓴 ${totalDrawn()}자로 만들었어요.`;
    const missing = missingKo();
    $('doneLabel').textContent = missing.length ? '일부 완성 · 미리보기' : '완성';
    $('topStep').textContent = missing.length ? '일부 완성' : '완성';
    $('doneTitle').textContent = missing.length ? '지금까지 쓴 글씨로 만든 폰트예요' : '짜잔, 내 글씨가 폰트가 됐어요';
    $('partialNotice').hidden = missing.length === 0;
    $('partialText').textContent = missing.length ? `기본 24자 중 ${24 - missing.length}자를 썼어요. 남은 ${missing.length}자(${missing.join(' ')})를 쓰면 한글 11,172자가 모두 들어 있는 폰트를 받을 수 있어요.` : '';
    $('fallbackNote').textContent = faceOk ? '아직 조합되지 않은 한글과 직접 쓰지 않은 영문·문장부호는 미리보기와 카드에서 기본 글꼴로 보이며, 다운로드한 폰트에는 포함되지 않아요.' : '이 브라우저에서는 직접 쓴 획으로 미리 보여드려요. 아직 만들지 않은 글자는 빈칸으로 보이고, 다운로드한 폰트에도 포함되지 않아요.';
    $('pvName').textContent = state.name + (state.nameEn ? ` · ${state.nameEn}` : '');
    $('pvSize').textContent = builtStats ? `${(builtStats.bytes / 1024).toFixed(0)} KB · ${builtStats.numGlyphs.toLocaleString()} glyphs` : '';
  }
  function renderStageList() {
    const box = $('stageList'); box.innerHTML = '';
    STAGES.forEach((st, i) => {
      const n = drawnCount(st); const row = document.createElement('div'); row.className = 'stage-row';
      row.innerHTML = `<div><b>${st.name} <span class="num muted" style="font-weight:500">${n}/${st.chars.length}</span></b><span>${st.desc}</span></div>`;
      const b = document.createElement('button'); b.className = 'btn' + (n < st.chars.length && !st.required ? ' primary' : ''); b.textContent = n === 0 ? '쓰기' : n < st.chars.length ? '이어 쓰기' : '고치기';
      b.addEventListener('click', () => { state.stage = i; const first = [...st.chars].findIndex(c => !(state.glyphs[c] && state.glyphs[c].length)); state.idx = first < 0 ? 0 : first; show('s-draw'); renderDraw(); });
      row.appendChild(b); box.appendChild(row);
    });
  }
  $('btnContinueKo').addEventListener('click', () => { state.stage = 0; state.idx = Math.max(0, STAGES[0].chars.indexOf(missingKo()[0])); show('s-draw'); renderDraw(); });
  function renderCheerChips() {
    const box = $('cheerChips'); box.innerHTML = '';
    CHEER_LINES.forEach(line => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'cheer-chip' + (line === state.sample ? ' on' : ''); b.textContent = line;
      b.addEventListener('click', () => { state.sample = line; $('sample').value = line; save(); renderPreview(); for (const x of box.children) x.classList.toggle('on', x === b); });
      box.appendChild(b);
    });
  }
  async function goDone() {
    show('s-done');
    $('sample').value = state.sample; $('fname').value = state.name; $('fnameEn').value = state.nameEn;
    renderCheerChips();
    for (const b of $('penSeg').children) b.classList.toggle('on', +b.dataset.pen === state.pen);
    resetCard(); $('btnCard').textContent = '공유 카드 만들기 (인스타 4:5)';
    renderStageList();
    await buildAndApply();
  }
  $('sample').addEventListener('input', e => { state.sample = e.target.value; save(); renderPreview(); for (const x of $('cheerChips').children) x.classList.toggle('on', x.textContent === state.sample); });
  $('fname').addEventListener('input', e => { state.name = e.target.value.trim() || CONFIG.defaultName; save(); $('pvName').textContent = state.name + ' · ' + state.nameEn; });
  $('fnameEn').addEventListener('input', e => { state.nameEn = e.target.value.replace(/[^A-Za-z0-9 \-]/g, '').trim() || CONFIG.defaultNameEn; save(); $('pvName').textContent = state.name + ' · ' + state.nameEn; });
  $('fname').addEventListener('change', buildAndApply); $('fnameEn').addEventListener('change', buildAndApply);
  $('penSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.pen = +b.dataset.pen; for (const x of $('penSeg').children) x.classList.toggle('on', x === b); save(); buildAndApply(); });

  async function saveFile(filename, blob) {
    const dl = await downloadsP;
    if (dl && typeof dl.save === 'function') {
      try { await dl.save({ filename, data: blob }); toast('저장했어요: ' + filename); return true; }
      catch (err) {
        const code = err && err.code;
        if (code === 'declined') { toast('저장을 취소했어요'); return false; }
        if (code === 'rate_limited') { toast('잠시 후 다시 눌러 주세요'); return false; }
        if (code && code !== 'unavailable' && code !== 'not_granted') { toast('저장할 수 없어요 (' + code + ')'); return false; }
      }
    }
    try {
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('다운로드를 시작했어요'); return true;
    } catch (e) { toast('이 환경에서는 저장이 막혀 있어요'); return false; }
  }
  $('btnFont').addEventListener('click', async () => {
    if (!built) await buildAndApply();
    const fn = (state.nameEn.replace(/\s+/g, '') || 'MyHandwriting') + '.ttf';
    await saveFile(fn, new Blob([built], { type: 'font/ttf' }));
  });

  // ---------- share card (1080x1350) ----------
  function wrapLines(measure, text, maxW) { // word-wrap (keep-all), char-wrap only for words wider than a line
    const out = [];
    for (const para of String(text).split('\n')) {
      let line = '';
      for (const word of para.split(' ')) {
        if (!word) continue;
        const t = line ? line + ' ' + word : word;
        if (measure(t) <= maxW) { line = t; continue; }
        if (line) { out.push(line); line = ''; }
        if (measure(word) <= maxW) { line = word; continue; }
        for (const ch of word) { if (measure(line + ch) > maxW && line) { out.push(line); line = ch; } else line += ch; }
      }
      out.push(line);
    }
    return out;
  }
  function cardLayout(text, metrics, maxW, top, bottom) {
    for (let size = 150; size >= 60; size -= 6) {
      const lines = wrapLines(s => metrics(s, size).width, text, maxW);
      let ascent = size * 0.95, descent = size * 0.3;
      for (const line of lines) {
        const m = metrics(line, size);
        ascent = Math.max(ascent, m.ascent); descent = Math.max(descent, m.descent);
      }
      const lh = Math.max(size * 1.35, ascent + descent + size * 0.1);
      const height = ascent + descent + (lines.length - 1) * lh;
      if (height <= bottom - top) return { lines, size, lh, y: top + (bottom - top - height) / 2 + ascent };
    }
    throw new RangeError('문구가 카드 한 장에 들어가지 않아요. 문장을 짧게 하거나 줄바꿈을 줄인 뒤 다시 만들어 주세요.');
  }
  async function makeCard() {
    if (!built) await buildAndApply();
    const W = 1080, H = 1350; const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
    const th = document.documentElement.dataset.theme; const dark = th === 'dark' || (th !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    const P = dark ? { bg: '#14161C', grid: '#20242E', ink: '#ECEEF3', ink2: '#A9B0C2', pen: '#7E9AFF', hl: '#E3CB3E', hlInk: '#1A1600' } : { bg: '#F5F6F8', grid: '#E7EAF1', ink: '#191B22', ink2: '#5B6170', pen: '#2044C8', hl: '#FFE95C', hlInk: '#3B3200' };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = P.grid; ctx.lineWidth = 2;
    for (let x = 60; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 60; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const UI = '"IBM Plex Sans KR", sans-serif';
    // 손글씨 폰트로 재기·그리기 (FontFace가 안 되는 환경은 획으로 직접 그려요)
    const handW = (s, size) => { if (faceOk) { ctx.font = `${size}px "${faceName}"`; return ctx.measureText(s).width; } return HF.measureText(state.glyphs, s, size, state.pen); };
    const hand = (s, x, y, size, color) => { if (faceOk) { ctx.font = `${size}px "${faceName}"`; ctx.fillStyle = color; ctx.fillText(s, x, y); } else HF.drawText(ctx, state.glyphs, s, x, y, size, state.pen, color); };
    const handMetrics = (s, size) => {
      const width = handW(s, size);
      const m = faceOk ? ctx.measureText(s) : null;
      return { width, ascent: m ? m.actualBoundingBoxAscent : size, descent: m ? m.actualBoundingBoxDescent : size * 0.35 };
    };
    const uiLine = (text, x, y, size, weight, color) => {
      ctx.fillStyle = color;
      do { ctx.font = `${weight} ${size}px ${UI}`; if (ctx.measureText(text).width <= W - 160 || size <= 16) break; size--; } while (true);
      ctx.fillText(text, x, y);
    };
    // top label
    const label = '내 손글씨로 만든 폰트';
    ctx.font = `700 28px ${UI}`; const lw = 300;
    ctx.fillStyle = P.hl; ctx.fillRect(80, 92, lw, 56); ctx.fillStyle = P.hlInk; ctx.textBaseline = 'middle'; ctx.fillText(label, 100, 120);
    ctx.fillStyle = P.ink2; ctx.font = `500 26px ${UI}`;
    ctx.textAlign = 'right'; ctx.fillText(CONFIG.brand, W - 80, 120); ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    // main text
    const text = state.sample || CONFIG.defaultSample;
    // 머리말과 하단 출처 영역을 제외하고, 실제 글자 높이를 재서 배치해요.
    const layout = cardLayout(text, handMetrics, W - 180, 220, 1100);
    const { size, lines, lh } = layout; let y = layout.y;
    ctx.textBaseline = 'alphabetic';
    for (const ln of lines) { hand(ln, 80, y, size, P.ink); y += lh; }
    // bottom
    const d = new Date(); const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    uiLine(state.name, 80, H - 170, 34, 600, P.ink);
    uiLine(`${date} · 직접 쓴 ${totalDrawn()}자로 한글 ${hangulCount()}자`, 80, H - 126, 26, 400, P.ink2);
    ctx.fillStyle = P.pen; ctx.font = `600 30px ${UI}`; ctx.textAlign = 'right';
    ctx.fillText(`${CONFIG.handle}  ${CONFIG.hashtag}`, W - 80, H - 80); ctx.textAlign = 'left';
    return c;
  }
  // 파일 공유를 지원하면 기기의 공유 시트를 열어요. 대상 앱은 기기 환경에 따라 달라요.
  let cardBlob = null;
  const canShareFiles = (() => { try { return !!(navigator.canShare && navigator.canShare({ files: [new File([new Uint8Array(1)], 'x.png', { type: 'image/png' })] })); } catch (e) { return false; } })();
  function cardFileName() { return (state.nameEn.replace(/\s+/g, '') || 'MyHandwriting') + '-card.png'; }
  function resetCard() { cardBlob = null; $('cardImg').classList.remove('show'); $('cardActions').hidden = true; $('cardError').hidden = true; $('cardError').textContent = ''; }
  $('btnCard').addEventListener('click', async () => {
    resetCard();
    const b = $('btnCard'); b.disabled = true; b.textContent = '카드 만드는 중…';
    try {
      const c = await makeCard();
      cardBlob = await new Promise(res => c.toBlob(res, 'image/png'));
      if (!cardBlob) throw new Error('PNG encoding failed');
      const img = $('cardImg'); img.src = c.toDataURL('image/png'); img.classList.add('show');
      $('btnShare').hidden = !canShareFiles;
      $('cardActions').hidden = false;
      toast(canShareFiles ? '카드 완성! 공유하거나 저장하세요' : '카드 완성! 이미지를 저장하세요');
    } catch (e) {
      resetCard();
      $('cardError').textContent = e instanceof RangeError ? e.message : '카드를 만들지 못했어요. 잠시 후 다시 눌러 주세요.';
      $('cardError').hidden = false;
    } finally { b.disabled = false; b.textContent = cardBlob ? '카드 다시 만들기' : CARD_BTN; }
  });
  $('btnShare').addEventListener('click', async () => {
    if (!cardBlob) return;
    const file = new File([cardBlob], cardFileName(), { type: 'image/png' });
    try { await navigator.share({ files: [file], title: CONFIG.brand, text: `${state.sample}\n${CONFIG.handle} ${CONFIG.hashtag}` }); }
    catch (e) { if (e && e.name === 'AbortError') return; toast('공유가 안 되면 저장해서 올려 주세요'); }
  });
  $('btnSaveCard').addEventListener('click', async () => { if (cardBlob) await saveFile(cardFileName(), cardBlob); });

  function twoTap(btn, label, fn) { // sandboxed pages block confirm(); ask by a second tap instead
    if (btn.dataset.armed === '1') { btn.dataset.armed = ''; btn.textContent = btn.dataset.label; fn(); return; }
    btn.dataset.label = btn.textContent; btn.dataset.armed = '1'; btn.textContent = label;
    setTimeout(() => { if (btn.dataset.armed === '1') { btn.dataset.armed = ''; btn.textContent = btn.dataset.label; } }, 4000);
  }
  $('btnReset').addEventListener('click', e => twoTap(e.currentTarget, '정말요? 다시 누르면 모두 지워져요', () => {
    state.glyphs = {}; state.stage = 0; state.idx = 0; built = null; save(); renderHome(); show('s-home');
  }));
  $('btnStart').addEventListener('click', e => {
    const go = () => { state.glyphs = {}; state.stage = 0; state.idx = 0; built = null; save(); show('s-draw'); renderDraw(); };
    if (totalDrawn()) twoTap(e.currentTarget, '저장된 글자가 지워져요. 다시 누르면 시작', go); else go();
  });
  $('btnResume').addEventListener('click', () => {
    if (koReady() && drawnCount(STAGES[0]) === STAGES[0].chars.length) { goDone(); return; }
    state.stage = 0; const first = [...STAGES[0].chars].findIndex(c => !(state.glyphs[c] && state.glyphs[c].length)); state.idx = first < 0 ? 0 : first; show('s-draw'); renderDraw();
  });

  // ---------- boot ----------
  function applyConfig() {
    $('brand').firstChild.textContent = CONFIG.brand + ' ';
    $('igHandle').textContent = CONFIG.handle; $('igHandle2').textContent = CONFIG.handle; $('igTag').textContent = CONFIG.hashtag; $('igLink').href = CONFIG.profileUrl;
    document.title = CONFIG.brand;
  }
  function start() {
    load(); applyConfig(); renderHome(); show('s-home');
    try { document.fonts.ready.then(demoFont); } catch (e) { demoFont(); }
  }
  try { if (window.claude && window.claude.hot && typeof window.claude.hot.snapshot === 'function') window.claude.hot.snapshot(() => ({ ok: true })); } catch (e) {}
  start();
})();
