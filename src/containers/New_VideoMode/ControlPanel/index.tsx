import { RefObject, useState, useCallback, useRef, ChangeEvent, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios, { Canceler } from 'axios';
import TagManager from 'react-gtm-module';
import { useSelector } from 'reducers';
import * as errors from 'errors';

import * as globalUIActions from 'actions/Common/globalUI';
import * as modeSelectActions from 'actions/modeSelection';
import * as lpActions from 'actions/LP/lpNodeAction';
import * as userActions from 'actions/User';
import requestApi from 'api/requestApi';
import * as api from 'api';
import { Spinner } from 'components';
import { FilledButton, OutlineButton } from 'components/Button';
import { Typography } from 'components/Typography';
import { BaseForm } from 'components/Form';
import { BaseModal } from 'components/Modal';
import { BaseInput } from 'components/Input';
import { IconWrapper, SvgPath } from 'components/Icon';
import { Overlay } from 'components/Overlay';
import planManager from 'utils/PlanManager';
import ExtractForm from './ExtractForm';
import { convertServerResponseToNode, setChildNodeIds } from 'utils/LP/converters';

import classNames from 'classnames/bind';
import styles from './ControlPanel.module.scss';

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
  totalFrames: number;
  isFastForwardDone: boolean;
}

interface ExtractFormData {
  model: 'single' | 'multi';
  footLock: 'Yes' | 'No';
  tPose: 'Yes' | 'No';
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
  totalFrames,
  isFastForwardDone,
}: Props) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const lpNode = useSelector((state) => state.lpNode);
  let cancelTokenSource = useRef<Canceler>();
  const [isOpenExceptionModal, setIsOpenExceptionModal] = useState<MocapException>({ isOpen: false });
  const [valueName, setValueName] = useState('Extracted motion');
  const [valueFormData, setValueFormData] = useState({
    model: 'single',
    footLock: 'No',
    tPose: 'Yes',
  });
  const [tagToolTip, setTagToolTip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const requiredCredit = Math.floor(((totalFrames * (endValue - startValue)) / duration) * (valueFormData.model === 'single' ? 1 : 3));

  useEffect(() => {
    if (isOpenExtractModal && inputRef.current) {
      inputRef.current.select();
    }
  }, [isOpenExtractModal, inputRef]);

  const handleSubmit = async (data: ExtractFormData) => {
    if (planManager.isCreditExceeded(user, requiredCredit)) {
      planManager.openCreditExceededModal(user, requiredCredit);
      return;
    } else if (planManager.isStorageExceeded(user)) {
      planManager.openStorageExceededModal(user);
      return;
    }

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
    setIsOpenLoadingModal(false);
    setIsOpenExtractModal(false);
    cancelTokenSource.current && cancelTokenSource.current();
  }, [setIsOpenExtractModal, setIsOpenLoadingModal]);

  const convertBlobToFile = useCallback(async ({ url, type, fileName }: any) => {
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
    setIsOpenExtractModal(false);

    if (videoRef.current) {
      if (endValue - startValue > 300) {
        setIsOpenExceptionModal({
          isOpen: true,
          case: 'OverLength',
        });

        return;
      }

      const formData = new FormData();

      setIsOpenLoadingModal(true);

      const file = await convertBlobToFile({ url: videoRef.current.src, type: browserType === 'safari' ? 'mp4' : 'webm', valueName });
      const { fileKey } = await api.upload(file);

      formData.append('fileKey', fileKey);
      formData.append('name', valueName || 'Extracted motion');
      formData.append('startTime', String(startValue));
      formData.append('endTime', String(endValue));
      formData.append('duration', String(duration));
      formData.append('modelType', valueFormData.model);
      formData.append('isFootLock', valueFormData.footLock === 'Yes' ? 'true' : 'false');
      formData.append('isTPose', valueFormData.tPose === 'Yes' ? 'true' : 'false');

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
          TagManager.dataLayer({
            dataLayer: {
              event: 'extract_mocap_success',
            },
          });

          setIsOpenLoadingModal(false);
          onUnmount();
          const mocapNode = convertServerResponseToNode(response.data);
          const nodes = setChildNodeIds([mocapNode, ...lpNode.nodes]);

          dispatch(modeSelectActions.changeMode({ mode: 'animationMode', videoURL: undefined }));
          dispatch(lpActions.changeNode({ nodes }));
          dispatch(userActions.getUserCreditInfoAsync.request());
          dispatch(userActions.getUserStorageInfoAsync.request());
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
          } else if (statusCode === errors.TOOL_PAYMENT_NOT_ALLOWED_FUNCTION) {
            planManager.openProFeaturesNotAllowedModal(user);
          } else if (statusCode === errors.TOOL_PAYMENT_MAXIMUM_SIZE) {
            planManager.openStorageExceededModal(user);
          } else if (statusCode === errors.TOOL_PAYMENT_NOT_ENOUGH_CREDIT) {
            planManager.openCreditExceededModal(user, requiredCredit);
          } else if (statusCode === errors.INVALID_MOCAP_VIDEO_DURATION) {
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

  const remainingCredit = planManager.remainingCredits(user, requiredCredit).toLocaleString();
  return (
    <div className={cx('wrapper')} onMouseEnter={() => setCPModified(false)}>
      <div className={cx('section')}>
        <div className={cx('section-title')}>
          <Typography type="title">Extract option</Typography>
        </div>
        <BaseForm onSubmit={isFastForwardDone ? handleSubmit : () => null}>
          {(fieldProps) => (
            <ExtractForm isFastForwardDone={isFastForwardDone} doneVMOnBoarding={doneVMOnBoarding} setExtractButtonRef={setExtractButtonRef} fieldProps={fieldProps} />
          )}
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
              <span className={cx('extract-text')}>
                <strong>{requiredCredit.toLocaleString()} credits</strong> are required on this. You will have <strong>{remainingCredit} credits</strong> remaining.
              </span>
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
              <div className={cx('loading-spinner')}>
                <Spinner size="small" backgroundColor="elevated" />
              </div>
            </div>
            <div className={cx('modal-footer', 'loading-footer')}>
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
