import { useReactiveVar } from '@apollo/client';
import { ArrowBackIcon } from 'components/Icons/generated2/ArrowBackIcon';
import { ArrowForwardIcon } from 'components/Icons/generated2/ArrowForwardIcon';
import { LPMODE_TYPES } from 'types';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { LP_MODE, PAGES } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { PagesTypes } from '../../Panels/LibraryPanel';
import * as S from './IconPageStyles';

export interface IconPageProps {}
const IconPageComponent: React.FC<IconPageProps> = ({}) => {
  const pages = useReactiveVar(PAGES);
  const lpmode = useReactiveVar(LP_MODE);
  const onClick = useCallback(() => {
    if (_.gt(_.size(pages), 1)) {
      PAGES(_.filter(pages, (o) => !_.isEqual(o.key, _.last(pages)?.key)));
    }
  }, [pages]);
  return (
    <S.IconPageWrapper>
      <S.ArrowBackWrapper onClick={onClick}>
        <ArrowBackIcon />
      </S.ArrowBackWrapper>
      {_.map(
        _.isEqual(lpmode, LPMODE_TYPES.iconview)
          ? pages
          : [{ key: ROOT_FOLDER_NAME, name: ROOT_FOLDER_NAME }],
        (item: PagesTypes, index) => (
          <>
            <S.PageText>{item.name}</S.PageText>
            {!_.isEqual(index, _.size(pages) - 1) && (
              <S.ArrowForwardIconWrapper>
                <ArrowForwardIcon />
              </S.ArrowForwardIconWrapper>
            )}
          </>
        ),
      )}
    </S.IconPageWrapper>
  );
};
export const IconPage = React.memo(IconPageComponent);
