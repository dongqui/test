import { FocusEvent, Fragment, useCallback, useEffect, useState } from 'react';
import { Typography } from 'components/Typography';
import { Switch, Toggle } from 'components/Input';
import { FilledButton } from 'components/Button';
import { BaseField } from 'components/Form';

import classNames from 'classnames/bind';
import styles from './ExtractForm.module.scss';

const cx = classNames.bind(styles);

interface Props {
  fieldProps: Field.FormProps;
  setExtractButtonRef: (ref: HTMLButtonElement) => void;
  doneVMOnBoarding: (step: number) => void;
}

const FOOT_LOCK_AVAILABLE = false;

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
  const [isMulti, setIsMulti] = useState(selectOption[defaultSelectOptionIndex].value);

  useEffect(() => {
    if (isMulti && FOOT_LOCK_AVAILABLE) {
      fieldProps.control.unregister('footLock');
    }
  }, [fieldProps.control, isMulti]);

  const blurFocused = useCallback((e: FocusEvent<HTMLButtonElement>) => e.target.blur(), []);

  return (
    <Fragment>
      <div className={cx('section-item')}>
        <Typography>Tracking</Typography>
        <BaseField<Field.SwitchProps, string>
          onChange={(value) => {
            doneVMOnBoarding(3);
            setIsMulti(selectOption.find((option) => option.key === value)!.value);
          }}
          className={cx('switch')}
          options={selectOption}
          control={fieldProps.control}
          render={(props) => <Switch {...props} />}
          defaultValue={selectOption[defaultSelectOptionIndex].key}
          name="model"
        />
      </div>
      {isMulti && (
        <div className={cx('section-item', 'section-text')}>
          <Typography className={cx('section-comments')}>For optimized performance, we recommended your video have less than 10 people in it.</Typography>
        </div>
      )}
      {!isMulti && FOOT_LOCK_AVAILABLE && (
        <div className={cx('section-item')}>
          <Typography>Foot lock</Typography>
          <BaseField<Field.ToggleProps, boolean>
            onChange={() => doneVMOnBoarding(3)}
            control={fieldProps.control}
            name="footLock"
            render={(props) => <Toggle {...props} />}
            defaultValue={false}
          />
        </div>
      )}
      <div className={cx('section-item')}>
        <Typography>T-pose</Typography>
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
