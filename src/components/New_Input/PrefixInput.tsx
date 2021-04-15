import { FunctionComponent, ReactNode, MutableRefObject } from 'react';
import BaseInput from './BaseInput';
import classNames from 'classnames/bind';
import styles from './PrefixInput.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  ref?: any;
  prefix: ReactNode;
  arrow?: boolean;
  color?: 'primary' | 'default';
  className?: string;
}

const defaultProps: Partial<Props> = {
  color: 'default',
};

export type Props = BaseProps & Omit<Input.BaseInputProps, 'prefix'>;

const PrefixInput: FunctionComponent<Props> = ({
  ref,
  prefix,
  arrow,
  color,
  className,
  ...rest
}) => {
  const classes = cx('input-wrapper', className);
  const prefixClasses = cx('prefix', color);

  return (
    <div className={classes}>
      <span className={prefixClasses}>{prefix}</span>
      <BaseInput innerRef={ref} className={cx('input')} type="number" arrow={arrow} {...rest} />
    </div>
  );
};

export default PrefixInput;
