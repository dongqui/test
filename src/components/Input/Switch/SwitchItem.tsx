import { FunctionComponent, memo, useCallback } from 'react';
import { Typography, Html } from 'components/Typography';

import classNames from 'classnames/bind';
import styles from './SwitchItem.module.scss';
import { IconWrapper } from 'components/Icon';

const cx = classNames.bind(styles);

interface Props {
  option: {
    key: string;
    value: string | number | boolean;
    label: string | FunctionComponent;
  };
  selected: boolean;
  onClick: (key: string) => void;
  disabled: boolean;
}

const SwitchItem = ({ option, selected, onClick, disabled }: Props) => {
  const { key, value, label } = option;
  const handleClick = useCallback(() => {
    onClick(key);
  }, [key, onClick]);

  return (
    <div className={cx('btn', { disabled, selected })} onClick={handleClick}>
      {/*for hover text above select-effect*/}
      {typeof label === 'string' ? (
        <span className={cx('btn-text')}>
          <Html content={label} />
        </span>
      ) : (
        <IconWrapper icon={label} className={cx('btn-icon')} />
      )}

      {/*for keep div size behind the select-effect due to overlayed text*/}
      {typeof label === 'string' ? (
        <span className={cx('padding')}>
          <Html content={label} />
        </span>
      ) : (
        <IconWrapper icon={label} className={cx('btn-padding')} />
      )}
      <input type="radio" value={value.toString()} defaultChecked={selected} />
    </div>
  );
};

export default memo(SwitchItem);
