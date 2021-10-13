import { memo, useMemo, FunctionComponent } from 'react';
import ScaleLinear from 'utils/ScaleLinear';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  timeIndex: number;
  isSelected: boolean;
}

const Keyframe: FunctionComponent<Props> = (props) => {
  const { timeIndex, isSelected } = props;

  const keyframeAttr = useMemo(() => {
    const x = ScaleLinear.getTimeIndexValue(timeIndex);
    return { d: `M${x},0 V32` };
  }, [timeIndex]);

  return <path className={cx('keyframe', { clicked: isSelected })} d={keyframeAttr.d} />;
};

export default memo(Keyframe);
