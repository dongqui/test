import { FunctionComponent, memo, useCallback } from 'react';
import classNames from 'classnames/bind';
import { LPDataState } from 'actions/lpdata';
import styles from './IconNode.module.scss';
import Icon from '../Icon';

const cx = classNames.bind(styles);

interface Props {
  item: LPDataState;
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
