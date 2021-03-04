import React from 'react';
import { isClient } from 'utils/const';
import { RealtimePage } from '../components/Pages/RealtimePage';

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
