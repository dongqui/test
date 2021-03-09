import { useReactiveVar } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { useContextmenu } from 'hooks/common/useContextmenu';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CONTEXTMENU_INFO, LP_MODE, MAIN_DATA, PAGES, SEARCH_WORD } from '../../../lib/store';
import { Icon } from '../Icon';
import * as S from './IconViewStyles';
import { useShortcut } from 'hooks/common/useShortcut';
import { useLPControl } from 'hooks/LP/useLPControl';

export interface IconViewProps {}
export interface onChangeFileNameTypes {
  ({ key, value }: { key: string; value: string }): void;
}

const IconViewComponent: React.FC<IconViewProps> = ({}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const pages = useReactiveVar(PAGES);
  const searchWord = useReactiveVar(SEARCH_WORD);
  const contextmenuInfo = useReactiveVar(CONTEXTMENU_INFO);
  const lpmode = useReactiveVar(LP_MODE);
  const iconViewWrapperRef = useRef<HTMLDivElement | any>(null);
  const { onClick, onContextMenu, onDragStart, onDrop, shortcutData, filteredData } = useLPControl({
    contextmenuInfo,
    mainData,
    pages,
    searchWord,
    lpmode,
  });
  useContextmenu({ targetRef: iconViewWrapperRef, event: onContextMenu });
  useShortcut({
    data: shortcutData,
  });
  return (
    <S.IconViewWrapper ref={iconViewWrapperRef} onClick={onClick}>
      {_.map(filteredData, (item, index) => (
        <S.IconWrapper
          key={index}
          className="icon"
          id={item.key}
          index={index}
          draggable
          onDragStart={() => onDragStart({ key: item.key })}
          onDrop={() => onDrop({ key: item.key })}
        >
          <Icon rowKey={item.key} mode={item.type} isDragging={item.isDragging} />
        </S.IconWrapper>
      ))}
    </S.IconViewWrapper>
  );
};
export const IconView = React.memo(IconViewComponent);
