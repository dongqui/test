import { FunctionComponent, useRef } from 'react';
import { useAnimation, useGizmoControl, useInitializeScene } from 'hooks/RP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const RenderingPanel: FunctionComponent<Props> = () => {
  const renderingCanvas1 = useRef<HTMLCanvasElement>(null);
  // const renderingCanvas2 = useRef<HTMLCanvasElement>(null);

  useInitializeScene({ renderingCanvas: renderingCanvas1 });
  // useInitializeScene({ renderingCanvas: renderingCanvas2 });

  useGizmoControl();
  useAnimation();

  return (
    <div className={cx('wrapper')}>
      <div id="_dragBox"></div>
      <canvas className={cx('rendering-canvas')} ref={renderingCanvas1} id="renderingCanvas1" />
      {/* <canvas className={cx('rendering-canvas')} ref={renderingCanvas2} id="renderingCanvas2" /> */}
    </div>
  );
};

export default RenderingPanel;
