import { FunctionComponent, Fragment, memo, useCallback, useState } from 'react';
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
import { v4 as uuidv4 } from 'uuid';
import * as api from 'utils/common/api';
import { storeLpData } from 'lib/store';
import { FILE_TYPES, LPDataType } from 'types';
import { STANDARD_TIME_UNIT } from 'utils/const';
import { ROOT_FOLDER_NAME } from 'types/LP';
import fnQuaternionToEulerTracks from 'utils/common/fnQuaternionToEulerTracks';
import { FormModal } from 'components/New_Modal';
import { useAlertModal } from 'components/New_Modal/AlertModal';
import { BaseInput } from 'components/New_Input';
import classNames from 'classnames/bind';
import styles from './PlayBox.module.scss';

const cx = classNames.bind(styles);

export interface Props {}

const PlayBox: FunctionComponent<Props> = ({}) => {
  const recordingData = useReactiveVar(storeRecordingData);
  const animatingData = useReactiveVar(storeAnimatingData);
  const modalInfo = useReactiveVar(storeModalInfo);
  const pageInfo = useReactiveVar(storePageInfo);
  const lpData = useReactiveVar(storeLpData);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);

  const { getConfirm } = useAlertModal();

  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

  const handleKeyDown = () => {};

  const handleRecord = useCallback(() => {
    if (pageInfo.page === PAGE_NAMES.shoot) {
      storePageInfo({ page: PAGE_NAMES.record });
    }
  }, [pageInfo.page]);

  const handleStop = useCallback(() => {
    if (animatingData.playState !== 'stop' && currentVisualizedData) {
      storeAnimatingData({
        ...animatingData,
        playState: 'stop',
      });
    }
  }, [animatingData, currentVisualizedData]);

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
      setTimeout(() => {
        storeRecordingData({ ...recordingData, isPlaying: false });
      }, 1000 * recordingData.duration);
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

    if (!isShootPage) {
      storeRecordingData({ ...recordingData, isPlaying: true });
      // setTimeout(() => {
      //   storeRecordingData({ ...recordingData, isPlaying: false });
      // }, 1000 * recordingData.duration);
    }
  }, [animatingData, currentVisualizedData, isShootPage, recordingData]);

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
      storeRecordingData({ ...recordingData, isPlaying: false });
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
    // storeModalInfo({
    //   isShow: true,
    //   type: MODAL_TYPES.input,
    //   msg: '모션의 이름을 입력해주세요.',
    // });
  }, []);

  const handleSubmit = useCallback(async () => {
    setShowsModal(false);
    storeModalInfo({
      ...modalInfo,
      isShow: true,
      type: MODAL_TYPES.loading,
      msg: '모션 데이터를 추출중입니다.',
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
      // alert(msg);
      storeModalInfo({ ...modalInfo, isShow: false, type: MODAL_TYPES.alert });

      const confirmed = await getConfirm({
        title: msg,
      });

      if (confirmed) {
        return false;
      }
    }
    const key = uuidv4();
    const newData: LPDataType[] = [
      {
        key,
        type: FILE_TYPES.motion,
        name: _.isEmpty(recordingData?.motionName) ? 'Exported motion' : recordingData?.motionName,
        parentKey: ROOT_FOLDER_NAME,
        baseLayer: result?.data?.result
          ? fnQuaternionToEulerTracks({ quaternionTracks: result?.data?.result })
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
        {showsModal && (
          <FormModal
            isOpen={showsModal}
            onClose={handleModalClose}
            onOutsideClose={handleModalClose}
            onSubmit={handleSubmit}
            title="모션의 이름을 입력해주세요"
            text={{
              submit: '확인',
              cancel: '취소',
            }}
          >
            <BaseInput
              className={cx('form-name')}
              placeholder="모션 이름"
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
