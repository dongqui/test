import {
  FunctionComponent,
  memo,
  useCallback,
  FocusEvent,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import classNames from 'classnames/bind';
import styles from './BaseInput.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  arrow?: boolean;
}

type Props = BaseProps & Input.BaseInputProps;

const defaultProps: Partial<Props> = {
  type: 'text',
  spellCheck: 'false',
  arrow: false,
};

const BaseInput: FunctionComponent<Props> = ({
  className,
  innerRef,
  disabled,
  invalid,
  arrow,
  onBlur,
  onChange,
  onKeyUp,
  ...rest
}) => {
  const classes = cx('input', className, {
    arrow,
    invalid,
    disabled,
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

  return (
    <input
      className={classes}
      disabled={disabled}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyUp={handleKeyUp}
      ref={innerRef}
      {...rest}
    />
  );
};

BaseInput.defaultProps = defaultProps;

export default memo(BaseInput);
