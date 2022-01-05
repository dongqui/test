import { FunctionComponent, Fragment, memo, RefObject, FocusEvent, KeyboardEvent, ChangeEvent, useEffect, useCallback, useState } from 'react';
import { BaseInput } from 'components/Input';
import classNames from 'classnames/bind';
import styles from './NodeName.module.scss';

const cx = classNames.bind(styles);

interface Props {
  inputRef: RefObject<HTMLInputElement>;
  textRef: RefObject<HTMLDivElement>;
  isEditing?: boolean;
  name: string;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  defaultValue: string;
}

const NodeName: FunctionComponent<Props> = ({ inputRef, textRef, isEditing, name, defaultValue, onBlur, onKeyDown }) => {
  useEffect(() => {
    if (isEditing) {
      if (inputRef && inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [inputRef, isEditing]);

  const [value, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      let currentValue = event.target.value;

      if (currentValue.length === 1) {
        currentValue = currentValue.replace(/[0-9]/gi, '');
      }

      const first = currentValue.charAt(0);

      if (first.match(/[0-9]/g)) {
        setValue(value);
      } else {
        currentValue = currentValue.replace(/[^A-Za-z0-9_-\s\(\)]/gi, '');
        setValue(currentValue);
      }
    },
    [value],
  );

  if (isEditing) {
    return (
      <Fragment>
        <BaseInput className={cx('input')} ref={inputRef} placeholder={name} value={value} type="text" onBlur={onBlur} onKeyDown={onKeyDown} onChange={handleChange} autoFocus />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className={cx('name')}>
        <div className={cx('text')} ref={textRef}>
          {name}
        </div>
      </div>
    </Fragment>
  );
};

NodeName.displayName = 'NodeName';

export default memo(NodeName);
