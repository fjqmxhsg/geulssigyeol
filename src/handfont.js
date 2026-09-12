/* HandFont engine — handwriting strokes → composable Hangul/Latin TrueType font.
 * Works in browser and Node. No dependencies.
 * Coordinates: input strokes are normalized canvas coords (0..1, y down).
 * Font units: 1000 upm, y up.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HandFont = factory();
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  // ---------- Metrics ----------
  const UPM = 1000;
  const ASC = 880, DESC = -200, LINEGAP = 80;
  const HBOX = { x: 60, w: 840, top: 790, h: 850, adv: 960 }; // Hangul syllable box
  const LATIN = { base: 0.70, K: 1300, lsb: 40, rsb: 40, space: 300 };

  // ---------- Hangul tables ----------
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const JONG = '\0ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
  const BASIC_CONS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ';
  const BASIC_VOW = 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ';
  const CONS_DECOMP = { 'ㄲ': 'ㄱㄱ', 'ㄸ': 'ㄷㄷ', 'ㅃ': 'ㅂㅂ', 'ㅆ': 'ㅅㅅ', 'ㅉ': 'ㅈㅈ', 'ㄳ': 'ㄱㅅ', 'ㄵ': 'ㄴㅈ', 'ㄶ': 'ㄴㅎ', 'ㄺ': 'ㄹㄱ', 'ㄻ': 'ㄹㅁ', 'ㄼ': 'ㄹㅂ', 'ㄽ': 'ㄹㅅ', 'ㄾ': 'ㄹㅌ', 'ㄿ': 'ㄹㅍ', 'ㅀ': 'ㄹㅎ', 'ㅄ': 'ㅂㅅ' };
  const VVOW_DECOMP = { 'ㅐ': 'ㅏㅣ', 'ㅒ': 'ㅑㅣ', 'ㅔ': 'ㅓㅣ', 'ㅖ': 'ㅕㅣ' };
  const MIXED = { 'ㅘ': ['ㅗ', 'ㅏ'], 'ㅙ': ['ㅗ', 'ㅐ'], 'ㅚ': ['ㅗ', 'ㅣ'], 'ㅝ': ['ㅜ', 'ㅓ'], 'ㅞ': ['ㅜ', 'ㅔ'], 'ㅟ': ['ㅜ', 'ㅣ'], 'ㅢ': ['ㅡ', 'ㅣ'] };
  const VERT = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅣ', HORZ = 'ㅗㅛㅜㅠㅡ';

  // Slot layouts as fractions of the Hangul box (x, y-from-top, w, h)
  const LAYOUT = {
    V:  { cho: [0.05, 0.10, 0.50, 0.80], vow: [0.60, 0.04, 0.36, 0.92] },
    H:  { cho: [0.16, 0.05, 0.68, 0.48], vow: [0.05, 0.57, 0.90, 0.38] },
    M:  { cho: [0.05, 0.06, 0.48, 0.46], hv: [0.03, 0.55, 0.64, 0.38], vv: [0.70, 0.04, 0.27, 0.92] },
    VJ: { cho: [0.05, 0.05, 0.46, 0.52], vow: [0.57, 0.02, 0.38, 0.60], jong: [0.12, 0.66, 0.76, 0.32] },
    HJ: { cho: [0.18, 0.02, 0.64, 0.36], vow: [0.05, 0.40, 0.90, 0.25], jong: [0.12, 0.68, 0.76, 0.30] },
    MJ: { cho: [0.05, 0.03, 0.46, 0.40], hv: [0.03, 0.44, 0.62, 0.24], vv: [0.68, 0.02, 0.29, 0.63], jong: [0.12, 0.69, 0.76, 0.29] },
  };

  // ---------- Geometry helpers ----------
  function smooth(pts, passes) {
    let p = pts;
    for (let k = 0; k < (passes || 1); k++) {
      if (p.length < 3) return p;
      const out = [p[0]];
      for (let i = 1; i < p.length - 1; i++) {
        out.push({ x: (p[i - 1].x + 2 * p[i].x + p[i + 1].x) / 4, y: (p[i - 1].y + 2 * p[i].y + p[i + 1].y) / 4 });
      }
      out.push(p[p.length - 1]);
      p = out;
    }
    return p;
  }
  function rdp(pts, eps) {
    if (pts.length < 3) return pts.slice();
    const keep = new Uint8Array(pts.length); keep[0] = 1; keep[pts.length - 1] = 1;
    const stack = [[0, pts.length - 1]];
    while (stack.length) {
      const [a, b] = stack.pop();
      const A = pts[a], B = pts[b];
      const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1e-9;
      let maxd = -1, idx = -1;
      for (let i = a + 1; i < b; i++) {
        const P = pts[i];
        let d;
        if (len < 1e-9) d = Math.hypot(P.x - A.x, P.y - A.y);
        else d = Math.abs(dy * P.x - dx * P.y + B.x * A.y - B.y * A.x) / len;
        if (d > maxd) { maxd = d; idx = i; }
      }
      if (maxd > eps && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
    }
    const out = [];
    for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
    return out;
  }
  function dedupe(pts, minD) {
    const out = [];
    for (const p of pts) {
      if (!out.length || Math.hypot(p.x - out[out.length - 1].x, p.y - out[out.length - 1].y) >= minD) out.push(p);
    }
    if (out.length === 1 && pts.length > 1) out.push(pts[pts.length - 1]);
    return out;
  }
  // Clean a raw stroke (normalized coords): smooth + simplify
  function cleanStroke(raw, eps) {
    if (!raw || !raw.length) return [];
    let p = dedupe(raw, 0.002);
    p = smooth(p, 2);
    p = rdp(p, eps == null ? 0.007 : eps);
    return p;
  }
  function bboxOf(strokes) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const s of strokes) for (const p of s) { if (p.x < x0) x0 = p.x; if (p.y < y0) y0 = p.y; if (p.x > x1) x1 = p.x; if (p.y > y1) y1 = p.y; }
    if (x0 === Infinity) return null;
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
  }

  // Fit normalized strokes into a font-unit slot {x,y,w,h} (x,y = bottom-left, y up).
  // Returns array of polylines in font units. r = pen radius (slot is inset by r).
  function fitStrokes(strokes, slot, r, opts) {
    opts = opts || {};
    const bb = bboxOf(strokes);
    if (!bb) return [];
    const minDim = opts.minDim == null ? 0.30 : opts.minDim;
    let { x0, y0, w: bw, h: bh } = bb;
    if (bw < minDim) { x0 = x0 + bw / 2 - minDim / 2; bw = minDim; }
    if (bh < minDim) { y0 = y0 + bh / 2 - minDim / 2; bh = minDim; }
    const sw = Math.max(slot.w - 2 * r, 10), sh = Math.max(slot.h - 2 * r, 10);
    let sx = sw / bw, sy = sh / bh;
    const lo = opts.ratioMin == null ? 0.55 : opts.ratioMin, hi = opts.ratioMax == null ? 1.9 : opts.ratioMax;
    const ratio = sy / sx;
    if (ratio > hi) sy = sx * hi; else if (ratio < lo) sx = sy / lo;
    const ox = slot.x + r + (sw - bw * sx) / 2;
    const oyTop = slot.y + slot.h - r - (sh - bh * sy) / 2;
    return strokes.map(s => s.map(p => ({ x: ox + (p.x - x0) * sx, y: oyTop - (p.y - y0) * sy })));
  }

  // ---------- Outline expansion (polyline → capsules, quadratic) ----------
  const KAPPA = 1 / Math.cos(Math.PI / 8); // control distance for 45° quadratic arcs
  function arcOffs(cx, cy, r, a0, dir) { // 4 off-curve pts covering 180° from a0, dir=+1 ccw / -1 cw
    const out = [];
    for (let k = 0; k < 4; k++) {
      const a = a0 + dir * (k + 0.5) * Math.PI / 4;
      out.push({ x: cx + Math.cos(a) * r * KAPPA, y: cy + Math.sin(a) * r * KAPPA, on: false });
    }
    return out;
  }
  function circle(cx, cy, r) {
    const out = [];
    for (let k = 0; k < 8; k++) {
      const a = -(k + 0.5) * Math.PI / 4; // clockwise
      out.push({ x: cx + Math.cos(a) * r * KAPPA, y: cy + Math.sin(a) * r * KAPPA, on: false });
    }
    return out;
  }
  function capsule(P, Q, r) {
    const dx = Q.x - P.x, dy = Q.y - P.y, L = Math.hypot(dx, dy);
    if (L < 0.5) return circle(P.x, P.y, r);
    const ux = dx / L, uy = dy / L, nx = -uy, ny = ux; // n = left normal
    const th = Math.atan2(ny, nx);
    const pts = [];
    pts.push({ x: P.x + nx * r, y: P.y + ny * r, on: true });
    pts.push({ x: Q.x + nx * r, y: Q.y + ny * r, on: true });
    pts.push(...arcOffs(Q.x, Q.y, r, th, -1)); // from +n through +d to -n (clockwise)
    pts.push({ x: Q.x - nx * r, y: Q.y - ny * r, on: true });
    pts.push({ x: P.x - nx * r, y: P.y - ny * r, on: true });
    pts.push(...arcOffs(P.x, P.y, r, th + Math.PI, -1));
    return pts;
  }
  function signedArea(c) {
    let a = 0;
    for (let i = 0; i < c.length; i++) { const p = c[i], q = c[(i + 1) % c.length]; a += p.x * q.y - q.x * p.y; }
    return a / 2;
  }
  function expandPolylines(polys, r) {
    const contours = [];
    for (const poly of polys) {
      if (!poly.length) continue;
      if (poly.length === 1) { contours.push(circle(poly[0].x, poly[0].y, r)); continue; }
      for (let i = 0; i < poly.length - 1; i++) {
        const c = capsule(poly[i], poly[i + 1], r);
        if (signedArea(c) > 0) c.reverse(); // clockwise (negative area in y-up)
        contours.push(c);
      }
    }
    // round to integer font units
    return contours.map(c => c.map(p => ({ x: Math.round(p.x), y: Math.round(p.y), on: !!p.on })));
  }

  // ---------- Glyph planning ----------
  function hasGlyph(glyphs, ch) { return !!(glyphs[ch] && glyphs[ch].length); }
  function vowelClass(v) { return VERT.includes(v) ? 'V' : HORZ.includes(v) ? 'H' : 'M'; }
  function slotFrac(f) { // fraction → font units (x, y bottom-left, w, h)
    return { x: HBOX.x + f[0] * HBOX.w, y: HBOX.top - (f[1] + f[3]) * HBOX.h, w: f[2] * HBOX.w, h: f[3] * HBOX.h };
  }
  function splitH(slot, n, gap) { // split slot horizontally into n parts
    const g = gap == null ? 0.06 : gap; const w = slot.w * (1 - g * (n - 1)) / n; const out = [];
    for (let i = 0; i < n; i++) out.push({ x: slot.x + i * (w + slot.w * g), y: slot.y, w, h: slot.h });
    return out;
  }
  // Place a consonant (possibly compound) into slot → list of {jamo, slot, opts}
  function placeCons(glyphs, c, slot) {
    if (hasGlyph(glyphs, c)) return [{ jamo: c, slot, opts: {} }];
    const d = CONS_DECOMP[c];
    if (!d) return [];
    const parts = splitH(slot, 2, 0.05);
    const opts = { ratioMax: 2.6 };
    return [{ jamo: d[0], slot: parts[0], opts }, { jamo: d[1], slot: parts[1], opts }];
  }
  function placeVertVowel(glyphs, v, slot) {
    if (hasGlyph(glyphs, v)) return [{ jamo: v, slot, opts: {} }];
    const d = VVOW_DECOMP[v];
    if (!d) return [];
    const a = { x: slot.x, y: slot.y, w: slot.w * 0.64, h: slot.h };
    const b = { x: slot.x + slot.w * 0.64, y: slot.y, w: slot.w * 0.36, h: slot.h };
    return [{ jamo: d[0], slot: a, opts: { ratioMax: 3 } }, { jamo: d[1], slot: b, opts: { ratioMax: 4 } }];
  }
  function planSyllable(glyphs, cp) {
    const s = cp - 0xAC00;
    const ci = Math.floor(s / 588), vi = Math.floor((s % 588) / 28), ji = s % 28;
    const cho = CHO[ci], jung = JUNG[vi], jong = ji ? JONG[ji] : null;
    const cls = vowelClass(jung);
    const L = LAYOUT[cls + (jong ? 'J' : '')];
    const parts = [];
    parts.push(...placeCons(glyphs, cho, slotFrac(L.cho)));
    if (cls === 'V') parts.push(...placeVertVowel(glyphs, jung, slotFrac(L.vow)));
    else if (cls === 'H') parts.push({ jamo: jung, slot: slotFrac(L.vow), opts: {} });
    else {
      if (hasGlyph(glyphs, jung)) {
        // user drew the compound vowel itself: merge hv+vv area into one slot
        const top = L.vv[1], bottom = L.hv[1] + L.hv[3];
        parts.push({ jamo: jung, slot: slotFrac([L.hv[0], top, L.vv[0] + L.vv[2] - L.hv[0], bottom - top]), opts: {} });
      } else {
        const [hv, vv] = MIXED[jung];
        parts.push({ jamo: hv, slot: slotFrac(L.hv), opts: {} });
        const vvSlot = slotFrac(L.vv);
        if (VVOW_DECOMP[vv] && !hasGlyph(glyphs, vv)) { vvSlot.x -= vvSlot.w * 0.25; vvSlot.w *= 1.25; }
        parts.push(...placeVertVowel(glyphs, vv, vvSlot));
      }
    }
    if (jong) parts.push(...placeCons(glyphs, jong, slotFrac(L.jong)));
    return { advance: HBOX.adv, parts };
  }
  function planJamoStandalone(glyphs, ch) {
    const slot = slotFrac([0.12, 0.12, 0.76, 0.76]);
    const isVow = JUNG.includes(ch) || ch === 'ㅐ';
    let parts;
    if (VVOW_DECOMP[ch] || VERT.includes(ch)) parts = placeVertVowel(glyphs, ch, { x: slot.x + slot.w * 0.25, y: slot.y, w: slot.w * 0.5, h: slot.h });
    else if (MIXED[ch] && !hasGlyph(glyphs, ch)) {
      const [hv, vv] = MIXED[ch];
      parts = [{ jamo: hv, slot: { x: slot.x, y: slot.y, w: slot.w * 0.7, h: slot.h * 0.45 }, opts: {} }, ...placeVertVowel(glyphs, vv, { x: slot.x + slot.w * 0.72, y: slot.y, w: slot.w * 0.28, h: slot.h })];
    } else if (HORZ.includes(ch)) parts = [{ jamo: ch, slot: { x: slot.x, y: slot.y + slot.h * 0.2, w: slot.w, h: slot.h * 0.5 }, opts: {} }];
    else parts = placeCons(glyphs, ch, slot);
    return { advance: HBOX.adv, parts, isVow };
  }
  // Which drawn jamo a character needs (after decomposition). null = not a Hangul char.
  function neededJamo(glyphs, ch) {
    const cp = ch.codePointAt(0);
    const cons = c => hasGlyph(glyphs, c) ? [c] : (CONS_DECOMP[c] ? CONS_DECOMP[c].split('') : [c]);
    const vvow = v => hasGlyph(glyphs, v) ? [v] : (VVOW_DECOMP[v] ? VVOW_DECOMP[v].split('') : [v]);
    const vow = v => hasGlyph(glyphs, v) ? [v] : MIXED[v] ? [MIXED[v][0], ...vvow(MIXED[v][1])] : vvow(v);
    if (cp >= 0xAC00 && cp <= 0xD7A3) {
      const s = cp - 0xAC00, ci = Math.floor(s / 588), vi = Math.floor((s % 588) / 28), ji = s % 28;
      return [...cons(CHO[ci]), ...vow(JUNG[vi]), ...(ji ? cons(JONG[ji]) : [])];
    }
    if (cp >= 0x3131 && cp <= 0x3163) return (JUNG.includes(ch) ? vow(ch) : cons(ch));
    return null;
  }
  function canRender(glyphs, text) {
    for (const ch of text) {
      if (ch === ' ') continue;
      const need = neededJamo(glyphs, ch);
      if (need) { for (const j of need) if (!hasGlyph(glyphs, j)) return false; }
      else if (!hasGlyph(glyphs, ch)) return false;
    }
    return true;
  }
  // Latin / digits / punctuation: fixed baseline mapping → polylines in font units + advance
  function planLatin(glyphs, ch) {
    const strokes = glyphs[ch];
    if (!strokes || !strokes.length) return null;
    const K = LATIN.K;
    let polys = strokes.map(s => s.map(p => ({ x: p.x * K, y: (LATIN.base - p.y) * K })));
    const bb = bboxOf(polys);
    const shift = LATIN.lsb - bb.x0;
    polys = polys.map(s => s.map(p => ({ x: p.x + shift, y: p.y })));
    return { advance: Math.round(bb.w + LATIN.lsb + LATIN.rsb), polys };
  }
  function planChar(glyphs, ch, r) {
    const cp = ch.codePointAt(0);
    if (ch === ' ' || ch === ' ') return { advance: LATIN.space, polys: [] };
    if (cp >= 0xAC00 && cp <= 0xD7A3) {
      const pl = planSyllable(glyphs, cp);
      const polys = [];
      for (const p of pl.parts) if (hasGlyph(glyphs, p.jamo)) polys.push(...fitStrokes(glyphs[p.jamo], p.slot, r, p.opts));
      return { advance: pl.advance, polys, parts: pl.parts };
    }
    if (cp >= 0x3131 && cp <= 0x3163) {
      const pl = planJamoStandalone(glyphs, ch);
      const polys = [];
      for (const p of pl.parts) if (hasGlyph(glyphs, p.jamo)) polys.push(...fitStrokes(glyphs[p.jamo], p.slot, r, p.opts));
      return { advance: pl.advance, polys, parts: pl.parts };
    }
    return planLatin(glyphs, ch);
  }

  // ---------- Binary writer ----------
  class Buf {
    constructor(n) { this.a = new Uint8Array(n || 1024); this.n = 0; }
    ensure(k) { if (this.n + k > this.a.length) { const b = new Uint8Array(Math.max(this.a.length * 2, this.n + k)); b.set(this.a); this.a = b; } }
    u8(v) { this.ensure(1); this.a[this.n++] = v & 0xFF; }
    i8(v) { this.u8(v < 0 ? v + 256 : v); }
    u16(v) { this.ensure(2); this.a[this.n++] = (v >>> 8) & 0xFF; this.a[this.n++] = v & 0xFF; }
    i16(v) { this.u16(v < 0 ? v + 65536 : v); }
    u32(v) { this.ensure(4); this.a[this.n++] = (v >>> 24) & 0xFF; this.a[this.n++] = (v >>> 16) & 0xFF; this.a[this.n++] = (v >>> 8) & 0xFF; this.a[this.n++] = v & 0xFF; }
    i32(v) { this.u32(v >>> 0); }
    fixed(v) { this.i32(Math.round(v * 65536)); }
    tag(s) { for (let i = 0; i < 4; i++) this.u8(s.charCodeAt(i)); }
    bytes(arr) { this.ensure(arr.length); this.a.set(arr, this.n); this.n += arr.length; }
    pad4() { while (this.n % 4) this.u8(0); }
    get() { return this.a.subarray(0, this.n); }
  }
  function checksum(u8) {
    let s = 0; const n = u8.length;
    for (let i = 0; i < n; i += 4) {
      s = (s + (((u8[i] || 0) << 24) | ((u8[i + 1] || 0) << 16) | ((u8[i + 2] || 0) << 8) | (u8[i + 3] || 0))) >>> 0;
    }
    return s >>> 0;
  }

  // Simple glyph → bytes
  function encodeSimple(contours) {
    const b = new Buf(256);
    if (!contours.length) return { bytes: b.get(), bbox: null, nPts: 0, nCont: 0 };
    let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
    const pts = [];
    const ends = [];
    for (const c of contours) { for (const p of c) { pts.push(p); if (p.x < xMin) xMin = p.x; if (p.y < yMin) yMin = p.y; if (p.x > xMax) xMax = p.x; if (p.y > yMax) yMax = p.y; } ends.push(pts.length - 1); }
    b.i16(contours.length); b.i16(xMin); b.i16(yMin); b.i16(xMax); b.i16(yMax);
    for (const e of ends) b.u16(e);
    b.u16(0); // instructions
    const flags = [], xs = [], ys = [];
    let px = 0, py = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]; let f = p.on ? 1 : 0;
      const dx = p.x - px, dy = p.y - py;
      if (dx === 0) f |= 0x10; else if (Math.abs(dx) < 256) { f |= 0x02; if (dx > 0) f |= 0x10; xs.push({ s: true, v: Math.abs(dx) }); } else xs.push({ s: false, v: dx });
      if (dy === 0) f |= 0x20; else if (Math.abs(dy) < 256) { f |= 0x04; if (dy > 0) f |= 0x20; ys.push({ s: true, v: Math.abs(dy) }); } else ys.push({ s: false, v: dy });
      if (i === 0) f |= 0x40; // OVERLAP_SIMPLE
      flags.push(f); px = p.x; py = p.y;
    }
    // flags with repeat compression
    let i = 0;
    while (i < flags.length) {
      let j = i; while (j + 1 < flags.length && flags[j + 1] === flags[i] && j - i < 255) j++;
      const rep = j - i;
      if (rep >= 1) { b.u8(flags[i] | 0x08); b.u8(rep); } else b.u8(flags[i]);
      i = j + 1;
    }
    for (const v of xs) v.s ? b.u8(v.v) : b.i16(v.v);
    for (const v of ys) v.s ? b.u8(v.v) : b.i16(v.v);
    b.pad4();
    return { bytes: b.get(), bbox: { xMin, yMin, xMax, yMax }, nPts: pts.length, nCont: contours.length };
  }
  // Composite glyph → bytes. comps: [{gid, dx, dy, bbox}]
  function encodeComposite(comps) {
    const b = new Buf(64);
    let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
    for (const c of comps) { if (!c.bbox) continue; xMin = Math.min(xMin, c.bbox.xMin + c.dx); yMin = Math.min(yMin, c.bbox.yMin + c.dy); xMax = Math.max(xMax, c.bbox.xMax + c.dx); yMax = Math.max(yMax, c.bbox.yMax + c.dy); }
    if (xMin === Infinity) return { bytes: new Uint8Array(0), bbox: null };
    b.i16(-1); b.i16(xMin); b.i16(yMin); b.i16(xMax); b.i16(yMax);
    comps.forEach((c, i) => {
      let flags = 0x0001 | 0x0002 | 0x0004; // words, xy values, round to grid
      if (i < comps.length - 1) flags |= 0x0020;
      if (i === 0) flags |= 0x0400; // OVERLAP_COMPOUND
      b.u16(flags); b.u16(c.gid); b.i16(c.dx); b.i16(c.dy);
    });
    b.pad4();
    return { bytes: b.get(), bbox: { xMin, yMin, xMax, yMax } };
  }

  function notdefContours() {
    // hollow rectangle: outer clockwise, inner counter-clockwise
    const o = [{ x: 80, y: -100 }, { x: 80, y: 700 }, { x: 560, y: 700 }, { x: 560, y: -100 }].map(p => ({ ...p, on: true }));
    const i = [{ x: 140, y: -40 }, { x: 500, y: -40 }, { x: 500, y: 640 }, { x: 140, y: 640 }].map(p => ({ ...p, on: true }));
    return [o, i];
  }

  function asciiOnly(s, fallback) { const t = (s || '').replace(/[^\x20-\x7E]/g, '').trim(); return t || fallback; }

  // ---------- Font builder ----------
  function buildFont(opts) {
    const glyphs = opts.glyphs || {};
    const r = opts.penRadius || 30;
    const family = (opts.family || '내 손글씨').trim() || '내 손글씨';
    const familyAscii = asciiOnly(opts.familyAscii || family, 'MyHandwriting');
    const psName = familyAscii.replace(/[^A-Za-z0-9-]/g, '') .slice(0, 40) || 'MyHandwriting';
    const includeHangul = opts.includeHangul !== false;
    const hasAnyHangul = BASIC_CONS.split('').some(c => hasGlyph(glyphs, c)) && BASIC_VOW.split('').some(c => hasGlyph(glyphs, c));

    // Collect mapped characters
    const mapped = []; // {cp, kind}
    mapped.push({ cp: 32, kind: 'space' });
    mapped.push({ cp: 0xA0, kind: 'space' });
    for (const ch of Object.keys(glyphs)) {
      const cp = ch.codePointAt(0);
      if (!hasGlyph(glyphs, ch)) continue;
      if ((cp >= 0x3131 && cp <= 0x3163)) continue; // handled below
      if (cp >= 0xAC00 && cp <= 0xD7A3) continue;
      mapped.push({ cp, kind: 'latin' });
    }
    if (includeHangul && hasAnyHangul) {
      for (let cp = 0x3131; cp <= 0x3163; cp++) mapped.push({ cp, kind: 'jamo' });
      for (let cp = 0xAC00; cp <= 0xD7A3; cp++) mapped.push({ cp, kind: 'syl' });
    }
    mapped.sort((a, b) => a.cp - b.cp);

    // Glyph records
    const glyphRecs = []; // {bytes, bbox, adv, lsb, nPts, nCont, compPts, compCont, nComps}
    function addSimple(contours, adv) {
      const e = encodeSimple(contours);
      glyphRecs.push({ bytes: e.bytes, bbox: e.bbox, adv, lsb: e.bbox ? e.bbox.xMin : 0, nPts: e.nPts, nCont: e.nCont });
      return glyphRecs.length - 1;
    }
    addSimple(notdefContours(), 640); // gid 0

    const cmapPairs = [];
    const compCache = new Map();
    const pendingComposites = [];
    function componentGid(jamo, w, h, o) {
      const key = jamo + '|' + w + '|' + h + '|' + (o.ratioMax || '') + '|' + (o.ratioMin || '');
      if (compCache.has(key)) return compCache.get(key);
      const polys = fitStrokes(glyphs[jamo], { x: 0, y: 0, w, h }, r, o);
      const contours = expandPolylines(polys, r);
      const gid = addSimple(contours, 0);
      compCache.set(key, gid);
      return gid;
    }
    for (const m of mapped) {
      if (m.kind === 'space') { cmapPairs.push([m.cp, addSimple([], LATIN.space)]); continue; }
      const ch = String.fromCodePoint(m.cp);
      if (m.kind === 'latin') {
        const pl = planLatin(glyphs, ch);
        if (!pl) continue;
        cmapPairs.push([m.cp, addSimple(expandPolylines(pl.polys, r), pl.advance)]);
        continue;
      }
      if (!canRender(glyphs, ch)) continue; // leave the char to system fallback rather than a half-drawn syllable
      const pl = m.kind === 'syl' ? planSyllable(glyphs, m.cp) : planJamoStandalone(glyphs, ch);
      const comps = [];
      for (const p of pl.parts) {
        if (!hasGlyph(glyphs, p.jamo)) continue;
        const w = Math.round(p.slot.w / 4) * 4, h = Math.round(p.slot.h / 4) * 4;
        const gid = componentGid(p.jamo, w, h, p.opts || {});
        comps.push({ gid, dx: Math.round(p.slot.x), dy: Math.round(p.slot.y), bbox: glyphRecs[gid].bbox, nPts: glyphRecs[gid].nPts, nCont: glyphRecs[gid].nCont });
      }
      if (!comps.length) continue;
      const e = encodeComposite(comps);
      glyphRecs.push({ bytes: e.bytes, bbox: e.bbox, adv: pl.advance, lsb: e.bbox ? e.bbox.xMin : 0, nPts: 0, nCont: 0, compPts: comps.reduce((a, c) => a + c.nPts, 0), compCont: comps.reduce((a, c) => a + c.nCont, 0), nComps: comps.length });
      cmapPairs.push([m.cp, glyphRecs.length - 1]);
    }
    cmapPairs.sort((a, b) => a[0] - b[0]);
    const numGlyphs = glyphRecs.length;

    // ---- glyf + loca
    const glyf = new Buf(1 << 20), loca = new Buf(numGlyphs * 4 + 4);
    let xMin = 0, yMin = 0, xMax = 0, yMax = 0, maxPts = 0, maxCont = 0, maxCPts = 0, maxCCont = 0, maxComps = 0, advMax = 0, minLsb = 0, minRsb = 0, xMaxExt = 0, advSum = 0;
    for (const g of glyphRecs) {
      loca.u32(glyf.n); glyf.bytes(g.bytes);
      if (g.bbox) { xMin = Math.min(xMin, g.bbox.xMin); yMin = Math.min(yMin, g.bbox.yMin); xMax = Math.max(xMax, g.bbox.xMax); yMax = Math.max(yMax, g.bbox.yMax); minRsb = Math.min(minRsb, g.adv - g.bbox.xMax); xMaxExt = Math.max(xMaxExt, g.bbox.xMax); }
      maxPts = Math.max(maxPts, g.nPts); maxCont = Math.max(maxCont, g.nCont);
      maxCPts = Math.max(maxCPts, g.compPts || 0); maxCCont = Math.max(maxCCont, g.compCont || 0); maxComps = Math.max(maxComps, g.nComps || 0);
      advMax = Math.max(advMax, g.adv); minLsb = Math.min(minLsb, g.lsb); advSum += g.adv;
    }
    loca.u32(glyf.n);

    // ---- hmtx
    const hmtx = new Buf(numGlyphs * 4);
    for (const g of glyphRecs) { hmtx.u16(g.adv); hmtx.i16(g.lsb); }

    // ---- cmap (format 4, (0,3) and (3,1))
    const segs = [];
    for (const [cp, gid] of cmapPairs) {
      const last = segs[segs.length - 1];
      if (last && cp === last.end + 1 && gid === last.gidEnd + 1) { last.end = cp; last.gidEnd = gid; }
      else segs.push({ start: cp, end: cp, gidStart: gid, gidEnd: gid });
    }
    segs.push({ start: 0xFFFF, end: 0xFFFF, gidStart: 0, gidEnd: 0, final: true });
    const segCount = segs.length;
    const sub = new Buf(16 + segCount * 8);
    sub.u16(4); sub.u16(16 + segCount * 8); sub.u16(0);
    const es = Math.floor(Math.log2(segCount)), sr = 2 * Math.pow(2, es);
    sub.u16(segCount * 2); sub.u16(sr); sub.u16(es); sub.u16(segCount * 2 - sr);
    for (const s of segs) sub.u16(s.end);
    sub.u16(0);
    for (const s of segs) sub.u16(s.start);
    for (const s of segs) sub.u16(s.final ? 1 : ((s.gidStart - s.start) & 0xFFFF));
    for (const s of segs) sub.u16(0);
    const cmap = new Buf(64 + sub.n);
    cmap.u16(0); cmap.u16(2);
    cmap.u16(0); cmap.u16(3); cmap.u32(20);
    cmap.u16(3); cmap.u16(1); cmap.u32(20);
    cmap.bytes(sub.get());
    const firstCp = cmapPairs[0][0], lastCp = Math.min(cmapPairs[cmapPairs.length - 1][0], 0xFFFF);

    // ---- head
    const head = new Buf(54);
    head.fixed(1); head.fixed(1); head.u32(0); head.u32(0x5F0F3CF5);
    head.u16(0x000B); head.u16(UPM);
    const now = Math.floor(Date.now() / 1000) + 2082844800; // 1904 epoch
    head.u32(0); head.u32(now); head.u32(0); head.u32(now);
    head.i16(xMin); head.i16(yMin); head.i16(xMax); head.i16(yMax);
    head.u16(0); head.u16(8); head.i16(2); head.i16(1); head.i16(0);

    // ---- hhea
    const hhea = new Buf(36);
    hhea.fixed(1); hhea.i16(ASC); hhea.i16(DESC); hhea.i16(LINEGAP);
    hhea.u16(advMax); hhea.i16(minLsb); hhea.i16(minRsb); hhea.i16(xMaxExt);
    hhea.i16(1); hhea.i16(0); hhea.i16(0); hhea.i16(0); hhea.i16(0); hhea.i16(0); hhea.i16(0);
    hhea.i16(0); hhea.u16(numGlyphs);

    // ---- maxp
    const maxp = new Buf(32);
    maxp.fixed(1); maxp.u16(numGlyphs); maxp.u16(maxPts); maxp.u16(maxCont); maxp.u16(maxCPts); maxp.u16(maxCCont);
    maxp.u16(2); maxp.u16(0); maxp.u16(0); maxp.u16(0); maxp.u16(0); maxp.u16(0); maxp.u16(0); maxp.u16(maxComps); maxp.u16(maxComps ? 1 : 0);

    // ---- OS/2 (v4)
    const os2 = new Buf(96);
    os2.u16(4); os2.i16(Math.round(advSum / numGlyphs)); os2.u16(400); os2.u16(5); os2.u16(0);
    [650, 600, 0, 75, 650, 600, 0, 350, 50, 300].forEach(v => os2.i16(v));
    os2.i16(0);
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0].forEach(v => os2.u8(v));
    os2.u32((1 << 0) | (1 << 1) | (1 << 31)); os2.u32((1 << 20) | (1 << 24)); os2.u32(0); os2.u32(0);
    os2.tag('HNDF'); os2.u16(0x00C0); os2.u16(firstCp); os2.u16(lastCp);
    os2.i16(ASC); os2.i16(DESC); os2.i16(LINEGAP); os2.u16(Math.max(950, yMax + 20)); os2.u16(Math.max(250, -yMin + 20));
    os2.u32((1 << 0) | (1 << 19) | (1 << 21)); os2.u32(0);
    os2.i16(312); os2.i16(600); os2.u16(0); os2.u16(32); os2.u16(0);

    // ---- post (format 3)
    const post = new Buf(32);
    post.u32(0x00030000); post.fixed(0); post.i16(-100); post.i16(50); post.u32(0); post.u32(0); post.u32(0); post.u32(0); post.u32(0);

    // ---- name
    const version = 'Version 1.0';
    const uniq = psName + ';HandFont;' + new Date().toISOString().slice(0, 10);
    const names = [[0, 'Made with HandFont'], [1, family], [2, 'Regular'], [3, uniq], [4, family], [5, version], [6, psName]];
    const recs = [];
    for (const [id, str] of names) {
      const mac = id === 6 ? psName : asciiOnly(id === 1 || id === 4 ? familyAscii : str, familyAscii);
      recs.push({ p: 1, e: 0, l: 0, id, bytes: Array.from(mac).map(c => c.charCodeAt(0) & 0xFF) });
      const w = []; for (const c of (id === 6 ? psName : str)) { const u = c.charCodeAt(0); w.push(u >> 8, u & 0xFF); }
      recs.push({ p: 3, e: 1, l: 0x409, id, bytes: w });
      if (id === 1 || id === 4) recs.push({ p: 3, e: 1, l: 0x412, id, bytes: w });
    }
    recs.sort((a, b) => a.p - b.p || a.e - b.e || a.l - b.l || a.id - b.id);
    const nameStr = new Buf(512); const nameHdr = new Buf(6 + recs.length * 12);
    nameHdr.u16(0); nameHdr.u16(recs.length); nameHdr.u16(6 + recs.length * 12);
    for (const rc of recs) { nameHdr.u16(rc.p); nameHdr.u16(rc.e); nameHdr.u16(rc.l); nameHdr.u16(rc.id); nameHdr.u16(rc.bytes.length); nameHdr.u16(nameStr.n); nameStr.bytes(rc.bytes); }
    const name = new Buf(nameHdr.n + nameStr.n); name.bytes(nameHdr.get()); name.bytes(nameStr.get());

    // ---- assemble
    const tables = [['OS/2', os2], ['cmap', cmap], ['glyf', glyf], ['head', head], ['hhea', hhea], ['hmtx', hmtx], ['loca', loca], ['maxp', maxp], ['name', name], ['post', post]];
    tables.sort((a, b) => (a[0] < b[0] ? -1 : 1));
    const numTables = tables.length;
    const es2 = Math.floor(Math.log2(numTables)), sr2 = 16 * Math.pow(2, es2);
    const out = new Buf(12 + numTables * 16 + tables.reduce((a, t) => a + t[1].n + 4, 0));
    out.u32(0x00010000); out.u16(numTables); out.u16(sr2); out.u16(es2); out.u16(numTables * 16 - sr2);
    let off = 12 + numTables * 16;
    const dir = [];
    for (const [tag, buf] of tables) {
      const data = buf.get(); const padded = (data.length + 3) & ~3;
      dir.push({ tag, cs: checksum(data), off, len: data.length }); off += padded;
    }
    for (const d of dir) { out.tag(d.tag); out.u32(d.cs); out.u32(d.off); out.u32(d.len); }
    let headOff = 0;
    for (const [tag, buf] of tables) { if (tag === 'head') headOff = out.n; out.bytes(buf.get()); out.pad4(); }
    const whole = out.get();
    const adj = (0xB1B0AFBA - checksum(whole)) >>> 0;
    whole[headOff + 8] = (adj >>> 24) & 0xFF; whole[headOff + 9] = (adj >>> 16) & 0xFF; whole[headOff + 10] = (adj >>> 8) & 0xFF; whole[headOff + 11] = adj & 0xFF;
    const buffer = whole.slice().buffer;
    return { buffer, stats: { numGlyphs, mapped: cmapPairs.length, hangul: cmapPairs.filter(([cp]) => cp >= 0xAC00 && cp <= 0xD7A3).length, components: compCache.size, bytes: whole.length, psName } };
  }

  // ---------- Canvas fallback renderer ----------
  function drawText(ctx, glyphs, text, x, y, size, r, color) {
    const s = size / UPM; ctx.save();
    ctx.strokeStyle = color || '#111'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2 * r * s;
    let pen = x;
    for (const ch of text) {
      const pl = planChar(glyphs, ch, r);
      if (!pl) { pen += 500 * s; continue; }
      for (const poly of pl.polys) {
        if (!poly.length) continue;
        ctx.beginPath();
        if (poly.length === 1) { ctx.moveTo(pen + poly[0].x * s, y - poly[0].y * s); ctx.lineTo(pen + poly[0].x * s + 0.01, y - poly[0].y * s); }
        else { ctx.moveTo(pen + poly[0].x * s, y - poly[0].y * s); for (let i = 1; i < poly.length; i++) ctx.lineTo(pen + poly[i].x * s, y - poly[i].y * s); }
        ctx.stroke();
      }
      pen += pl.advance * s;
    }
    ctx.restore();
    return pen - x;
  }
  function measureText(glyphs, text, size, r) {
    let w = 0; for (const ch of text) { const pl = planChar(glyphs, ch, r); w += (pl ? pl.advance : 500) * size / UPM; } return w;
  }

  return {
    UPM, ASC, DESC, HBOX, LATIN, LAYOUT, CHO, JUNG, JONG, BASIC_CONS, BASIC_VOW, VVOW_DECOMP, CONS_DECOMP, MIXED,
    cleanStroke, bboxOf, fitStrokes, expandPolylines, planChar, planSyllable, neededJamo, canRender, buildFont, drawText, measureText,
  };
});
