import { FunctionComponent, ReactNode } from 'react';
import BaseInput from './BaseInput';
import classNames from 'classnames/bind';
import styles from './PrefixInput.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  prefix: ReactNode;
}

export type Props = BaseProps & Omit<Input.BaseInputProps, 'prefix'>;

const PrefixInput: FunctionComponent<Props> = ({ prefix, ...rest }) => {
  return (
    <div className={cx('input-wrapper')}>
      <span className={cx('prefix')}>{prefix}</span>
      <BaseInput className={cx('input')} type="number" {...rest} />
    </div>
  );
};

export default PrefixInput;
