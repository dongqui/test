import React, { FunctionComponent } from 'react';
import MiddleBarBody from './MiddleBarBody';

interface Props {}

const MiddleBar: FunctionComponent<Props> = () => {
  return (
    <div>
      <MiddleBarBody />
    </div>
  );
};

export default MiddleBar;
