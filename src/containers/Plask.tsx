import { FunctionComponent, Fragment, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { changeMode } from 'actions/modeSelection';
import { Box } from 'components/Layout';
import { UpperBar } from 'containers/UpperBar';
import AnimationMode from './AnimationMode';
import VideoMode from './New_VideoMode';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  browserType: string;
}

const Plask: FunctionComponent<Props> = (props) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.modeSelection);

  const classes = cx('wrapper', {
    visible: mode === 'animationMode',
    hidden: mode !== 'animationMode',
  });

  const UBProps = {
    height: 36,
  };

  const handleChangeMode = useCallback(() => {
    dispatch(changeMode({ mode: mode === 'animationMode' ? 'videoMode' : 'unmountVideoMode' }));
  }, [dispatch, mode]);

  return (
    <Fragment>
      <Box id="UP" {...UBProps}>
        <UpperBar switchMode={handleChangeMode} defaultMode="EM" />
      </Box>
      <AnimationMode className={classes} />
      {/* {mode !== 'animationMode' && <VideoMode className={cx('wrapper')} browserType={props.browserType} />} */}
      {mode !== 'animationMode' && <VideoMode browserType={props.browserType} />}
    </Fragment>
  );
};

export default Plask;
