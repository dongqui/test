import { IconWrapper, SvgPath } from 'components/New_Icon';
import _ from 'lodash';
import React, { memo } from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface RenderingPresenterProps {
  id: string;
  handleCameraReset: () => void;
}

const RenderingPresenter: React.FC<RenderingPresenterProps> = (props: RenderingPresenterProps) => {
  const { id, handleCameraReset } = props;

  return (
    <div className={cx('rendering-panel')}>
      <div className={cx('rendering-div')} id={id} />
      <div className={cx('camera-reset-background')}>
        <IconWrapper
          className={cx('camera-reset')}
          icon={SvgPath.CameraReset}
          hasFrame={false}
          onClick={handleCameraReset}
        />
      </div>
    </div>
  );
};

export default memo(RenderingPresenter);
