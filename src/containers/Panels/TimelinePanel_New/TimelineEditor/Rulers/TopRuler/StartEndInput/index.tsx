import React, { useCallback, FunctionComponent } from 'react';
import { BaseInput } from 'components/Input';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  endInput?: boolean;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: number | string;
}

const StartEndInput: FunctionComponent<Props> = ({ endInput, onBlur, onChange, value }) => {
  // start, end input에 Enter key 입력 동작
  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.currentTarget.blur();
        break;
      default:
        break;
    }
  }, []);

  return (
    <g className={cx('input', { 'end-input': endInput })}>
      <foreignObject width="36" height="12">
        <BaseInput
          arrow={false}
          maxLength={4}
          onBlur={onBlur}
          onChange={onChange}
          onKeyDown={handleInputKeyDown}
          type="number"
          value={value}
        />
      </foreignObject>
    </g>
  );
};

export default StartEndInput;
