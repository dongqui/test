import { useRef, Fragment } from 'react';
import { useSelector } from 'reducers';
import { PlayDirection } from 'types/RP';
import Pause from './Pause';
import Play from './Play';
import Record from './Record';
import Rewind from './Rewind';
import Stop from './Stop';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Buttons = () => {
  const playState = useSelector((state) => state.animatingControls.playState);
  const playDirection = useSelector((state) => state.animatingControls.playDirection);
  const requestAnimationFrameId = useRef(0);

  const ButtonState = () => {
    const isPlaying = playState === 'play';
    if (isPlaying) {
      if (playDirection === PlayDirection.forward) {
        return (
          <Fragment>
            <Rewind requestAnimationFrameId={requestAnimationFrameId} />
            <Pause requestAnimationFrameId={requestAnimationFrameId} />
          </Fragment>
        );
      } else {
        return (
          <Fragment>
            <Pause requestAnimationFrameId={requestAnimationFrameId} />
            <Play requestAnimationFrameId={requestAnimationFrameId} />
          </Fragment>
        );
      }
    } else {
      return (
        <Fragment>
          <Rewind requestAnimationFrameId={requestAnimationFrameId} />
          <Play requestAnimationFrameId={requestAnimationFrameId} />
        </Fragment>
      );
    }
  };

  return (
    <div className={cx('animation-buttons')}>
      <Record />
      <ButtonState />
      <Stop requestAnimationFrameId={requestAnimationFrameId} />
    </div>
  );
};

export default Buttons;
