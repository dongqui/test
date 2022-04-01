import { FunctionComponent, Fragment, useEffect } from 'react';
import AnimationMode from './AnimationMode';
import { VideoMode } from './VideoMode';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import * as socketActions from 'actions/Common/socket';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  browserType: string;
}

const Plask: FunctionComponent<Props> = (props) => {
  const mode = useSelector((state) => state.modeSelection.mode);
  const dispatch = useDispatch();

  const classes = cx('wrapper', {
    visible: mode === 'animationMode',
    hidden: mode === 'videoMode',
  });

  useEffect(() => {
    // is here best place to connect socket?
    dispatch(socketActions.connectSocket.request({ scendId: '', token: '' }));
  }, [dispatch]);

  return (
    <Fragment>
      <AnimationMode className={classes} />
      {mode !== 'animationMode' && <VideoMode className={cx('wrapper')} browserType={props.browserType} />}
    </Fragment>
  );
};

export default Plask;
