import { FunctionComponent, Fragment, useState, Dispatch, SetStateAction } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './Dropdown.module.scss';

const cx = classNames.bind(styles);

const DEFAULT_INACTIVE_MESSAGE = 'Default Inactive Message';

interface Props {
  className?: string;
  options: Array<{ text: string; handleSelect: Dispatch<SetStateAction<string>> }>;
  currentValue?: string;
  activeStatus?: boolean;
  inactiveMessage?: string;
}

const Dropdown: FunctionComponent<Props> = ({ className, options, currentValue, activeStatus, inactiveMessage }) => {
  const [activeDropdown, setActiveDropdown] = useState<boolean>(false);

  const classes = cx('dropdown-wrapper', className, { able: activeStatus ?? true });

  return (
    <Fragment>
      <div className={cx(classes)}>
        <div className={cx('dropdown-button')} onClick={() => setActiveDropdown(!activeDropdown)}>
          <div className={cx('dropdown-text')}>{currentValue ?? 'Select Option'}</div>
          <IconWrapper className={cx('arrow-down-icon')} icon={SvgPath.EmptyDownArrow} />
        </div>
        {activeDropdown && (
          <div className={cx('dropdown-menu-container')}>
            <ul className={cx('menu-list')}>
              {options.map((option, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    option.handleSelect(option.text);
                    setActiveDropdown(false);
                  }}
                >
                  <div className={cx('dropdown-option', 'inner')}>
                    <div className={cx('option-text', 'list')}>{option.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* 드랍다운 버튼 자체의 비활성화를 위한 overlay (내부 텍스트 변경 시 표시되는 텍스트 변경 가능) */}
        {!activeStatus && <div className={cx('dropdown-inactive-overlay')}>{inactiveMessage ?? DEFAULT_INACTIVE_MESSAGE}</div>}
      </div>
      {activeDropdown && <div className={cx('dropdown-overlay')} onClick={() => setActiveDropdown(false)}></div>}
    </Fragment>
  );
};

export default Dropdown;
