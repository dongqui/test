import { FunctionComponent } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './LPControlbar.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const LPControlbar: FunctionComponent<Props> = () => {
  return (
    <div className={cx('wrapper')}>
      <IconWrapper className={cx('icon-search')} icon={SvgPath.Search} />
      <input className={cx('input-search')} placeholder="Search" />
      <div className={cx('view')}>
        <IconWrapper className={cx('icon-iconview')} icon={SvgPath.IconView} />
        <IconWrapper className={cx('icon-listview')} icon={SvgPath.ListView} />
      </div>
    </div>
  );
};

export default LPControlbar;
