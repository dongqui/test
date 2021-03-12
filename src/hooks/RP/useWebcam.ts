import { useCallback, RefObject } from 'react';
import _ from 'lodash';

const constraints = {
  audio: false,
  video: {
    // 비디오가 사용자를 향함
    facingMode: 'user',
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
  },
};

const useWebcam = (videoRef: RefObject<HTMLVideoElement>) => {
  const setMediaStream = useCallback(
    (ref: RefObject<HTMLVideoElement>, mediaStream: MediaStream) => {
      const currentRef = ref?.current;

      if (currentRef) {
        currentRef.srcObject = mediaStream;
      }
    },
    [],
  );

  const setWebcam = useCallback(() => {
    const response = navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
      setMediaStream(videoRef, mediaStream);
      return {
        isError: false,
      };
    });

    return response;
  }, [setMediaStream, videoRef]);

  return {
    handleSetWebcam: setWebcam,
  };
};

export default useWebcam;
