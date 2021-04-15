import { DropdownArrowDownIcon } from 'components/Icons/generated2/DropdownArrowDownIcon';
import _ from 'lodash';
import React, { useState } from 'react';
import * as S from './RetargetPanelStyles';

export interface DropdownProps {
  data: { key: number | string; name: string; isSelected: boolean }[];
  onSelect: ({ key }: { key: number }) => void;
  width?: number;
  height?: number;
  fontSize?: number;
}

const DropdownComponent: React.FC<DropdownProps> = ({
  data = [
    { key: 0.25, name: '0.25x', isSelected: false },
    { key: 0.5, name: '0.5x', isSelected: false },
    { key: 1, name: '1x', isSelected: true },
    { key: 1.25, name: '1.25x', isSelected: false },
    { key: 1.75, name: '1.75x', isSelected: false },
    { key: 2, name: '2x', isSelected: false },
  ],
  onSelect = () => {},
  width = 106,
  height = 20,
  fontSize = 2,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      {isOpen ? (
        <S.DropdownParentWrapper height={height * 5}>
          <>
            {_.map(data, (item: any, index) => (
              <S.DropdownWrapper
                key={index}
                width={width}
                height={height}
                isSelected={item.isSelected}
                onClick={() => {
                  onSelect({ key: item.key });
                  setIsOpen(false);
                }}
              >
                <S.IndicatorText marginLeft={12} fontSize={fontSize}>
                  {item.name}
                </S.IndicatorText>
                {_.isEqual(index, 0) && (
                  <S.DropdownArrowDownIconWrapper>
                    <DropdownArrowDownIcon />
                  </S.DropdownArrowDownIconWrapper>
                )}
              </S.DropdownWrapper>
            ))}
          </>
        </S.DropdownParentWrapper>
      ) : (
        <S.DropdownWrapper
          width={width}
          height={height}
          isBorderRadius={true}
          onClick={() => setIsOpen(!isOpen)}
        >
          <S.IndicatorText marginLeft={12} fontSize={fontSize}>
            {_.find(data, ['isSelected', true])?.name}
          </S.IndicatorText>
          <S.DropdownArrowDownIconWrapper>
            <DropdownArrowDownIcon />
          </S.DropdownArrowDownIconWrapper>
        </S.DropdownWrapper>
      )}
    </div>
  );
};
export const Dropdown = React.memo(DropdownComponent);
