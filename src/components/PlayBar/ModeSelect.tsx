import { Camera, HorizontalBar } from 'components/Icons';
import _ from 'lodash';
import React from 'react';
import * as S from './PlayBarStyles';

export interface ModeSelectProps {
  data: { key: string; mode: 'camera' | 'edit'; isSelected: boolean }[];
  onSelect: ({ key }: { key: string }) => void;
}

const ModeSelectComponent: React.FC<ModeSelectProps> = ({
  data = [
    { key: 'edit', mode: 'edit', isSelected: true },
    { key: 'camera', mode: 'camera', isSelected: false },
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
          {_.isEqual(item.key, 'edit') && (
            <HorizontalBar width={22} height={8} viewBox="0 0 24 10" />
          )}
          {_.isEqual(item.key, 'camera') && <Camera width={22} height={18} viewBox="0 0 24 20" />}
        </S.ModeSelectIconWrapper>
      ))}
    </S.ModeSelectWrapper>
  );
};
export const ModeSelect = React.memo(ModeSelectComponent);
