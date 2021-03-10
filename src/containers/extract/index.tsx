import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import * as S from './ExtractStyle';
import { Webcam } from 'containers/Webcam';
import { useReactiveVar } from '@apollo/client';
import { RECORDING_DATA } from 'lib/store';

interface Props {}

const ExtractPage: NextPage<Props> = () => {
  const recordingData = useReactiveVar(RECORDING_DATA);
  return (
    <main>
      <S.WebcamWrapper>
        <Webcam videoUrl={recordingData.videoUrl} />
      </S.WebcamWrapper>
      <S.CutEditWrapper />
    </main>
  );
};

export default ExtractPage;
