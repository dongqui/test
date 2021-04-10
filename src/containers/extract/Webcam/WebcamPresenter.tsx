import _ from 'lodash';
import React from 'react';
import * as S from './WebcamStyles';

export interface WebcamProps {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement> | null | undefined;
  showVideoRef: React.RefObject<HTMLVideoElement> | null | undefined;
}
const WebcamPresenterComponent: React.FC<WebcamProps> = ({ videoUrl, videoRef, showVideoRef }) => {
  return (
    <>
      <S.WebcamSubWrapper ref={videoRef} muted src={videoUrl}>
        <track kind="captions" />
      </S.WebcamSubWrapper>
      <S.WebcamWrapper ref={showVideoRef} muted src={videoUrl} loop>
        <track kind="captions" />
      </S.WebcamWrapper>
    </>
  );
};
export const WebcamPresenter = React.memo(WebcamPresenterComponent);
