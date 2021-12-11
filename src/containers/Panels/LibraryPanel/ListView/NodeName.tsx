import { FunctionComponent, Fragment, memo, RefObject, FocusEvent, KeyboardEvent, useEffect } from 'react';
import { BaseInput } from 'components/Input';
import classNames from 'classnames/bind';
import styles from './NodeName.module.scss';

const cx = classNames.bind(styles);

interface Props {
  innerRef: RefObject<HTMLInputElement>;
  isRenaming: boolean;
  name: string;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  defaultValue: string;
}

const NodeName: FunctionComponent<Props> = ({ innerRef, isRenaming, name, defaultValue, onBlur, onKeyDown }) => {
  useEffect(() => {
    if (isRenaming) {
      if (innerRef && innerRef.current) {
        innerRef.current.select();
      }
    }
  }, [innerRef, isRenaming]);

  if (isRenaming) {
    return (
      <Fragment>
        <div className={cx('column')} />
        <BaseInput className={cx('input')} ref={innerRef} placeholder={name} type="text" onBlur={onBlur} onKeyDown={onKeyDown} defaultValue={defaultValue} autoFocus />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className={cx('column')} />
      <div className={cx('name')}>{name}</div>
    </Fragment>
  );
};

NodeName.displayName = 'NodeName';

export default memo(NodeName);
