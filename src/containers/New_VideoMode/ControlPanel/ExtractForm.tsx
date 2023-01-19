import { FocusEvent, Fragment, useCallback, useEffect, useState } from 'react';

import { Typography } from 'components/Typography';
import { Switch } from 'components/Input';
import { FilledButton } from 'components/Button';
import { BaseField } from 'components/Form';
import { useSelector } from 'reducers';
import PlanManager from 'utils/PlanManager';

import classNames from 'classnames/bind';
import styles from './ExtractForm.module.scss';

const cx = classNames.bind(styles);

interface Props {
  fieldProps: Field.FormProps;
  setExtractButtonRef: (ref: HTMLButtonElement) => void;
  doneVMOnBoarding: (step: number) => void;
  isFastForwardDone: boolean;
}

const FOOT_LOCK_AVAILABLE = true;

const selectMultiOption = [
  {
    key: 'multi',
    label: 'Multi',
    value: true,
  },
  {
    key: 'single',
    label: 'Single',
    value: false,
  },
];

const selectFootLockAndTPoseOption = [
  {
    key: 'Yes',
    label: 'Yes',
    value: true,
  },
  {
    key: 'No',
    label: 'No',
    value: false,
  },
];

// Need to refactor it.........
const ExtractForm = ({ fieldProps, setExtractButtonRef, doneVMOnBoarding, isFastForwardDone }: Props) => {
  const DEFAULT_MULTI_SELECT_OPTION_INDEX = 1;
  const DEFAULT_FOOT_LOCK_SELECT_OPTION_INDEX = 1;
  const DEFAULT_T_POSE_SELECT_OPTION_INDEX = 0;
  const [multiOption, setMultiOption] = useState(selectMultiOption[DEFAULT_MULTI_SELECT_OPTION_INDEX]);
  const [footLockOption, setFootLockOption] = useState(selectFootLockAndTPoseOption[DEFAULT_FOOT_LOCK_SELECT_OPTION_INDEX]);
  const [trackingTooltip, setTrackingTooltip] = useState(false);
  const [footLockTooltip, setFootLockTooltip] = useState(false);
  const [tPoseTooltip, setTPoseTooltip] = useState(false);
  const userState = useSelector((state) => state.user);
  const [betaTagToolTip, setBetaTagToolTip] = useState(false);

  useEffect(() => {
    if (multiOption.value && FOOT_LOCK_AVAILABLE) {
      fieldProps.control.unregister('footLock');
    }
  }, [fieldProps.control, multiOption.value]);

  const blurFocused = useCallback((e: FocusEvent<HTMLButtonElement>) => e.target.blur(), []);

  function handleChangeMultiSwitch(key: string) {
    if (userState.planType === 'freemium') {
      PlanManager.openProFeaturesNotAllowedModal(userState, 'multi');
      setMultiOption(selectMultiOption[DEFAULT_MULTI_SELECT_OPTION_INDEX]);
    } else {
      const option = selectMultiOption.find((option) => option.key === key);
      if (option) {
        setMultiOption(option);
      }
    }
    doneVMOnBoarding(3);
  }

  function handleClickFootLock(key: string) {
    const option = selectFootLockAndTPoseOption.find((option) => option.key === key);
    if (option) {
      setFootLockOption(option);
    }
    doneVMOnBoarding(3);
  }
  return (
    <Fragment>
      <div className={cx('section-item')}>
        <div className={cx('switch-label')}>
          <Typography className={cx('section-title')}>Tracking</Typography>
          <div className={cx('overlay')} onMouseEnter={() => setTrackingTooltip(true)} onMouseLeave={() => setTrackingTooltip(false)} />
          {trackingTooltip && (
            <div className={cx('tooltip')}>
              <div className={cx('arrow')} />
              <Typography type="body">Select either ‘Single’ or ‘Multi to extract one or more than one person’s motion from the video.</Typography>
            </div>
          )}
        </div>
        <BaseField<React.ComponentProps<typeof Switch>, string>
          className={cx('switch')}
          onChange={handleChangeMultiSwitch}
          control={fieldProps.control}
          name="model"
          controlledValue={multiOption?.key}
          options={selectMultiOption}
          defaultValue={multiOption.key}
          render={(props) => <Switch {...props} />}
        />
      </div>
      {multiOption.value && (
        <div className={cx('section-item', 'section-text')}>
          <Typography className={cx('section-comments')}>
            Recommend <br />
            <span className={cx('mid-dot')}>&#183;</span> less than 10 people <br />
            <span className={cx('mid-dot')}>&#183;</span> under 1000 frames
          </Typography>
        </div>
      )}

      {!multiOption.value && FOOT_LOCK_AVAILABLE && (
        <div className={cx('section-item')}>
          <div className={cx('switch-label')}>
            <Typography className={cx('section-title')}>Foot lock</Typography>
            <div
              className={cx('overlay')}
              onMouseEnter={() => {
                setFootLockTooltip(true);
              }}
              onMouseLeave={() => setFootLockTooltip(false)}
            />

            {footLockTooltip && (
              <div className={cx('tooltip')}>
                <div className={cx('arrow')} />
                <Typography type="body">Locking the feet to the ground and gliding the feet across the ground</Typography>
              </div>
            )}
          </div>

          <div className={cx('beta-chip')}>
            <Typography className={cx('text')}>Beta</Typography>
            <div className={cx('overlay')} />
            {/*{betaTagToolTip && (*/}
            {/*  <div className={cx('tooltip')}>*/}
            {/*    <div className={cx('arrow')} />*/}
            {/*    <Typography type="body">The keyframe edited in the scene is not saved for foot lock motion.</Typography>*/}
            {/*  </div>*/}
            {/*)}*/}
          </div>

          <BaseField<React.ComponentProps<typeof Switch>, string>
            className={cx('switch')}
            onChange={handleClickFootLock}
            control={fieldProps.control}
            name="footLock"
            defaultValue={footLockOption.key}
            controlledValue={footLockOption.key}
            options={selectFootLockAndTPoseOption}
            render={(props) => <Switch {...props} />}
          />
        </div>
      )}
      <div className={cx('section-item')}>
        <div className={cx('switch-label')}>
          <Typography className={cx('section-title')}>T-pose</Typography>
          <div className={cx('overlay')} onMouseEnter={() => setTPoseTooltip(true)} onMouseLeave={() => setTPoseTooltip(false)} />
          {tPoseTooltip && (
            <div className={cx('tooltip')}>
              <div className={cx('arrow')} />
              <Typography type="body">Overwrite the first keyframe with the T-pose.</Typography>
            </div>
          )}
        </div>

        <BaseField<React.ComponentProps<typeof Switch>, string>
          className={cx('switch')}
          onChange={() => doneVMOnBoarding(3)}
          control={fieldProps.control}
          name="tPose"
          defaultValue={selectFootLockAndTPoseOption[DEFAULT_T_POSE_SELECT_OPTION_INDEX].key}
          options={selectFootLockAndTPoseOption}
          render={(props) => <Switch {...props} />}
        />
      </div>
      <div style={{ height: '10px' }} />
      <div className={cx('section-item')}>
        <FilledButton r={setExtractButtonRef} fullSize type="submit" onFocus={blurFocused} disabled={!isFastForwardDone}>
          <Typography type="button">{isFastForwardDone ? 'Extract' : 'Loading...'}</Typography>
        </FilledButton>
      </div>
    </Fragment>
  );
};

export default ExtractForm;
