import { useReactiveVar } from '@apollo/client';
import React, { useCallback, useEffect } from 'react';
import { RealtimePage } from '../components/Pages/RealtimePage';
import { isClient } from '../utils';

const IndexPage = () => {
  const onResize = useCallback(() => {}, []);
  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [onResize]);
  return (
    <>
      {isClient ? (
        <RealtimePage width={`${window.innerWidth}px`} height={`${window.innerHeight}px`} />
      ) : (
        <div>로딩중...</div>
      )}
    </>
  );
};

export default IndexPage;
