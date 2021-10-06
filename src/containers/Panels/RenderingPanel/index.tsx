import { FunctionComponent, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { useGizmoControl, useInitializeScene, useLoadAssets, useVisualizeModel } from 'hooks/RP';

const cx = classNames.bind(styles);

interface Props {}

const RenderingPanel: FunctionComponent<Props> = () => {
  const renderingCanvas1 = useRef<HTMLCanvasElement>(null);

  useInitializeScene({ renderingCanvas: renderingCanvas1 });
  useLoadAssets();
  useVisualizeModel();
  useGizmoControl();

  return (
    <div className={cx('wrapper')}>
      <canvas className={cx('rendering-canvas')} ref={renderingCanvas1} id="renderingCanvas1" />
    </div>
  );
};

export default RenderingPanel;
