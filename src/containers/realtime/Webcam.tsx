import { FunctionComponent, memo, useState, useEffect, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import _ from 'lodash';
import { FilledButton } from 'components/New_Buttons';
import { Headline } from 'components/New_Typography';
import useWebcam from 'hooks/RP/useWebcam';
import classnames from 'classnames/bind';
import styles from './Webcam.module.scss';

const cx = classnames.bind(styles);

type RecordStatus = 'START' | 'END';

interface Props {
  // onRetarget: () => void;
  isStart?: boolean;
  onStart: (status: RecordStatus) => void;
}

/**
 * ===WARN===
 * Webcam (getUserMedia) 보안상의 이슈로 HTTPS 또는 Localhost에서만 동작
 */
const Webcam: FunctionComponent<Props> = ({ isStart, onStart }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { handleSetWebcam } = useWebcam(videoRef);

  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (videoRef && videoRef.current) {
      handleSetWebcam().then((response) => {
        setIsError(response.isError);
      });
    }
  }, [handleSetWebcam]);

  const handleRecord = useCallback(async () => {
    //   const video = document.getElementById('video') as HTMLVideoElement;
    if (videoRef && videoRef.current) {
      const cam = await tf.data.webcam(videoRef.current);
      const img = await cam.capture();

      // cam.capture();

      if (!isStart) {
        img.print();
        // onRetarget();
        onStart('START');
      }

      if (isStart) {
        onStart('END');
        cam.stop();
      }

      // onStart(!isStart);
    }
  }, [isStart, onStart]);

  const handlePageRefresh = useCallback(() => {
    location.reload();
  }, []);

  const classes = cx('video', {
    hide: !isStart,
  });

  return (
    <div className={cx('wrapper')}>
      {!isError ? (
        <>
          <video className={classes} ref={videoRef} width="100%" height="100%" id="video" muted />
          <FilledButton className={cx('button')} onClick={handleRecord}>
            {isStart ? 'STOP' : 'START'}
          </FilledButton>
        </>
      ) : (
        <div className={cx('inner')}>
          <div className={cx('message')}>
            <Headline level="6" align="center" margin>
              Please check your webcam
            </Headline>
            <FilledButton onClick={handlePageRefresh}>Refresh</FilledButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Webcam);
