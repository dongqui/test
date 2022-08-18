import { FunctionComponent, Fragment, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { changeMode } from 'actions/modeSelection';
import { Box } from 'components/Layout';
import { UpperBar } from 'containers/UpperBar';
import AnimationMode from './AnimationMode';
import VideoMode from './New_VideoMode';

import popupManager from 'utils/PopupManager';
import planManager from 'utils/PlanManager';
import * as socketActions from 'actions/Common/socket';
import * as lpActions from 'actions/LP/lpNodeAction';
import { RequestNodeResponse } from 'types/LP';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import usePlaskShortcut from 'hooks/common/usePlaskShortcut';
import * as keyframeActions from 'actions/keyframes';

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

  /**
   * shortcuts related to editing keyframes
   */
  usePlaskShortcut(
    ['k'],
    () => {
      console.log('Keyframe Added');
      dispatch(keyframeActions.editKeyframesSocket.request());
    },
    { repeatOnHold: false },
  );

  const UBProps = {
    height: 48,
  };

  const handleChangeMode = useCallback(() => {
    dispatch(changeMode({ mode: mode === 'animationMode' ? 'videoMode' : 'unmountVideoMode', videoURL: undefined }));

    if (mode === 'videoMode') {
      return false;
    }
  }, [dispatch, mode]);

  useEffect(() => {
    // is here the best place to connect socket?
    function initProjectAuth() {
      dispatch(lpActions.setSceneId(sceneId));
      dispatch(socketActions.connectSocket.request({ sceneId, token }));
      dispatch(lpActions.initNodes(data));
    }

    initProjectAuth();
    planManager.init(dispatch);
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
