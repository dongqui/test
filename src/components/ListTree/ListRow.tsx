import { ArrowDown, ArrowRight, ModelIcon, Motion } from 'components/Icons';
import _ from 'lodash';
import React from 'react';
import { rem } from 'utils';
import * as S from './ListTreeStyles';

export interface ListRowProps {
  mode: 'folder' | 'file' | 'motion';
  name: string;
  isExpanded?: boolean;
  isSelected?: boolean;
}

const ListRowComponent: React.FC<ListRowProps> = ({
  mode = 'folder',
  name = 'Model',
  isExpanded = false,
  isSelected = false,
}) => {
  return (
    <>
      {_.isEqual(mode, 'folder') && (
        <S.ListRowWrapper isSelected={isSelected}>
          {isExpanded ? (
            <ArrowDown width={`${rem(8)}rem`} height={`${rem(4)}rem`} viewBox="0 0 8 4" />
          ) : (
            <ArrowRight width={`${rem(4)}rem`} height={`${rem(8)}rem`} viewBox="0 0 4 8" />
          )}

          <S.ListRowText marginLeft={rem(6)}>{name}</S.ListRowText>
        </S.ListRowWrapper>
      )}
      {_.isEqual(mode, 'file') && (
        <S.ListRowWrapper isSelected={isSelected} paddingLeft={rem(10)}>
          {isExpanded ? (
            <ArrowDown width={`${rem(8)}rem`} height={`${rem(4)}rem`} viewBox="0 0 8 4" />
          ) : (
            <ArrowRight width={`${rem(4)}rem`} height={`${rem(8)}rem`} viewBox="0 0 4 8" />
          )}
          <ModelIcon
            width={`${rem(12)}rem`}
            height={`${rem(12)}rem`}
            viewBox="0 0 12 12"
            style={{ marginLeft: `${rem(7)}rem` }}
          />
          <S.ListRowText marginLeft={rem(11)}>{name}</S.ListRowText>
        </S.ListRowWrapper>
      )}
      {_.isEqual(mode, 'motion') && (
        <S.ListRowWrapper isSelected={isSelected}>
          <Motion
            width={24}
            height={24}
            viewBox="0 0 24 24"
            style={{ marginLeft: `${rem(49)}rem` }}
          />
          <S.ListRowText marginLeft={rem(6)}>{name}</S.ListRowText>
        </S.ListRowWrapper>
      )}
    </>
  );
};
export const ListRow = React.memo(ListRowComponent);
