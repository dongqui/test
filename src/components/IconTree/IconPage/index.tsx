import { useReactiveVar } from '@apollo/client';
import { ArrowBack, ArrowForward } from 'components/Icons';
import { PAGES } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { BACKGROUND_COLOR, LIBRARYPANEL_INFO } from 'styles/common';
import { rem } from 'utils/rem';
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
    <S.IconPageWrapper
      width={LIBRARYPANEL_INFO.widthRem}
      height={rem(48)}
      backgroundColor={BACKGROUND_COLOR}
    >
      <S.ArrowBackWrapper onClick={onClick}>
        <ArrowBack
          style={{ marginLeft: `${rem(22)}rem` }}
          width={`${rem(6)}rem`}
          height={`${rem(10)}rem`}
          viewBox="0 0 6 10"
        />
      </S.ArrowBackWrapper>
      {_.map(pages, (item: PagesTypes, index) => (
        <>
          <S.PageText>{item.name}</S.PageText>
          {!_.isEqual(index, _.size(pages) - 1) && (
            <div style={{ flexBasis: `${rem(5)}rem` }}>
              <ArrowForward
                width={`${rem(5)}rem`}
                height={`${rem(8)}rem`}
                viewBox="0 0 5 8"
                style={{ marginRight: `${rem(8)}rem` }}
              />
            </div>
          )}
        </>
      ))}
    </S.IconPageWrapper>
  );
};
export const IconPage = React.memo(IconPageComponent);
