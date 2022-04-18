import { FunctionComponent, memo } from 'react';

import { ResizeProvider } from 'contexts/LS/ResizeContext';

import Plask from './Plask';

export type Procedure = 'service' | 'token' | 'success' | 'denied';

interface Props {
  browserType: string;
}

const Index: FunctionComponent<Props> = ({ browserType }) => {
  return (
    <main>
      <ResizeProvider>
        <Plask browserType={browserType} />
      </ResizeProvider>
    </main>
  );
};

export default memo(Index);
