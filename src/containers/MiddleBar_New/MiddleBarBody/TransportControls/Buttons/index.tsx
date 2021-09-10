import { Fragment, FunctionComponent } from 'react';
import { useSelector } from 'reducers';
import _ from 'lodash';
import Pause from './Pause';
import Play from './Play';
import Record from './Record';
import Rewind from './Rewind';
import Stop from './Stop';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const Buttons: FunctionComponent<Props> = () => {
  const recordingData = useSelector((state) => state.recordingData);
  const { playState } = useSelector((state) => state.animatingData);
  const isPlaying = _.isEqual(playState, 'play') || recordingData.isPlaying;

  return (
    <div className={cx('buttons')}>
      <Record />
      {isPlaying ? (
        <Pause />
      ) : (
        <Fragment>
          <Rewind />
          <Play />
        </Fragment>
      )}
      <Stop />
    </div>
  );
};

export default Buttons;
