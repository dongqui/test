import { useReactiveVar } from '@apollo/client';
import { useContextmenu } from 'hooks/common/useContextmenu';
import { useShortcut } from 'hooks/common/useShortcut';
import { useLPControl } from 'hooks/LP/useLPControl';
import { CONTEXTMENU_INFO, MAIN_DATA, PAGES, SEARCH_WORD } from 'lib/store';
import _ from 'lodash';
import React, { useRef } from 'react';
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
  const listViewWrapperRef = useRef<HTMLDivElement>(null);
  const {
    onClick,
    onContextMenu,
    onCopy,
    onDragStart,
    onDragStop,
    onDrop,
    onEdit,
    onPaste,
    shortcutData,
  } = useLPControl({ contextmenuInfo, mainData, pages });
  useContextmenu({ targetRef: listViewWrapperRef, event: onContextMenu });
  useShortcut({
    data: shortcutData,
  });
  console.log('mainData', mainData);
  return (
    <S.ListViewWrapper ref={listViewWrapperRef} width={width} height={height}>
      {_.map(mainData, (item, index) => (
        <div key={index} className="icon">
          <ListRow
            listKey={item.key}
            mode={item.type}
            name={item.name}
            parentKey={item.parentKey}
          />
        </div>
      ))}
    </S.ListViewWrapper>
  );
};
export const ListView = React.memo(ListViewComponent);
