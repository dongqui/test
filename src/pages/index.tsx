import React from 'react';
import { RealtimePage } from '../components/Pages/RealtimePage';
import { isClient } from '../utils';

const IndexPage = () => {
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
