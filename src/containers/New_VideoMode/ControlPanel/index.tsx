import { RefObject, useState, useCallback, useRef, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import axios, { Canceler } from 'axios';
import * as globalUIActions from 'actions/Common/globalUI';
import * as modeSelectActions from 'actions/modeSelection';
import * as lpActions from 'actions/LP/lpNodeAction';
import requestApi from 'api/requestApi';
import { FilledButton, OutlineButton } from 'components/Button';
import { Typography } from 'components/Typography';
import { BaseField, BaseForm } from 'components/Form';
import { BaseModal } from 'components/Modal';
import { BaseInput } from 'components/Input';
import ExtractForm from './ExtractForm';

import classNames from 'classnames/bind';
import styles from './ControlPanel.module.scss';
import { IconWrapper, SvgPath } from 'components/Icon';
import { Overlay } from 'components/Overlay';

const cx = classNames.bind(styles);

interface Props {
  sceneId: string;
  token: string;
  browserType: string;
  videoRef: RefObject<HTMLVideoElement>;
  duration: number;
  startValue: number;
  endValue: number;
  onUnmount: () => void;
  setExtractButtonRef: (ref: HTMLButtonElement) => void;
  doneVMOnBoarding: (step: number) => void;
  setCPModified: (modified: boolean) => void;
}

interface ExtractFormData {
  model: 'single' | 'multi';
  footLock: boolean;
  tPose: boolean;
}

const ControlPanel = ({ setExtractButtonRef, sceneId, token, browserType, videoRef, duration, startValue, endValue, onUnmount, doneVMOnBoarding, setCPModified }: Props) => {
  const dispatch = useDispatch();

  let cancelTokenSource = useRef<Canceler>();
  const [isOpenExtractModal, setIsOpenExtractModal] = useState(false);
  const [isOpenLoadingModal, setIsOpenLoadingModal] = useState(false);
  const [valueName, setValueName] = useState('Extracted motion');
  const [valueFormData, setValueFormData] = useState({
    model: 'single',
    footLock: false,
    tPose: false,
  });

  const handleSubmit = async (data: ExtractFormData) => {
    if (endValue - startValue >= 300) {
      dispatch(
        globalUIActions.openModal('_AlertModal', {
          title: 'Import Failed',
          message: 'Videos longer than 5 minutes are difficult to apply. Cut it within 5 minutes and try again.',
        }),
      );
    } else {
      doneVMOnBoarding(4);
      setValueFormData({
        ...data,
      });

      setIsOpenExtractModal(true);
    }
  };

  const handleChangeName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValueName(event.target.value);
  }, []);

  const handleCloseModal = useCallback(() => {
    setValueName('Extracted motion');
    setIsOpenExtractModal(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpenLoadingModal(false);
    setIsOpenExtractModal(false);
    cancelTokenSource.current && cancelTokenSource.current();
  }, []);

  const convertBlobToFile = useCallback(async ({ url, type, fileName }) => {
    const response = await fetch(url);
    const data = await response
      .blob()
      .then((response) => {
        const metaData = {
          type: type === 'webm' ? `video/webm` : type,
        };
        return new File([response], `${fileName}.${type}`, metaData);
      })
      .catch((err) => {
        throw err;
      });

    return data;
  }, []);

  const handleSubmitModal = async () => {
    if (videoRef.current) {
      const formData = new FormData();

      const file = await convertBlobToFile({ url: videoRef.current.src, type: browserType === 'safari' ? 'mp4' : 'webm', valueName });
      formData.append('file', file);
      formData.append('name', valueName || 'Extracted motion');
      formData.append('startTime', String(startValue));
      formData.append('endTime', String(endValue));
      formData.append('duration', String(duration));
      formData.append('modelType', valueFormData.model);
      formData.append('isFootLock', valueFormData.footLock ? 'true' : 'false');
      formData.append('isTPose', valueFormData.tPose ? 'true' : 'false');

      setIsOpenExtractModal(false);
      setIsOpenLoadingModal(true);

      await requestApi({
        method: 'POST',
        url: `/library/${sceneId}/mocap`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        cancelToken: new axios.CancelToken((cancel) => {
          cancelTokenSource.current = cancel;
        }),
      })
        .then(async (response) => {
          // const { data } = response;

          const { loaded, data, error } = await requestApi({
            method: 'GET',
            url: `/library/get/${sceneId}/library`,
          })
            .then((response) => {
              setIsOpenLoadingModal(false);
              onUnmount();
              dispatch(modeSelectActions.changeMode({ mode: 'animationMode', videoURL: '' }));
              dispatch(lpActions.initNodes(response.data));

              return {
                loaded: true,
                error: null,
                data: response.data,
              };
            })
            .catch((error) => {
              return {
                loaded: false,
                data: [],
                error: error,
              };
            });
        })
        .catch((error) => {
          //
          // TODO 예외처리
          throw error;
        });
    }
  };

  return (
    <div className={cx('wrapper')} onMouseEnter={() => setCPModified(false)}>
      <div className={cx('section')}>
        <div className={cx('section-title')}>
          <Typography type="title">Extract option</Typography>
          <div className={cx('tag')}>
            <Typography>Beta</Typography>
          </div>
        </div>
        <BaseForm onSubmit={handleSubmit}>
          {(fieldProps) => <ExtractForm doneVMOnBoarding={doneVMOnBoarding} setExtractButtonRef={setExtractButtonRef} fieldProps={fieldProps} />}
        </BaseForm>
      </div>
      {isOpenExtractModal && (
        <BaseModal>
          <div className={cx('modal-inner')}>
            <div className={cx('modal-header')}>
              <div className={cx('title')}>Extract Mocap</div>
              <IconWrapper className={cx('button-close')} icon={SvgPath.Close} onClick={handleCloseModal} />
            </div>
            <div className={cx('modal-content')}>
              <div className={cx('message')}>Enter the name of the mocap to extract.</div>
              <label className={cx('label-name')}>Name</label>
              <BaseInput className={cx('input-name')} name="name" placeholder="Enter the name" value={valueName} onChange={handleChangeName} />
            </div>
            <div className={cx('modal-footer')}>
              <OutlineButton className={cx('button-negative')} onClick={handleCloseModal}>
                Cancel
              </OutlineButton>
              <FilledButton className={cx('button-positive')} onClick={handleSubmitModal}>
                Extract
              </FilledButton>
            </div>
          </div>
          <Overlay />
        </BaseModal>
      )}
      {isOpenLoadingModal && (
        <BaseModal>
          <div className={cx('modal-inner')}>
            <div className={cx('modal-header')}>
              <div className={cx('title')}>Extracting mocap</div>
            </div>
            <div className={cx('modal-content')}>
              <div className={cx('message')}>It can take up to {duration * 6 >= 60 ? Math.floor((duration * 6) / 60) + ' minutes' : Math.floor(duration * 6) + ' seconds'}</div>
            </div>
            <div className={cx('modal-footer')}>
              <OutlineButton className={cx('button-cancel')} onClick={handleCancel}>
                Cancel
              </OutlineButton>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
};

export default ControlPanel;
