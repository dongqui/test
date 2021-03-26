import { DropdownArrowDownIcon } from 'components/Icons/generated2/DropdownArrowDownIcon';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import { rem } from 'utils/rem';
import * as S from './RetargetPanelStyles';

export interface DropdownProps {
  data: { key: number; name: string; isSelected: boolean }[];
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
  width = 64,
  height = 36,
  fontSize = 14,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | any>(null);
  useOutsideClick({ ref: wrapperRef, event: () => setIsOpen(false) });
  return (
    <div ref={wrapperRef}>
      {isOpen ? (
        _.map(data, (item, index) => (
          <S.DropdownWrapper
            width={width}
            height={height}
            isFirst={_.isEqual(index, 0)}
            isLast={_.isEqual(index, _.size(data) - 1)}
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
        ))
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
