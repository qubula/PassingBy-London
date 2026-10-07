// Figma script (run with the Figma MCP use_figma tool) that builds the dark ride
// map used by the "PB/Ride map" component in the design file.
//
// Image uploads are blocked in the cloud sessions, so this script restyles the
// light Google map that is already in the Figma file (image hash
// 8de9a47406d8d2a98a34a0c4303574409c7aefd2) entirely inside Figma's script
// sandbox. It decodes the PNG, removes the labels, maps the greys to the ride's
// DARK_MAP colours (static/v2/js/tour_logic.js), crops the Trafalgar Square to
// Millbank area at 2x for a 390 x 844 phone, and creates a new image with
// figma.createImage().
//
// Usage: paste this file plus the build steps (see the end of the file) into a
// use_figma call. makeDarkMap(bytes, ox, oy, scale, outW, outH) returns PNG bytes.
// If the ride's map colours change, update the xs/ys tables in darkStyle().

// Restyle a light Google map PNG (palette, 8-bit) into the PassingBy ride's dark map style.
// Pure JS: inflate, PNG unfilter, label removal, colour LUT, crop/scale, PNG encode (stored deflate).
function inflate(src) {
  let pos = 0, bitBuf = 0, bitCnt = 0;
  const out = []; let outArr = new Uint8Array(1 << 20), outLen = 0;
  function push(b) { if (outLen >= outArr.length) { const n = new Uint8Array(outArr.length * 2); n.set(outArr); outArr = n; } outArr[outLen++] = b; }
  function bits(n) { while (bitCnt < n) { bitBuf |= src[pos++] << bitCnt; bitCnt += 8; } const v = bitBuf & ((1 << n) - 1); bitBuf >>>= n; bitCnt -= n; return v; }
  function build(lengths) {
    const counts = new Uint16Array(16), offs = new Uint16Array(16);
    for (const l of lengths) counts[l]++;
    counts[0] = 0;
    for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + counts[i - 1];
    const symbols = new Uint16Array(lengths.length);
    for (let i = 0; i < lengths.length; i++) if (lengths[i]) symbols[offs[lengths[i]]++] = i;
    return { counts, symbols };
  }
  function decode(t) {
    let code = 0, first = 0, index = 0;
    for (let len = 1; len < 16; len++) {
      code |= bits(1);
      const c = t.counts[len];
      if (code - c < first) return t.symbols[index + (code - first)];
      index += c; first += c; first <<= 1; code <<= 1;
    }
    throw new Error('bad code');
  }
  const LB = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  const LE = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const DB = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  const DE = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  let fixedL = null, fixedD = null;
  pos = 2; // skip zlib header
  let final = 0;
  while (!final) {
    final = bits(1);
    const type = bits(2);
    if (type === 0) {
      bitBuf = 0; bitCnt = 0;
      const len = src[pos] | (src[pos + 1] << 8); pos += 4;
      for (let i = 0; i < len; i++) push(src[pos++]);
      continue;
    }
    let lt, dt;
    if (type === 1) {
      if (!fixedL) {
        const l = new Array(288);
        for (let i = 0; i < 144; i++) l[i] = 8; for (let i = 144; i < 256; i++) l[i] = 9;
        for (let i = 256; i < 280; i++) l[i] = 7; for (let i = 280; i < 288; i++) l[i] = 8;
        fixedL = build(l); fixedD = build(new Array(30).fill(5));
      }
      lt = fixedL; dt = fixedD;
    } else {
      const hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
      const ord = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
      const cl = new Array(19).fill(0);
      for (let i = 0; i < hclen; i++) cl[ord[i]] = bits(3);
      const ct = build(cl);
      const lens = [];
      while (lens.length < hlit + hdist) {
        const sym = decode(ct);
        if (sym < 16) lens.push(sym);
        else if (sym === 16) { const p = lens[lens.length - 1]; for (let r = 3 + bits(2); r > 0; r--) lens.push(p); }
        else if (sym === 17) { for (let r = 3 + bits(3); r > 0; r--) lens.push(0); }
        else { for (let r = 11 + bits(7); r > 0; r--) lens.push(0); }
      }
      lt = build(lens.slice(0, hlit)); dt = build(lens.slice(hlit));
    }
    for (;;) {
      const sym = decode(lt);
      if (sym < 256) push(sym);
      else if (sym === 256) break;
      else {
        const li = sym - 257, len = LB[li] + bits(LE[li]);
        const di = decode(dt), dist = DB[di] + bits(DE[di]);
        for (let i = 0; i < len; i++) push(outArr[outLen - dist]);
      }
    }
  }
  return outArr.subarray(0, outLen);
}

