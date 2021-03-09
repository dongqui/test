import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import * as S from './ExtractStyle';
import { Webcam } from 'containers/Webcam';

interface Props {}

const ExtractPage: NextPage<Props> = () => {
  return (
    <main>
      <S.WebcamWrapper>
        <Webcam />
      </S.WebcamWrapper>
      <S.CutEditWrapper />
    </main>
  );
};

export default ExtractPage;
