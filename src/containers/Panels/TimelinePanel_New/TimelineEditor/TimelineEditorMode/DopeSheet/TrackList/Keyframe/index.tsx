import { memo, useMemo, FunctionComponent } from 'react';

import ScaleLinear from 'utils/ScaleLinear';
import { Keyframe } from 'types/TP_New/keyframe';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props extends Keyframe {
  isLayerKeyframe?: boolean;
}

const KeyframeComponent: FunctionComponent<Props> = (props) => {
  const { timeIndex, isSelected, isLayerKeyframe = false } = props;

  const keyframeAttr = useMemo(() => {
    const scaleX = ScaleLinear.getKeyframeX();
    const x = scaleX(timeIndex);
    return { d: `M${x},0 V${isLayerKeyframe ? 32 : 24}` };
  }, [isLayerKeyframe, timeIndex]);

  return <path className={cx('keyframe', { clicked: isSelected })} d={keyframeAttr.d} />;
};

export default memo(KeyframeComponent);
