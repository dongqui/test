import { useEffect, useState } from 'react';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  recordButtonRef: HTMLButtonElement | null;
  leftCropSliderRef: HTMLInputElement | null;
  CPModified: boolean | undefined;
  extractButtonRef: HTMLButtonElement | null;
}

const OnBoarding = ({ recordButtonRef, leftCropSliderRef, CPModified, extractButtonRef }: Props) => {
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);
  const [step4, setStep4] = useState(false);

  useEffect(() => {
    const OnBoardingMask = Number(localStorage.getItem('vm_onboarding') ?? '0');
    const STEP1_KEY = 1 << 0;
    const STEP2_KEY = 1 << 1;
    const STEP3_KEY = 1 << 2;
    const STEP4_KEY = 1 << 3;

    setStep1(!!(!(OnBoardingMask & STEP1_KEY) && recordButtonRef));
    setStep2(!!(!(OnBoardingMask & STEP2_KEY) && leftCropSliderRef));
    setStep3(!(OnBoardingMask & STEP3_KEY) && CPModified === false);
    setStep4(!!(!(OnBoardingMask & STEP4_KEY) && extractButtonRef));
  }, [CPModified, extractButtonRef, leftCropSliderRef, recordButtonRef]);

  return (
    <div className={cx('wrapper')}>
      {step1 && <button onClick={() => console.log(recordButtonRef)}>check recordButtonRef</button>}
      {step2 && <button onClick={() => console.log(leftCropSliderRef)}>check leftCropSliderRef</button>}
      {step3 && <button onClick={() => console.log(CPModified)}>check CPModified</button>}
      {step4 && <button onClick={() => console.log(extractButtonRef)}>check extractButtonRef</button>}
    </div>
  );
};

export default OnBoarding;
