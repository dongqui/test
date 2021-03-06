import { useReactiveVar } from '@apollo/client';
import { useContextmenu } from 'hooks/common/useContextmenu';
import { useShortcut } from 'hooks/common/useShortcut';
import { useLPControl } from 'hooks/LP/useLPControl';
import { FILE_TYPES, mainDataTypes, MAINDATA_PROPERTY_TYPES } from 'interfaces';
import { ROOT_FOLDER_NAME } from 'interfaces/LP';
import { CONTEXTMENU_INFO, LP_MODE, MAIN_DATA, PAGES, SEARCH_WORD } from 'lib/store';
import _ from 'lodash';
import React, { useMemo, useRef } from 'react';
import { fnSortArrayByHierarchy } from 'utils/LP/fnSortArrayByHierarchy';
import { ListRow } from './ListRow';
import * as S from './ListTreeStyles';

export interface ListViewProps {
  width: string;
  height: string;
}

const ListViewComponent: React.FC<ListViewProps> = ({ width, height }) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const pages = useReactiveVar(PAGES);
  const searchWord = useReactiveVar(SEARCH_WORD);
  const contextmenuInfo = useReactiveVar(CONTEXTMENU_INFO);
  const lpmode = useReactiveVar(LP_MODE);
  const listViewWrapperRef = useRef<HTMLDivElement>(null);
  const { onContextMenu, shortcutData, filteredData, onDragStart, onDrop } = useLPControl({
    contextmenuInfo,
    mainData,
    pages,
    searchWord,
    lpmode,
  });
  useContextmenu({ targetRef: listViewWrapperRef, event: onContextMenu });
  useShortcut({
    data: shortcutData,
  });
  const processedData = useMemo(() => {
    const result: mainDataTypes[] = [];
    const data = fnSortArrayByHierarchy({ data: filteredData });
    _.forEach(data, (item) => {
      if (_.isEqual(item.parentKey, ROOT_FOLDER_NAME)) {
        result.push(item);
        return;
      }
      if (
        _.some(result, [MAINDATA_PROPERTY_TYPES.key, item.parentKey]) &&
        _.find(result, [MAINDATA_PROPERTY_TYPES.key, item.parentKey])?.isExpanded
      ) {
        result.push(item);
      }
    });
    return result;
  }, [filteredData]);
  return (
    <S.ListViewWrapper ref={listViewWrapperRef} width={width} height={height}>
      {_.map(processedData, (item, index) => (
        <S.ListViewRowWrapper
          key={index}
          className="icon"
          draggable
          onDragStart={() => onDragStart({ key: item.key })}
          onDrop={() => {
            onDrop({ key: _.isEqual(item.type, FILE_TYPES.motion) ? item.parentKey : item.key });
          }}
        >
          {_.isEqual(item.parentKey, ROOT_FOLDER_NAME) ? (
            <ListRow rowKey={item.key} mode={item.type} parentKey={item.parentKey} />
          ) : (
            <>
              {_.find(mainData, [MAINDATA_PROPERTY_TYPES.key, item.parentKey])?.isExpanded && (
                <ListRow rowKey={item.key} mode={item.type} parentKey={item.parentKey} />
              )}
            </>
          )}
        </S.ListViewRowWrapper>
      ))}
    </S.ListViewWrapper>
  );
};
export const ListView = React.memo(ListViewComponent);
