import { Fragment, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Typography } from 'components/Typography';
import { Switch, Toggle } from 'components/Input';
import { FilledButton } from 'components/Button';
import { BaseForm } from 'components/Form';

import classNames from 'classnames/bind';
import styles from './ControlPanel.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const ControlPanel = ({}: Props) => {
  const selectOption = [
    {
      key: 'opt1',
      label: 'single',
      value: 0,
    },
    {
      key: 'opt2',
      label: 'multi',
      value: 1,
    },
  ];
  const defaultSelectOptionIndex = 0;
  const [isMulti, setIsMulti] = useState(Boolean(defaultSelectOptionIndex));
  // TODO: handler와 api 연결
  const handleSubmit = (data: any) => console.log(data);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('section')}>
        <div className={cx('section-title')}>
          <Typography type="title">Extract option</Typography>
          <div className={cx('tag')}>
            <Typography>Beta</Typography>
          </div>
        </div>
        <BaseForm onSubmit={handleSubmit}>
          {(props) => {
            return (
              <Fragment>
                <div className={cx('section-item')}>
                  <Typography>Model</Typography>
                  <Controller
                    defaultValue={selectOption[defaultSelectOptionIndex].key}
                    control={props.control}
                    name="model"
                    render={({ field }) => (
                      <Switch
                        className={cx('switch')}
                        onChange={(e) => {
                          field.onChange(e);
                          setIsMulti(!isMulti);
                        }}
                        defaultKey={selectOption[defaultSelectOptionIndex].key}
                        options={selectOption}
                      />
                    )}
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
                    <Controller defaultValue={false} control={props.control} name="Foot lock" render={({ field }) => <Toggle onChange={field.onChange} defaultChecked={false} />} />
                  </div>
                )}
                <div className={cx('section-item')}>
                  <Typography>T-pose</Typography>
                  <Controller defaultValue={false} control={props.control} name="T-pose" render={({ field }) => <Toggle onChange={field.onChange} defaultChecked={false} />} />
                </div>
                <div className={cx('section-item', 'section-text')}>
                  <Typography className={cx('section-comments')}>In case of T-pose On, the first frame is extracted by changing to T-pose.</Typography>
                </div>
                <div className={cx('section-item')}>
                  <FilledButton fullSize buttonType="submit">
                    <Typography type="button">Extract</Typography>
                  </FilledButton>
                </div>
              </Fragment>
            );
          }}
        </BaseForm>
      </div>
    </div>
  );
};

export default ControlPanel;
