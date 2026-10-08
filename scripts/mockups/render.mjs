// Renders the high-fidelity PassingBy mockups in docs/images/v2/mockups/.
// Screens: scripts/mockups/screens/ (3x exports of the Figma source frames, no status bar).
// Usage: npm i playwright && npx playwright install chromium, then
//   node scripts/mockups/render.mjs <outDir> [names...]   (names: hero flow ride detail themes entry single)
// Status bar time uses SF Pro Text Semibold from scripts/mockups/fonts/ (not committed:
// Apple licence). Download it from developer.apple.com/fonts; Inter Display is the fallback.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import os from 'os';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = process.argv[2] || path.join(HERE, 'out');
fs.mkdirSync(OUT, { recursive: true });
const S = n => 'file://' + path.join(HERE, 'screens', n + '.png');
const DARK = new Set(['ridemap', 'postcard', 'story']);

// ---------- status bar (iOS 17 style) ----------
function statusBar(dark) {
  // iOS 17 status bar on a 390 pt wide iPhone 15 Pro screen. Items sit on the
  // Dynamic Island's centre line; time is centred in the left "ear", icons in the right.
  const c = dark ? '#fff' : '#000';
  const signal = `<svg width="18" height="12" viewBox="0 0 18 12"><g fill="${c}">
    <rect x="0" y="7.5" width="3" height="4.5" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/>
    <rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></g></svg>`;
  const arc = r => { const a = 0.785, cx = 8.5, cy = 11.4; return `M${(cx - r * Math.sin(a)).toFixed(2)} ${(cy - r * Math.cos(a)).toFixed(2)} A${r} ${r} 0 0 1 ${(cx + r * Math.sin(a)).toFixed(2)} ${(cy - r * Math.cos(a)).toFixed(2)}`; };
  const wedge = (() => { const a = 0.785, cx = 8.5, cy = 11.4, r = 3.3; return `M${cx} ${cy - 0.2} L${(cx - r * Math.sin(a)).toFixed(2)} ${(cy - r * Math.cos(a)).toFixed(2)} A${r} ${r} 0 0 1 ${(cx + r * Math.sin(a)).toFixed(2)} ${(cy - r * Math.cos(a)).toFixed(2)} Z`; })();
  const wifi = `<svg width="17" height="12" viewBox="0 0 17 12">
    <g fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"><path d="${arc(9.6)}"/><path d="${arc(6.1)}"/></g>
    <path d="${wedge}" fill="${c}" stroke="${c}" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
  const battery = `<svg width="27.5" height="13" viewBox="0 0 27.5 13">
    <rect x="0.5" y="0.5" width="24" height="12" rx="4" fill="none" stroke="${c}" stroke-opacity="0.35"/>
    <rect x="2" y="2" width="21" height="9" rx="2.6" fill="${c}"/>
    <path d="M26 4.6v3.8c0.85-0.32 1.4-1.1 1.4-1.9s-0.55-1.58-1.4-1.9z" fill="${c}" fill-opacity="0.4"/></svg>`;
  return `<div class="sb" style="color:${c}"><span class="time">9:41</span>
    <div class="sb-r">${signal}${wifi}${battery}</div></div>`;
}

// ---------- device ----------
function phone(screen, opts = {}) {
  const dark = DARK.has(screen);
  const scale = opts.scale || 1;
  return `<div class="phone ${opts.cls || ''}" style="--s:${scale};${opts.style || ''}">
    <div class="btn act"></div><div class="btn vu"></div><div class="btn vd"></div><div class="btn pw"></div>
    <div class="bezel"><div class="screen" style="background-image:url('${S(screen)}')">
      ${statusBar(dark)}<div class="island"><i></i></div>
      <div class="home" style="background:${dark ? '#fff' : '#000'}"></div><div class="glare"></div>
    </div></div></div>`;
}
// frameless screen card (for cascades)
function card(screen, style = '') {
  const dark = DARK.has(screen);
  return `<div class="card" style="background-image:url('${S(screen)}');${style}">${statusBar(dark)}
    <div class="home" style="background:${dark ? '#fff' : '#000'}"></div></div>`;
}

const CSS = `
@font-face{font-family:'SF Pro Text';src:url('file://${HERE}/fonts/SF-Pro-Text-Semibold.otf');font-weight:600}
@font-face{font-family:Satoshi;src:url('file://${HERE}/../../App/Web_App/static/fonts/Satoshi-Variable.ttf');font-weight:300 900}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Satoshi,Inter,sans-serif;-webkit-font-smoothing:antialiased;color:#111}
.stage{position:relative;overflow:hidden}
.phone{position:absolute;isolation:isolate;width:421px;height:875px;border-radius:70px;transform:scale(var(--s));transform-origin:top left;
  background:linear-gradient(150deg,#5b6672 0%,#232a33 18%,#3d4652 38%,#1a1f26 62%,#4d5864 82%,#20262e 100%);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
.phone::after{content:'';position:absolute;inset:1.6px;border-radius:68.5px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.6),inset 0 0 2px 1px rgba(255,255,255,.08);pointer-events:none}
.btn{position:absolute;width:4px;border-radius:2px;background:linear-gradient(90deg,#1b2027,#4f5a66 50%,#252b33)}
.btn.act{left:-3px;top:118px;height:34px}.btn.vu{left:-3px;top:182px;height:64px}.btn.vd{left:-3px;top:258px;height:64px}
.btn.pw{right:-3px;top:212px;height:102px}
.bezel{position:absolute;inset:3.5px;border-radius:66.5px;background:#050506;box-shadow:inset 0 0 0 1.5px #16191d}
.screen{position:absolute;left:12px;top:12px;width:390px;height:844px;border-radius:55px;overflow:hidden;background-size:cover;background-position:center;background-color:#fff}
.card{position:absolute;width:390px;height:844px;border-radius:44px;overflow:hidden;background-size:cover;background-color:#fff;
  box-shadow:0 40px 80px -30px rgba(20,22,26,.35),0 12px 30px -12px rgba(20,22,26,.18),0 0 0 1px rgba(0,0,0,.04)}
.sb{position:absolute;left:0;right:0;top:0;height:58px;z-index:3}
.time{position:absolute;left:0;width:116px;top:18px;text-align:center;font-family:'SF Pro Text','Inter Display',Inter,sans-serif;font-weight:600;font-size:17px;line-height:22px;letter-spacing:-.4px}
.sb-r{position:absolute;right:28px;top:23px;height:13px;display:flex;align-items:center;gap:6px}
.island{position:absolute;top:11px;left:50%;width:125px;height:37px;margin-left:-62.5px;border-radius:20px;background:#000;z-index:4}
.island i{position:absolute;right:13px;top:12px;width:13px;height:13px;border-radius:50%;
  background:radial-gradient(circle at 40% 35%,#2b3a55 0%,#0d1220 45%,#05070b 70%);box-shadow:0 0 0 1.5px #0b0d12}
.home{position:absolute;bottom:8px;left:50%;width:138px;height:5px;margin-left:-69px;border-radius:3px;z-index:3}
.glare{position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,255,255,.07) 0%,rgba(255,255,255,0) 32%);pointer-events:none;z-index:5}
.lbl{position:absolute;font-size:15px;font-weight:500;color:#6b6e75;letter-spacing:.2px}
.lbl b{display:block;font-size:20px;font-weight:700;color:#111;letter-spacing:-.2px;margin-top:4px}
.num{position:absolute;font-size:13px;font-weight:600;letter-spacing:1.4px;color:#8a8d93}
.h1{position:absolute;font-weight:800;letter-spacing:-2px;line-height:.98;color:#111}
.h1 span{color:#a3a5a9}

.ad-k{position:absolute;font-size:22px;font-weight:500;color:#111;letter-spacing:-.2px}
.ad-g{color:#8d8f93}
.ad-row{position:absolute;display:flex;gap:28px;width:560px}
.ad-row .k{width:200px;flex:none;font-size:19px;font-weight:700;line-height:1.2;color:#111;letter-spacing:-.2px}
.ad-row .v{font-size:19px;font-weight:500;line-height:1.35;color:#7d8086}
.ad-col{position:absolute}
.ad-col .k{font-size:28px;font-weight:700;line-height:1.2;color:#111;letter-spacing:-.3px}
.ad-col .v{margin-top:8px;font-size:24px;font-weight:500;line-height:1.38;color:#6f7278}
.ad-code{position:absolute;font-size:24px;font-weight:500;color:#7d8086;letter-spacing:.5px}
`;


const SPECS = [
  ['Custom landmark database', 'About 1,400 London landmarks, built from OpenStreetMap and Wikipedia.'],
  ['Triggered by GPS', 'Each landmark has its own radius, so its card arrives as it comes into view.'],
  ['Nine themed tours', 'Royal, Architecture, Parks & Gardens and more, sorted by your route.'],
  ['Narrated by Alfie', 'A custom London cabbie voice tells each story.'],
  ['Nothing to install', 'A web app. Scan a QR code in the cab and go.'],
];
const specCol = (x, y, gap, w) => SPECS.map(([k, v], i) => `<div class="ad-col" style="left:${x}px;top:${y + i * gap}px;width:${w}px"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('');
const specRows = (x, y, gap) => SPECS.map(([k, v], i) => `<div class="ad-row" style="left:${x}px;top:${y + i * gap}px"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('');

const pages = {
  // 1. Hero: three phones in a row
  hero: { w: 1800, h: 1100, bg: '#E8E7E3', html: () => `
    ${phone('landing', { scale: .98, style: 'left:226px;top:118px' })}
    ${phone('theme', { scale: .98, style: 'left:690px;top:118px' })}
    ${phone('postcard', { scale: .98, style: 'left:1154px;top:118px' })}` },

  // 2. Flow cascade: four steps, frameless, overlapping
  flow: { w: 2000, h: 1000, bg: '#EFEEEA', html: () => {
    const items = [['landing', 'Where to?'], ['route', 'Choose a route'], ['theme', 'Pick a theme'], ['postcard', 'Ride']];
    return items.map(([s, t], i) => {
      const x = 150 + i * 430, y = 150 + (i % 2) * 0;
      return `${card(s, `left:${x}px;top:${y}px;transform:scale(.92);transform-origin:top left;z-index:${i + 1}`)}
        <div class="num" style="left:${x + 4}px;top:${y - 52}px">0${i + 1}</div>
        <div class="lbl" style="left:${x + 40}px;top:${y - 58}px"><b style="margin:0">${t}</b></div>`;
    }).join('');
  } },

  // 3. Ride states: map -> postcard -> story, cascading with overlap
  ride: { w: 1800, h: 1020, bg: '#1E2126', html: () => `
    ${card('ridemap', 'left:180px;top:150px;transform:scale(.95) rotate(0deg);transform-origin:top left;opacity:1;z-index:1')}
    ${card('postcard', 'left:705px;top:150px;transform:scale(.95);transform-origin:top left;z-index:2')}
    ${card('story', 'left:1230px;top:150px;transform:scale(.95);transform-origin:top left;z-index:3')}
    <div class="lbl" style="left:180px;top:84px;color:#9aa0a8">Map first<b style="color:#fff">The next stop, always on top</b></div>
    <div class="lbl" style="left:705px;top:84px;color:#9aa0a8">Swipe up<b style="color:#fff">A postcard for each landmark</b></div>
    <div class="lbl" style="left:1230px;top:84px;color:#9aa0a8">Tap to flip<b style="color:#fff">Alfie's story on the back</b></div>` },

  // 4. Detail: big cropped phone with headline (reference: single-phone hero)
  detail: { w: 1800, h: 1200, bg: '#E3E1DA', html: () => `
    <div class="h1" style="left:110px;top:360px;font-size:92px">London's<br>stories,<br><span>as you<br>pass them.</span></div>
    ${phone('postcard', { scale: 1.62, style: 'left:860px;top:150px' })}` },

  // 5. Theme close-up: zoomed crop of the tiles
  themes: { w: 1800, h: 1200, bg: '#EFEEEA', html: () => `
    ${phone('theme', { scale: 1.0, style: 'left:150px;top:160px' })}
    <div style="position:absolute;left:760px;top:160px;width:880px;height:878px;border-radius:48px;overflow:hidden;
      box-shadow:0 50px 90px -40px rgba(20,22,26,.4),0 0 0 1px rgba(0,0,0,.04);background:#fff url('${S('theme')}') no-repeat;background-size:1009px auto;background-position:-64px -506px"></div>
    <svg style="position:absolute;left:0;top:0" width="1800" height="1200">
      <path d="M530 372 L760 200 M530 711 L760 1000" stroke="#a9abb0" stroke-width="2" fill="none" stroke-dasharray="1 9" stroke-linecap="round"/>
      <rect x="190" y="371" width="340" height="340" rx="22" fill="none" stroke="#111" stroke-width="2.5"/></svg>
    <div class="lbl" style="left:760px;top:1062px">Choose Theme<b>Nine editions, one tile design</b></div>` },

  // 6. Two ways in
  entry: { w: 1800, h: 1150, bg: '#E8E7E3', html: () => `
    <div class="h1" style="left:110px;top:150px;font-size:72px">Two ways<br><span>in.</span></div>
    <div class="lbl" style="left:112px;top:360px;width:420px;font-size:20px;line-height:1.45;color:#55585e">A black cab has no booking to read, so you type where you're going.
      In an Uber or private hire, the trip is already booked, so one tap starts the stories.</div>
    ${phone('landing', { scale: .98, style: 'left:640px;top:135px' })}
    ${phone('privatehire', { scale: .98, style: 'left:1170px;top:135px' })}
    <div class="lbl" style="left:640px;top:1012px">Black cab<b>Built in v2</b></div>
    <div class="lbl" style="left:1170px;top:1012px">Uber / private hire<b>Design concept</b></div>` },

  // 7. Advert: the three-phone hero with product copy on both sides (4:3, like the single advert)
  advert: { w: 2020, h: 1500, bg: '#E8E7E3', html: () => `
    <div class="ad-k ad-g" style="right:80px;top:64px;font-size:24px">{v2 · 2026}</div>
    <div class="h1" style="left:80px;top:470px;font-size:76px;letter-spacing:-2.5px">London's<br>stories,<br><span>as you<br>pass them.</span></div>
    <div class="ad-k" style="left:82px;top:860px;width:380px;font-size:24px;line-height:1.45;color:#55585e">A web app that turns a cab ride into a tour of the city.</div>
    ${phone('landing', { scale: .7, style: 'left:500px;top:440px' })}
    ${phone('theme', { scale: .7, style: 'left:812px;top:440px' })}
    ${phone('postcard', { scale: .7, style: 'left:1124px;top:440px' })}
    ${specCol(1480, 250, 196, 460)}
    <div class="ad-k ad-g" style="right:80px;bottom:64px;font-size:24px">Black cab · Uber · on foot</div>` },

  // 8. Advert, single phone (reference layout: headline left, specs right)
  'advert-single': { w: 2020, h: 1500, bg: '#E3E1DA', html: () => `
    <div class="h1" style="left:80px;top:500px;font-size:96px;letter-spacing:-3px">Stories<br>for every<br>landmark<br><span>you pass.</span></div>
    ${phone('ridemap', { scale: 1.42, style: 'left:640px;top:120px' })}
    <div class="ad-code" style="left:1340px;top:150px">{1,400 landmarks}</div>
    ${specCol(1340, 250, 196, 600)}
    <div class="ad-code" style="left:1340px;top:1300px">{9 themes}</div>` },
};

const browser = await chromium.launch();
const only = process.argv.slice(3);
for (const [name, p] of Object.entries(pages)) {
  if (only.length && !only.includes(name)) continue;
  const page = await browser.newPage({ viewport: { width: p.w, height: p.h }, deviceScaleFactor: 2 });
  const f = path.join(os.tmpdir(), 'pb_mock_' + name + '.html');
  fs.writeFileSync(f, `<html><head><style>${CSS}</style></head><body><div class="stage" style="width:${p.w}px;height:${p.h}px;background:${p.bg}">${p.html()}</div></body></html>`);
  await page.goto('file://' + f, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, name + '.png') });
  await page.close();
}
// single framed phones on transparent background
for (const s of ['landing', 'privatehire', 'route', 'theme', 'ridemap', 'postcard', 'story']) {
  if (only.length && !only.includes('single')) break;
  const page = await browser.newPage({ viewport: { width: 520, height: 980 }, deviceScaleFactor: 3 });
  const f = path.join(os.tmpdir(), 'pb_mock_single.html');
  fs.writeFileSync(f, `<html><head><style>${CSS} .phone{box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}</style></head><body style="background:transparent">
    <div class="stage" style="width:520px;height:980px">${phone(s, { style: 'left:49.5px;top:52.5px', noShadow: true })}</div></body></html>`);
  await page.goto('file://' + f, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, 'phone-' + s + '.png'), omitBackground: true, clip: { x: 44, y: 47, width: 432, height: 886 } });
  await page.close();
}
await browser.close();
console.log('done', OUT);
