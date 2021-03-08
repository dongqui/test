import { useReactiveVar } from '@apollo/client';
import { CircleIcon } from 'components/Icons/generated2/CircleIcon';
import { PauseIcon } from 'components/Icons/generated2/PauseIcon';
import { PlayForwardIcon } from 'components/Icons/generated2/PlayForwardIcon';
import { PlayIcon } from 'components/Icons/generated2/PlayIcon';
import { RangeIcon } from 'components/Icons/generated2/RangeIcon';
import { SquareIcon } from 'components/Icons/generated2/SquareIcon';
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
        <CircleIcon />
      </S.PlayBoxIconWrapper>
      <S.PlayBoxIconWrapper>
        <SquareIcon />
      </S.PlayBoxIconWrapper>
      {renderingData.isPlay ? (
        <S.PlayBoxIconDoubleWrapper
          onClick={() => RENDERING_DATA({ ...renderingData, isPlay: false })}
        >
          <PauseIcon />
        </S.PlayBoxIconDoubleWrapper>
      ) : (
        <>
          <S.PlayBoxIconWrapper
            onClick={() => RENDERING_DATA({ ...renderingData, playDirection: -1, isPlay: true })}
          >
            <PlayForwardIcon />
          </S.PlayBoxIconWrapper>
          <S.PlayBoxIconWrapper
            onClick={() => RENDERING_DATA({ ...renderingData, playDirection: 1, isPlay: true })}
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
