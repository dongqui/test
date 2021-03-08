import { useReactiveVar } from '@apollo/client';
import { ArrowBackIcon } from 'components/Icons/generated2/ArrowBackIcon';
import { ArrowForwardIcon } from 'components/Icons/generated2/ArrowForwardIcon';
import { PAGES } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { PagesTypes } from '../../Panels/LibraryPanel';
import * as S from './IconPageStyles';

export interface IconPageProps {}
const IconPageComponent: React.FC<IconPageProps> = ({}) => {
  const pages = useReactiveVar(PAGES);
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
      {_.map(pages, (item: PagesTypes, index) => (
        <>
          <S.PageText>{item.name}</S.PageText>
          {!_.isEqual(index, _.size(pages) - 1) && (
            <S.ArrowForwardIconWrapper>
              <ArrowForwardIcon />
            </S.ArrowForwardIconWrapper>
          )}
        </>
      ))}
    </S.IconPageWrapper>
  );
};
export const IconPage = React.memo(IconPageComponent);
