import { FunctionComponent, memo } from 'react';
import _ from 'lodash';
import { LPItemListType } from 'types/LP';
import ListRow from './ListRow';
import classNames from 'classnames/bind';
import styles from './ListGroup.module.scss';

const cx = classNames.bind(styles);

interface Props {
  items: LPItemListType;
}

const ListGroup: FunctionComponent<Props> = ({ items }) => {
  return (
    <div className={cx('group-wrapper')}>
      {items.map((item, index) => {
        const key = `${item.key}_${index}`;
        return (
          <div key={key} className={cx('list-wrapper')}>
            <div className="icon" draggable>
              <ListRow item={item} depth={1} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(ListGroup);
