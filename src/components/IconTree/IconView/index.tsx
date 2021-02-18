import { mainDataTypes } from 'interfaces';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { INITIAL_MAIN_DATA } from 'utils';
import { useContextmenu } from '../../../hooks/common/useContextmenu';
import { CONTEXTMENU_INFO } from '../../../lib/store';
import { Contextmenu } from '../../Contextmenu';
import { PagesTypes } from '../../Panels/LibraryPanel';
import { Icon } from '../Icon';
import * as S from './IconViewStyles';

export interface IconViewProps {
  width: string;
  height: string;
  backgroundColor?: string;
  pages?: PagesTypes[];
  setPages?: Function;
  data?: mainDataTypes[];
  setData?: Function;
}
export interface onChangeFileNameTypes {
  ({ key, value }: { key: string; value: string }): void;
}

const IconViewComponent: React.FC<IconViewProps> = ({
  width,
  height,
  backgroundColor = 'black',
  pages = [{ key: 'root', name: 'root' }],
  setPages = () => {},
  data = INITIAL_MAIN_DATA,
  setData = () => {},
}) => {
  const iconViewWrapperRef = useRef<HTMLDivElement | any>(null);
  const filteredData: mainDataTypes[] = useMemo(() => {
    return _.filter(data, (o) => _.isEqual(o.parentKey, _.last(pages)?.key));
  }, [data, pages]);
  const onDoubleClickIcon = useCallback(
    ({ key, isChild, name }: { key: string; isChild: boolean; name: string }) => {
      if (!isChild) {
        setPages(_.concat(pages, { key, name }));
      }
    },
    [pages, setPages],
  );
  const onChangeFileName: onChangeFileNameTypes = useCallback(
    ({ key, value }) => {
      const newData: mainDataTypes[] = _.map(data, (item) =>
        _.isEqual(key, item.key) ? { ...item, name: value } : item,
      );
      setData(newData);
    },
    [data, setData],
  );
  const onContextMenu = useCallback(({ top, left }: { top: number; left: number }) => {
    CONTEXTMENU_INFO({
      isShow: true,
      top,
      left,
      data: [
        { key: '0', name: 'Copy' },
        { key: '1', name: 'Paste' },
        { key: '2', name: 'Visualization' },
        { key: '3', name: 'Edit name' },
      ],
    });
  }, []);
  useContextmenu({ targetRef: iconViewWrapperRef, event: onContextMenu });
  return (
    <S.IconViewWrapper
      ref={iconViewWrapperRef}
      width={width}
      height={height}
      backgroundColor={backgroundColor}
    >
      {_.map(filteredData, (item, index) => (
        <Rnd key={index}>
          <S.IconWrapper
            index={index}
            onDoubleClick={() =>
              onDoubleClickIcon({ key: item.key, isChild: item.isChild, name: item.name })
            }
          >
            <Icon
              iconKey={item.key}
              mode={item.isChild ? 'icon' : 'folder'}
              fileName={item.name}
              onChangeFileName={onChangeFileName}
            />
          </S.IconWrapper>
        </Rnd>
      ))}
    </S.IconViewWrapper>
  );
};
export const IconView = React.memo(IconViewComponent);
