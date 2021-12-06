import { FunctionComponent, memo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { ResizeProvider } from 'contexts/LS/ResizeContext';
import { VideoMode } from 'containers/VideoMode';
import Shoot from './Shoot';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export type Procedure = 'service' | 'token' | 'success' | 'denied';

interface Props {
  browserType: string;
}

const Index: FunctionComponent<Props> = ({ browserType }) => {
  const { mode } = useSelector((state: RootState) => state.modeSelection);

  const classes = cx('wrapper', {
    visible: mode === 'animationMode',
    hidden: mode === 'videoMode',
  });

  return (
    <main>
      <ResizeProvider>
        <Shoot className={classes} />
      </ResizeProvider>
      {mode !== 'animationMode' && <VideoMode className={cx('wrapper')} browserType={browserType} />}
    </main>
  );
};

export default memo(Index);
