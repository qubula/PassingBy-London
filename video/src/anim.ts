import { Easing, interpolate, spring } from 'remotion';

// Motion language: fast in, soft settle.
export const SNAP = { damping: 18, stiffness: 180, mass: 0.9 };
export const SOFT = { damping: 22, stiffness: 110, mass: 1 };
export const BOUNCE = { damping: 12, stiffness: 160, mass: 0.8 };

export const sp = (frame: number, fps: number, delay = 0, config = SNAP) =>
  spring({ frame: frame - delay, fps, config });

export const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

// Eased 0..1 between two frames.
export const ramp = (frame: number, from: number, to: number, ease = Easing.bezier(0.22, 1, 0.36, 1)) =>
  interpolate(frame, [from, to], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
