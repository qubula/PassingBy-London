// Alfie's waveform, drawn from the real clip: one bar per slice of the audio,
// revealed left to right as it plays.
import React from 'react';
import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { getWaveformPortion, useAudioData } from '@remotion/media-utils';
import { ALFIE } from '../config';
import { sp } from '../anim';

type Props = { left: number; top: number; width: number; height: number; color: string; start: number };

export const Waveform: React.FC<Props> = ({ left, top, width, height, color, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audio = useAudioData(staticFile(ALFIE.file));
  if (!audio) return null;
  const N = 72;
  const bars = getWaveformPortion({
    audioData: audio, startTimeInSeconds: ALFIE.startFrom, durationInSeconds: ALFIE.duration, numberOfSamples: N,
  });
  const peak = Math.max(...bars.map(b => b.amplitude), 0.001);
  const gap = width / N;
  const playedBars = ((frame - start) / fps / ALFIE.duration) * N;
  return (
    <svg style={{ position: 'absolute', left, top, overflow: 'visible' }} width={width} height={height}>
      {bars.map((b, i) => {
        const grow = sp(frame, fps, start + (i / N) * ALFIE.duration * fps - 2);
        const amp = 0.08 + 0.92 * Math.pow(b.amplitude / peak, 0.8);
        const h = Math.max(3, amp * height * grow);
        const played = i < playedBars;
        return (
          <rect key={i} x={i * gap + gap * 0.2} y={(height - h) / 2} width={gap * 0.6} height={h} rx={gap * 0.3}
            fill={color} opacity={played ? 1 : 0.25} />
        );
      })}
    </svg>
  );
};
