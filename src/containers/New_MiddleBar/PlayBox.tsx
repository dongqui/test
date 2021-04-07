import { FunctionComponent, Fragment, memo, useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import { storeAnimatingData } from 'lib/store';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './PlayBox.module.scss';

const cx = classNames.bind(styles);

export interface Props {}

const PlayBox: FunctionComponent<Props> = ({}) => {
  const data = useReactiveVar(storeAnimatingData);

  const handleKeyDown = () => {};

  const handleRecord = useCallback(() => {}, []);

  const handleStop = useCallback(() => {
    storeAnimatingData({
      ...data,
      playState: 'stop',
    });
  }, [data]);

  const handleRewind = useCallback(() => {
    storeAnimatingData({
      ...data,
      playDirection: -1,
      playState: 'play',
    });
  }, [data]);

  const handlePlay = useCallback(() => {
    storeAnimatingData({
      ...data,
      playDirection: 1,
      playState: 'play',
    });
  }, [data]);

  const handlePause = useCallback(() => {
    storeAnimatingData({
      ...data,
      playState: 'pause',
    });
  }, [data]);

  const isPlaying = _.isEqual(data.playState, 'play');

  return (
    <div className={cx('wrapper')}>
      <div className={cx('button-group')}>
        <span
          className={cx('record')}
          onClick={handleRecord}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        />
        <span
          className={cx('stop')}
          onClick={handleStop}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        />
        <div className={cx('holder')}>
          {isPlaying ? (
            <IconWrapper
              className={cx('pause')}
              onClick={handlePause}
              icon={SvgPath.Pause}
              hasFrame={false}
            />
          ) : (
            <Fragment>
              <IconWrapper
                className={cx('rewind')}
                onClick={handleRewind}
                icon={SvgPath.RewindArrow}
                hasFrame={false}
              />
              <IconWrapper
                className={cx('play')}
                onClick={handlePlay}
                icon={SvgPath.PlayArrow}
                hasFrame={false}
              />
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(PlayBox);
