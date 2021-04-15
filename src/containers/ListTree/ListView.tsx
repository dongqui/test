import { FunctionComponent, memo, useMemo, useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useShortcut } from 'hooks/common/useShortcut';
import { FILE_TYPES, LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { storeLpData, storeSearchWord } from 'lib/store';
import _ from 'lodash';
import fnFilterArrayByHierarchy from 'utils/LP/fnFilterArrayByHierarchy';
import fnMakeSelection from 'utils/LP/fnMakeSelection';
import fnSortArrayByHierarchy from 'utils/LP/fnSortArrayByHierarchy';
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
  const lpData = useReactiveVar(storeLpData);
  const searchWord = useReactiveVar(storeSearchWord);
  useShortcut({
    data: shortcutData,
  });
  const processedData = useMemo(() => {
    let result: LPDataType[] = [];
    let data = _.clone(lpData);
    if (!_.isEmpty(searchWord)) {
      data = fnFilterArrayByHierarchy({ data, searchWord });
    }
    data = fnSortArrayByHierarchy({ data });
    _.forEach(data, (item) => {
      if (_.isEqual(item.parentKey, ROOT_FOLDER_NAME)) {
        result.push(item);
        return;
      }
      if (_.find(result, [LPDATA_PROPERTY_TYPES.key, item.parentKey])?.isExpanded) {
        result.push(item);
      }
    });
    result = fnMakeSelection({ data: result, originalData: lpData });
    return result;
  }, [lpData, searchWord]);

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
