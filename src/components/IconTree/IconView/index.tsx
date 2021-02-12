import _ from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
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
}
export interface onChangeFileNameTypes {
  ({ key, value }: { key: string; value: string }): void;
}

export const IconView: React.FC<IconViewProps> = ({ width, height, backgroundColor = 'black' }) => {
  const [data, setData] = useState<dataTypes[]>(DUMMY_DATA);
  const iconViewWrapperRef = useRef<HTMLDivElement | any>(null);
  const [pageKeyArray, setPagekeyArray] = useState<string[]>(['root']);
  const filteredData = useMemo(() => {
    let result = _.clone(data);
    if (!_.isEmpty(pageKeyArray)) {
      result = _.filter(result, (o) => _.isEqual(o.parentKey, _.last(pageKeyArray)));
    }
    return result;
  }, [data, pageKeyArray]);
  const onDoubleClickIcon = useCallback(
    ({ key, isChild }: { key: string; isChild: boolean }) => {
      if (!isChild) {
        setPagekeyArray(_.concat(pageKeyArray, key));
      }
    },
    [pageKeyArray],
  );
  const onChangeFileName: onChangeFileNameTypes = useCallback(
    ({ key, value }) => {
      const newData: dataTypes[] = _.map(data, (item) =>
        _.isEqual(key, item.key) ? { ...item, name: value } : item,
      );
      setData(newData);
    },
    [data],
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
            onDoubleClick={() => onDoubleClickIcon({ key: item.key, isChild: item.isChild })}
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
