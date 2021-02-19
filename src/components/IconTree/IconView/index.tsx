import { useReactiveVar } from '@apollo/client';
import { mainDataTypes } from 'interfaces';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { MAIN_DATA } from '../../../lib/store';
import { PagesTypes } from '../../Panels/LibraryPanel';
import { Icon } from '../Icon';
import * as S from './IconViewStyles';

export interface IconViewProps {
  width: string;
  height: string;
  backgroundColor?: string;
  pages?: PagesTypes[];
  onClickContextMenu?: ({
    key,
    selectedItemKeys,
  }: {
    key: string;
    selectedItemKeys: string[];
  }) => void;
}
export interface onChangeFileNameTypes {
  ({ key, value }: { key: string; value: string }): void;
}

const IconViewComponent: React.FC<IconViewProps> = ({
  width,
  height,
  backgroundColor = 'black',
  pages = [{ key: 'root', name: 'root' }],
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const [isDraggingItemKeys, setIsDraggingItemKeys] = useState<string[]>([]);
  const iconViewWrapperRef = useRef<HTMLDivElement | any>(null);
  const filteredData: mainDataTypes[] = useMemo(() => {
    return _.filter(mainData, (o) => _.isEqual(o.parentKey, _.last(pages)?.key));
  }, [mainData, pages]);
  const onDragStart = useCallback(
    ({ key }) => {
      setIsDraggingItemKeys(_.concat(isDraggingItemKeys, key));
    },
    [isDraggingItemKeys],
  );
  const onDragStop = useCallback(({ key }) => {
    setIsDraggingItemKeys([]);
  }, []);
  return (
    <S.IconViewWrapper
      ref={iconViewWrapperRef}
      width={width}
      height={height}
      backgroundColor={backgroundColor}
    >
      {_.map(filteredData, (item, index) => (
        <Rnd
          key={index}
          onDragStart={() => onDragStart({ key: item.key })}
          onDragStop={() => onDragStop({ key: item.key })}
        >
          <S.IconWrapper index={index}>
            <Icon
              iconKey={item.key}
              mode={item.isChild ? 'icon' : 'folder'}
              isDragging={_.includes(isDraggingItemKeys, item.key)}
            />
          </S.IconWrapper>
        </Rnd>
      ))}
    </S.IconViewWrapper>
  );
};
export const IconView = React.memo(IconViewComponent);
