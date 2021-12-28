import { FunctionComponent, memo, useEffect, useRef, useState } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import { ScreenVisivilityItem } from 'types/RP';
import ScreenVisibilityItem from './ScreenVisibilityItem';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  itemList: ScreenVisivilityItem[];
}

const ScreenVisibility: FunctionComponent<Props> = ({ itemList }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggleButtonClick = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleOutSideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('click', handleOutSideClick);

    return () => {
      window.removeEventListener('click', handleOutSideClick);
    };
  }, []);

  return (
    <div className={cx('wrapper')} ref={wrapperRef}>
      <div className={cx('header', { open: isOpen })}>
        <button type="button" className={cx('toggle-button')} onClick={handleToggleButtonClick}>
          <IconWrapper className={cx('eye')} icon={SvgPath.EyeOpenWhite} />
          <IconWrapper className={cx('arrow')} icon={isOpen ? SvgPath.ChevronUp : SvgPath.ChevronDown} />
        </button>
      </div>
      {isOpen && (
        <div className={cx('body')}>
          <div className={cx('description')}>Screen Visibility</div>
          <ul className={cx('menu')} role="menu">
            {itemList.map((item, idx) => (
              <ScreenVisibilityItem key={`${item.value}_${idx}`} {...item} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default memo(ScreenVisibility);
