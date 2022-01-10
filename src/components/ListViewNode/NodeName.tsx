import { FunctionComponent, Fragment, memo, FocusEvent, KeyboardEvent, ChangeEvent, useEffect, useCallback, useState } from 'react';
import { BaseInput } from 'components/Input';
import classNames from 'classnames/bind';
import styles from './NodeName.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isEditing?: boolean;
  name?: string;
}

const NodeName: FunctionComponent<Props> = ({ isEditing, name }) => {
  const [value, setValue] = useState('');

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
        <BaseInput className={cx('input')} placeholder={name} value={value} type="text" onChange={handleChange} autoFocus />
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
