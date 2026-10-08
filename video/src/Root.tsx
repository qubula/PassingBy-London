import React from 'react';
import { Composition } from 'remotion';
import { Advert } from './Advert';
import { FPS, TOTAL } from './config';

// Same advert, two formats: 4:5 for the LinkedIn feed, 16:9 for the website.
export const Root: React.FC = () => (
  <>
    <Composition id="advert-4x5" component={Advert} durationInFrames={TOTAL} fps={FPS} width={1080} height={1350} />
    <Composition id="advert-16x9" component={Advert} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
  </>
);
