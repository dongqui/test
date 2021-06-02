import { FunctionComponent, memo } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';
import { LPItemListType } from 'types/LP';

const cx = classNames.bind(styles);

interface Props {
  item: LPItemListType;
}

const ListGroup: FunctionComponent<Props> = ({ item }) => {
  return (
    <div className={cx('list-wrapper')}>
      <div
        className="icon"
        // id={item.key}
        draggable
      ></div>
    </div>
  );
};

export default memo(ListGroup);
