import { ProgressiveBar } from 'components/ProgressiveBar';
import { useTimer } from 'hooks/common/useTimer';
import _ from 'lodash';
import React, { useMemo } from 'react';
import * as S from './ModalStyles';

export interface ModalLoadingProps {
  msg: string;
  totalTime: number;
  isActive: boolean;
  onCancel: Function;
}

const ModalLoadingComponent: React.FC<ModalLoadingProps> = ({
  msg = '영상에서 이미지를 추출하고 있습니다.',
  totalTime = 10,
  isActive = false,
  onCancel = () => {},
}) => {
  const { result } = useTimer({ isActive, totalTime });
  const progressRate = useMemo(() => {
    let rate = Math.round((result / totalTime) * 100);
    if (_.gt(rate, 100)) {
      rate = 100;
    }
    return rate;
  }, [result, totalTime]);
  return (
    <S.ModalLoadingWrapper>
      <p>{msg}</p>
      <S.ProgressiveTextWrapper>{progressRate}%</S.ProgressiveTextWrapper>
      <S.ProgressiveBarWrapper>
        <ProgressiveBar isActive={isActive} totalTime={totalTime} />
      </S.ProgressiveBarWrapper>
      <S.CancelTextWrapper onClick={() => onCancel()}>Cancel</S.CancelTextWrapper>
    </S.ModalLoadingWrapper>
  );
};
export const ModalLoading = React.memo(ModalLoadingComponent);
