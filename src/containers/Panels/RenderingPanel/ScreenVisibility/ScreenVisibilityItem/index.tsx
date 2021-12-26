import { FunctionComponent, memo, MouseEventHandler, useCallback } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import { ScreenVisivilityItem } from 'types/RP';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

type Props = ScreenVisivilityItem;

const ScreenVisibilityItem: FunctionComponent<Props> = ({ value, onSelect, checked, active }) => {
  const handleClick: MouseEventHandler<HTMLLIElement> = useCallback(
    (event) => {
      active && onSelect();
    },
    [active, onSelect],
  );

  return (
    <li tabIndex={0} className={cx('wrapper', { inactive: !active })} onClick={handleClick} role="menuitem">
      {checked ? <IconWrapper className={cx('prefix')} icon={SvgPath.CheckThin} /> : <span className={cx('prefix')} />}
      <span className={cx('value')}>{value}</span>
    </li>
  );
};

export default memo(ScreenVisibilityItem);
