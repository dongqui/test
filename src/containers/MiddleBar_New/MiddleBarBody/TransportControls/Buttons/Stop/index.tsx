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

const Stop: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const currentVisualizedData = useSelector((state) => state.currentVisualizedData);
  const pageInfo = useSelector((state) => state.pageInfo);
  const recordingData = useSelector((state) => state.recordingData);
  const { playState, playDirection } = useSelector((state) => state.animatingData);
  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

  // 정지 버튼 클릭 시 재생바 start 로 && current time 과 time index 시작점으로
  const handleStop = useCallback(() => {
    // if (isShootPage) {
    //   if (playState !== 'stop' && currentVisualizedData) {
    //     dispatch(animatingDataActions.setPlayState({ playState: 'stop' }));
    //   }
    //   if (
    //     currentPlayBarTime &&
    //     currentTimeRef &&
    //     currentTimeRef.current &&
    //     currentTimeIndexRef &&
    //     currentTimeIndexRef.current &&
    //     dopeSheetScale &&
    //     dopeSheetScale.current
    //   ) {
    //     if (_.round(startTimeIndex / 30, 4) <= lastTime) {
    //       fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(startTimeIndex / 30, 0)));
    //     } else {
    //       fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(lastTime, 0)));
    //     }
    //     fnSetValue(currentTimeIndexRef, startTimeIndex);
    //     if (currentAction) {
    //       currentAction.time = _.round(startTimeIndex / 30, 4);
    //     }
    //     currentPlayBarTime.current = startTimeIndex;
    //     const xScaleLinear = dopeSheetScale.current as d3ScaleLinear;
    //     d3.select('#play-bar').style(
    //       'transform',
    //       `translate3d(${xScaleLinear(currentPlayBarTime.current) - 10}px,
    //         ${X_AXIS_HEIGHT / 2}px, 0)`,
    //     );
    //   }
    // }
    // if (!isShootPage) {
    //   dispatch(
    //     recordingDataActions.setRecordingData({
    //       ...recordingData,
    //       isPlaying: false,
    //       rangeBoxInfo: {
    //         ...recordingData.rangeBoxInfo,
    //         barX: recordingData.rangeBoxInfo.x + Math.random(),
    //       },
    //     }),
    //   );
    //   dispatch(barPositionXActions.setBarPositionX({ x: recordingData.rangeBoxInfo.x }));
    // }
  }, []);

  return (
    <IconWrapper className={cx('stop')} onClick={handleStop} icon={SvgPath.Stop} hasFrame={false} />
  );
};

export default Stop;
