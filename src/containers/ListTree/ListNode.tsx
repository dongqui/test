import { FunctionComponent, memo, Fragment, useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import { storeMainData, storeSearchWord } from 'lib/store';
import { FILE_TYPES, MainDataType, MAINDATA_PROPERTY_TYPES } from 'types';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { ListRow } from './ListRow';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  item: MainDataType;
  data: MainDataType[];
  onDragStart: ({ key }: any) => void;
  onDragEnd: ({ key }: any) => void;
  onDrop: ({ key }: any) => void;
}

const ListNode: FunctionComponent<Props> = ({ item, data, onDragStart, onDragEnd, onDrop }) => {
  const mainData = useReactiveVar(storeMainData);
  const searchWord = useReactiveVar(storeSearchWord);

  const handleDragStart = useCallback(() => {
    onDragStart(item.key);
  }, [item.key, onDragStart]);

  const handleDrop = useCallback(() => {
    const key = _.isEqual(item.type, FILE_TYPES.motion) ? item.parentKey : item.key;
    onDrop(key);
  }, [item.key, item.parentKey, item.type, onDrop]);

  const isSearching = _.isEmpty(searchWord);

  const isParentRoot = _.isEqual(item.parentKey, ROOT_FOLDER_NAME);
  const isParentExpanded = _.find(mainData, { key: item.parentKey })?.isExpanded;

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
                data={data}
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
            data={data}
          />
        )}
      </div>
    </div>
  );
};

export default memo(ListNode);
