import { useVideoToImages } from 'hooks/RP/useVideoToImages';
import _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sleep } from 'utils/common/sleep';
import { STANDARD_TIME_CUT_UNIT } from 'utils/const';
import * as S from './WebcamStyles';

export interface WebcamProps {}

const WebcamComponent: React.FC<WebcamProps> = ({}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // const { images } = useVideoToImages({ videoRef });
  const [image, setImage] = useState<string>();
  const makeImages = useCallback(async () => {
    const video = videoRef.current;
    document.getElementsByTagName('canvas')?.[0]?.remove();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!_.isNull(video) && !_.isNull(ctx)) {
      canvas.setAttribute('width', `${video?.offsetWidth}px`);
      canvas.setAttribute('height', `${video?.offsetHeight}px`);
      ctx.drawImage(video, 0, 0, video.offsetWidth, video.offsetHeight);
      const frameImage = canvas.toDataURL('jpg');
      setImage(frameImage);
    }
  }, [videoRef]);
  const onClick = useCallback(() => {
    videoRef.current?.play();
    setInterval(makeImages, 1000);
  }, [makeImages]);
  return (
    <>
      <S.WebcamWrapper ref={videoRef} muted src="/video/sample.mov">
        <track kind="captions" />
      </S.WebcamWrapper>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 500, height: 500 }}>
        <img src={image} alt="test" width={500} height={500} />
      </div>
      <button onClick={onClick}>버튼</button>
    </>
  );
};
export const Webcam = React.memo(WebcamComponent);
