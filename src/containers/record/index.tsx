import React from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import * as S from '../RecordWebcam/RecordStyle';
import { RecordPlayBar } from 'containers/RecordPlayBar';
import Webcam from 'containers/RecordWebcam';

interface Props {}

const RecordPage: NextPage<Props> = ({}) => {
  return (
    <main>
      <S.WebcamWrapper>
        <Webcam />
      </S.WebcamWrapper>
      <RecordPlayBar />
      <S.CutEditWrapper></S.CutEditWrapper>
    </main>
  );
};

export default React.memo(RecordPage);
