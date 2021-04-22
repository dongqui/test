import {
  FunctionComponent,
  Fragment,
  memo,
  useCallback,
  useState,
  RefObject,
  MutableRefObject,
} from 'react';
import { useReactiveVar } from '@apollo/client';
import {
  storeAnimatingData,
  storeModalInfo,
  storeCurrentVisualizedData,
  storePageInfo,
  storeRecordingData,
  storeBarPositionX,
  storeCurrentAction,
} from 'lib/store';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { MODAL_TYPES, PAGE_NAMES } from 'types';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import * as api from 'utils/common/api';
import { storeLpData } from 'lib/store';
import { FILE_TYPES, LPDataType } from 'types';
import { STANDARD_TIME_UNIT } from 'utils/const';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { FormModal } from 'components/New_Modal';
import { useAlertModal } from 'components/New_Modal/AlertModal';
import { BaseInput } from 'components/New_Input';
import classNames from 'classnames/bind';
import styles from './PlayBox.module.scss';
import fnGetFileName from 'utils/LP/fnGetFileName';
import sleep from 'utils/common/sleep';
import { d3ScaleLinear } from 'types/TP';
import * as d3 from 'd3';
import fnQuaternionToEulerTrack from 'utils/common/fnQuaternionToEulerTrack';

const cx = classNames.bind(styles);

const X_AXIS_HEIGHT = 48; // 트랙 높이

export interface Props {
  currentTimeRef?: RefObject<HTMLInputElement>;
  currentTimeIndexRef?: RefObject<HTMLInputElement>;
  currentXAxisPosition?: MutableRefObject<number>;
  prevXScale?: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
  startTimeIndex: number;
  lastTime: number;
}

