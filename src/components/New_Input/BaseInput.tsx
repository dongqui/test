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

type Props = Input.BaseInputProps;

const defaultProps: Partial<Props> = {
  type: 'text',
  spellCheck: 'false',
};

const BaseInput: FunctionComponent<Props> = ({
  className,
  innerRef,
  disabled,
  invalid,
  onBlur,
  onChange,
  onKeyUp,
  ...rest
}) => {
  const classes = cx('input', className, {
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
