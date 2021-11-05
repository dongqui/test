import { FunctionComponent, memo } from 'react';
import Icon from '../Icon';
import { LPItemType } from 'types/LP';
import classNames from 'classnames/bind';
import styles from './IconNode.module.scss';

const cx = classNames.bind(styles);

interface Props extends Pick<LPItemType, 'name' | 'type' | 'parentKey'> {
  rowKey: string;
}

const IconNode: FunctionComponent<Props> = ({ rowKey, name, type, parentKey }) => {
  return (
    <div className={cx('icon-wrapper')}>
      <div className="icon" itemID={rowKey}>
        <Icon rowKey={rowKey} name={name} type={type} parentKey={parentKey} />
      </div>
    </div>
  );
};

export default memo(IconNode);
