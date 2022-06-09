import { Fragment, useState } from 'react';
import { Controller } from 'react-hook-form';
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
      key: 'opt1',
      label: 'single',
      value: false,
    },
    {
      key: 'opt2',
      label: 'multi',
      value: true,
    },
  ];
  const defaultSelectOptionIndex = 0;
  const [isMulti, setIsMulti] = useState(selectOption[defaultSelectOptionIndex].value);

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
          name="switch"
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
          <Controller defaultValue={false} control={fieldProps.control} name="Foot lock" render={({ field }) => <Toggle onChange={field.onChange} defaultChecked={false} />} />
        </div>
      )}
      <div className={cx('section-item')}>
        <Typography>T-pose</Typography>
        <Controller defaultValue={false} control={fieldProps.control} name="T-pose" render={({ field }) => <Toggle onChange={field.onChange} defaultChecked={false} />} />
      </div>
      <div className={cx('section-item', 'section-text')}>
        <Typography className={cx('section-comments')}>In case of T-pose On, the first frame is extracted by changing to T-pose.</Typography>
      </div>
      <div className={cx('section-item')}>
        <FilledButton fullSize type="submit">
          <Typography type="button">Extract</Typography>
        </FilledButton>
      </div>
    </Fragment>
  );
};

export default ExtractForm;
