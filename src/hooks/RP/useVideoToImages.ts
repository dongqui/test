import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { isClient, STANDARD_TIME_UNIT } from 'utils/const';
import { STANDARD_TIME_CUT_UNIT } from '../../utils/const';

interface useVideoToImagesProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

let tempImages: string[] = [];
export const useVideoToImages = ({ videoRef }: useVideoToImagesProps) => {
  const [images, setImages] = useState<string[]>([]);
  const makeImages = useCallback(async () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!_.isNull(video) && !_.isNull(ctx)) {
      canvas.setAttribute('width', `${video?.offsetWidth}px`);
      canvas.setAttribute('height', `${video?.offsetHeight}px`);
      await video.play();
      let cnt = 0;
      tempImages = [];
      for (const item of Array(Math.round(video.duration / STANDARD_TIME_CUT_UNIT))) {
        console.log('cnt', cnt);
        try {
          await video?.play();
          video.currentTime = cnt * STANDARD_TIME_CUT_UNIT;
          await video.pause();
          ctx.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);
          const frameImage = canvas.toDataURL('jpg');
          tempImages.push(frameImage);
          setImages(tempImages);
          cnt += 1;
          // eslint-disable-next-line no-empty
        } catch (error) {}
      }
      // setImages(tempImages);
    }
  }, [videoRef]);
  useEffect(() => {
    makeImages();
  }, [makeImages]);
  useEffect(() => {
    console.log('images', images);
  }, [images]);
  return {
    images,
  };
};
