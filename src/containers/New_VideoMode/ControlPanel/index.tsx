import { Fragment, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Typography as Tg } from 'components/Typography';
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
  const handleClick = (data: any) => console.log(data);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('section')}>
        <div className={cx('section-title')}>
          <Tg type="title">Extract option</Tg>
          <div className={cx('tag')}>
            <Tg>Beta</Tg>
          </div>
        </div>
        <BaseForm onSubmit={handleClick}>
          {(props) => {
            return (
              <Fragment>
                <div className={cx('section-item')}>
                  <Tg>Model</Tg>
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
                    <Tg className={cx('section-comments')}>We recommend videos with no more than 10 people.</Tg>
                  </div>
                )}
                {!isMulti && (
                  <div className={cx('section-item')}>
                    <Tg>Foot lock</Tg>
                    <Controller defaultValue={false} control={props.control} name="Foot lock" render={({ field }) => <Toggle onChange={field.onChange} defaultChecked={false} />} />
                  </div>
                )}
                <div className={cx('section-item')}>
                  <Tg>T-pose</Tg>
                  <Controller defaultValue={false} control={props.control} name="T-pose" render={({ field }) => <Toggle onChange={field.onChange} defaultChecked={false} />} />
                </div>
                <div className={cx('section-item', 'section-text')}>
                  <Tg className={cx('section-comments')}>In case of T-pose On, the first frame is extracted by changing to T-pose.</Tg>
                </div>
                <div className={cx('section-item')}>
                  <FilledButton fullSize buttonType="submit">
                    <Tg type="button">Extract</Tg>
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
