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
}

interface ExtractFormData {
  model: 'single' | 'multi';
  footLock: boolean;
  tPose: boolean;
}

interface MocapException {
  isOpen: boolean;
  case?: 'OverLength' | 'Timeout' | 'Condition' | 'Others';
}

const ControlPanel = ({ sceneId, token, browserType, videoRef, duration, startValue, endValue, onUnmount }: Props) => {
  const dispatch = useDispatch();

  let cancelTokenSource = useRef<Canceler>();
  const [isOpenExtractModal, setIsOpenExtractModal] = useState(false);
  const [isOpenLoadingModal, setIsOpenLoadingModal] = useState(false);
  const [isOpenExceptionModal, setIsOpenExceptionModal] = useState<MocapException>({ isOpen: false });
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
    setIsOpenLoadingModal(false);
    setIsOpenExceptionModal({
      isOpen: false,
    });
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
      if (endValue - startValue > 300) {
        setIsOpenExceptionModal({
          isOpen: true,
          case: 'OverLength',
        });

        return;
      }

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
          await requestApi({
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
          const { statusCode } = error;
          setIsOpenLoadingModal(false);

          if (statusCode === 500.9) {
            setIsOpenExceptionModal({
              isOpen: true,
              case: 'Condition',
            });
          } else if (statusCode === 408) {
            setIsOpenExceptionModal({
              isOpen: true,
              case: 'Timeout',
            });
          } else {
            setIsOpenExceptionModal({
              isOpen: true,
              case: 'Others',
            });
          }
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
      {isOpenExceptionModal.isOpen && isOpenExceptionModal.case === 'OverLength' && (
        <BaseModal>
          <div className={cx('modal-inner')}>
            <div className={cx('modal-header')}>
              <div className={cx('title-area')}>
                <IconWrapper className={cx('icon-warning')} icon={SvgPath.ErrorWarning} />
                <div className={cx('title')}>Clip the length of the video</div>
              </div>
              <IconWrapper className={cx('button-close')} icon={SvgPath.Close} onClick={handleCloseModal} />
            </div>
            <div className={cx('modal-content', 'nomargin')}>
              <div className={cx('message', 'nomargin')}>
                Longer than 5 minutes have difficulty in <br /> making motions. Reduce the length of the video and try again.
              </div>
            </div>
          </div>
        </BaseModal>
      )}
      {isOpenExceptionModal.isOpen && isOpenExceptionModal.case === 'Condition' && (
        <BaseModal>
          <div className={cx('modal-inner')}>
            <div className={cx('modal-header')}>
              <div className={cx('title-area')}>
                <IconWrapper className={cx('icon-warning')} icon={SvgPath.ErrorWarning} />
                <div className={cx('title')}>Check the requirements</div>
              </div>
              <IconWrapper className={cx('button-close')} icon={SvgPath.Close} onClick={handleCloseModal} />
            </div>
            <div className={cx('modal-content', 'nomargin')}>
              <div className={cx('message', 'nomargin')}>
                It seems that the video does not enough on
                <br /> the <span className={cx('impact')}>requirements</span> for get motion.
              </div>
            </div>
          </div>
        </BaseModal>
      )}
      {isOpenExceptionModal.isOpen && isOpenExceptionModal.case === 'Others' && (
        <BaseModal>
          <div className={cx('modal-inner')}>
            <div className={cx('modal-header')}>
              <div className={cx('title-area')}>
                <IconWrapper className={cx('icon-warning')} icon={SvgPath.ErrorWarning} />
                <div className={cx('title')}>There was an unknown problem</div>
              </div>
              <IconWrapper className={cx('button-close')} icon={SvgPath.Close} onClick={handleCloseModal} />
            </div>
            <div className={cx('modal-content', 'nomargin')}>
              <div className={cx('message', 'nomargin')}>
                Please try again. <br /> If the problem occurs again, please let us know through the website chat window.
              </div>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
};

export default ControlPanel;
