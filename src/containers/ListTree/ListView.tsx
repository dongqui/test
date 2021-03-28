import React, { useMemo, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import useContextMenu from 'hooks/common/useContextMenu';
import { useShortcut } from 'hooks/common/useShortcut';
import { useLPControl } from 'hooks/LP/useLPControl';
import { FILE_TYPES, MainDataType, MAINDATA_PROPERTY_TYPES } from 'types';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { storeContextMenuInfo, storeMainData, storePages, storeSearchWord } from 'lib/store';
import _ from 'lodash';
import { fnFilterArrayByHierarchy } from 'utils/LP/fnFilterArrayByHierarchy';
import { fnMakeSelection } from 'utils/LP/fnMakeSelection';
import { fnSortArrayByHierarchy } from 'utils/LP/fnSortArrayByHierarchy';
import { ListRow } from './ListRow';
import * as S from './ListTreeStyles';

export interface ListViewProps {}

const ListViewComponent: React.FC<ListViewProps> = ({}) => {
  const mainData = useReactiveVar(storeMainData);
  const pages = useReactiveVar(storePages);
  const searchWord = useReactiveVar(storeSearchWord);
  const contextmenuInfo = useReactiveVar(storeContextMenuInfo);
  const listViewWrapperRef = useRef<HTMLDivElement>(null);
  const { onContextMenu, shortcutData, onDragStart, onDrop, onClick, onDragEnd } = useLPControl({
    contextmenuInfo,
    mainData,
    pages,
    searchWord,
  });
  useContextMenu({ targetRef: listViewWrapperRef, event: onContextMenu });
  useShortcut({
    data: shortcutData,
  });
  const processedData = useMemo(() => {
    const result: MainDataType[] = [];
    let data = fnSortArrayByHierarchy({ data: mainData });
    if (!_.isEmpty(searchWord)) {
      data = fnFilterArrayByHierarchy({ data, searchWord });
      data = _.map(data, (item) => ({
        ...item,
        parentKey: _.isEqual(item.type, FILE_TYPES.file) ? ROOT_FOLDER_NAME : item.parentKey,
      }));
    }
    data = fnMakeSelection({ data });
    _.forEach(data, (item) => {
      if (_.isEqual(item.parentKey, ROOT_FOLDER_NAME)) {
        result.push(item);
        return;
      }
      if (_.find(result, [MAINDATA_PROPERTY_TYPES.key, item.parentKey])?.isExpanded) {
        result.push(item);
      }
    });
    return result;
  }, [mainData, searchWord]);
  return (
    <S.ListViewWrapper ref={listViewWrapperRef} onClick={onClick}>
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
                  data={processedData}
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
              data={processedData}
            />
          )}
        </S.ListViewRowWrapper>
      ))}
    </S.ListViewWrapper>
  );
};
export const ListView = React.memo(ListViewComponent);
