import { FunctionComponent, memo } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './NodeIcon.module.scss';

const cx = classNames.bind(styles);

interface Props {
  icon: LP.NodeType;
  isVisualizedUICondition: boolean;
  isSelected: boolean;
}

const NodeIcon: FunctionComponent<Props> = ({ icon, isVisualizedUICondition, isSelected }) => {
  const classes = cx('icon', {
    visualized: isVisualizedUICondition,
    selected: isSelected,
  });

  return <IconWrapper icon={SvgPath[icon]} className={classes} />;
};

export default memo(NodeIcon);
