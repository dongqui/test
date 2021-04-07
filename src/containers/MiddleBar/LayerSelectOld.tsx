import { LayerIcon } from 'components/Icons/generated2/LayerIcon';
import { TrashIcon } from 'components/Icons/generated2/TrashIcon';
import _ from 'lodash';
import React from 'react';
import * as S from './PlayBarStyles';

export interface LayerSelectProps {
  data: { key: string; mode: 'layer' | 'trash'; isSelected: boolean }[];
  onSelect: ({ key }: { key: string }) => void;
}

const LayerSelectComponent: React.FC<LayerSelectProps> = ({
  data = [
    { key: 'layer', mode: 'layer', isSelected: true },
    { key: 'trash', mode: 'trash', isSelected: false },
  ],
  onSelect = () => {},
}) => {
  return (
    <S.ModeSelectWrapper>
      {_.map(data, (item, index) => (
        <S.ModeSelectIconWrapper
          key={index}
          isSelected={item.isSelected}
          onClick={() => onSelect({ key: item.key })}
        >
          {_.isEqual(item.key, 'layer') && <LayerIcon />}
          {_.isEqual(item.key, 'trash') && <TrashIcon />}
        </S.ModeSelectIconWrapper>
      ))}
    </S.ModeSelectWrapper>
  );
};
export const LayerSelect = React.memo(LayerSelectComponent);
