import { memo, useMemo, useCallback, useRef, FocusEvent, KeyboardEvent, ChangeEvent, forwardRef } from 'react';
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
  spellCheck?: boolean;
  isChild?: boolean;
  theme?: 'dark' | 'light';
  dataCy?: string;
}

type Props = BaseProps & Omit<Input.BaseInputProps, 'autoComplete' | 'spellCheck'>;

const defaultProps: Partial<Props> = {
  type: 'text',
  maskChar: '',
  spellCheck: false,
  arrow: false,
  autoComplete: false,
  autoFocus: false,
  isChild: false,
  theme: 'dark',
};

const BaseInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      dataCy,
      type,
      className,
      mask,
      maskChar,
      disabled,
      invalid,
      arrow,
      fullSize,
      autoComplete,
      spellCheck,
      readOnly,
      isChild,
      theme,
      onBlur,
      onChange,
      onKeyUp,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const classes = cx('input', className, theme, {
      arrow,
      invalid,
      disabled,
      fullSize,
      isChild,
      readOnly,
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

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown && onKeyDown(e);
      },
      [onKeyDown],
    );

    const handlers = useMemo(() => {
      return {
        onBlur: handleBlur,
        onChange: handleChange,
        onKeyUp: handleKeyUp,
        onKeyDown: handleKeyDown,
      };
    }, [handleBlur, handleChange, handleKeyDown, handleKeyUp]);

    if (mask) {
      return (
        <MaskedInput className={classes} mask={mask} maskChar={maskChar} readOnly={readOnly} alwaysShowMask {...rest}>
          {(inputProps: unknown) => (
            <input type={type} ref={ref} autoComplete={autoComplete ? 'on' : 'off'} spellCheck={spellCheck ? 'true' : 'false'} readOnly={readOnly} {...handlers} {...inputProps} />
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
        spellCheck={spellCheck ? 'true' : 'false'}
        readOnly={readOnly}
        data-cy={dataCy}
        {...handlers}
        {...rest}
      />
    );
  },
);

BaseInput.defaultProps = defaultProps;
BaseInput.displayName = 'BaseInput';

export default memo(BaseInput);
