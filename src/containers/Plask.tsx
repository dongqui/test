import { FunctionComponent, Fragment, useEffect } from 'react';
import AnimationMode from './AnimationMode';
import { VideoMode } from './VideoMode';
import { useDispatch } from 'react-redux';

import { tokenManager } from 'api/requestApi';
import { useSelector } from 'reducers';
import * as socketActions from 'actions/Common/socket';
import * as lpActions from 'actions/LP/lpNodeAction';
import { RequestNodeResponse } from 'types/LP';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  browserType: string;
  token: string;
  sceneId: string;
  data: RequestNodeResponse[];
}

const Plask: FunctionComponent<Props> = ({ browserType, sceneId, token, data }) => {
  const mode = useSelector((state) => state.modeSelection.mode);
  const dispatch = useDispatch();

  const classes = cx('wrapper', {
    visible: mode === 'animationMode',
    hidden: mode === 'videoMode',
  });

  useEffect(() => {
    // is here best place to connect socket?
    function initProjectAuth() {
      tokenManager.set(token);
      dispatch(lpActions.setSceneId(sceneId));
      dispatch(socketActions.connectSocket.request({ sceneId, token }));
      dispatch(lpActions.initNodes(data));
    }

    initProjectAuth();
  }, [dispatch, sceneId, token, data]);

  return (
    <Fragment>
      <AnimationMode className={classes} />
      {mode !== 'animationMode' && <VideoMode className={cx('wrapper')} browserType={browserType} />}
    </Fragment>
  );
};

export default Plask;
