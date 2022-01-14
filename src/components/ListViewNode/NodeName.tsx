import React, { FunctionComponent, Fragment, memo, FocusEvent, KeyboardEvent, ChangeEvent, useEffect, useCallback, useState } from 'react';
import { BaseInput } from 'components/Input';
import classNames from 'classnames/bind';
import styles from './NodeName.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isEditing?: boolean;
  name?: string;
  extension?: string;
  handleEditName: (newName: string) => void;
  handleCancelEdit: () => void;
}

const NodeName: FunctionComponent<Props> = ({ isEditing, name, handleEditName, handleCancelEdit, extension }) => {
  const nameWithoutExtension = name?.replace(new RegExp(`.${extension}$`), '');
  const [inputValue, setInputValue] = useState(nameWithoutExtension || '');

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      let currentValue = event.target.value;

      if (currentValue.length === 1) {
        currentValue = currentValue.replace(/[0-9]/gi, '');
      }

      const first = currentValue.charAt(0);

      if (first.match(/[0-9]/g)) {
        setInputValue(inputValue);
      } else {
        currentValue = currentValue.replace(/[^A-Za-z0-9_-\s\(\)]/gi, '');
        setInputValue(currentValue);
      }
    },
    [inputValue],
  );

  const onBlur = () => {
    handleEditName(inputValue);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'Escape') {
      handleCancelEdit();
    } else if (event.code === 'Enter') {
      handleEditName(inputValue);
    }
  };

  if (isEditing) {
    return (
      <Fragment>
        <BaseInput className={cx('input')} placeholder={name} value={inputValue} type="text" onChange={handleChange} onBlur={onBlur} onKeyDown={onKeyDown} autoFocus />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className={cx('name')}>
        <div className={cx('text')}>{name}</div>
      </div>
    </Fragment>
  );
};

NodeName.displayName = 'NodeName';

export default memo(NodeName);
