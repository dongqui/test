import { RefObject, useState, useCallback, useRef, ChangeEvent, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios, { Canceler } from 'axios';
import * as globalUIActions from 'actions/Common/globalUI';
import * as modeSelectActions from 'actions/modeSelection';
import * as lpActions from 'actions/LP/lpNodeAction';
import requestApi from 'api/requestApi';
import { FilledButton, OutlineButton } from 'components/Button';
import { Typography } from 'components/Typography';
import { BaseForm } from 'components/Form';
import { BaseModal } from 'components/Modal';
import { BaseInput } from 'components/Input';
import { IconWrapper, SvgPath } from 'components/Icon';
import { Overlay } from 'components/Overlay';
import ExtractForm from './ExtractForm';

import classNames from 'classnames/bind';
import styles from './ControlPanel.module.scss';
import TooltipArrow from 'components/TooltipArrow';
import TagManager from 'react-gtm-module';

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
  isOpenExtractModal: boolean;
  setIsOpenExtractModal: (state: boolean) => void;
  isOpenLoadingModal: boolean;
  setIsOpenLoadingModal: (state: boolean) => void;
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

const ControlPanel = ({
  setExtractButtonRef,
  sceneId,
  token,
  browserType,
  videoRef,
  duration,
  startValue,
  endValue,
  onUnmount,
  doneVMOnBoarding,
  setCPModified,
  isOpenExtractModal,
  setIsOpenExtractModal,
  isOpenLoadingModal,
  setIsOpenLoadingModal,
}: Props) => {
  const dispatch = useDispatch();

  let cancelTokenSource = useRef<Canceler>();
  const [isOpenExceptionModal, setIsOpenExceptionModal] = useState<MocapException>({ isOpen: false });
  const [valueName, setValueName] = useState('Extracted motion');
  const [valueFormData, setValueFormData] = useState({
    model: 'single',
    footLock: false,
    tPose: false,
  });
  const [tagToolTip, setTagToolTip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpenExtractModal && inputRef.current) {
      inputRef.current.select();
    }
  }, [isOpenExtractModal, inputRef]);

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

  const handleChangeName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      let currentValue = event.target.value;

      if (currentValue.length === 1) {
        currentValue = currentValue.replace(/[0-9]/gi, '');
      }

      const first = currentValue.charAt(0);

      if (first.match(/[0-9]/g)) {
        setValueName(valueName);
      } else {
        currentValue = currentValue.replace(/[^A-Za-z0-9_-\s\(\)]/gi, '');
        setValueName(currentValue);
      }
    },
    [valueName],
  );

  const handleCloseModal = useCallback(() => {
    setValueName('Extracted motion');
    setIsOpenExtractModal(false);
    setIsOpenLoadingModal(false);
    setIsOpenExceptionModal({
      isOpen: false,
    });
  }, [setIsOpenExtractModal, setIsOpenLoadingModal]);

  const handleCancel = useCallback(() => {
    TagManager.dataLayer({
      dataLayer: {
        event: 'export-motion-cancel',
      },
    });

    setIsOpenLoadingModal(false);
    setIsOpenExtractModal(false);
    cancelTokenSource.current && cancelTokenSource.current();
  }, [setIsOpenExtractModal, setIsOpenLoadingModal]);

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
    TagManager.dataLayer({
      dataLayer: {
        event: 'export-motion',
      },
    });

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
              TagManager.dataLayer({
                dataLayer: {
                  event: 'export-motion-success',
                },
              });

              setIsOpenLoadingModal(false);
              onUnmount();
              dispatch(modeSelectActions.changeMode({ mode: 'animationMode', videoURL: undefined }));
              dispatch(lpActions.initNodes(response.data));

              return {
                loaded: true,
                error: null,
                data: response.data,
              };
            })
            .catch((error) => {
              setIsOpenExceptionModal({
                isOpen: true,
                case: 'Others',
              });

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

          if (error.isCancel) {
            setIsOpenLoadingModal(false);
            return;
          }

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

  useEffect(() => {
    if (isOpenExceptionModal.isOpen && isOpenExceptionModal.case !== undefined) {
      TagManager.dataLayer({
        dataLayer: {
          event: 'error',
          type: isOpenExceptionModal.case,
        },
      });
    }
  }, [isOpenExceptionModal]);

  return (
    <div className={cx('wrapper')} onMouseEnter={() => setCPModified(false)}>
      <div className={cx('section')}>
        <div className={cx('section-title')}>
          <Typography type="title">Extract option</Typography>
          <div className={cx('tag')}>
            <Typography className={cx('text')}>Beta</Typography>
            <div className={cx('overlay')} onMouseEnter={() => setTagToolTip(true)} onMouseLeave={() => setTagToolTip(false)} />
            {tagToolTip && (
              <div className={cx('tooltip')}>
                <div className={cx('arrow')} />
                <Typography type="body">Currently in Beta and free!</Typography>
              </div>
            )}
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
              <label className={cx('label-name')}>Name</label>
              <BaseInput ref={inputRef} className={cx('input-name')} name="name" placeholder="Enter the name" value={valueName} onChange={handleChangeName} />
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
