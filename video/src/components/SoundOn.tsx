// LinkedIn cut only: a small "sound on" pill at the start. LinkedIn plays the
// feed muted, and the music, sound effects and Alfie are worth hearing. It sits
// below the cards, light enough to read on the black opening and on the grey,
// and leaves before the quotes reach the bottom of the frame.
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, COPY, SOUND_ON } from '../config';
import { SANS } from '../fonts';
import { useLayout } from '../layout';
import { ramp, sp } from '../anim';

const Speaker: React.FC<{ size: number; frame: number; fps: number }> = ({ size, frame, fps }) => {
  // the two waves pulse outwards, one after the other, about once a second
  const wave = (i: number) => 0.35 + 0.65 * Math.max(0, Math.sin(((frame / fps) * 1.1 - i * 0.18) * Math.PI * 2));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={COLORS.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill={COLORS.ink} />
      <path d="M15.5 9.2a4 4 0 0 1 0 5.6" opacity={wave(0)} />
      <path d="M18.3 6.6a7.6 7.6 0 0 1 0 10.8" opacity={wave(1)} />
    </svg>
  );
};

export const SoundOn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const inT = sp(frame, fps, SOUND_ON.from);
  const outT = ramp(frame, SOUND_ON.to - 10, SOUND_ON.to);
  if (frame < SOUND_ON.from || frame > SOUND_ON.to) return null;
  const fs = 34 * L.u;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: SOUND_ON.bottom * L.u,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      opacity: Math.min(1, inT * 1.4) * (1 - outT),
      transform: `translateY(${((1 - inT) * 24 + outT * 12) * L.u}px)`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12 * L.u,
        padding: `${14 * L.u}px ${28 * L.u}px ${14 * L.u}px ${22 * L.u}px`,
        borderRadius: 999, background: 'rgba(255,255,255,0.94)',
        boxShadow: `0 ${6 * L.u}px ${24 * L.u}px rgba(0,0,0,0.12)`,
        fontFamily: SANS, fontSize: fs, fontWeight: 600, letterSpacing: '-0.01em', color: COLORS.ink,
      }}>
        <Speaker size={fs * 1.25} frame={frame} fps={fps} />
        {COPY.soundOn}
      </div>
    </div>
  );
};
