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

const Rewind: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const currentVisualizedData = useSelector((state) => state.currentVisualizedData);
  const pageInfo = useSelector((state) => state.pageInfo);
  const recordingData = useSelector((state) => state.recordingData);
  const { playState, playDirection } = useSelector((state) => state.animatingData);
  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

  const handleRewind = useCallback(() => {
    if (isShootPage && currentVisualizedData) {
      if (!(playState === 'play' && playDirection === -1)) {
        dispatch(animatingDataActions.setPlayState({ playState: 'play' }));
        dispatch(animatingDataActions.setPlayDirection({ playDirection: -1 }));
      }
    }

    if (!isShootPage) {
      dispatch(recordingDataActions.setRecordingData({ ...recordingData, isPlaying: true }));
    }
  }, [currentVisualizedData, dispatch, isShootPage, playDirection, playState, recordingData]);

  const rewindButtonClasses = cx('rewind', {
    invisible: !isShootPage,
  });

  return (
    <IconWrapper
      className={rewindButtonClasses}
      onClick={handleRewind}
      icon={SvgPath.RewindArrow}
      hasFrame={false}
    />
  );
};

export default Rewind;
