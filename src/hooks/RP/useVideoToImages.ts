import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { STANDARD_TIME_CUT_UNIT } from '../../utils/const';

interface useVideoToImagesProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

let tempImages: string[] = [];
let interval: any;
export const useVideoToImages = ({ videoRef }: useVideoToImagesProps) => {
  const [images, setImages] = useState<string[]>([]);
  const initialAction = useCallback(async () => {
    tempImages = [];
  }, []);
  const makeImages = useCallback(async () => {
    const video = videoRef.current;
    if (video?.ended) {
      await video.pause();
      await video.remove();
      clearInterval(interval);
    }
    if (video?.paused) {
      await video.play();
    }
    document.getElementsByTagName('canvas')?.[0]?.remove();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!_.isNull(video) && !_.isNull(ctx)) {
      canvas.setAttribute('width', `${video?.offsetWidth}px`);
      canvas.setAttribute('height', `${video?.offsetHeight}px`);
      ctx.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);
      const frameImage = canvas.toDataURL('jpg');
      tempImages = _.concat(tempImages, frameImage);
      setImages(tempImages);
    }
  }, [videoRef]);
  useEffect(() => {
    initialAction();
    interval = setInterval(makeImages, 1000 * STANDARD_TIME_CUT_UNIT);
  }, [initialAction, makeImages]);
  return {
    images,
  };
};
