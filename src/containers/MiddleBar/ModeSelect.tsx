import { CameraIcon } from 'components/Icons/generated2/CameraIcon';
import { HorizontalBarIcon } from 'components/Icons/generated2/HorizontalBarIcon';
import { PAGE_NAMES } from 'types';
import _ from 'lodash';
import React from 'react';
import * as S from './PlayBarStyles';
import { storePageInfo } from 'lib/store';

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
      {_.map(data, (item, index) => (
        <S.ModeSelectIconWrapper
          key={index}
          isSelected={item.isSelected}
          onClick={() => onSelect({ key: item.key })}
        >
          {_.isEqual(item.key, 'edit') && <HorizontalBarIcon />}
          {_.isEqual(item.key, 'camera') && (
            <S.CameraIconWrapper
              onClick={() => {
                storePageInfo({ page: PAGE_NAMES.record });
              }}
            >
              <CameraIcon />
            </S.CameraIconWrapper>
          )}
        </S.ModeSelectIconWrapper>
      ))}
    </S.ModeSelectWrapper>
  );
};
export const ModeSelect = React.memo(ModeSelectComponent);
