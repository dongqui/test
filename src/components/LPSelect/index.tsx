import { useReactiveVar } from '@apollo/client';
import { IconviewIcon } from 'components/Icons/generated2/IconviewIcon';
import { ListviewIcon } from 'components/Icons/generated2/ListviewIcon';
import { FILE_TYPES, LPMODE_TYPES } from 'interfaces';
import { LP_MODE, MAIN_DATA, PAGES } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { GRAY500, PRIMARY_BLUE } from 'styles/constants/common';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon } from '../Icons/generated2/PlusIcon';
import * as S from './LPSelectStyles';

export interface LPSelectProps {}

const LPSelectComponent: React.FC<LPSelectProps> = ({}) => {
  const lpmode = useReactiveVar(LP_MODE);
  const pages = useReactiveVar(PAGES);
  const mainData = useReactiveVar(MAIN_DATA);
  const addNewGroup = useCallback(() => {
    MAIN_DATA(
      _.concat(mainData, {
        key: uuidv4(),
        type: FILE_TYPES.folder,
        name: 'Folder',
        parentKey: _.last(pages)?.key,
        isModifying: true,
      }),
    );
  }, [mainData, pages]);
  return (
    <S.LPSelectWrapper>
      <S.PlusIconWrapper onClick={addNewGroup}>
        <PlusIcon style={{ cursor: 'pointer' }} />
      </S.PlusIconWrapper>
      <S.ViewWrapper>
        <S.IconViewIconWrapper onClick={() => LP_MODE(LPMODE_TYPES.iconview)}>
          <IconviewIcon
            fillColor={_.isEqual(lpmode, LPMODE_TYPES.iconview) ? PRIMARY_BLUE : GRAY500}
          />
        </S.IconViewIconWrapper>
        <S.ListViewIconWrapper onClick={() => LP_MODE(LPMODE_TYPES.listview)}>
          <ListviewIcon
            fillColor={_.isEqual(lpmode, LPMODE_TYPES.listview) ? PRIMARY_BLUE : GRAY500}
          />
        </S.ListViewIconWrapper>
      </S.ViewWrapper>
    </S.LPSelectWrapper>
  );
};
export const LPSelect = React.memo(LPSelectComponent);
