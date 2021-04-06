import { useReactiveVar } from '@apollo/client';
import { ArrowBackIcon } from 'components/Icons/generated2/ArrowBackIcon';
import { ArrowForwardIcon } from 'components/Icons/generated2/ArrowForwardIcon';
import { FILE_TYPES, LPModeType } from 'types';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { storeLPMode, storePages } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { PagesType } from '../../Panels/LibraryPanel';
import * as S from './IconPageStyles';

export interface IconPageProps {}
const IconPageComponent: React.FC<IconPageProps> = ({}) => {
  const pages = useReactiveVar(storePages);
  const lpmode = useReactiveVar(storeLPMode);
  const onClick = useCallback(() => {
    if (_.gt(_.size(pages), 1)) {
      storePages(_.filter(pages, (o) => !_.isEqual(o.key, _.last(pages)?.key)));
    }
  }, [pages]);
  return (
    <S.IconPageWrapper>
      <S.ArrowBackWrapper onClick={onClick}>
        <ArrowBackIcon />
      </S.ArrowBackWrapper>
      {_.map(
        _.isEqual(lpmode, LPModeType.iconview)
          ? pages
          : [{ key: ROOT_FOLDER_NAME, name: ROOT_FOLDER_NAME, type: FILE_TYPES.folder }],
        (item: PagesType, index) => (
          <React.Fragment key={index}>
            <S.PageText>{item.name}</S.PageText>
            {!_.isEqual(index, _.size(pages) - 1) && (
              <S.ArrowForwardIconWrapper>
                <ArrowForwardIcon />
              </S.ArrowForwardIconWrapper>
            )}
          </React.Fragment>
        ),
      )}
    </S.IconPageWrapper>
  );
};
export const IconPage = React.memo(IconPageComponent);
