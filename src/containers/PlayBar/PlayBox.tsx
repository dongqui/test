import { useReactiveVar } from '@apollo/client';
import { CircleIcon } from 'components/Icons/generated2/CircleIcon';
import { PauseIcon } from 'components/Icons/generated2/PauseIcon';
import { PlayForwardIcon } from 'components/Icons/generated2/PlayForwardIcon';
import { PlayIcon } from 'components/Icons/generated2/PlayIcon';
import { RangeIcon } from 'components/Icons/generated2/RangeIcon';
import { SquareIcon } from 'components/Icons/generated2/SquareIcon';
import { storeAnimatingData } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import * as S from './PlayBarStyles';

export interface PlayBoxProps {}

const PlayBoxComponent: React.FC<PlayBoxProps> = ({}) => {
  const animatingData = useReactiveVar(storeAnimatingData);
  return (
    <S.PlayBoxWrapper>
      <S.PlayBoxIconWrapper>
        <CircleIcon />
      </S.PlayBoxIconWrapper>
      <S.PlayBoxIconWrapper>
        <SquareIcon />
      </S.PlayBoxIconWrapper>
      {animatingData.isPlaying ? (
        <S.PlayBoxIconDoubleWrapper
          onClick={() => storeAnimatingData({ ...animatingData, isPlaying: false })}
        >
          <PauseIcon />
        </S.PlayBoxIconDoubleWrapper>
      ) : (
        <>
          <S.PlayBoxIconWrapper
            onClick={() =>
              storeAnimatingData({ ...animatingData, playDirection: -1, isPlaying: true })
            }
          >
            <PlayForwardIcon />
          </S.PlayBoxIconWrapper>
          <S.PlayBoxIconWrapper
            onClick={() =>
              storeAnimatingData({ ...animatingData, playDirection: 1, isPlaying: true })
            }
          >
            <PlayIcon />
          </S.PlayBoxIconWrapper>
        </>
      )}
      <S.PlayBoxIconWrapper>
        <RangeIcon />
      </S.PlayBoxIconWrapper>
    </S.PlayBoxWrapper>
  );
};
export const PlayBox = React.memo(PlayBoxComponent);
