import { Camera, HorizontalBar, Layer, Trash } from 'components/Icons';
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
      {_.map(data, (item) => (
        <S.ModeSelectIconWrapper
          isSelected={item.isSelected}
          onClick={() => onSelect({ key: item.key })}
        >
          {_.isEqual(item.key, 'layer') && <Layer width={20} height={20} viewBox="0 0 22 22" />}
          {_.isEqual(item.key, 'trash') && <Trash width={18} height={20} viewBox="0 0 20 22" />}
        </S.ModeSelectIconWrapper>
      ))}
    </S.ModeSelectWrapper>
  );
};
export const LayerSelect = React.memo(LayerSelectComponent);
