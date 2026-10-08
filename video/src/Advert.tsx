// The advert: nine beats in a row, hard cuts between them.
// Beats 1–5 are one continuous shot (src/scenes/Cards.tsx). Scenes cut on
// motion: each one is still moving when the next begins, so nothing stalls.
import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { BEATS, COLORS } from './config';
import { loadFonts } from './fonts';
import { Cards } from './scenes/Cards';
import { RideApp } from './scenes/RideApp';
import { Themes } from './scenes/Themes';
import { Ride } from './scenes/Ride';
import { BlackCab } from './scenes/BlackCab';
import { EndCard } from './scenes/EndCard';

loadFonts();

export const Advert: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <Series>
      <Series.Sequence durationInFrames={BEATS.hook + BEATS.deck + BEATS.stories + BEATS.fan + BEATS.alfie}><Cards /></Series.Sequence>
      <Series.Sequence durationInFrames={BEATS.rideApp}><RideApp /></Series.Sequence>
      <Series.Sequence durationInFrames={BEATS.themes}><Themes /></Series.Sequence>
      <Series.Sequence durationInFrames={BEATS.ride}><Ride /></Series.Sequence>
      <Series.Sequence durationInFrames={BEATS.blackCab}><BlackCab /></Series.Sequence>
      <Series.Sequence durationInFrames={BEATS.end}><EndCard /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);
