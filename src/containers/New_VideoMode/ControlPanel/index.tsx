import { RefObject, useState, useCallback, useRef, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import axios, { Canceler } from 'axios';
import * as globalUIActions from 'actions/Common/globalUI';
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

const cx = classNames.bind(styles);

interface Props {
  sceneId: string;
  browserType: string;
  videoRef: RefObject<HTMLVideoElement>;
  duration: number;
  startValue: number;
  endValue: number;
}

interface ExtractFormData {
  model: 'single' | 'multi';
  footLock: boolean;
  tPose: boolean;
}

const ControlPanel = ({ sceneId, browserType, videoRef, duration, startValue, endValue }: Props) => {
  const dispatch = useDispatch();

  let cancelTokenSource = useRef<Canceler>();
  const [isOpenExtractModal, setIsOpenExtractModal] = useState(false);
  const [isOpenLoadingModal, setIsOpenLoadingModal] = useState(false);
  const [valueName, setValueName] = useState('');
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
      console.log(data, startValue, endValue);

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
    setValueName('');
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
    console.log(valueName);
    console.log(valueFormData);

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

      const response = await requestApi({
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
        .then((response) => {
          console.log(response);
          const { data } = response;
          setIsOpenLoadingModal(false);
          return response;
        })
        .catch((error) => {
          // console.log(error);
          // TODO 예외처리
          throw error;
        });
    }
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('section')}>
        <div className={cx('section-title')}>
          <Typography type="title">Extract option</Typography>
          <div className={cx('tag')}>
            <Typography>Beta</Typography>
          </div>
        </div>
        <BaseForm onSubmit={handleSubmit}>{(fieldProps) => <ExtractForm fieldProps={fieldProps} />}</BaseForm>
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
              <BaseInput className={cx('input-name')} name="name" placeholder="Extracted motion" value={valueName} onChange={handleChangeName} />
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
        </BaseModal>
      )}
      {isOpenLoadingModal && (
        <BaseModal>
          <div className={cx('modal-inner')}>
            <div className={cx('modal-header')}>
              <div className={cx('title')}>Extracting mocap</div>
            </div>
            <div className={cx('modal-content')}>
              <div className={cx('message')}>It can take up to 7 seconds</div>
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
