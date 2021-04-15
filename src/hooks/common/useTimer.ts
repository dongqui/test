import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';

interface useTimerProps {
  isActive: boolean;
  totalTime: number;
}
let time = 0;
let interval: any;
export const useTimer = ({ isActive, totalTime }: useTimerProps) => {
  const [second, setSecond] = useState(0);
  const clearTimeSecond = useCallback(() => {
    setSecond(time);
    clearInterval(interval);
  }, []);
  const addTimeSecond = useCallback(() => {
    time += 1;
    if (_.gt(time, totalTime)) {
      clearTimeSecond();
    } else {
      setSecond(time);
    }
  }, [clearTimeSecond, totalTime]);
  useEffect(() => {
    if (isActive) {
      time = 0;
      interval = setInterval(addTimeSecond, 1000);
    } else {
      clearTimeSecond();
    }
  }, [addTimeSecond, clearTimeSecond, isActive]);
  return {
    result: second,
  };
};
