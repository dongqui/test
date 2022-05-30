import { forwardRef, FunctionComponent, memo, useCallback, useEffect, useRef, useState } from 'react';
import { IconWrapper } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './TextInput.module.scss';

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
  const { prefix, placeholder, fullSize, disabled, invalid, autoComplete, spellCheck, defaultValue, ...rest } = Props;

  const [onDrag, setOnDrag] = useState(false);
  const [onInput, setOnInput] = useState(false);
  const [value, setValue] = useState((defaultValue ?? '').toString());
  const offsetX = useRef(0);

  const wrapper = cx('wrapper', { fullSize, invalid, onDrag, nType: rest.type === 'number' });
  const prefixWrapper = cx('prefix-wrapper', { isStringType: typeof prefix === 'string' });
  const textInput = cx('text-input', { disabled });

  const numberMouseMove = (e: MouseEvent) => {
    if (!onInput) {
      let safeValue = value;
      if (isNaN(parseInt(value))) {
        safeValue = (rest.min ?? '0').toString();
      }

      const xDiff = offsetX.current - e.pageX;
      let newValue = parseInt(safeValue) - xDiff;

      if (rest.max !== undefined && parseInt(rest.max.toString()) < newValue) {
        newValue = parseInt(rest.max.toString());
      }
      if (rest.min !== undefined && parseInt(rest.min.toString()) > newValue) {
        newValue = parseInt(rest.min.toString());
      }

      setValue(newValue.toString());
    }
  };
  const numberMouseUp = () => {
    setOnDrag(false);
    document.body.style.cursor = 'default';
    window.removeEventListener('mousemove', numberMouseMove);
    window.removeEventListener('mouseup', numberMouseUp);
  };

  return (
    <div
      className={wrapper}
      onMouseDown={(e) => {
        if (rest.type === 'number') {
          offsetX.current = e.pageX;
          setOnDrag(true);
          document.body.style.cursor = 'ew-resize';
          window.addEventListener('mousemove', numberMouseMove);
          window.addEventListener('mouseup', numberMouseUp);
        }
      }}
    >
      {!!prefix && (
        <div className={prefixWrapper}>
          {typeof prefix === 'string' && <span>{prefix}</span>}
          {typeof prefix !== 'string' && <IconWrapper className={cx('icon')} icon={prefix} />}
        </div>
      )}
      <input
        {...rest}
        ref={ref}
        disabled={disabled}
        placeholder={placeholder}
        className={textInput}
        autoComplete={autoComplete ? 'on' : 'off'}
        spellCheck={spellCheck ? 'true' : 'false'}
        value={value}
        onMouseEnter={() => setOnInput(true)}
        onMouseLeave={() => setOnInput(false)}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
});

TextInput.displayName = 'TextInput';
TextInput.defaultProps = defaultProps;

export default memo(TextInput);
