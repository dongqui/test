import { FunctionComponent, memo, useCallback, useMemo } from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { LPItemListType, LPItemType } from 'types/LP';
import ListRow from './ListRow';
import * as lpDataActions from 'actions/lpData';
import classNames from 'classnames/bind';
import styles from './ListGroup.module.scss';
import { useSelector } from 'reducers';
import { fnFindSameNameFile } from 'utils/LP_launching';
import { useConfirmModal } from 'components/Modal/ConfirmModal';

const cx = classNames.bind(styles);

interface Props {
  items: LPItemListType;
  expandedKeys: string[];
}

export interface FilteredItem extends LPItemType {
  isExpanded: boolean;
}

type FilteredItems = Array<FilteredItem>;

const ListGroup: FunctionComponent<Props> = ({ items, expandedKeys }) => {
  const dispatch = useDispatch();

  const selectedKeys = useSelector((state) => state.lpData.selectedKeys);

  const filteredItems = useMemo((): FilteredItems => {
    let result = items.map((item) => ({ ...item, isExpanded: expandedKeys.includes(item.key) }));
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
      dispatch(lpDataActions.setItemList({ key, isExpanded: !expandedKeys.includes(key) }));
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
            <div className="icon" draggable>
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
