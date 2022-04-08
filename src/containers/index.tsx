import { FunctionComponent, memo, useState } from 'react';

import { ResizeProvider } from 'contexts/LS/ResizeContext';
import { BabylonProvider } from 'contexts/RP/BabylonContext';
import { PlaskEngine } from '3d/PlaskEngine';

import { Authentication } from 'containers/Error';

import Plask from './Plask';

interface Props {
  browserType: string;
  error: {
    statusCode: 401.1 | 401.2 | 400 | 400.7;
    message: string;
    timestamp: string;
    path: string;
  };
}

const Index: FunctionComponent<Props> = ({ browserType, error }) => {
  const [plaskEngine] = useState(new PlaskEngine());

  if (error) {
    return <Authentication statusCode={error.statusCode} message={error.message} />;
  }

  return (
    <ResizeProvider>
      <BabylonProvider plaskEngine={plaskEngine}>
        <Plask browserType={browserType} />
      </BabylonProvider>
    </ResizeProvider>
  );
};

export default memo(Index);
