import _ from 'lodash';
import { useEffect } from 'react';

const CONSTRAINT_OBJ = {
  audio: false,
  video: {
    facingMode: 'user',
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
  },
};

export const useWebcam = ({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) => {
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia(CONSTRAINT_OBJ)
      .then((mediaStreamObj) => {
        const video = videoRef?.current;
        if (video) {
          video.srcObject = mediaStreamObj;
        }
      })
      .catch((err) => {
        console.log(err.name, err.message);
      });
  }, [videoRef]);
};
