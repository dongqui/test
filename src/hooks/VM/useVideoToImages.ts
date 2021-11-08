import _ from 'lodash';
import { RefObject, useCallback, useEffect } from 'react';
import getBlobDuration from 'get-blob-duration';
import sleep from 'utils/common/sleep';
import fnKillThread from 'utils/common/fnKillSetInterval';

interface UseVideoToImagesProps {
  videoRef: RefObject<HTMLVideoElement>;
  videoUrl: string;
  action: ({ images }: { images: string[] }) => void;
  active: boolean;
}

let tempImages: string[] = [];
let isWorking = false;
const useVideoToImages = ({ videoRef, videoUrl, action, active }: UseVideoToImagesProps) => {
  const makeImages = useCallback(async () => {
    isWorking = true;
    const video = videoRef.current;
    const duration = await getBlobDuration(videoUrl);
    const interval = duration / 20;
    tempImages = [];
    for (const i of _.range(20)) {
      if (video) {
        video.currentTime = interval * (i + 1);
      }
      await video?.pause();
      document.getElementsByTagName('canvas')?.[0]?.remove();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!_.isNull(video) && !_.isNull(ctx)) {
        canvas.setAttribute('width', `${video?.offsetWidth}px`);
        canvas.setAttribute('height', `${video?.offsetHeight}px`);
        ctx.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);
        const frameImage = canvas.toDataURL('jpg');
        tempImages = _.concat(tempImages, frameImage);
        action({ images: tempImages });
      }
      await sleep(200);
    }
    isWorking = false;
  }, [action, videoRef, videoUrl]);
  useEffect(() => {
    try {
      if (active && !isWorking) {
        makeImages();
      }
    } catch (error) {
      console.log(error);
    }
  }, [active, makeImages]);
  useEffect(() => {
    return () => {
      isWorking = false;
      fnKillThread();
    };
  }, []);
};

export default useVideoToImages;
