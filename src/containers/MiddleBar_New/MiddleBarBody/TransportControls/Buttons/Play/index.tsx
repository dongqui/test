import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import _ from 'lodash';
import { IconWrapper, SvgPath } from 'components/Icon';
import { MODAL_TYPES, PAGE_NAMES } from 'types';
import * as animatingDataActions from 'actions/animatingData';
import * as recordingDataActions from 'actions/recordingData';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const Play: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const currentVisualizedData = useSelector((state) => state.currentVisualizedData);
  const pageInfo = useSelector((state) => state.pageInfo);
  const recordingData = useSelector((state) => state.recordingData);
  const { playState, playDirection } = useSelector((state) => state.animatingData);
  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

  const handlePlay = useCallback(() => {
    if (isShootPage && currentVisualizedData) {
      if (!(playState === 'play' && playDirection === 1)) {
        dispatch(animatingDataActions.setPlayState({ playState: 'play' }));
        dispatch(animatingDataActions.setPlayDirection({ playDirection: 1 }));
      }
    }

    if (_.isEqual(pageInfo.page, PAGE_NAMES.extract)) {
      dispatch(recordingDataActions.setRecordingData({ ...recordingData, isPlaying: true }));
    }
  }, [
    currentVisualizedData,
    dispatch,
    isShootPage,
    pageInfo.page,
    playDirection,
    playState,
    recordingData,
  ]);

  return (
    <IconWrapper
      className={cx('play')}
      onClick={handlePlay}
      icon={SvgPath.PlayArrow}
      hasFrame={false}
    />
  );
};

export default Play;
