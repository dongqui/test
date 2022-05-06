import { FunctionComponent, memo, useEffect, useRef, useState } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import { ScreenVisivilityItem } from 'types/RP';
import ScreenVisibilityItem from './ScreenVisibilityItem';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { ExpandButton } from 'components/Button';

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
    <div id="screenVisibilityWrapper" className={cx('wrapper')} ref={wrapperRef}>
      <div className={cx('header', { open: isOpen })}>
        <ExpandButton className={cx('toggle-button')} variant="ghost" onClick={handleToggleButtonClick} content={SvgPath.EyeOpenWhite} />
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
