import { FunctionComponent, memo, useCallback, useMemo } from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { LPItemListType, LPItemType } from 'types/LP';
import ListRow from './ListRow';
import * as lpDataActions from 'actions/lpData';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './ListGroup.module.scss';

const cx = classNames.bind(styles);

interface Props {
  items: LPItemListType;
  expandedKeys: string[];
  unExpandedKeys: string[];
}

export interface FilteredItem extends LPItemType {
  isExpanded: boolean;
}

type FilteredItems = Array<FilteredItem>;

const ListGroup: FunctionComponent<Props> = ({ items, expandedKeys, unExpandedKeys }) => {
  const dispatch = useDispatch();

  const selectedKeys = useSelector((state) => state.lpData.selectedKeys);

  const filteredItems = useMemo((): FilteredItems => {
    const expandedRows = items.filter((item) =>
      _.isEmpty(_.intersection(item.parentKeyList, unExpandedKeys)),
    ); // 부모 키들중 닫힌 키가 포함되어 있는 row들은 모두 지워준다
    const result = expandedRows.map(
      (item) => ({ ...item, isExpanded: expandedKeys.includes(item.key) } as FilteredItem),
    );
    return result;
  }, [expandedKeys, items, unExpandedKeys]);

  const handleClickExpand = useCallback(
    (key: string) => {
      dispatch(lpDataActions.setExpandedKey({ key, isExpand: !expandedKeys.includes(key) }));
    },
    [dispatch, expandedKeys],
  );

  const isGroupSelected = items.some((item) => selectedKeys.includes(item.key));

  const listGroupClasses = cx('group-wrapper', {
    selected: isGroupSelected,
    visualized: false,
  });

  return (
    <div className={listGroupClasses}>
      {filteredItems.map((item, index) => {
        const key = `${item.key}_${index}`;
        return (
          <div key={key} className={cx('list-wrapper')}>
            <div className="icon" draggable itemID={item.key}>
              <ListRow
                rowKey={item.key}
                name={item.name}
                isExpanded={item.isExpanded}
                depth={item.depth}
                type={item.type}
                parentKey={item.parentKey}
                onClickExpand={handleClickExpand}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(ListGroup);
