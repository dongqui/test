import { useReactiveVar } from '@apollo/client';
import { storeRenderingData } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import { Dropdown } from './Dropdown';
import { Indicator } from './Indicator';
import { LayerSelect } from './LayerSelect';
import { ModeSelect } from './ModeSelect';
import * as S from './PlayBarStyles';
import { PlayBox } from './PlayBox';

export interface PlayBarProps {}

const PlayBarComponent: React.FC<PlayBarProps> = ({}) => {
  const renderingData = useReactiveVar(storeRenderingData);
  return (
    <S.PlayBarWrapper>
      <LayerSelect
        data={[
          {
            isSelected: false,
            key: 'layer',
            mode: 'layer',
          },
          {
            isSelected: true,
            key: 'trash',
            mode: 'trash',
          },
        ]}
        onSelect={() => {}}
      />
      <S.PlayBarIndicatorWrapper>
        <Indicator end={300} now={100} start={100} />
      </S.PlayBarIndicatorWrapper>
      <S.PlayBarPlayBoxWrapper>
        <PlayBox />
        <S.PlayBarDropdownWrapper>
          <Dropdown
            data={[
              {
                isSelected: _.isEqual(renderingData.playSpeed, 0.25),
                key: 0.25,
                name: '0.25x',
              },
              {
                isSelected: _.isEqual(renderingData.playSpeed, 0.5),
                key: 0.5,
                name: '0.5x',
              },
              {
                isSelected: _.isEqual(renderingData.playSpeed, 1),
                key: 1,
                name: '1x',
              },
              {
                isSelected: _.isEqual(renderingData.playSpeed, 1.25),
                key: 1.25,
                name: '1.25x',
              },
              {
                isSelected: _.isEqual(renderingData.playSpeed, 1.75),
                key: 1.75,
                name: '1.75x',
              },
              {
                isSelected: _.isEqual(renderingData.playSpeed, 2),
                key: 2,
                name: '2x',
              },
            ]}
            onSelect={({ key }) => {
              storeRenderingData({ ...renderingData, playSpeed: key });
            }}
          />
        </S.PlayBarDropdownWrapper>
      </S.PlayBarPlayBoxWrapper>
      <ModeSelect
        data={[
          {
            isSelected: true,
            key: 'edit',
            mode: 'edit',
          },
          {
            isSelected: false,
            key: 'camera',
            mode: 'camera',
          },
        ]}
        onSelect={() => {}}
      />
    </S.PlayBarWrapper>
  );
};
export const PlayBar = React.memo(PlayBarComponent);
