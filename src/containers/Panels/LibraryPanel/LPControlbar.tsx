import { throttle } from 'lodash';
import { FunctionComponent, useRef, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './LPControlbar.module.scss';

const cx = classNames.bind(styles);

interface Props {
  onSearch: (text: string) => void;
}

const LPControlbar: FunctionComponent<Props> = ({ onSearch }) => {
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const currentRef = inputRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.stopPropagation();
    };

    if (currentRef) {
      currentRef.addEventListener('keydown', handleKeyDown);
      currentRef.addEventListener('keyup', handleKeyUp);

      return () => {
        currentRef.removeEventListener('keydown', handleKeyDown);
        currentRef.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, []);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('search-wrapper')}>
        <IconWrapper className={cx('icon-search')} icon={SvgPath.Search} />
        <input className={cx('input-search')} placeholder="Search" onChange={handleSearch} ref={inputRef} />
      </div>
    </div>
  );
};

export default LPControlbar;
