import { useReactiveVar } from '@apollo/client';
import { Pause, Play, PlayBack, Range, Rectangle } from 'components/Icons';
import { Circle } from 'components/Icons/generated/Circle';
import { RENDERING_DATA } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import * as S from './PlayBarStyles';

export interface PlayBoxProps {}

const PlayBoxComponent: React.FC<PlayBoxProps> = ({}) => {
  const renderingData = useReactiveVar(RENDERING_DATA);
  return (
    <S.PlayBoxWrapper>
      <S.PlayBoxIconWrapper>
        <Circle width={18} height={18} viewBox="0 0 18 18" />
      </S.PlayBoxIconWrapper>
      <S.PlayBoxIconWrapper>
        <Rectangle width={18} height={18} viewBox="0 0 18 18" />
      </S.PlayBoxIconWrapper>
      {renderingData.isPlay ? (
        <S.PlayBoxIconDoubleWrapper
          onClick={() => RENDERING_DATA({ ...renderingData, isPlay: false })}
        >
          <Pause width={72} height={36} viewBox="0 0 72 36" />
        </S.PlayBoxIconDoubleWrapper>
      ) : (
        <>
          <S.PlayBoxIconWrapper
            onClick={() => RENDERING_DATA({ ...renderingData, playDirection: -1, isPlay: true })}
          >
            <PlayBack width={20} height={16} viewBox="0 0 16 20" />
          </S.PlayBoxIconWrapper>
          <S.PlayBoxIconWrapper
            onClick={() => RENDERING_DATA({ ...renderingData, playDirection: 1, isPlay: true })}
          >
            <Play width={20} height={16} viewBox="0 0 16 20" />
          </S.PlayBoxIconWrapper>
        </>
      )}
      <S.PlayBoxIconWrapper>
        <Range width={36} height={36} viewBox="0 0 36 36" />
      </S.PlayBoxIconWrapper>
    </S.PlayBoxWrapper>
  );
};
export const PlayBox = React.memo(PlayBoxComponent);
