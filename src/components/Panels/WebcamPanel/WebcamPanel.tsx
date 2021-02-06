/* eslint-disable jsx-a11y/media-has-caption */
import _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWebcam } from '../../../hooks/RP/useWebcam';

export interface WebcamPanelProps {
  width: string;
  height: string;
}

const WebcamPanelComponent: React.FC<WebcamPanelProps> = ({ width = '100%', height = '100%' }) => {
  const videoRef: any = useRef(null);
  useWebcam({ videoRef });
  useEffect(() => {
    // setInterval(() => {
    //   const video: any = document.getElementById('video');
    //   const captureStream = video.captureStream();
    //   console.log('captureStream', captureStream);
    // }, 1000);
  }, []);
  return (
    <div style={{ width, height }}>
      <video ref={videoRef} width="100%" height="100%" id="video" autoPlay></video>
    </div>
  );
};

export const WebcamPanel = React.memo(WebcamPanelComponent);
