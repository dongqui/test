import { ChangeEvent, FocusEvent, forwardRef, FunctionComponent, KeyboardEvent, memo, useCallback, useMemo } from 'react';

import classNames from 'classnames/bind';
import styles from './TextInput.module.scss';
import { IconWrapper } from 'components/Icon';

const cx = classNames.bind(styles);

interface BaseProps {
  prefix?: string | FunctionComponent;
  placeholder?: string;
  fullSize?: boolean;

  autoComplete?: boolean;
  spellCheck?: boolean;
}

type Props = BaseProps & Omit<Input.BaseInputProps, 'autoComplete' | 'spellCheck' | 'prefix'>;

const defaultProps: Partial<Props> = {
  type: 'text',
  fullSize: false,
  autoComplete: false,
  spellCheck: false,
};

const TextInput = forwardRef<HTMLInputElement, Props>((Props: Props, ref) => {
  const { prefix, placeholder, fullSize, disabled, invalid, autoComplete, spellCheck, ...rest } = Props;

  const wrapper = cx('wrapper', { fullSize, invalid });
  const prefixWrapper = cx('prefix-wrapper', { isStringType: typeof prefix === 'string' });
  const textInput = cx('text-input', { disabled });

  return (
    <div className={wrapper}>
      {!!prefix && (
        <div className={prefixWrapper}>
          {typeof prefix === 'string' && <span>{prefix}</span>}
          {typeof prefix !== 'string' && <IconWrapper className={cx('icon')} icon={prefix} />}
        </div>
      )}
      <input
        ref={ref}
        disabled={disabled}
        placeholder={placeholder}
        className={textInput}
        autoComplete={autoComplete ? 'on' : 'off'}
        spellCheck={spellCheck ? 'true' : 'false'}
        {...rest}
      />
    </div>
  );
});

TextInput.displayName = 'TextInput';
TextInput.defaultProps = defaultProps;

export default memo(TextInput);
