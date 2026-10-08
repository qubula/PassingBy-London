// The on-screen words. Each word rises in on a spring, a beat apart, and the
// whole line lifts out at the end of its beat.
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useLayout } from '../layout';
import { SANS } from '../fonts';
import { ramp, sp } from '../anim';

type Props = {
  text: string;
  sub?: string; // smaller second line
  color?: string;
  delay?: number; // frames before the first word
  out?: number; // frame at which it leaves; omit to stay
  size?: number; // font size at 1080
};

export const Caption: React.FC<Props> = ({ text, sub, color = '#111', delay = 0, out, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const fs = (size ?? (L.wide ? 96 : 92)) * L.u;
  const words = text.split(' ');
  const leave = out === undefined ? 0 : ramp(frame, out, out + 8);
  const c = L.caption;
  return (
    <div style={{
      position: 'absolute', left: c.left, top: c.top, bottom: c.bottom, width: c.width,
      display: 'flex', flexDirection: 'column', justifyContent: c.justify, alignItems: c.align === 'center' ? 'center' : 'flex-start',
      textAlign: c.align, fontFamily: SANS, color, pointerEvents: 'none',
      opacity: 1 - leave, transform: `translateY(${-30 * leave * L.u}px)`, filter: leave ? `blur(${leave * 6}px)` : undefined,
    }}>
      <div style={{ fontSize: fs, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.035em' }}>
        {words.map((w, i) => {
          const t = sp(frame, fps, delay + i * 2.5);
          return (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
              <span style={{ display: 'inline-block', transform: `translateY(${(1 - t) * 105}%)`, opacity: Math.min(1, t * 1.6) }}>
                {w}{i < words.length - 1 ? ' ' : ''}
              </span>
            </span>
          );
        })}
      </div>
      {sub ? (
        <div style={{
          marginTop: 22 * L.u, fontSize: fs * 0.42, fontWeight: 500, letterSpacing: '-0.01em', opacity: 0.62 * sp(frame, fps, delay + words.length * 2.5 + 4),
        }}>{sub}</div>
      ) : null}
    </div>
  );
};
