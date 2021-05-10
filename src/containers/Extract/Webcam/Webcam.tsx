import _ from 'lodash';
import { FunctionComponent, memo, Fragment, RefObject } from 'react';
import classNames from 'classnames/bind';
import styles from './Webcam.module.scss';

const cx = classNames.bind(styles);

export interface Props {
  videoUrl: string;
  videoRef?: RefObject<HTMLVideoElement>;
  showVideoRef?: RefObject<HTMLVideoElement>;
}

const WebcamPresenterComponent: FunctionComponent<Props> = ({
  videoUrl,
  videoRef,
  showVideoRef,
}) => {
  return (
    <Fragment>
      <video className={cx('sub')} ref={videoRef} muted src={videoUrl}>
        <track kind="captions" />
      </video>
      <video className={cx('wrapper')} ref={showVideoRef} muted src={videoUrl} loop>
        <track kind="captions" />
      </video>
    </Fragment>
  );
};
export const WebcamPresenter = memo(WebcamPresenterComponent);
