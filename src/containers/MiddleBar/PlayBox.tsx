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
import { storeModalInfo, storePageInfo, storeRecordingData, storeBarPositionX } from 'lib/store';
import { IconWrapper, SvgPath } from 'components/Icon';
import { MODAL_TYPES, PAGE_NAMES } from 'types';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import * as api from 'utils/common/api';
import { storeLpData } from 'lib/store';
import { FILE_TYPES, LPDataType } from 'types';
import { STANDARD_TIME_UNIT } from 'utils/const';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { FormModal } from 'components/Modal';
import { useAlertModal } from 'components/Modal/AlertModal';
import { BaseInput } from 'components/Input';
import fnGetFileName from 'utils/LP/fnGetFileName';
import sleep from 'utils/common/sleep';
import { d3ScaleLinear } from 'types/TP';
import * as d3 from 'd3';
import fnQuaternionToEulerTrack from 'utils/common/fnQuaternionToEulerTrack';
import fnDetectSafari from 'utils/common/fnDetectSafari';
import { fnGetMaskedValue, fnSetValue } from 'utils/common';
import { useDispatch } from 'react-redux';
import * as animatingDataActions from 'actions/animatingData';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './PlayBox.module.scss';

const cx = classNames.bind(styles);

const X_AXIS_HEIGHT = 48; // 트랙 높이
const DECIMAL_PLACES = 10000; // 반올림할 소수점 자리수

export interface Props {
  currentTimeRef?: RefObject<HTMLInputElement>;
  currentTimeIndexRef?: RefObject<HTMLInputElement>;
  currentPlayBarTime?: MutableRefObject<number>;
  dopeSheetScale?: MutableRefObject<d3ScaleLinear | null>;
  startTimeIndex: number;
  lastTime: number;
}

const PlayBox: FunctionComponent<Props> = ({
  currentPlayBarTime,
  currentTimeRef,
  currentTimeIndexRef,
  dopeSheetScale,
  startTimeIndex,
  lastTime,
}) => {
  const recordingData = useReactiveVar(storeRecordingData);
  const modalInfo = useReactiveVar(storeModalInfo);
  const pageInfo = useReactiveVar(storePageInfo);
  const lpData = useReactiveVar(storeLpData);

  const dispatch = useDispatch();

  const { playState, playDirection, currentAction } = useSelector((state) => state.animatingData);
  const currentVisualizedData = useSelector((state) => state.currentVisualizedData);

  const { getConfirm } = useAlertModal();

  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

  const handleKeyDown = () => {};

  const handleRecord = useCallback(async () => {
    if (fnDetectSafari()) {
      return;
    }
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
      if (playState !== 'stop' && currentVisualizedData) {
        dispatch(animatingDataActions.setPlayState({ playState: 'stop' }));
      }
      if (
        currentPlayBarTime &&
        currentTimeRef &&
        currentTimeRef.current &&
        currentTimeIndexRef &&
        currentTimeIndexRef.current &&
        dopeSheetScale &&
        dopeSheetScale.current
      ) {
        if (_.round(startTimeIndex / 30, 4) <= lastTime) {
          fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(startTimeIndex / 30, 0)));
        } else {
          fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(lastTime, 0)));
        }
        fnSetValue(currentTimeIndexRef, startTimeIndex);

        if (currentAction) {
          currentAction.time = _.round(startTimeIndex / 30, 4);
        }

        currentPlayBarTime.current = startTimeIndex;

        const xScaleLinear = dopeSheetScale.current as d3ScaleLinear;
        d3.select('#play-bar').style(
          'transform',
          `translate3d(${xScaleLinear(currentPlayBarTime.current) - 10}px,
          ${X_AXIS_HEIGHT / 2}px, 0)`,
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
    currentAction,
    currentTimeIndexRef,
    currentTimeRef,
    currentVisualizedData,
    currentPlayBarTime,
    dispatch,
    isShootPage,
    lastTime,
    playState,
    dopeSheetScale,
    recordingData,
    startTimeIndex,
  ]);

  const handleRewind = useCallback(() => {
    if (isShootPage && currentVisualizedData) {
      if (!(playState === 'play' && playDirection === -1)) {
        dispatch(animatingDataActions.setPlayState({ playState: 'play' }));
        dispatch(animatingDataActions.setPlayDirection({ playDirection: -1 }));
      }
    }

    if (!isShootPage) {
      storeRecordingData({ ...recordingData, isPlaying: true });
    }
  }, [currentVisualizedData, dispatch, isShootPage, playDirection, playState, recordingData]);

  const handlePlay = useCallback(() => {
    if (isShootPage && currentVisualizedData) {
      if (!(playState === 'play' && playDirection === 1)) {
        dispatch(animatingDataActions.setPlayState({ playState: 'play' }));
        dispatch(animatingDataActions.setPlayDirection({ playDirection: 1 }));
      }
    }

    if (_.isEqual(pageInfo.page, PAGE_NAMES.extract)) {
      storeRecordingData({ ...recordingData, isPlaying: true });
    }
  }, [
    currentVisualizedData,
    dispatch,
    isShootPage,
    pageInfo.page,
    playDirection,
    playState,
    recordingData,
  ]);

  const handlePause = useCallback(() => {
    if (isShootPage && currentVisualizedData) {
      if (playState !== 'pause') {
        dispatch(animatingDataActions.setPlayState({ playState: 'pause' }));
      }
    }

    if (!isShootPage) {
      storeRecordingData({
        ...recordingData,
        isPlaying: false,
      });
    }
  }, [currentVisualizedData, dispatch, isShootPage, playState, recordingData]);

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
    if (_.isEqual(pageInfo.page, PAGE_NAMES.extract)) {
      setShowsModal(true);
    }
  }, [pageInfo.page]);

  const handleSubmit = useCallback(async () => {
    setShowsModal(false);
    const startTime = _.round(
      recordingData.duration * (recordingData.rangeBoxInfo.x / window.innerWidth),
      4,
    );
    const endTime = _.round(
      recordingData.duration *
        ((recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width) / window.innerWidth),
      4,
    );
    const maxDurationSec = (endTime - startTime) * 30;
    const modalMsg =
      maxDurationSec >= 60
        ? `Exporting motion from the video.<br />This can take up to ${_.ceil(
            maxDurationSec / 60,
          )} minutes`
        : `Exporting motion from the video.<br />This can take up to ${_.ceil(
            maxDurationSec,
          )} seconds`;

    storeModalInfo({
      ...modalInfo,
      isShow: true,
      type: MODAL_TYPES.loading,
      msg: modalMsg,
      cancel: true,
      onClose: () => {
        api.cancelTokenSource();
        storeModalInfo({
          ...modalInfo,
          isShow: false,
        });
      },
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
      startTime,
      endTime,
      fileName: recordingData?.motionName,
      timeout: maxDurationSec * 1000 * 10,
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

  const isPlaying = _.isEqual(playState, 'play') || recordingData.isPlaying;

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
              autoFocus={true}
              fullSize
            />
          </FormModal>
        )}
      </div>
    </div>
  );
};

export default memo(PlayBox);
