import { FunctionComponent, useRef } from 'react';
import useLoadAssets from './useLoadAssets';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { useInitializeScene } from 'hooks/RP';

const cx = classNames.bind(styles);

interface Props {}

const RenderingPanel: FunctionComponent<Props> = () => {
  const renderingCanvas = useRef<HTMLCanvasElement>(null);

  useInitializeScene({ renderingCanvas });

  return (
    <div className={cx('wrapper')}>
      <canvas className={cx('rendering-canvas')} ref={renderingCanvas} />
    </div>
  );
};

export default RenderingPanel;
