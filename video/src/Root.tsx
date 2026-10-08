import React from 'react';
import { Composition } from 'remotion';
import { Advert } from './Advert';
import { FPS, TOTAL } from './config';
import { LabAdvert, LAB_TOTAL } from './lab/LabAdvert';

// Same advert, two formats: 4:5 for the LinkedIn feed, 16:9 for the website.
export const Root: React.FC = () => (
  <>
    <Composition id="advert-4x5" component={Advert} durationInFrames={TOTAL} fps={FPS} width={1080} height={1350} />
    <Composition id="advert-16x9" component={Advert} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    {/* Experimental cut, motion inspired by two references (see src/lab/LabAdvert.tsx) */}
    <Composition id="lab-4x5" component={LabAdvert} durationInFrames={LAB_TOTAL} fps={FPS} width={1080} height={1350} />
    <Composition id="lab-16x9" component={LabAdvert} durationInFrames={LAB_TOTAL} fps={FPS} width={1920} height={1080} />
  </>
);
