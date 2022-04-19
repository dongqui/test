import { FunctionComponent, memo } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './NodeIcon.module.scss';
import LP from '../../../@types/Container/LP';

const cx = classNames.bind(styles);

interface Props {
  icon: LP.NodeType;
  isVisualizedUICondition: boolean;
  isSelected: boolean;
}

type NodeIcon = 'Mocap' | 'Model' | 'Directory' | 'Motion';

function iconFormat(iconName: LP.NodeType): NodeIcon {
  if (iconName === 'MOCAP') {
    return 'Mocap';
  } else if (iconName === 'MOTION') {
    return 'Motion';
  } else if (iconName === 'DIRECTORY') {
    return 'Directory';
  } else {
    return 'Model';
  }
}

const NodeIcon: FunctionComponent<Props> = ({ icon, isVisualizedUICondition, isSelected }) => {
  const classes = cx('icon', {
    visualized: isVisualizedUICondition,
    selected: isSelected,
  });

  return <IconWrapper icon={SvgPath[iconFormat(icon)]} className={classes} />;
};

export default memo(NodeIcon);
