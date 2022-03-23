import { FunctionComponent, memo, useState } from 'react';

import { ResizeProvider } from 'contexts/LS/ResizeContext';
import { BabylonProvider } from 'contexts/RP/BabylonContext';
import { PlaskEngine } from '3d/PlaskEngine';

import Plask from './Plask';

export type Procedure = 'service' | 'token' | 'success' | 'denied';

interface Props {
  browserType: string;
}

const Index: FunctionComponent<Props> = ({ browserType }) => {
  const [plaskEngine] = useState(new PlaskEngine());

  return (
    <main>
      <ResizeProvider>
        <BabylonProvider plaskEngine={plaskEngine}>
          <Plask browserType={browserType} />
        </BabylonProvider>
      </ResizeProvider>
    </main>
  );
};

export default memo(Index);
