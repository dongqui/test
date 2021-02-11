import _ from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { shortcutTypes } from '../../interfaces';

export const useShortcut = ({
  ref,
  data,
}: {
  ref: React.MutableRefObject<HTMLDivElement>;
  data: shortcutTypes[];
}) => {
  const onKeyPress = useCallback(
    (e) => {
      _.find(data, ['key', e.key])?.event();
    },
    [data],
  );
  useEffect(() => {
    document.addEventListener('keypress', onKeyPress);
    return () => {
      document.removeEventListener('keypress', onKeyPress);
    };
  }, [onKeyPress, ref]);
};
