import { IconWrapper, SvgPath } from 'components/Icon';
import _ from 'lodash';
import React, { memo } from 'react';
import classNames from 'classnames/bind';
import styles from './RenderingPresenter.module.scss';

const cx = classNames.bind(styles);

export interface RenderingPresenterProps {
  id: string;
  onCameraReset: () => void;
}

const RenderingPresenter: React.FC<RenderingPresenterProps> = (props: RenderingPresenterProps) => {
  const { id, onCameraReset } = props;

  return (
    <div className={cx('rendering-panel')}>
      <div className={cx('rendering-div')} id={id} />
      <div className={cx('camera-reset-background')}>
        <IconWrapper
          className={cx('camera-reset')}
          icon={SvgPath.CameraReset}
          hasFrame={false}
          onClick={onCameraReset}
        />
      </div>
    </div>
  );
};

export default memo(RenderingPresenter);
