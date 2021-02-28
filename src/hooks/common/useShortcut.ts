import _ from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { shortcutTypes } from '../../interfaces';

export const useShortcut = ({ data }: { data: shortcutTypes[] }) => {
  const onKeyPress = useCallback(
    (e) => {
      if (_.find(data, ['key', e.key])?.ctrlKey) {
        if (!e.ctrlKey) {
          return;
        }
      }
      _.find(data, ['key', e.key])?.event();
    },
    [data],
  );
  useEffect(() => {
    document.addEventListener('keyup', onKeyPress);
    return () => {
      document.removeEventListener('keyup', onKeyPress);
    };
  }, [onKeyPress]);
};
