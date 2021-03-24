import React from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import * as S from './ExtractStyle';
import { Webcam } from 'containers/Webcam';
import { CutEdit } from 'containers/CutEdit';
import { ExtractPlayBar } from 'containers/ExtractPlayBar';
import { useReactiveVar } from '@apollo/client';
import { storePageInfo } from 'lib/store';
import { DEFAULT_FILE_URL } from 'utils/const';

interface Props {}

const ExtractPage: NextPage<Props> = ({}) => {
  const pageInfo = useReactiveVar(storePageInfo);
  return (
    <main>
      <S.WebcamWrapper>
        <Webcam videoUrl={`${pageInfo?.videoUrl ?? DEFAULT_FILE_URL}`} />
      </S.WebcamWrapper>
      <ExtractPlayBar />
      <S.CutEditWrapper>
        <CutEdit />
      </S.CutEditWrapper>
    </main>
  );
};

export default React.memo(ExtractPage);
