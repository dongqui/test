import { memo, useCallback, useMemo, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { SelectedKeyframe, Keyframe } from 'types/TP_New/keyframe';
import { selectKeyframes } from 'actions/keyframes';
import { ScaleLinear } from 'utils/TP';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props extends SelectedKeyframe, Keyframe {
  trackType: 'layer' | 'bone' | 'transform';
}

const KeyframeComponent: FunctionComponent<Props> = (props) => {
  const { trackIndex, timeIndex, isSelected, trackType, trackId } = props;
  const dispatch = useDispatch();

  // 키프레임 속성 값 관리
  const keyframeAttr = useMemo(() => {
    const scaleX = ScaleLinear.getKeyframeX();
    const x = scaleX(timeIndex);
    const height = trackType === 'layer' ? 32 : 24;
    return { d: `M${x},0 V${height}` };
  }, [timeIndex, trackType]);

  // 키프레임 클릭
  const clickKeyframe = useCallback(
    (event: React.MouseEvent<Element>) => {
      dispatch(
        selectKeyframes({
          selectedKeyframes: { timeIndex, trackIndex, trackId },
          selectType: event.ctrlKey ? 'multiple' : 'left',
          trackType,
        }),
      );
    },
    [dispatch, timeIndex, trackId, trackIndex, trackType],
  );

  return (
    <path
      className={cx('keyframe', { clicked: isSelected })}
      d={keyframeAttr.d}
      onClick={clickKeyframe}
    />
  );
};

export default memo(KeyframeComponent);
