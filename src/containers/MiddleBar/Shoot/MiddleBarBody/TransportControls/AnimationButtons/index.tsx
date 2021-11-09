import { Fragment } from 'react';
import { useSelector } from 'reducers';
import _ from 'lodash';
import { PlayDirection_New } from 'types/RP';
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

  const ButtonState = () => {
    const isPlaying = _.isEqual(playState, 'play');
    if (isPlaying) {
      if (playDirection === PlayDirection_New.forward) {
        return (
          <Fragment>
            <Rewind />
            <Pause />
          </Fragment>
        );
      } else {
        return (
          <Fragment>
            <Pause />
            <Play />
          </Fragment>
        );
      }
    } else {
      return (
        <Fragment>
          <Rewind />
          <Play />
        </Fragment>
      );
    }
  };

  return (
    <div className={cx('animation-buttons')}>
      <Record />
      <ButtonState />
      <Stop />
    </div>
  );
};

export default Buttons;
