import { FunctionComponent, Fragment, memo, useCallback, useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import {
  storeAnimatingData,
  storeModalInfo,
  storeCurrentVisualizedData,
  storePageInfo,
  storeRecordingData,
} from 'lib/store';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { MODAL_TYPES, PAGE_NAMES } from 'types';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './PlayBox.module.scss';

const cx = classNames.bind(styles);

export interface Props {}

const PlayBox: FunctionComponent<Props> = ({}) => {
  const recordingData = useReactiveVar(storeRecordingData);
  const animatingData = useReactiveVar(storeAnimatingData);
  const pageInfo = useReactiveVar(storePageInfo);

  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

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
    if (isShootPage) {
      if (!(animatingData.playState === 'play' && animatingData.playDirection === -1)) {
        storeAnimatingData({
          ...animatingData,
          playDirection: -1,
          playState: 'play',
        });
      }
    }

    if (!isShootPage) {
      storeRecordingData({ ...recordingData, isPlaying: true });
      setTimeout(() => {
        storeRecordingData({ ...recordingData, isPlaying: false });
      }, 1000 * recordingData.duration);
    }
  }, [animatingData, isShootPage, recordingData]);

  const handlePlay = useCallback(() => {
    if (isShootPage) {
      if (!(animatingData.playState === 'play' && animatingData.playDirection === 1)) {
        storeAnimatingData({
          ...animatingData,
          playDirection: 1,
          playState: 'play',
        });
      }
    }

    if (!isShootPage) {
      storeRecordingData({ ...recordingData, isPlaying: true });
      // setTimeout(() => {
      //   storeRecordingData({ ...recordingData, isPlaying: false });
      // }, 1000 * recordingData.duration);
    }
  }, [animatingData, isShootPage, recordingData]);

  const handlePause = useCallback(() => {
    if (isShootPage) {
      if (animatingData.playState !== 'pause') {
        storeAnimatingData({
          ...animatingData,
          playState: 'pause',
        });
      }
    }

    if (!isShootPage) {
      storeRecordingData({ ...recordingData, isPlaying: false });
    }
  }, [animatingData, isShootPage, recordingData]);

  const handleExport = useCallback(() => {
    storeModalInfo({
      isShow: true,
      type: MODAL_TYPES.input,
      msg: '모션의 이름을 입력해주세요.',
    });
  }, []);

  const isPlaying = _.isEqual(animatingData.playState, 'play') || recordingData.isPlaying;

  const pauseButtonClasses = cx('pause', {
    center: isShootPage,
  });

  const rewindButtonClasses = cx('rewind', {
    invisible: !isShootPage,
  });

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
              className={pauseButtonClasses}
              onClick={handlePause}
              icon={SvgPath.Pause}
              hasFrame={false}
            />
          ) : (
            <Fragment>
              <IconWrapper
                className={rewindButtonClasses}
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
        {!isShootPage && (
          <IconWrapper
            className={cx('export')}
            onClick={handleExport}
            icon={SvgPath.Export}
            hasFrame={false}
          />
        )}
      </div>
    </div>
  );
};

export default memo(PlayBox);
