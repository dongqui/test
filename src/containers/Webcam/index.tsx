import { useVideoToImages } from 'hooks/RP/useVideoToImages';
import _ from 'lodash';
import React, { useRef } from 'react';
import * as S from './WebcamStyles';

export interface WebcamProps {
  videoUrl: string;
}

const WebcamComponent: React.FC<WebcamProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { images } = useVideoToImages({ videoRef });
  return (
    <>
      <S.WebcamSubWrapper ref={videoRef} muted src={videoUrl}>
        <track kind="captions" />
      </S.WebcamSubWrapper>
      <S.WebcamWrapper muted src={videoUrl}>
        <track kind="captions" />
      </S.WebcamWrapper>
    </>
  );
};
export const Webcam = React.memo(WebcamComponent);
