import { FunctionComponent, memo, Fragment, useCallback } from 'react';
import { LPItemOldType, ROOT_FOLDER_NAME } from 'types/LP';
import { ListRow } from './ListRow';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';
import { useSelector } from 'reducers';

const cx = classNames.bind(styles);

interface Props {
  item: LPItemOldType;
  onDragStart: ({ key }: any) => void;
  onDragEnd: ({ key }: any) => void;
  onDrop: ({ key }: any) => void;
}

const ListNode: FunctionComponent<Props> = ({ item, onDragStart, onDragEnd, onDrop }) => {
  const lpData = useSelector((state) => state.lpDataOld);
  const searchWord = useSelector((state) => state.lpSearchword.word);

  const handleDragStart = useCallback(() => {
    onDragStart(item.key);
  }, [item.key, onDragStart]);

  const handleDrop = useCallback(() => {
    const key = _.isEqual(item.type, 'Motion') ? item.parentKey : item.key;
    onDrop(key);
  }, [item.key, item.parentKey, item.type, onDrop]);

  const isSearching = _.isEmpty(searchWord);

  const isParentRoot = _.isEqual(item.parentKey, ROOT_FOLDER_NAME);
  const isParentExpanded = _.find(lpData, { key: item.parentKey })?.isExpanded;

  return (
    <div className={cx('list-wrapper')}>
      <div
        className="icon"
        id={item.key}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDrop={handleDrop}
      >
        {isSearching ? (
          <Fragment>
            {(isParentRoot || isParentExpanded) && (
              <ListRow
                rowKey={item.key}
                mode={item.type}
                isClicked={item.isClicked}
                isSelected={item.isSelected}
                isVisualizeSelected={item.isVisualizeSelected}
                isVisualized={item.isVisualized}
                isFirst={item.isFirst}
                isLast={item.isLast}
                depth={item.depth}
              />
            )}
          </Fragment>
        ) : (
          <ListRow
            rowKey={item.key}
            mode={item.type}
            isClicked={item.isClicked}
            isSelected={item.isSelected}
            isVisualizeSelected={item.isVisualizeSelected}
            isVisualized={item.isVisualized}
            isFirst={item.isFirst}
            isLast={item.isLast}
            depth={item.depth}
          />
        )}
      </div>
    </div>
  );
};

export default memo(ListNode);
