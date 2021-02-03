import { useReactiveVar } from '@apollo/client';
import React, { useCallback, useEffect } from 'react';
import { RealtimePage } from '../components/Pages/RealtimePage';
import { SCREEN_SIZE } from '../lib/store';
import { isClient } from '../utils';

const IndexPage = () => {
  const screenSizeInfo = useReactiveVar(SCREEN_SIZE);
  const onResize = useCallback(() => {
    SCREEN_SIZE({ width: window.innerWidth, height: window.innerHeight });
  }, []);
  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [onResize]);
  return (
    <>
      {isClient ? (
        <RealtimePage
          width={`${screenSizeInfo.width}px`}
          height={`${screenSizeInfo.height}px`}
          screenSizeInfo={screenSizeInfo}
        />
      ) : (
        <div>로딩중...</div>
      )}
    </>
  );
};

export default IndexPage;
