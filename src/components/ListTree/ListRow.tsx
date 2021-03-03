import { useReactiveVar } from '@apollo/client';
import { ArrowDown, ArrowRight, ModelIcon, Motion } from 'components/Icons';
import { MAIN_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { rem } from 'utils/rem';
import * as S from './ListTreeStyles';

export interface ListRowProps {
  mode: 'folder' | 'file' | 'motion';
  name: string;
  listKey: string;
  motionKey: string;
}

const ListRowComponent: React.FC<ListRowProps> = ({
  mode = 'folder',
  name = 'Model',
  listKey = '0',
  motionKey,
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const isSelected = useMemo(() => _.find(mainData, ['key', listKey])?.isSelected, [
    listKey,
    mainData,
  ]);
  const isVisualized = useMemo(() => _.find(mainData, ['key', listKey])?.isVisualized, [
    listKey,
    mainData,
  ]);
  const onClick = useCallback(() => {
    if (_.isEqual(mode, 'motion')) {
      MAIN_DATA(
        _.map(mainData, (item) => ({
          ...item,
          isSelected: _.isEqual(listKey, item.key) ? true : false,
          selectedMotionKey: motionKey,
        })),
      );
    } else {
      MAIN_DATA(
        _.map(mainData, (item) => ({
          ...item,
          isExpanded: _.isEqual(listKey, item.key) ? !item.isExpanded : item.isExpanded,
          isSelected: _.isEqual(listKey, item.key) ? true : false,
        })),
      );
    }
  }, [listKey, mainData, mode, motionKey]);
  return (
    <>
      {_.isEqual(mode, 'folder') && (
        <S.ListRowWrapper isVisualized={isVisualized} isSelected={isSelected} onClick={onClick}>
          {_.find(mainData, ['key', listKey])?.isExpanded ? (
            <S.ArrowWrapper>
              <ArrowDown width={`${rem(8)}rem`} height={`${rem(4)}rem`} viewBox="0 0 8 4" />
            </S.ArrowWrapper>
          ) : (
            <S.ArrowWrapper>
              <ArrowRight width={`${rem(4)}rem`} height={`${rem(8)}rem`} viewBox="0 0 4 8" />
            </S.ArrowWrapper>
          )}

          <S.ListRowText marginLeft={rem(6)}>{name}</S.ListRowText>
        </S.ListRowWrapper>
      )}
      {_.isEqual(mode, 'file') && (
        <S.ListRowWrapper
          isVisualized={isVisualized}
          paddingLeft={rem(10)}
          isSelected={isSelected}
          onClick={onClick}
        >
          {_.find(mainData, ['key', listKey])?.isExpanded ? (
            <S.ArrowWrapper>
              <ArrowDown width={`${rem(8)}rem`} height={`${rem(4)}rem`} viewBox="0 0 8 4" />
            </S.ArrowWrapper>
          ) : (
            <S.ArrowWrapper>
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
        <S.ListRowWrapper
          isVisualized={isVisualized}
          isSelected={isSelected}
          isSelectedClicked={_.isEqual(
            motionKey,
            _.find(mainData, ['key', listKey])?.selectedMotionKey,
          )}
          isVisualizedSelected={_.isEqual(
            motionKey,
            _.find(mainData, ['key', listKey])?.visualizedMotionKey,
          )}
          onClick={onClick}
        >
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
