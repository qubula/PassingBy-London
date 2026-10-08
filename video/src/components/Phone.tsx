// iPhone 15 Pro frame, ported from scripts/mockups/render.mjs so the video's
// phones match the README mockups. Drawn at 421 × 875 and scaled.
import React from 'react';
import { Img, staticFile } from 'remotion';

const SB_FONT = "'SF Pro Text', Satoshi, sans-serif";

export const StatusBar: React.FC<{ dark: boolean }> = ({ dark }) => {
  const c = dark ? '#fff' : '#000';
  const arc = (r: number) => {
    const a = 0.785, cx = 8.5, cy = 11.4;
    return `M${cx - r * Math.sin(a)} ${cy - r * Math.cos(a)} A${r} ${r} 0 0 1 ${cx + r * Math.sin(a)} ${cy - r * Math.cos(a)}`;
  };
  const wedge = (() => {
    const a = 0.785, cx = 8.5, cy = 11.4, r = 3.3;
    return `M${cx} ${cy - 0.2} L${cx - r * Math.sin(a)} ${cy - r * Math.cos(a)} A${r} ${r} 0 0 1 ${cx + r * Math.sin(a)} ${cy - r * Math.cos(a)} Z`;
  })();
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 58, zIndex: 3, color: c }}>
      <span style={{ position: 'absolute', left: 0, width: 116, top: 18, textAlign: 'center', fontFamily: SB_FONT, fontWeight: 600, fontSize: 17, lineHeight: '22px', letterSpacing: -0.4 }}>
        9:41
      </span>
      <div style={{ position: 'absolute', right: 28, top: 23, height: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="18" height="12" viewBox="0 0 18 12"><g fill={c}>
          <rect x="0" y="7.5" width="3" height="4.5" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></g></svg>
        <svg width="17" height="12" viewBox="0 0 17 12">
          <g fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d={arc(9.6)} /><path d={arc(6.1)} /></g>
          <path d={wedge} fill={c} stroke={c} strokeWidth="1.3" strokeLinejoin="round" /></svg>
        <svg width="27.5" height="13" viewBox="0 0 27.5 13">
          <rect x="0.5" y="0.5" width="24" height="12" rx="4" fill="none" stroke={c} strokeOpacity="0.35" />
          <rect x="2" y="2" width="21" height="9" rx="2.6" fill={c} />
          <path d="M26 4.6v3.8c0.85-0.32 1.4-1.1 1.4-1.9s-0.55-1.58-1.4-1.9z" fill={c} fillOpacity="0.4" /></svg>
      </div>
    </div>
  );
};

export const PHONE_W = 421;
export const PHONE_H = 875;

type Props = {
  // A screen image in public/, or nothing if children draw the screen.
  screen?: string;
  // 'light' / 'dark' draws the status bar; false when the image has its own.
  statusBar?: 'light' | 'dark' | false;
  island?: boolean;
  width: number; // rendered width in px
  style?: React.CSSProperties;
  children?: React.ReactNode; // drawn on top of the screen, in 390 × 844 screen points
};

export const Phone: React.FC<Props> = ({ screen, statusBar = 'light', island = true, width, style, children }) => {
  const k = width / PHONE_W;
  const dark = statusBar === 'dark';
  const btn: React.CSSProperties = { position: 'absolute', width: 4, borderRadius: 2, background: 'linear-gradient(90deg,#1b2027,#4f5a66 50%,#252b33)' };
  return (
    <div style={{ position: 'absolute', width: PHONE_W * k, height: PHONE_H * k, ...style }}>
      <div style={{
        position: 'absolute', width: PHONE_W, height: PHONE_H, transform: `scale(${k})`, transformOrigin: 'top left',
        borderRadius: 70, isolation: 'isolate',
        background: 'linear-gradient(150deg,#5b6672 0%,#232a33 18%,#3d4652 38%,#1a1f26 62%,#4d5864 82%,#20262e 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)',
      }}>
        <div style={{ ...btn, left: -3, top: 118, height: 34 }} />
        <div style={{ ...btn, left: -3, top: 182, height: 64 }} />
        <div style={{ ...btn, left: -3, top: 258, height: 64 }} />
        <div style={{ ...btn, right: -3, top: 212, height: 102 }} />
        <div style={{ position: 'absolute', inset: 3.5, borderRadius: 66.5, background: '#050506', boxShadow: 'inset 0 0 0 1.5px #16191d' }}>
          <div style={{ position: 'absolute', left: 12, top: 12, width: 390, height: 844, borderRadius: 55, overflow: 'hidden', background: '#fff' }}>
            {screen ? <Img src={staticFile(screen)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
            {children}
            {statusBar ? <StatusBar dark={dark} /> : null}
            {island ? (
              <div style={{ position: 'absolute', top: 11, left: '50%', width: 125, height: 37, marginLeft: -62.5, borderRadius: 20, background: '#000', zIndex: 4 }}>
                <i style={{ position: 'absolute', right: 13, top: 12, width: 13, height: 13, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%,#2b3a55 0%,#0d1220 45%,#05070b 70%)', boxShadow: '0 0 0 1.5px #0b0d12' }} />
              </div>
            ) : null}
            {statusBar ? (
              <div style={{ position: 'absolute', bottom: 8, left: '50%', width: 138, height: 5, marginLeft: -69, borderRadius: 3, zIndex: 3, background: dark ? '#fff' : '#000' }} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
