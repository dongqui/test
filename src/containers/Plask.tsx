import { FunctionComponent, Fragment, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { changeMode } from 'actions/modeSelection';
import { Box } from 'components/Layout';
import { UpperBar } from 'containers/UpperBar';
import AnimationMode from './AnimationMode';
import VideoMode from './New_VideoMode';

import popupManager from 'utils/PopupManager';
import { tokenManager } from 'api/requestApi';
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
  const { mode } = useSelector((state) => state.modeSelection);
  const dispatch = useDispatch();

  const classes = cx('wrapper', {
    visible: mode === 'animationMode',
    hidden: mode !== 'animationMode',
  });

  const UBProps = {
    height: 36,
  };

  const handleChangeMode = useCallback(() => {
    dispatch(changeMode({ mode: mode === 'animationMode' ? 'videoMode' : 'unmountVideoMode' }));

    if (mode === 'videoMode') {
      return false;
    }
  }, [dispatch, mode]);

  useEffect(() => {
    // is here the best place to connect socket?
    function initProjectAuth() {
      tokenManager.set(token);
      dispatch(lpActions.setSceneId(sceneId));
      dispatch(socketActions.connectSocket.request({ sceneId, token }));
      dispatch(lpActions.initNodes(data));
    }

    initProjectAuth();
    popupManager.init(dispatch);
    popupManager.next();
  }, [dispatch, sceneId, token, data]);

  return (
    <Fragment>
      <Box id="UP" {...UBProps}>
        <UpperBar switchMode={handleChangeMode} defaultMode="EM" />
      </Box>
      <AnimationMode className={classes} />
      {/* {mode !== 'animationMode' && <VideoMode className={cx('wrapper')} browserType={props.browserType} />} */}
      {mode !== 'animationMode' && <VideoMode browserType={browserType} sceneId={sceneId} token={token} />}
    </Fragment>
  );
};

export default Plask;
