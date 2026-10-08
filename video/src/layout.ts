import { useVideoConfig } from 'remotion';

// One layout per format. 16:9: words on the left, picture on the right.
// 4:5: words on top, picture below. `u` scales sizes designed at 1080 px.
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const u = wide ? height / 1080 : width / 1080;
  return {
    wide,
    width,
    height,
    u,
    // centre of the picture area
    cx: wide ? width * 0.66 : width / 2,
    cy: wide ? height / 2 : height * 0.6,
    // caption box
    caption: wide
      ? { left: 140 * u, top: 0, bottom: 0, width: width * 0.42, align: 'left' as const, justify: 'center' as const }
      : { left: 70 * u, top: 96 * u, bottom: undefined, width: width - 140 * u, align: 'center' as const, justify: 'flex-start' as const },
  };
};
