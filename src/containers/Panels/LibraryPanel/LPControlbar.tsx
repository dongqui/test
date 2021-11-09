import { throttle } from 'lodash';
import { FunctionComponent, useCallback, useMemo, ChangeEvent } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './LPControlbar.module.scss';

const cx = classNames.bind(styles);

interface Props {
  onSearch: (text: string) => void;
}

const LPControlbar: FunctionComponent<Props> = ({ onSearch }) => {
  const search = useMemo(
    () =>
      throttle((value) => {
        onSearch(value);
      }, 200),
    [onSearch],
  );

  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      search(e.currentTarget.value.toLowerCase());
    },
    [search],
  );

  return (
    <div className={cx('wrapper')}>
      <IconWrapper className={cx('icon-search')} icon={SvgPath.Search} />
      <input className={cx('input-search')} placeholder="Search" onChange={handleSearch} />
      <div className={cx('view')}>
        <IconWrapper className={cx('icon-iconview')} icon={SvgPath.IconView} />
        <IconWrapper className={cx('icon-listview')} icon={SvgPath.ListView} />
      </div>
    </div>
  );
};

export default LPControlbar;
