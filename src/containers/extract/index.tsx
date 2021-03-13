import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import * as S from './ExtractStyle';
import { Webcam } from 'containers/Webcam';
import { CutEdit } from 'containers/CutEdit';
import { PlayBar } from 'containers/RecordPlayBar';
import { useRouter } from 'next/dist/client/router';

interface Props {}

const ExtractPage: NextPage<Props> = ({}) => {
  const router = useRouter();
  return (
    <main>
      <S.WebcamWrapper>
        <Webcam videoUrl={`${router.query?.videoUrl ?? '/video/exo.mp4'}`} />
      </S.WebcamWrapper>
      <PlayBar />
      <S.CutEditWrapper>
        <CutEdit />
      </S.CutEditWrapper>
    </main>
  );
};

export default ExtractPage;
