import { RefObject, useCallback, useEffect } from 'react';

interface useRecordWebcamProps {
  ref: RefObject<HTMLVideoElement>;
}
const OPTIONS = {
  audio: false,
  video: {
    facingMode: 'user',
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
  },
};
export const useRecordWebcam = ({ ref }: useRecordWebcamProps) => {
  const initialAction = useCallback(async () => {
    const video = ref.current;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(OPTIONS);
      if (video) {
        video.srcObject = mediaStream;
        video.onloadedmetadata = () => {
          video.play();
        };
      }
    } catch (error) {
      console.log('error', error);
    }
  }, [ref]);
  useEffect(() => {
    initialAction();
  }, [initialAction, ref]);
};
