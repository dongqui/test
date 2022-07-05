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
import usePlaskShortcut from 'hooks/common/usePlaskShortcut';
import * as plaskHistoryAction from 'actions/plaskHistoryAction';

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
  usePlaskShortcut(['control', 'z'], (shortcutKeys: string[]) => dispatch(plaskHistoryAction.undo()), { repeatOnHold: false });
  usePlaskShortcut(['control', 'shift', 'z'], (shortcutKeys: string[]) => dispatch(plaskHistoryAction.redo()), { repeatOnHold: false });

  useEffect(() => {
    // is here the best place to connect socket?
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
