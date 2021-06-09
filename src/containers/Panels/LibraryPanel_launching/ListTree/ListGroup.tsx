import { FunctionComponent, memo, useCallback, useMemo, useState } from 'react';
import _ from 'lodash';
import { LPItemListType, LPItemType } from 'types/LP';
import ListRow from './ListRow';
import classNames from 'classnames/bind';
import styles from './ListGroup.module.scss';

const cx = classNames.bind(styles);

interface Props {
  items: LPItemListType;
}

export interface FilteredItem extends LPItemType {
  isExpanded: boolean;
}

type FilteredItems = Array<FilteredItem>;

const ListGroup: FunctionComponent<Props> = ({ items }) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const filteredItems = useMemo((): FilteredItems => {
    let result = items.map(
      (item) => ({ ...item, isExpanded: expandedKeys.includes(item.key) } as FilteredItem),
    );
    // 닫혀있는 row key들을 구한다
    const unExpandedKeys = result
      .filter((item) => item.isExpanded === false)
      .map((item) => item.key);
    // 닫혀있는 row key들의 child 들은 모두 지워준다
    result = result.filter((item) => !unExpandedKeys.includes(item.parentKey));
    return result;
  }, [expandedKeys, items]);

  const handleClickExpand = useCallback(
    (key: string) => {
      let newExpandedKeys = _.clone(expandedKeys);
      if (expandedKeys.includes(key)) {
        newExpandedKeys = _.remove(expandedKeys, key);
      } else {
        newExpandedKeys = [...expandedKeys, key];
      }
      setExpandedKeys(newExpandedKeys);
    },
    [expandedKeys],
  );

  return (
    <div className={cx('group-wrapper')}>
      {filteredItems.map((item, index) => {
        const key = `${item.key}_${index}`;
        return (
          <div key={key} className={cx('list-wrapper')}>
            <div className="icon" draggable>
              <ListRow item={item} onClickExpand={handleClickExpand} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(ListGroup);
