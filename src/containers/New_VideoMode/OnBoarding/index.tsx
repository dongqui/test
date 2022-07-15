import { useEffect } from 'react';
import { VM_ON_BOARDING_KEY } from 'utils/const';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import GuideModal from 'components/Modal/GuideModal';

const cx = classNames.bind(styles);

interface Props {
  recordButtonRef: HTMLButtonElement | null;
  leftCropSliderRef: HTMLInputElement | null;
  CPModified: boolean | undefined;
  extractButtonRef: HTMLButtonElement | null;
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
  setStep1: (step: boolean) => void;
  setStep2: (step: boolean) => void;
  setStep3: (step: boolean) => void;
  setStep4: (step: boolean) => void;
  doneVMOnBoarding: (step: number) => void;
}

const OnBoarding = ({
  recordButtonRef,
  leftCropSliderRef,
  CPModified,
  extractButtonRef,
  step1,
  step2,
  step3,
  step4,
  setStep1,
  setStep2,
  setStep3,
  setStep4,
  doneVMOnBoarding,
}: Props) => {
  useEffect(() => {
    const OnBoardingMask = Number(localStorage.getItem(VM_ON_BOARDING_KEY) ?? '0');
    const STEP1_KEY = 1 << 0;
    const STEP2_KEY = 1 << 1;
    const STEP3_KEY = 1 << 2;
    const STEP4_KEY = 1 << 3;

    setStep1(!!(!(OnBoardingMask & STEP1_KEY) && recordButtonRef));
    setStep2(!!(!(OnBoardingMask & STEP2_KEY) && leftCropSliderRef));
    setStep3(!(OnBoardingMask & STEP3_KEY) && CPModified === false);
    setStep4(!!(OnBoardingMask & STEP3_KEY && !step3 && !(OnBoardingMask & STEP4_KEY) && extractButtonRef) && CPModified !== undefined);
  }, [CPModified, extractButtonRef, leftCropSliderRef, recordButtonRef, setStep1, setStep2, setStep3, setStep4, step3]);

  return (
    <div>
      {step1 && recordButtonRef && (
        <GuideModal
          className={cx('onboarding-modal', {
            show: step1,
          })}
          title="Are you new to Video mode?"
          message="You can <span>import</span> or <span>record</span> a video first to extract motion."
          onClose={() => {
            doneVMOnBoarding(1);
          }}
          postion={{
            bottom: `calc(100vh - ${recordButtonRef.getBoundingClientRect().y - 12 - 6}px)`,
            left: 'calc(50% - 5px)',
            transform: 'translateX(-50%)',
          }}
          tooltipArrowPlacement="bottom-middle"
        />
      )}
      {step2 && leftCropSliderRef && (
        <GuideModal
          className={cx('onboarding-modal', {
            show: step2,
          })}
          title="Clipping your video"
          message="<span>Adjust the length</span> of the video to extract only the section you want."
          onClose={() => {
            doneVMOnBoarding(2);
          }}
          postion={{
            bottom: `calc(100vh - ${leftCropSliderRef.getBoundingClientRect().y - 12 - 6}px)`,
            left: `${leftCropSliderRef.getBoundingClientRect().x}px`,
            transform: 'translateX(-20px)',
          }}
          tooltipArrowPlacement="bottom-start"
        />
      )}
      {step3 && (
        <GuideModal
          className={cx('onboarding-modal', {
            show: step3,
          })}
          title="Set the Extract option you want"
          message="Depending on the purpose, <span>various settings</span> can be manipulated and extracted from the video."
          onClose={() => {
            doneVMOnBoarding(3);
          }}
          postion={{
            right: '266px',
            top: '52px',
          }}
          tooltipArrowPlacement="right-start"
        />
      )}
      {step4 && extractButtonRef && (
        <GuideModal
          className={cx('onboarding-modal', {
            show: step4,
          })}
          title="Ready for an amazing experience?"
          message="After the setting is complete, <span>start extracting.</span>"
          onClose={() => {
            doneVMOnBoarding(4);
          }}
          postion={{
            top: `${extractButtonRef.getBoundingClientRect().y + 48}px`,
            right: '17px',
          }}
          tooltipArrowPlacement="top-end"
        />
      )}
    </div>
  );
};

export default OnBoarding;
