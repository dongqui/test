import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { PagesTypes } from '../../Panels/LibraryPanel';
import { Icon } from '../Icon';
import * as S from './IconViewStyles';
import { DUMMY_DATA } from './IconViewStyles';

export interface dataTypes {
  key: string;
  name: string;
  isChild: boolean;
  parentKey?: string;
  isExpanded?: boolean;
}
export interface IconViewProps {
  width: string;
  height: string;
  backgroundColor?: string;
  pages?: PagesTypes[];
  setPages?: Function;
  data?: dataTypes[];
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
  data = DUMMY_DATA,
  setData = () => {},
}) => {
  const iconViewWrapperRef = useRef<HTMLDivElement | any>(null);
  const filteredData: dataTypes[] = useMemo(() => {
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
      const newData: dataTypes[] = _.map(data, (item) =>
        _.isEqual(key, item.key) ? { ...item, name: value } : item,
      );
      setData(newData);
    },
    [data, setData],
  );
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
              width="100%"
              height="100%"
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
