import { FunctionComponent, memo, useMemo, useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useShortcut } from 'hooks/common/useShortcut';
import { FILE_TYPES, MainDataType, MAINDATA_PROPERTY_TYPES } from 'types';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { storeMainData, storeSearchWord } from 'lib/store';
import _ from 'lodash';
import { fnFilterArrayByHierarchy } from 'utils/LP/fnFilterArrayByHierarchy';
import { fnMakeSelection } from 'utils/LP/fnMakeSelection';
import { fnSortArrayByHierarchy } from 'utils/LP/fnSortArrayByHierarchy';
import ListNode from './ListNode';
import classNames from 'classnames/bind';
import styles from './ListView.module.scss';

const cx = classNames.bind(styles);

export interface ListViewProps {
  onClick: (e: any) => void;
  onContextMenu: ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => void;
  onDragStart: ({ key }: any) => void;
  onDragEnd: ({ key }: any) => void;
  onDrop: ({ key }: any) => void;
  shortcutData: {
    key: string;
    ctrlKey?: boolean;
    event: () => void;
  }[];
}

const ListViewComponent: FunctionComponent<ListViewProps> = ({
  onClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDrop,
  shortcutData,
}) => {
  const mainData = useReactiveVar(storeMainData);
  const searchWord = useReactiveVar(storeSearchWord);
  useShortcut({
    data: shortcutData,
  });
  const processedData = useMemo(() => {
    let result: MainDataType[] = [];
    let data = _.clone(mainData);
    if (!_.isEmpty(searchWord)) {
      data = fnFilterArrayByHierarchy({ data, searchWord });
    }
    data = fnSortArrayByHierarchy({ data });
    _.forEach(data, (item) => {
      if (_.isEqual(item.parentKey, ROOT_FOLDER_NAME)) {
        result.push(item);
        return;
      }
      if (_.find(result, [MAINDATA_PROPERTY_TYPES.key, item.parentKey])?.isExpanded) {
        result.push(item);
      }
    });
    result = fnMakeSelection({ data: result, originalData: mainData });
    return result;
  }, [mainData, searchWord]);

  const handleDragStart = useCallback(
    (key: string) => {
      onDragStart({ key });
    },
    [onDragStart],
  );

  const handleDrop = useCallback(
    (key: string) => {
      onDrop({ key });
    },
    [onDrop],
  );
  return (
    <div className={cx('wrapper')}>
      {_.map(processedData, (item, index) => {
        const key = `${item.parentKey}_${item.name}_${index}`;
        return (
          <ListNode
            key={key}
            item={item}
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
            onDrop={handleDrop}
          />
        );
      })}
    </div>
  );
};

export const ListView = memo(ListViewComponent);

{
  /* return (
    <div className={cx('wrapper')}>
      {_.map(processedData, (item, index) => (
        <S.ListViewRowWrapper
          key={index}
          id={item.key}
          className="icon"
          draggable
          onDragStart={() => onDragStart({ key: item.key })}
          onDragEnd={onDragEnd}
          onDrop={() => {
            onDrop({ key: _.isEqual(item.type, FILE_TYPES.motion) ? item.parentKey : item.key });
          }}
        >
          {_.isEmpty(searchWord) ? (
            <>
              {(_.isEqual(item.parentKey, ROOT_FOLDER_NAME) ||
                _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, item.parentKey])?.isExpanded) && (
                <ListRow
                  rowKey={item.key}
                  mode={item.type}
                  isClicked={item.isClicked}
                  isSelected={item.isSelected}
                  isVisualizeSelected={item.isVisualizeSelected}
                  isVisualized={item.isVisualized}
                  isFirst={item.isFirst}
                  isLast={item.isLast}
                />
              )}
            </>
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
            />
          )}
        </S.ListViewRowWrapper>
      ))}
    </div>
  ); */
}
