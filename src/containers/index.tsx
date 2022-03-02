import { FunctionComponent, memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import cookie from 'react-cookies';

import * as commonActions from 'actions/Common/globalUI';
import { ResizeProvider } from 'contexts/LS/ResizeContext';
import { VideoMode } from 'containers/VideoMode';
import { RootState, useSelector } from 'reducers';
import { BabylonProvider } from 'contexts/RP/BabylonContext';
import { PlaskEngine } from '3d/PlaskEngine';

import Onboarding from './Onboarding';
import Shoot from './Shoot';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export type Procedure = 'service' | 'token' | 'success' | 'denied';

interface Props {
  browserType: string;
}

const Index: FunctionComponent<Props> = ({ browserType }) => {
  const dispatch = useDispatch();

  const { mode } = useSelector((state: RootState) => state.modeSelection);

  // 접속 후 2초 뒤에 온보딩 쿠키가 없을 경우, 온보딩 ui 출력
  useEffect(() => {
    setTimeout(() => {
      if (!cookie.load('onboarding_1')) {
        dispatch(commonActions.openOnboarding());
      }
    }, 2000);
  }, [dispatch]);

  const [plaskEngine, setPlaskEngine] = useState(new PlaskEngine());

  const classes = cx('wrapper', {
    visible: mode === 'animationMode',
    hidden: mode === 'videoMode',
  });

  return (
    <main>
      <ResizeProvider>
        <BabylonProvider plaskEngine={plaskEngine}>
          <Shoot className={classes} />
        </BabylonProvider>
      </ResizeProvider>
      {mode !== 'animationMode' && <VideoMode className={cx('wrapper')} browserType={browserType} />}
      <Onboarding />
    </main>
  );
};

export default memo(Index);
