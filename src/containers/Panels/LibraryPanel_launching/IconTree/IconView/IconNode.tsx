import { FunctionComponent, memo } from 'react';
import Icon from '../Icon';
import { LPItemType } from 'types/LP';
import classNames from 'classnames/bind';
import styles from './IconNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  item: LPItemType;
}

const IconNode: FunctionComponent<Props> = ({ item }) => {
  return (
    <div className={cx('icon-wrapper')}>
      <div className="icon" id={item.key} draggable>
        <Icon rowKey={item.key} name={item.name} type={item.type} />
      </div>
    </div>
  );
};

export default memo(IconNode);
