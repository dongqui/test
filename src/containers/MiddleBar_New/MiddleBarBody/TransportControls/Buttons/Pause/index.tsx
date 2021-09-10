import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import _ from 'lodash';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animatingDataActions from 'actions/animatingData';
import * as recordingDataActions from 'actions/recordingData';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const Buttons: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const currentVisualizedData = useSelector((state) => state.currentVisualizedData);
  const pageInfo = useSelector((state) => state.pageInfo);
  const recordingData = useSelector((state) => state.recordingData);
  const { playState } = useSelector((state) => state.animatingData);
  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

  const handlePause = useCallback(() => {
    if (isShootPage && currentVisualizedData) {
      if (playState !== 'pause') {
        dispatch(animatingDataActions.setPlayState({ playState: 'pause' }));
      }
    }
    if (!isShootPage) {
      dispatch(
        recordingDataActions.setRecordingData({
          ...recordingData,
          isPlaying: false,
        }),
      );
    }
  }, [currentVisualizedData, dispatch, isShootPage, playState, recordingData]);

  const pauseButtonClasses = cx('pause', {
    center: isShootPage,
  });

  return (
    <IconWrapper
      className={pauseButtonClasses}
      onClick={handlePause}
      icon={SvgPath.Pause}
      hasFrame={false}
    />
  );
};

export default Buttons;
