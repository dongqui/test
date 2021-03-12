/* eslint-disable jsx-a11y/media-has-caption */
import React, { useCallback, useEffect, useRef } from 'react';
import _ from 'lodash';
import useWebcam from 'hooks/RP/useWebcam';
import * as tf from '@tensorflow/tfjs';

/**
 * ===WARN===
 * Webcam (getUserMedia) 보안상의 이슈로 HTTPS 또는 Localhost에서만 동작
 */
const Webcam: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { handleSetWebcam } = useWebcam(videoRef);

  useEffect(() => {
    handleSetWebcam();
  }, [handleSetWebcam]);

  const handleClick = useCallback(async () => {
    const video = document.getElementById('video') as HTMLVideoElement;
    // video?.captureStream();
    console.log(video);
    const cam = await tf.data.webcam(video);
    const img = await cam.capture();
    img.print();
    cam.capture();
  }, []);

  return (
    <>
      <div>
        <video ref={videoRef} width="100%" height="100%" id="video" autoPlay></video>
      </div>
      {/* <button onClick={handleClick}>stop</button> */}
    </>
  );
};

export default React.memo(Webcam);