function readPng(b) {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let p = 8, w = 0, h = 0, ct = 0, pal = null; const idat = [];
  while (p < b.length) {
    const len = dv.getUint32(p), type = String.fromCharCode(b[p + 4], b[p + 5], b[p + 6], b[p + 7]);
    const d = b.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = dv.getUint32(p + 8); h = dv.getUint32(p + 12); ct = d[9]; if (d[8] !== 8) throw new Error('depth'); }
    else if (type === 'PLTE') pal = d;
    else if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  let tot = 0; for (const d of idat) tot += d.length;
  const z = new Uint8Array(tot); let o = 0; for (const d of idat) { z.set(d, o); o += d.length; }
  const raw = inflate(z);
  const bpp = ct === 3 ? 1 : ct === 0 ? 1 : ct === 2 ? 3 : ct === 6 ? 4 : ct === 4 ? 2 : 0;
  const stride = w * bpp, px = new Uint8Array(stride * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], rs = y * (stride + 1) + 1, ro = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[ro + x - bpp] : 0, up = y ? px[ro - stride + x] : 0, c = (x >= bpp && y) ? px[ro - stride + x - bpp] : 0;
      let v = raw[rs + x];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? up : c); }
      px[ro + x] = v & 255;
    }
  }
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (ct === 3) g[i] = pal[px[i] * 3]; else if (ct === 0) g[i] = px[i]; else g[i] = px[i * bpp];
  }
  return { w, h, g };
}

function boxBlur(a, w, h, r) {
  const I = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) { let s = 0; for (let x = 0; x < w; x++) { s += a[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + s; } }
  const o = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1), y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    const s = I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0];
    o[y * w + x] = s / ((x1 - x0) * (y1 - y0));
  }
  return o;
}

function darkStyle(img) {
  const { w, h, g } = img, n = w * h;
  const text = new Uint8Array(n), fill = new Uint8Array(n);
  for (let i = 0; i < n; i++) text[i] = g[i] < 196 ? 1 : 0;
  // dilate text mask by 3 px (7x7)
  const tmp = new Uint8Array(n);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = 0; for (let k = -3; k <= 3 && !m; k++) { const xx = x + k; if (xx >= 0 && xx < w && text[y * w + xx]) m = 1; } tmp[y * w + x] = m; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = 0; for (let k = -3; k <= 3 && !m; k++) { const yy = y + k; if (yy >= 0 && yy < h && tmp[yy * w + x]) m = 1; } const i = y * w + x; fill[i] = (m && !(g[i] >= 197 && g[i] <= 203)) ? 1 : 0; }
  const W = new Float32Array(n), V = new Float32Array(n);
  for (let i = 0; i < n; i++) { W[i] = fill[i] ? 0 : 1; V[i] = g[i] * W[i]; }
  const bv = boxBlur(boxBlur(V, w, h, 6), w, h, 6), bw = boxBlur(boxBlur(W, w, h, 6), w, h, 6);
  const xs = [0,196,200,206,212,218,224,229,236,240,244,248,251,255], ys = [26,26,26,30,37,37,44,48,47,44,42,46,54,58];
  const lut = new Float32Array(256);
  for (let v = 0; v < 256; v++) { let k = 0; while (k < xs.length - 2 && v > xs[k + 1]) k++; const t = (v - xs[k]) / (xs[k + 1] - xs[k]); lut[v] = ys[k] + (ys[k + 1] - ys[k]) * Math.max(0, Math.min(1, t)); }
  const d = new Float32Array(n);
  for (let i = 0; i < n; i++) { let v = fill[i] ? (bw[i] > 1e-3 ? bv[i] / bw[i] : 244) : g[i]; v = Math.max(0, Math.min(255, v)); const lo = Math.floor(v), f = v - lo; d[i] = lut[lo] + (lut[Math.min(255, lo + 1)] - lut[lo]) * f; }
  return d;
}

