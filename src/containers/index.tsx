import { FunctionComponent, memo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { ResizeProvider } from 'contexts/LS/ResizeContext';
import { VideoMode } from 'containers/VideoMode';
import Shoot from './Shoot';

export type Procedure = 'service' | 'token' | 'success' | 'denied';

interface Props {
  browserType: string;
}

const Index: FunctionComponent<Props> = ({ browserType }) => {
  const { mode } = useSelector((state: RootState) => state.modeSelection);

  return (
    <main>
      {mode === 'animationMode' ? (
        <ResizeProvider>
          <Shoot />
        </ResizeProvider>
      ) : (
        <VideoMode browserType={browserType} />
      )}
    </main>
  );
};

export default memo(Index);
