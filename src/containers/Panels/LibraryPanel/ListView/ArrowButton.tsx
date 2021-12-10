import { memo, forwardRef } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './ArrowButton.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isOpen?: boolean;
}

const ArrowButton = forwardRef<HTMLDivElement, Props>(({ isOpen }, ref) => {
  const icon = isOpen ? SvgPath.ArrowOpen : SvgPath.ArrowClose;

  return (
    <div className="ArrowButton_wrapper" ref={ref}>
      <IconWrapper icon={icon} className={cx('icon')} />
    </div>
  );
});

ArrowButton.displayName = 'ArrowButton';

export default memo(ArrowButton);
