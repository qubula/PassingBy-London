// A counter on its own line with its label underneath, so the number can grow
// without the line reflowing. The label swaps (with a quick lift) when it changes.
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useLayout } from '../layout';
import { SANS } from '../fonts';
import { ramp, sp } from '../anim';

type Props = {
  value: number;
  plus: boolean;
  label: string;
  labelKey: string; // changes when the label changes, to re-run its entrance
  labelAt: number; // frame the current label came in
  sub?: string;
  subAt?: number;
  color: string;
  delay?: number;
  out?: number;
};

export const BigCount: React.FC<Props> = ({ value, plus, label, labelKey, labelAt, sub, subAt = 0, color, delay = 0, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const c = L.caption;
  const inT = sp(frame, fps, delay);
  const leave = out === undefined ? 0 : ramp(frame, out, out + 10);
  const lab = sp(frame, fps, labelAt);
  const subT = sub ? sp(frame, fps, subAt) : 0;
  const big = (L.wide ? 96 : 92) * L.u; // same size as the other captions
  return (
    <div style={{
      position: 'absolute', left: c.left, top: c.top, bottom: c.bottom, width: c.width,
      display: 'flex', flexDirection: 'column', justifyContent: c.justify, alignItems: c.align === 'center' ? 'center' : 'flex-start',
      textAlign: c.align, fontFamily: SANS, color, opacity: (1 - leave), transform: `translateY(${-30 * leave * L.u}px)`,
    }}>
      <div style={{
        fontSize: big, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums',
        transform: `translateY(${(1 - inT) * 40 * L.u}px)`, opacity: inT, whiteSpace: 'nowrap',
      }}>
        {value.toLocaleString('en-GB')}{plus ? '+' : ''}
      </div>
      <div key={labelKey} style={{
        fontSize: big, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.04,
        transform: `translateY(${(1 - lab) * 30 * L.u}px)`, opacity: lab,
      }}>{label}</div>
      {sub ? (
        <div style={{ marginTop: 16 * L.u, fontSize: (L.wide ? 30 : 30) * L.u, fontWeight: 500, opacity: 0.62 * subT, maxWidth: 760 * L.u }}>{sub}</div>
      ) : null}
    </div>
  );
};
