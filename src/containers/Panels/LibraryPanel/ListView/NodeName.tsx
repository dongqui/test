import { FunctionComponent, Fragment, memo, RefObject, FocusEvent, KeyboardEvent, useEffect } from 'react';
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

  if (isEditing) {
    return (
      <Fragment>
        <BaseInput className={cx('input')} ref={inputRef} placeholder={name} type="text" onBlur={onBlur} onKeyDown={onKeyDown} defaultValue={defaultValue} autoFocus />
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
