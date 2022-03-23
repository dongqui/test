import { FunctionComponent, Fragment } from 'react';
import AnimationMode from './AnimationMode';
import { VideoMode } from './VideoMode';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { useSelector } from 'reducers';

const cx = classNames.bind(styles);

interface Props {
  browserType: string;
}

const Plask: FunctionComponent<Props> = (props) => {
  const mode = useSelector((state) => state.modeSelection.mode);

  const classes = cx('wrapper', {
    visible: mode === 'animationMode',
    hidden: mode === 'videoMode',
  });

  return (
    <Fragment>
      <AnimationMode className={classes} />
      {mode !== 'animationMode' && <VideoMode className={cx('wrapper')} browserType={props.browserType} />}
    </Fragment>
  );
};

export default Plask;
