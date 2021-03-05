import { useReactiveVar } from '@apollo/client';
import { useContextmenu } from 'hooks/common/useContextmenu';
import { useShortcut } from 'hooks/common/useShortcut';
import { useLPControl } from 'hooks/LP/useLPControl';
import { MAINDATA_PROPERTY_TYPES } from 'interfaces';
import { ROOT_FOLDER_NAME } from 'interfaces/LP';
import { CONTEXTMENU_INFO, LP_MODE, MAIN_DATA, PAGES, SEARCH_WORD } from 'lib/store';
import _ from 'lodash';
import React, { useMemo, useRef } from 'react';
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
  const {
    onContextMenu,
    shortcutData,
    filteredData,
    onDragStart,
    onDragStop,
    onDrop,
  } = useLPControl({
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
  return (
    <S.ListViewWrapper ref={listViewWrapperRef} width={width} height={height}>
      {_.map(filteredData, (item, index) => (
        <S.ListViewRowWrapper
          key={index}
          className="icon"
          draggable
          onDragStart={() => onDragStart({ key: item.key })}
          onDragEnd={onDragStop}
          onDrop={() => onDrop({ key: item.key })}
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
