import { FunctionComponent, Fragment, memo, useCallback, useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import { storeAnimatingData, storeCurrentVisualizedData, storePageInfo } from 'lib/store';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './PlayBox.module.scss';
import { PAGE_NAMES } from 'types';

const cx = classNames.bind(styles);

export interface Props {}

const PlayBox: FunctionComponent<Props> = ({}) => {
  const animatingData = useReactiveVar(storeAnimatingData);
  const pageInfo = useReactiveVar(storePageInfo);

  const handleKeyDown = () => {};

  const handleRecord = useCallback(() => {
    if (pageInfo.page === PAGE_NAMES.shoot) {
      storePageInfo({ page: PAGE_NAMES.record });
    }
  }, [pageInfo.page]);

  const handleStop = useCallback(() => {
    if (animatingData.playState !== 'stop') {
      storeAnimatingData({
        ...animatingData,
        playState: 'stop',
      });
    }
  }, [animatingData]);

  const handleRewind = useCallback(() => {
    if (!(animatingData.playState === 'play' && animatingData.playDirection === -1)) {
      storeAnimatingData({
        ...animatingData,
        playDirection: -1,
        playState: 'play',
      });
    }
  }, [animatingData]);

  const handlePlay = useCallback(() => {
    if (!(animatingData.playState === 'play' && animatingData.playDirection === 1)) {
      storeAnimatingData({
        ...animatingData,
        playDirection: 1,
        playState: 'play',
      });
    }
  }, [animatingData]);

  const handlePause = useCallback(() => {
    if (animatingData.playState !== 'pause') {
      storeAnimatingData({
        ...animatingData,
        playState: 'pause',
      });
    }
  }, [animatingData]);

  const isPlaying = _.isEqual(animatingData.playState, 'play');

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
