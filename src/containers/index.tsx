import { FunctionComponent, memo } from 'react';

import { RequestNodeResponse } from 'types/LP';
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
  token: string;
  sceneId: string;
  data: RequestNodeResponse[];
}

const Index: FunctionComponent<Props> = ({ browserType, error, token, sceneId, data }) => {
  if (error) {
    return <Authentication statusCode={error.statusCode} message={error.message} />;
  }

  return (
    <main>
      <ResizeProvider>
        <Plask browserType={browserType} token={token} sceneId={sceneId} data={data} />
      </ResizeProvider>
    </main>
  );
};

export default memo(Index);
