import classNames from 'classnames/bind';
import { FunctionComponent, useRef } from 'react';
import styles from './index.module.scss';
import useLoadAssets from './useLoadAssets';

const cx = classNames.bind(styles);

interface Props {}

const RenderingPanel: FunctionComponent<Props> = () => {
  const renderingCanvas = useRef<HTMLCanvasElement>(null);

  useLoadAssets({ renderingCanvas });

  return (
    <div className={cx('wrapper')}>
      <canvas className={cx('rendering-canvas')} ref={renderingCanvas}></canvas>
    </div>
  );
};

export default RenderingPanel;
