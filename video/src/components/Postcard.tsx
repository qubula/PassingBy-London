// The ride's postcard (Figma "Map Postcard" in 04d, code: templates/v2/tour.html
// and the .v2-pc rules in static/v2/css/v2.css). Change the card here and
// every beat that uses it updates: hook, deck, fan, flip and end card.
// Sizes are the app's own, designed for a 350 px wide card and scaled.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { SANS } from '../fonts';
import { Landmark, storyFor } from '../config';

export const CARD_W = 350;
export const CARD_H = 470;

const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#6b7280';
const TEXT_TERTIARY = '#9ca3af';

const eyebrow: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: TEXT_SECONDARY,
};
const pill: React.CSSProperties = {
  flex: 'none', alignSelf: 'center', marginTop: 16, padding: '10px 18px', borderRadius: 14, background: '#f5f5f5', fontSize: 14, color: TEXT_PRIMARY,
};
const face: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '30px 20px 20px', borderRadius: 16, background: '#fff',
  backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'hidden',
};

type Props = {
  landmark: Landmark;
  width: number;
  flip?: number; // 0 = front, 1 = back
  story?: number; // 0..1 of the story written on the back
  storyChars?: number; // or an exact number of characters (overrides `story`)
  storyText?: string; // text for the back, instead of the landmark's story from the database
  caret?: boolean; // show a typing caret after the text
  shadow?: number; // 0..1 shadow strength
  style?: React.CSSProperties;
};

export const Postcard: React.FC<Props> = ({ landmark, width, flip = 0, story = 1, storyChars, storyText, caret = false, shadow = 1, style }) => {
  const k = width / CARD_W;
  const text = storyText ?? storyFor(landmark.name);
  const shown = text.slice(0, storyChars ?? Math.round(text.length * story));
  const photo = staticFile('landmarks/' + landmark.photo);
  const boxShadow = `0 ${8 + 20 * shadow}px ${24 + 40 * shadow}px rgba(0,0,0,${0.12 + 0.14 * shadow})`;
  return (
    <div style={{ position: 'absolute', width: CARD_W * k, height: CARD_H * k, ...style }}>
      <div style={{ width: CARD_W, height: CARD_H, transform: `scale(${k})`, transformOrigin: 'top left', perspective: 1400, fontFamily: SANS }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `rotateY(${flip * 180}deg)` }}>
          {/* Front */}
          <div style={{ ...face, boxShadow }}>
            <div style={{ flex: 1, minHeight: 0, width: '77%', padding: 8, borderRadius: 12, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden', background: '#f5f5f5' }}>
                <Img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
            <span style={{ ...eyebrow, marginTop: 18, textAlign: 'center' }}>{landmark.where}</span>
            <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 600, lineHeight: 1.2, color: TEXT_PRIMARY, textAlign: 'center' }}>{landmark.name}</p>
            <span style={pill}>Tap to read the story</span>
          </div>
          {/* Back */}
          <div style={{ ...face, boxShadow, alignItems: 'stretch', transform: 'rotateY(180deg)', padding: '32px 24px 20px' }}>
            <div style={{ position: 'absolute', top: 24, right: 20, width: 58, height: 70, padding: 4, border: `1.5px dashed ${TEXT_TERTIARY}`, borderRadius: 4, background: '#fff', transform: 'rotate(-4deg)' }}>
              <Img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <span style={eyebrow}>{landmark.where}</span>
            <p style={{ margin: '4px 0 0', paddingRight: 70, fontSize: 22, fontWeight: 600, lineHeight: 1.2, color: TEXT_PRIMARY }}>{landmark.name}</p>
            <div style={{
              flex: 1, minHeight: 0, marginTop: 16, padding: '14px 6px 24px 0', borderTop: '1px solid #e5e7eb', overflow: 'hidden',
              fontSize: 16, lineHeight: 1.55, color: TEXT_PRIMARY,
              WebkitMaskImage: 'linear-gradient(to bottom, #000 calc(100% - 40px), transparent)',
              maskImage: 'linear-gradient(to bottom, #000 calc(100% - 40px), transparent)',
            }}>
              {shown}
              {caret ? <span style={{ display: 'inline-block', width: 2, height: '1.1em', marginLeft: 1, verticalAlign: '-0.15em', background: TEXT_PRIMARY }} /> : null}
            </div>
            <span style={pill}>Tap to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
};
