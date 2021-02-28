import { ArrowDown, ArrowDownCircle, ArrowDropdownDown, ArrowExpand } from 'components/Icons';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { rem } from 'utils';
import * as S from './PlayBarStyles';

export interface DropdownProps {
  data: { key: number; name: string; isSelected: boolean }[];
  onSelect: ({ key }: { key: number }) => void;
}

const DropdownComponent: React.FC<DropdownProps> = ({
  data = [
    { key: 0.25, name: '0.25x', isSelected: false },
    { key: 0.5, name: '0.5x', isSelected: false },
    { key: 1, name: '1x', isSelected: true },
    { key: 1.25, name: '1.25x', isSelected: false },
    { key: 11.75, name: '1.75x', isSelected: false },
    { key: 2, name: '2x', isSelected: false },
  ],
  onSelect = () => {},
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | any>(null);
  useOutsideClick({ ref: wrapperRef, event: () => setIsOpen(false) });
  return (
    <div ref={wrapperRef}>
      {isOpen ? (
        _.map(data, (item, index) => (
          <S.DropdownWrapper
            isFirst={_.isEqual(index, 0)}
            isLast={_.isEqual(index, _.size(data) - 1)}
            isSelected={item.isSelected}
            onClick={() => {
              onSelect({ key: item.key });
              setIsOpen(false);
            }}
          >
            <S.IndicatorText marginLeft={rem(12)}>{item.name}</S.IndicatorText>
            {_.isEqual(index, 0) && (
              <ArrowDropdownDown
                width={10}
                height={15}
                viewBox="0 0 10 6"
                style={{ position: 'absolute', right: `${rem(8)}rem` }}
              />
            )}
          </S.DropdownWrapper>
        ))
      ) : (
        <S.DropdownWrapper isBorderRadius={true} onClick={() => setIsOpen(!isOpen)}>
          <S.IndicatorText marginLeft={rem(12)}>
            {_.find(data, ['isSelected', true])?.name}
          </S.IndicatorText>
          <ArrowDropdownDown
            width={10}
            height={15}
            viewBox="0 0 10 6"
            style={{ position: 'absolute', right: `${rem(8)}rem` }}
          />
        </S.DropdownWrapper>
      )}
    </div>
  );
};
export const Dropdown = React.memo(DropdownComponent);
