import { Pause, Play, PlayBack, Range, Rectangle } from 'components/Icons';
import { Circle } from 'components/Icons/generated/Circle';
import _ from 'lodash';
import React from 'react';
import * as S from './PlayBarStyles';

export interface PlayBoxProps {
  isPlay: boolean;
  isRange: boolean;
  onClickPlay: () => void;
  onClickStop: () => void;
  onClickRange: () => void;
}

const PlayBoxComponent: React.FC<PlayBoxProps> = ({
  isPlay = false,
  isRange = false,
  onClickPlay = () => {},
  onClickStop = () => {},
  onClickRange = () => {},
}) => {
  return (
    <S.PlayBoxWrapper>
      <S.PlayBoxIconWrapper>
        <Circle width={18} height={18} viewBox="0 0 18 18" />
      </S.PlayBoxIconWrapper>
      <S.PlayBoxIconWrapper>
        <Rectangle width={18} height={18} viewBox="0 0 18 18" />
      </S.PlayBoxIconWrapper>
      {isPlay ? (
        <S.PlayBoxIconDoubleWrapper>
          <Pause width={72} height={36} viewBox="0 0 72 36" />
        </S.PlayBoxIconDoubleWrapper>
      ) : (
        <>
          <S.PlayBoxIconWrapper>
            <PlayBack width={20} height={16} viewBox="0 0 16 20" />
          </S.PlayBoxIconWrapper>
          <S.PlayBoxIconWrapper>
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
