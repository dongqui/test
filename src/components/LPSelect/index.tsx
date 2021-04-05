import { useReactiveVar } from '@apollo/client';
import { IconviewIcon } from 'components/Icons/generated2/IconviewIcon';
import { ListviewIcon } from 'components/Icons/generated2/ListviewIcon';
import { FILE_TYPES, LPModeType } from 'types';
import { storeLPMode, storeLpData, storePages } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { GRAY500, PRIMARY_BLUE } from 'styles/constants/common';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon } from '../Icons/generated2/PlusIcon';
import * as S from './LPSelectStyles';
import { fnGetFileName } from 'utils/LP/fnGetFileName';

export interface LPSelectProps {}

const LPSelectComponent: React.FC<LPSelectProps> = ({}) => {
  const lpmode = useReactiveVar(storeLPMode);
  const pages = useReactiveVar(storePages);
  const lpData = useReactiveVar(storeLpData);
  const addNewGroup = useCallback(() => {
    storeLpData(
      _.concat(lpData, {
        key: uuidv4(),
        type: FILE_TYPES.folder,
        name: fnGetFileName({ key: '', mainData: lpData, name: 'Folder' }),
        parentKey: _.last(pages)?.key,
        isModifying: true,
      }),
    );
  }, [lpData, pages]);
  return (
    <S.LPSelectWrapper>
      <S.PlusIconWrapper onClick={addNewGroup}>
        <PlusIcon style={{ cursor: 'pointer' }} />
      </S.PlusIconWrapper>
      <S.ViewWrapper>
        <S.IconViewIconWrapper onClick={() => storeLPMode(LPModeType.iconview)}>
          <IconviewIcon
            fillColor={_.isEqual(lpmode, LPModeType.iconview) ? PRIMARY_BLUE : GRAY500}
          />
        </S.IconViewIconWrapper>
        <S.ListViewIconWrapper onClick={() => storeLPMode(LPModeType.listview)}>
          <ListviewIcon
            fillColor={_.isEqual(lpmode, LPModeType.listview) ? PRIMARY_BLUE : GRAY500}
          />
        </S.ListViewIconWrapper>
      </S.ViewWrapper>
    </S.LPSelectWrapper>
  );
};
export const LPSelect = React.memo(LPSelectComponent);
