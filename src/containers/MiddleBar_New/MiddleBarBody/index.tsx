import React, { FunctionComponent } from 'react';
import ChangeModes from './ChangeModes';

interface Props {}

const MiddleBarBody: FunctionComponent<Props> = () => {
  return (
    <div>
      <ChangeModes />
    </div>
  );
};

export default MiddleBarBody;
