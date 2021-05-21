import { forwardRef, ReactNode } from 'react';
import BaseInput from './BaseInput';
import classNames from 'classnames/bind';
import styles from './SuffixInput.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  suffix: ReactNode;
  arrow?: boolean;
  mask?: string | Array<string | RegExp>;
  maskChar?: string | null;
  color?: 'primary' | 'default';
  className?: string;
  autoComplete?: boolean;
  spellCheck?: boolean;
  theme?: 'dark' | 'light';
}

export type Props = BaseProps &
  Omit<Input.BaseInputProps, 'suffix' | 'autoComplete' | 'spellCheck'>;

const defaultProps: Partial<Props> = {
  theme: 'dark',
};

const SuffixInput = forwardRef<HTMLInputElement, Props>(
  ({ suffix, arrow, color, className, theme, disabled, ...rest }, ref) => {
    const classes = cx('input-wrapper', className, theme, { disabled });
    const suffixClasses = cx('suffix', color);

    return (
      <div className={classes}>
        <BaseInput
          className={cx('input')}
          type="number"
          ref={ref}
          arrow={arrow}
          theme={theme}
          disabled={disabled}
          isChild
          {...rest}
        />
        <span className={suffixClasses}>{suffix}</span>
      </div>
    );
  },
);

SuffixInput.defaultProps = defaultProps;

export default SuffixInput;
