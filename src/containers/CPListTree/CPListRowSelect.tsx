import _ from 'lodash';
import React from 'react';
import { CPSelectButton } from './CPSelectButton';
import * as S from './CPListTreeStyles';
import { CP_BUTTONINFO_TYPES } from 'interfaces/CP';

export interface CPListRowSelectProps {
  text: string;
  buttonInfo?: CP_BUTTONINFO_TYPES[];
}

const CPListRowSelectComponent: React.FC<CPListRowSelectProps> = ({
  text = 'Axis',
  buttonInfo = [],
}) => {
  return (
    <S.CPListRowInputWrapper>
      {text}
      <S.CPListRowInputsWrapper>
        {_.map(buttonInfo, (item) => (
          <CPSelectButton isSelected={item.isSelected} onClick={() => {}} text={item.name} />
        ))}
      </S.CPListRowInputsWrapper>
    </S.CPListRowInputWrapper>
  );
};
export const CPListRowSelect = React.memo(CPListRowSelectComponent);