function cropScale(d, w, h, ox, oy, s, ow, oh) {
  const o = new Uint8Array(ow * oh);
  for (let Y = 0; Y < oh; Y++) for (let X = 0; X < ow; X++) {
    const x = ox + (X + 0.5) / s - 0.5, y = oy + (Y + 0.5) / s - 0.5;
    const x0 = Math.max(0, Math.min(w - 2, Math.floor(x))), y0 = Math.max(0, Math.min(h - 2, Math.floor(y))), fx = x - x0, fy = y - y0;
    const v = d[y0 * w + x0] * (1 - fx) * (1 - fy) + d[y0 * w + x0 + 1] * fx * (1 - fy) + d[(y0 + 1) * w + x0] * (1 - fx) * fy + d[(y0 + 1) * w + x0 + 1] * fx * fy;
    o[Y * ow + X] = Math.round(v);
  }
  return o;
}

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b, s, e) { let c = 0xffffffff; for (let i = s; i < e; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

function writePngGray(px, w, h) {
  const raw = new Uint8Array((w + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w + 1)] = 0; raw.set(px.subarray(y * w, y * w + w), y * (w + 1) + 1); }
  const nb = Math.ceil(raw.length / 65535), zl = 2 + raw.length + nb * 5 + 4, z = new Uint8Array(zl);
  z[0] = 0x78; z[1] = 0x01; let p = 2;
  for (let i = 0; i < nb; i++) { const s = i * 65535, len = Math.min(65535, raw.length - s); z[p++] = i === nb - 1 ? 1 : 0; z[p++] = len & 255; z[p++] = len >> 8; z[p++] = ~len & 255; z[p++] = (~len >> 8) & 255; z.set(raw.subarray(s, s + len), p); p += len; }
  let a = 1, b2 = 0; for (let i = 0; i < raw.length; i++) { a = (a + raw[i]) % 65521; b2 = (b2 + a) % 65521; }
  const ad = ((b2 << 16) | a) >>> 0; z[p++] = ad >>> 24; z[p++] = (ad >>> 16) & 255; z[p++] = (ad >>> 8) & 255; z[p++] = ad & 255;
  const chunks = [];
  function chunk(type, data) { const c = new Uint8Array(12 + data.length), dv = new DataView(c.buffer); dv.setUint32(0, data.length); for (let i = 0; i < 4; i++) c[4 + i] = type.charCodeAt(i); c.set(data, 8); dv.setUint32(8 + data.length, crc32(c, 4, 8 + data.length)); chunks.push(c); }
  const ih = new Uint8Array(13), idv = new DataView(ih.buffer); idv.setUint32(0, w); idv.setUint32(4, h); ih[8] = 8; ih[9] = 0;
  chunk('IHDR', ih); chunk('IDAT', z); chunk('IEND', new Uint8Array(0));
  let tot = 8; for (const c of chunks) tot += c.length;
  const out = new Uint8Array(tot); out.set([137, 80, 78, 71, 13, 10, 26, 10]); let q = 8; for (const c of chunks) { out.set(c, q); q += c.length; }
  return out;
}

function makeDarkMap(bytes, ox, oy, s, ow, oh) {
  const full = readPng(bytes);
  const m = 24, sx = Math.max(0, Math.floor(ox) - m), sy = Math.max(0, Math.floor(oy) - m);
  const ex = Math.min(full.w, Math.ceil(ox + ow / s) + m), ey = Math.min(full.h, Math.ceil(oy + oh / s) + m);
  const w = ex - sx, h = ey - sy, g = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g[y * w + x] = full.g[(sy + y) * full.w + sx + x];
  const img = { w, h, g }; ox -= sx; oy -= sy;
  const d = darkStyle(img);
  return writePngGray(cropScale(d, img.w, img.h, ox, oy, s, ow, oh), ow, oh);
}

// Build steps used for PB/Ride map (Components page 2008:109):
//   const src = await figma.getImageByHash('8de9a47406d8d2a98a34a0c4303574409c7aefd2').getBytesAsync();
//   const png = makeDarkMap(src, 553, 339, 2.3, 780, 1688);
//   const image = figma.createImage(png);   // use image.hash as an IMAGE fill on a 390 x 844 rectangle
// Route, start/end dots, the "you are here" dot and PB/Map pin instances are
// drawn as vectors on top, in phone coordinates (see the component in Figma).
