import { FunctionComponent, memo, useState } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import { ScreenVisivilityItem } from 'types/RP';
import ScreenVisibilityItem from './ScreenVisibilityItem';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  itemList: ScreenVisivilityItem[];
}

const ScreenVisibilityMenu: FunctionComponent<Props> = ({ itemList }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleButtonClick = () => {
    setIsOpen((prev) => !prev);
  };

  const buttonClasses = cx('toggle-button', {
    open: isOpen,
  });

  return (
    <div className={cx('wrapper')}>
      <div className={cx('header')}>
        <button type="button" className={buttonClasses} onClick={handleToggleButtonClick}>
          <IconWrapper icon={SvgPath.EyeOpen} />
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

export default memo(ScreenVisibilityMenu);
