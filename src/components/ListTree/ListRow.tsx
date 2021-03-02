import { useReactiveVar } from '@apollo/client';
import { ArrowDown, ArrowRight, ModelIcon, Motion } from 'components/Icons';
import { MAIN_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { rem } from 'utils/rem';
import * as S from './ListTreeStyles';

export interface ListRowProps {
  mode: 'folder' | 'file' | 'motion';
  name: string;
  listKey: string;
}

const ListRowComponent: React.FC<ListRowProps> = ({
  mode = 'folder',
  name = 'Model',
  listKey = '0',
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const onClick = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isSelected: _.isEqual(listKey, item.key) ? true : item.isSelected,
      })),
    );
  }, [listKey, mainData]);
  const onClickArrow = useCallback(
    (e) => {
      e.stopPropagation();
      MAIN_DATA(
        _.map(mainData, (item) => ({
          ...item,
          isExpanded: _.isEqual(listKey, item.key) ? !item.isExpanded : item.isExpanded,
        })),
      );
    },
    [listKey, mainData],
  );
  return (
    <>
      {_.isEqual(mode, 'folder') && (
        <S.ListRowWrapper
          isSelected={_.find(mainData, ['key', listKey])?.isSelected}
          onClick={onClick}
        >
          {_.find(mainData, ['key', listKey])?.isExpanded ? (
            <S.ArrowWrapper onClick={onClickArrow}>
              <ArrowDown width={`${rem(8)}rem`} height={`${rem(4)}rem`} viewBox="0 0 8 4" />
            </S.ArrowWrapper>
          ) : (
            <S.ArrowWrapper onClick={onClickArrow}>
              <ArrowRight width={`${rem(4)}rem`} height={`${rem(8)}rem`} viewBox="0 0 4 8" />
            </S.ArrowWrapper>
          )}

          <S.ListRowText marginLeft={rem(6)}>{name}</S.ListRowText>
        </S.ListRowWrapper>
      )}
      {_.isEqual(mode, 'file') && (
        <S.ListRowWrapper
          isSelected={_.find(mainData, ['key', listKey])?.isSelected}
          paddingLeft={rem(10)}
          onClick={onClick}
        >
          {_.find(mainData, ['key', listKey])?.isExpanded ? (
            <S.ArrowWrapper onClick={onClickArrow}>
              <ArrowDown width={`${rem(8)}rem`} height={`${rem(4)}rem`} viewBox="0 0 8 4" />
            </S.ArrowWrapper>
          ) : (
            <S.ArrowWrapper onClick={onClickArrow}>
              <ArrowRight width={`${rem(4)}rem`} height={`${rem(8)}rem`} viewBox="0 0 4 8" />
            </S.ArrowWrapper>
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
        <S.ListRowWrapper>
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