const PlayBox: FunctionComponent<Props> = ({
  currentXAxisPosition,
  currentTimeRef,
  currentTimeIndexRef,
  prevXScale,
  startTimeIndex,
  lastTime,
}) => {
  const recordingData = useReactiveVar(storeRecordingData);
  const animatingData = useReactiveVar(storeAnimatingData);
  const modalInfo = useReactiveVar(storeModalInfo);
  const pageInfo = useReactiveVar(storePageInfo);
  const lpData = useReactiveVar(storeLpData);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);
  const currentAction = useReactiveVar(storeCurrentAction);

  const { getConfirm } = useAlertModal();

  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

  const handleKeyDown = () => {};

  const handleRecord = useCallback(async () => {
    if (!_.isEqual(pageInfo.page, PAGE_NAMES.record)) {
      storePageInfo({ page: PAGE_NAMES.record });
      return;
    }
    if (_.isUndefined(recordingData.count)) {
      if (!recordingData.isRecording) {
        for (const count of [5, 4, 3, 2, 1]) {
          storeRecordingData({ ...recordingData, count });
          await sleep(1000);
        }
      }
      storeRecordingData({
        ...recordingData,
        isRecording: !recordingData.isRecording,
        count: undefined,
      });
    }
  }, [pageInfo.page, recordingData]);

  // 정지 버튼 클릭 시 재생바 start 로 && current time 과 time index 시작점으로
  const handleStop = useCallback(() => {
    if (isShootPage) {
      if (animatingData.playState !== 'stop' && currentVisualizedData) {
        storeAnimatingData({
          ...animatingData,
          playState: 'stop',
        });
      }
      if (
        currentXAxisPosition &&
        currentTimeRef &&
        currentTimeRef.current &&
        currentTimeIndexRef &&
        currentTimeIndexRef.current &&
        prevXScale &&
        prevXScale.current
      ) {
        if (_.round(startTimeIndex / 30, 4) <= lastTime) {
          currentTimeRef.current.value = new Date(_.round(startTimeIndex / 30, 0) * 1000)
            .toISOString()
            .substr(11, 8)
            .substr(2)
            .replace(':', '');
        } else {
          currentTimeRef.current.value = new Date(_.round(lastTime, 0) * 1000)
            .toISOString()
            .substr(11, 8)
            .substr(2)
            .replace(':', '');
        }
        currentTimeIndexRef.current.value = startTimeIndex.toString();

        if (currentAction) {
          currentAction.time = _.round(startTimeIndex / 30, 4);
        }

        currentXAxisPosition.current = startTimeIndex;

        const xScaleLinear = prevXScale.current as d3ScaleLinear;
        d3.select('#play-bar-wrapper').attr(
          'transform',
          `translate(${xScaleLinear(currentXAxisPosition.current) - 10},
          ${X_AXIS_HEIGHT / 2})`,
        );
      }
    }
    if (!isShootPage) {
      storeRecordingData({
        ...recordingData,
        isPlaying: false,
        rangeBoxInfo: {
          ...recordingData.rangeBoxInfo,
          barX: recordingData.rangeBoxInfo.x + Math.random(),
        },
      });
      storeBarPositionX(recordingData.rangeBoxInfo.x);
    }
  }, [
    animatingData,
    currentAction,
    currentTimeIndexRef,
    currentTimeRef,
    currentVisualizedData,
    currentXAxisPosition,
    isShootPage,
    lastTime,
    prevXScale,
    recordingData,
    startTimeIndex,
  ]);

  const handleRewind = useCallback(() => {
    if (isShootPage && currentVisualizedData) {
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
    }
  }, [animatingData, currentVisualizedData, isShootPage, recordingData]);

  const handlePlay = useCallback(() => {
    if (isShootPage && currentVisualizedData) {
      if (!(animatingData.playState === 'play' && animatingData.playDirection === 1)) {
        storeAnimatingData({
          ...animatingData,
          playDirection: 1,
          playState: 'play',
        });
      }
    }

    if (_.isEqual(pageInfo.page, PAGE_NAMES.extract)) {
      storeRecordingData({ ...recordingData, isPlaying: true });
    }
  }, [animatingData, currentVisualizedData, isShootPage, pageInfo.page, recordingData]);

  const handlePause = useCallback(() => {
    if (isShootPage && currentVisualizedData) {
      if (animatingData.playState !== 'pause') {
        storeAnimatingData({
          ...animatingData,
          playState: 'pause',
        });
      }
    }

    if (!isShootPage) {
      storeRecordingData({
        ...recordingData,
        isPlaying: false,
      });
    }
  }, [animatingData, currentVisualizedData, isShootPage, recordingData]);

  const [showsModal, setShowsModal] = useState(false);

  const handleModalClose = () => {
    setShowsModal(false);
  };

  const handleBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      storeRecordingData({ ...recordingData, motionName: e.target.value });
    },
    [recordingData],
  );

  const handleExport = useCallback(() => {
    setShowsModal(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    setShowsModal(false);
    storeModalInfo({
      ...modalInfo,
      isShow: true,
      type: MODAL_TYPES.loading,
      msg: 'Exporting motion from the video.',
    });
    const { error, msg, result } = await api.uploadFileToMotionData({
      url: `${pageInfo?.videoUrl}`,
      type: `${pageInfo.extension ?? 'mp4'}`,
      id: uuidv4(),
      start: Math.round(
        (recordingData.duration * (recordingData.rangeBoxInfo.x / window.innerWidth)) /
          STANDARD_TIME_UNIT,
      ),
      end: Math.round(
        (recordingData.duration *
          ((recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width) / window.innerWidth)) /
          STANDARD_TIME_UNIT,
      ),
      fileName: recordingData?.motionName,
    });
    if (error) {
      storeModalInfo({ ...modalInfo, isShow: false, type: MODAL_TYPES.alert });

      const confirmed = await getConfirm({
        title: msg,
      });

      if (confirmed) {
        return false;
      }
    }
    const key = uuidv4();
    let name = _.isEmpty(recordingData?.motionName) ? 'Exported motion' : recordingData?.motionName;
    name = fnGetFileName({ key: '', lpData, name });
    const newData: LPDataType[] = [
      {
        key,
        type: FILE_TYPES.motion,
        name,
        parentKey: ROOT_FOLDER_NAME,
        baseLayer: result?.data?.result
          ? _.map(result.data.result, (track) => {
              if (track.name.includes('quaternion')) {
                return fnQuaternionToEulerTrack({ quaternionTrack: track });
              } else {
                return track;
              }
            })
          : [],
        layers: [],
        isExportedMotion: true,
      },
    ];
    storeLpData(_.concat(lpData, newData));
    storePageInfo({ page: PAGE_NAMES.shoot });
    storeModalInfo({ ...modalInfo, isShow: false, msg: '' });
  }, [
    getConfirm,
    lpData,
    modalInfo,
    pageInfo.extension,
    pageInfo?.videoUrl,
    recordingData.duration,
    recordingData?.motionName,
    recordingData.rangeBoxInfo.width,
    recordingData.rangeBoxInfo.x,
  ]);

  const isPlaying = _.isEqual(animatingData.playState, 'play') || recordingData.isPlaying;

  const pauseButtonClasses = cx('pause', {
    center: isShootPage,
  });

  const rewindButtonClasses = cx('rewind', {
    invisible: !isShootPage,
  });

  const recordButtonClasses = cx('record', {
    isRecording: recordingData.isRecording,
  });

  return (
    <div className={cx('wrapper')}>
      <div className={cx('button-group')}>
        <span
          className={recordButtonClasses}
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
        {showsModal && (
          <FormModal
            isOpen={showsModal}
            onClose={handleModalClose}
            onOutsideClose={handleModalClose}
            onSubmit={handleSubmit}
            title="Please enter the name of the motion."
            text={{
              submit: 'OK',
              cancel: 'Cancel',
            }}
          >
            <BaseInput
              className={cx('form-name')}
              placeholder="Motion name"
              onBlur={handleBlur}
              fullSize
            />
          </FormModal>
        )}
      </div>
    </div>
  );
};

export default memo(PlayBox);
