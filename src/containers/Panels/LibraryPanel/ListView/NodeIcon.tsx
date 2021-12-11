import { FunctionComponent, memo } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './NodeIcon.module.scss';

const cx = classNames.bind(styles);

interface Props {
  icon: LP.Node['type'];
}

const NodeIcon: FunctionComponent<Props> = ({ icon }) => {
  return <IconWrapper icon={SvgPath[icon]} className={cx('icon')} />;
};

export default memo(NodeIcon);
