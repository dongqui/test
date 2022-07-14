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
}

const ExtractForm = ({ fieldProps }: Props) => {
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
    if (isMulti) {
      fieldProps.control.unregister('footLock');
    }
  }, [fieldProps.control, isMulti]);

  const blurFocused = useCallback((e: FocusEvent<HTMLButtonElement>) => e.target.blur(), []);

  return (
    <Fragment>
      <div className={cx('section-item')}>
        <Typography>Model</Typography>
        <BaseField<Field.SwitchProps, string>
          onChange={(value) => setIsMulti(selectOption.find((option) => option.key === value)!.value)}
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
          <Typography className={cx('section-comments')}>We recommend videos with no more than 10 people.</Typography>
        </div>
      )}
      {!isMulti && (
        <div className={cx('section-item')}>
          <Typography>Foot lock</Typography>
          <BaseField<Field.ToggleProps, boolean> control={fieldProps.control} name="footLock" render={(props) => <Toggle {...props} />} defaultValue={false} />
        </div>
      )}
      <div className={cx('section-item')}>
        <Typography>T-pose</Typography>
        <BaseField<Field.ToggleProps, boolean> control={fieldProps.control} name="tPose" render={(props) => <Toggle {...props} />} defaultValue={false} />
      </div>
      <div className={cx('section-item', 'section-text')}>
        <Typography className={cx('section-comments')}>In case of T-pose On, the first frame is extracted by changing to T-pose.</Typography>
      </div>
      <div className={cx('section-item')}>
        <FilledButton fullSize type="submit" onFocus={blurFocused}>
          <Typography type="button">Extract</Typography>
        </FilledButton>
      </div>
    </Fragment>
  );
};

export default ExtractForm;
