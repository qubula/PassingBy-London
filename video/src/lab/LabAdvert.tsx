// Experimental cut ("lab"): the same pieces as the main advert, with motion
// borrowed from two references: everything grows out of one dot and returns
// to it (Mouthwash Studio, Brand.ai), and focus pulls between pieces floating
// at different depths instead of cuts (Rico, Jitter Showcase 09).
import React from 'react';
import { AbsoluteFill, Series, useCurrentFrame } from 'remotion';
import { COLORS, LANDMARK_COUNT, sec } from '../config';
import { loadFonts } from '../fonts';
import { useLayout } from '../layout';
import { Origin, ORIGIN_LEN } from './Origin';
import { Depth, DEPTH_LEN } from './Depth';
import { Collapse, COLLAPSE_LEN } from './Collapse';
import { Chrome } from './pieces';

loadFonts();
export const LAB_TOTAL = ORIGIN_LEN + DEPTH_LEN + COLLAPSE_LEN;

// Section label in the top-right corner, by start time.
const SECTIONS: [number, string][] = [
  [0, '01 · Landmarks'], [10.0, '02 · Stories'],
  [16.6 + 0.9, '03 · Ride app'], [16.6 + 4.1, '04 · Themes'], [16.6 + 7.0, '05 · The ride'], [16.6 + 9.9, '06 · Black cab'],
  [29.6, '07 · PassingBy'],
];

export const LabAdvert: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const index = [...SECTIONS].reverse().find(([s]) => frame >= sec(s))![1];
  const dark = frame >= ORIGIN_LEN && frame < ORIGIN_LEN + DEPTH_LEN;
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Series>
        <Series.Sequence durationInFrames={ORIGIN_LEN}><Origin /></Series.Sequence>
        <Series.Sequence durationInFrames={DEPTH_LEN}><Depth /></Series.Sequence>
        <Series.Sequence durationInFrames={COLLAPSE_LEN}><Collapse /></Series.Sequence>
      </Series>
      <Chrome u={L.u} color={dark ? COLORS.white : COLORS.ink} index={index}
        spec={`${LANDMARK_COUNT.toLocaleString('en-GB')} landmarks · 9 themes · Alfie`} />
    </AbsoluteFill>
  );
};
