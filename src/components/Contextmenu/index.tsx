import _ from 'lodash';
import React, { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import * as S from './ContextmenuStyles';

export interface ContextmenuDataTypes {
  key: string;
  value: string;
  isSelected?: boolean;
}
export interface ContextmeneuProps {
  width: string;
  height: string;
  backgroundColor?: string;
  data?: ContextmenuDataTypes[];
  onClick?: ({ key }: { key: string }) => void;
}

const ContextmenuComponent: React.FC<ContextmeneuProps> = ({
  width,
  height,
  backgroundColor = 'black',
  data = [
    { key: '0', value: 'Copy' },
    { key: '1', value: 'Paste' },
    { key: '2', value: 'Visualization' },
    { key: '3', value: 'Edit name' },
  ],
  onClick = () => {},
}) => {
  return (
    <S.ContextmenuWrapper width={width} backgroundColor={backgroundColor}>
      {_.map(data as ContextmenuDataTypes[], (item, index) => (
        <S.RowWrapper key={index} height={height} onClick={() => onClick({ key: item.key })}>
          {item.value}
        </S.RowWrapper>
      ))}
    </S.ContextmenuWrapper>
  );
};
export const Contextmenu = React.memo(ContextmenuComponent);
