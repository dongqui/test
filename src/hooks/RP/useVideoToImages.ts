import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface useVideoToImagesProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  action: ({ images }: { images: string[] }) => void;
  active: boolean;
  intervalTime: number;
}

let tempImages: string[] = [];
let interval: any;
export const useVideoToImages = ({
  videoRef,
  action,
  active,
  intervalTime,
}: useVideoToImagesProps) => {
  const makeImages = useCallback(async () => {
    const video = videoRef.current;
    if (video?.ended) {
      tempImages = [];
      await video.pause();
      await video.remove();
      for (let i = 0; i < 99999; i++) {
        window.clearInterval(i);
      }
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
      action({ images: tempImages });
    }
  }, [action, videoRef]);
  useEffect(() => {
    tempImages = [];
    if (active) {
      interval = setInterval(makeImages, intervalTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
