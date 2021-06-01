import { FunctionComponent, memo } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';
import { LPItemsState } from 'actions/lpData';

const cx = classNames.bind(styles);

interface Props {
  item: LPItemsState;
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
