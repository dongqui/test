import { FocusEvent, Fragment, useCallback, useEffect, useState } from 'react';

import { Typography } from 'components/Typography';
import { Switch, Toggle } from 'components/Input';
import { FilledButton } from 'components/Button';
import { BaseField } from 'components/Form';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import * as globalUIActions from 'actions/Common/globalUI';

import classNames from 'classnames/bind';
import styles from './ExtractForm.module.scss';
import { user } from 'reducers/User';

const cx = classNames.bind(styles);

interface Props {
  fieldProps: Field.FormProps;
  setExtractButtonRef: (ref: HTMLButtonElement) => void;
  doneVMOnBoarding: (step: number) => void;
}

const FOOT_LOCK_AVAILABLE = true;

const ExtractForm = ({ fieldProps, setExtractButtonRef, doneVMOnBoarding }: Props) => {
  const selectOption = [
    {
      key: 'single',
      label: 'single',
      value: false,
    },
    {
      key: 'multi',
      label: 'multi',
      value: true,
    },
  ];

  const defaultSelectOptionIndex = 0;
  const [multiOption, setMultiOption] = useState(selectOption[defaultSelectOptionIndex]);
  const [footLock, setFootLock] = useState(false);
  const [trackingTooltip, setTrackingTooltip] = useState(false);
  const [tPoseTooltip, setTPoseTooltip] = useState(false);
  const userState = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (multiOption.value && FOOT_LOCK_AVAILABLE) {
      fieldProps.control.unregister('footLock');
    }
  }, [fieldProps.control, multiOption.value]);

  const blurFocused = useCallback((e: FocusEvent<HTMLButtonElement>) => e.target.blur(), []);

  function handleChangeMultiSwitch(key: string) {
    if (userState.planType === 'freemium') {
      dispatch(
        globalUIActions.openModal('ProFeaturesModal', {
          hadFreeTrial: userState.hadFreeTrial,
        }),
      );
      setMultiOption(selectOption[defaultSelectOptionIndex]);
    } else {
      const option = selectOption.find((option) => option.key === key);
      if (option) {
        setMultiOption(option);
      }
    }
    doneVMOnBoarding(3);
  }

  function handleClickFootLock() {
    if (userState.planType === 'freemium') {
      dispatch(
        globalUIActions.openModal('ProFeaturesModal', {
          hadFreeTrial: userState.hadFreeTrial,
        }),
      );
      setFootLock(false);
    } else {
      setFootLock(!footLock);
    }
    doneVMOnBoarding(3);
  }
  return (
    <Fragment>
      <div className={cx('section-item')}>
        <div className={cx('tracking')}>
          <Typography>Tracking</Typography>
          <div className={cx('overlay')} onMouseEnter={() => setTrackingTooltip(true)} onMouseLeave={() => setTrackingTooltip(false)} />
          {trackingTooltip && (
            <div className={cx('tooltip')}>
              <div className={cx('arrow')} />
              <Typography type="body">Select either ‘Single’ or ‘Multi to extract one or more than one person’s motion from the video.</Typography>
            </div>
          )}
        </div>
        <Switch className={cx('switch')} value={multiOption.key} options={selectOption} defaultValue={multiOption.key} onChange={handleChangeMultiSwitch} />
      </div>
      {multiOption.value && (
        <div className={cx('section-item', 'section-text')}>
          <Typography className={cx('section-comments')}>For optimized performance, we recommended your video have less than 10 people in it.</Typography>
        </div>
      )}
      {!multiOption.value && FOOT_LOCK_AVAILABLE && (
        <div className={cx('section-item')}>
          <Typography>Foot lock</Typography>
          <Toggle onChange={handleClickFootLock} value={footLock} defaultValue={false} />
        </div>
      )}
      <div className={cx('section-item')}>
        <div className={cx('t-pose')}>
          <Typography>T-pose</Typography>
          <div className={cx('overlay')} onMouseEnter={() => setTPoseTooltip(true)} onMouseLeave={() => setTPoseTooltip(false)} />
          {tPoseTooltip && (
            <div className={cx('tooltip')}>
              <div className={cx('arrow')} />
              <Typography type="body">Overwrite the first keyframe with the T-pose.</Typography>
            </div>
          )}
        </div>
        <BaseField<Field.ToggleProps, boolean>
          onChange={() => doneVMOnBoarding(3)}
          control={fieldProps.control}
          name="tPose"
          render={(props) => <Toggle {...props} />}
          defaultValue={false}
        />
      </div>
      <div style={{ height: '10px' }} />
      <div className={cx('section-item')}>
        <FilledButton r={setExtractButtonRef} fullSize type="submit" onFocus={blurFocused}>
          <Typography type="button">Extract</Typography>
        </FilledButton>
      </div>
    </Fragment>
  );
};

export default ExtractForm;
