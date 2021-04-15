import React from 'react';
import { NextPage } from 'next';
import _ from 'lodash';
import * as S from './RecordWebcam/RecordStyle';
import { RecordPlayBar } from 'containers/record/RecordPlayBar';
import Webcam from 'containers/record/RecordWebcam';

interface Props {}

const RecordPage: NextPage<Props> = ({}) => {
  return (
    <main>
      <S.WebcamWrapper>
        <Webcam />
      </S.WebcamWrapper>
      <RecordPlayBar />
      <S.CutEditWrapper />
    </main>
  );
};

export default React.memo(RecordPage);
