import _ from 'lodash';
import React from 'react';
import { rem } from 'utils';
import { Dropdown } from './Dropdown';
import { Indicator } from './Indicator';
import { LayerSelect } from './LayerSelect';
import { ModeSelect } from './ModeSelect';
import * as S from './PlayBarStyles';
import { PlayBox } from './PlayBox';

export interface PlayBarProps {}

const PlayBarComponent: React.FC<PlayBarProps> = ({}) => {
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
      <div style={{ position: 'absolute', left: '15%' }}>
        <Indicator end={300} now={100} start={100} />
      </div>
      <div style={{ position: 'absolute', left: '45%', display: 'flex', flexDirection: 'row' }}>
        <PlayBox
          isPlay={false}
          isRange={false}
          onClickPlay={() => {}}
          onClickRange={function noRefCheck() {}}
          onClickStop={function noRefCheck() {}}
        />

        <Dropdown
          data={[
            {
              isSelected: false,
              key: '0.25x',
              name: '0.25x',
            },
            {
              isSelected: false,
              key: '0.5x',
              name: '0.5x',
            },
            {
              isSelected: true,
              key: '1x',
              name: '1x',
            },
            {
              isSelected: false,
              key: '1.25x',
              name: '1.25x',
            },
            {
              isSelected: false,
              key: '1.75x',
              name: '1.75x',
            },
            {
              isSelected: false,
              key: '2x',
              name: '2x',
            },
          ]}
          onSelect={() => {}}
        />
      </div>
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
