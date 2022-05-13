import { Observable } from '@babylonjs/core';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const useObserved = <S>(observable: Observable<S>, action: (payload: S, dispatch: ReturnType<typeof useDispatch>) => void): void => {
  const dispatch = useDispatch();
  useEffect(() => {
    const observer = observable.add((payload: S) => action(payload, dispatch));

    return () => {
      observable.remove(observer);
    };
  }, [observable, action, dispatch]);
};
