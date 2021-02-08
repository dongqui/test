/* eslint-disable jsx-a11y/media-has-caption */
import _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWebcam } from '../../../hooks/RP/useWebcam';
import * as tf from '@tensorflow/tfjs';

export interface WebcamPanelProps {
  width: string;
  height: string;
}

const WebcamPanelComponent: React.FC<WebcamPanelProps> = ({ width = '100%', height = '100%' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useWebcam({ videoRef });

  useEffect(() => {
    const video = videoRef.current;
    // setInterval(() => {
    //   const video: any = document.getElementById('video');
    //   const captureStream = video.captureStream();
    //   console.log('captureStream', captureStream);
    // }, 1000);
  }, []);

  const handleClick = useCallback(async () => {
    const video = document.getElementById('video') as HTMLVideoElement;
    // video?.captureStream();
    console.log(video);
    const cam = await tf.data.webcam(video);
    const img = await cam.capture();
    img.print();
    cam.capture();

    /**
     * TODO
     */
  }, []);

  return (
    <>
      <div style={{ width, height }}>
        <video ref={videoRef} width="100%" height="100%" id="video" autoPlay></video>
      </div>
      <button onClick={handleClick}>stop</button>
    </>
  );
};

export const WebcamPanel = React.memo(WebcamPanelComponent);
