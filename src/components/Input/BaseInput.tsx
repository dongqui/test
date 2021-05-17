import { memo, useCallback, FocusEvent, KeyboardEvent, ChangeEvent, forwardRef } from 'react';
import MaskedInput from 'react-input-mask';
import classNames from 'classnames/bind';
import styles from './BaseInput.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  arrow?: boolean;
  mask?: string | Array<string | RegExp>;
  maskChar?: string | null;
  fullSize?: boolean;
  autoComplete?: boolean;
}

type Props = BaseProps & Omit<Input.BaseInputProps, 'autoComplete'>;

const defaultProps: Partial<Props> = {
  type: 'text',
  maskChar: '',
  spellCheck: 'false',
  arrow: false,
  autoComplete: false,
};

const BaseInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      type,
      className,
      mask,
      maskChar,
      disabled,
      invalid,
      arrow,
      fullSize,
      autoComplete,
      readOnly,
      onBlur,
      onChange,
      onKeyUp,
      ...rest
    },
    ref,
  ) => {
    const classes = cx('input', className, {
      arrow,
      invalid,
      disabled,
      fullSize,
    });

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        onBlur && onBlur(e);
      },
      [onBlur],
    );

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChange && onChange(e);
      },
      [onChange],
    );

    const handleKeyUp = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        onKeyUp && onKeyUp(e);
      },
      [onKeyUp],
    );

    if (mask) {
      return (
        <MaskedInput
          className={classes}
          mask={mask}
          maskChar={maskChar}
          readOnly={readOnly}
          alwaysShowMask
          {...rest}
        >
          {(inputProps: unknown) => (
            <input
              type={type}
              ref={ref}
              autoComplete={autoComplete ? 'on' : 'off'}
              readOnly={readOnly}
              {...inputProps}
            />
          )}
        </MaskedInput>
      );
    }

    return (
      <input
        className={classes}
        type={type}
        ref={ref}
        disabled={disabled}
        autoComplete={autoComplete ? 'on' : 'off'}
        readOnly={readOnly}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        {...rest}
      />
    );
  },
);

BaseInput.defaultProps = defaultProps;

export default memo(BaseInput);
