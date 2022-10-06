import { FunctionComponent } from 'react';
import classnames from 'classnames/bind';
import styles from './RetargetMapIndicator.module.scss';
import { IconWrapper, SvgPath } from 'components/Icon';

const cx = classnames.bind(styles);

interface Props {
  isMapped: boolean;
}

const RetargetMapIndicator: FunctionComponent<React.PropsWithChildren<Props>> = ({ isMapped }) => {
  const classes = cx('map-indicator', { mapped: isMapped });

  return (
    <div className={cx(classes)}>
      <IconWrapper className={cx('indicate-icon')} icon={isMapped ? SvgPath.CheckThin : SvgPath.Warning} />
      Mapped
    </div>
  );
};

export default RetargetMapIndicator;
