import { FunctionComponent, memo } from 'react';

import { ResizeProvider } from 'contexts/LS/ResizeContext';

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
  if (error) {
    return <Authentication statusCode={error.statusCode} message={error.message} />;
  }

  return (
    <main>
      <ResizeProvider>
        <Plask browserType={browserType} />
      </ResizeProvider>
    </main>
  );
};

export default memo(Index);
