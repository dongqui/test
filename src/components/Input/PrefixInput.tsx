import { FunctionComponent, ReactNode, MutableRefObject, forwardRef } from 'react';
import BaseInput from './BaseInput';
import classNames from 'classnames/bind';
import styles from './PrefixInput.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  prefix: ReactNode;
  arrow?: boolean;
  mask?: string | Array<string | RegExp>;
  maskChar?: string | null;
  color?: 'primary' | 'default';
  className?: string;
  autoComplete?: boolean;
  spellCheck?: boolean;
}

export type Props = BaseProps &
  Omit<Input.BaseInputProps, 'prefix' | 'autoComplete' | 'spellCheck'>;

const PrefixInput = forwardRef<HTMLInputElement, Props>(
  ({ prefix, arrow, color, className, ...rest }, ref) => {
    const classes = cx('input-wrapper', className);
    const prefixClasses = cx('prefix', color);

    return (
      <div className={classes}>
        <span className={prefixClasses}>{prefix}</span>
        <BaseInput
          className={cx('input')}
          type="number"
          ref={ref}
          arrow={arrow}
          isChild
          {...rest}
        />
      </div>
    );
  },
);

export default PrefixInput;
