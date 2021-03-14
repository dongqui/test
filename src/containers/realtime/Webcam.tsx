/* eslint-disable jsx-a11y/media-has-caption */
import { FunctionComponent, memo, useState, useEffect, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import _ from 'lodash';
import { Loading } from 'components/Loading';
import { FilledButton } from 'components/New_Buttons';
import { Headline } from 'components/New_Typography';
import useWebcam from 'hooks/RP/useWebcam';
import classnames from 'classnames/bind';
import styles from './Webcam.module.scss';

const cx = classnames.bind(styles);

/**
 * ===WARN===
 * Webcam (getUserMedia) 보안상의 이슈로 HTTPS 또는 Localhost에서만 동작
 */
const Webcam: FunctionComponent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { handleSetWebcam } = useWebcam(videoRef);

  const [existWebcam, setExistWebcam] = useState({
    isLoaded: false,
    isExistWebcam: false,
  });

  useEffect(() => {
    handleSetWebcam().then((response) => {
      setExistWebcam({
        isLoaded: true,
        isExistWebcam: !response.isError,
      });

      return response.isError;
    });
  }, [handleSetWebcam]);

  // const handleClick = useCallback(async () => {
  //   const video = document.getElementById('video') as HTMLVideoElement;
  //   // video?.captureStream();
  //   const cam = await tf.data.webcam(video);
  //   const img = await cam.capture();
  //   img.print();
  //   cam.capture();
  // }, []);

  const handlePageRefresh = useCallback(() => {
    location.reload();
  }, []);

  const { isLoaded, isExistWebcam } = existWebcam;

  if (!isLoaded) {
    return (
      <div className={cx('wrapper')}>
        <span className={cx('loader')}>
          <Loading />
        </span>
      </div>
    );
  }

  if (!isExistWebcam) {
    return (
      <div className={cx('wrapper')}>
        <div className={cx('message')}>
          <Headline level="6" align="center" margin>
            Please check your webcam
          </Headline>
          <FilledButton onClick={handlePageRefresh}>Refresh</FilledButton>
        </div>
      </div>
    );
  }

  return (
    <div className={cx('wrapper')}>
      <video ref={videoRef} width="100%" height="100%" id="video" autoPlay />
    </div>
  );
};

export default memo(Webcam);
