import { FunctionComponent, Fragment, useState, Dispatch } from 'react';
import { SetStateAction } from 'hoist-non-react-statics/node_modules/@types/react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './Dropdown.module.scss';

interface Props {
  options: string[];
  currentOption: string;
  setCurrentOption: Dispatch<SetStateAction<string>>;
}

const cx = classNames.bind(styles);

const Dropdown: FunctionComponent<Props> = ({ options, currentOption, setCurrentOption }) => {
  const [activeDropdown, setActiveDropdown] = useState<boolean>(false);

  return (
    <Fragment>
      <div className={cx('dropdown-wrapper')}>
        <div className={cx('dropdown-button')} onClick={() => setActiveDropdown(!activeDropdown)}>
          <div className={cx('dropdown-text')}>{currentOption}</div>
          <IconWrapper className={cx('arrow-down-icon')} icon={SvgPath.EmptyDownArrow} />
        </div>
        {activeDropdown && (
          <div className={cx('dropdown-menu-container')}>
            <ul className={cx('menu-list')}>
              {options.map((option, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setCurrentOption(option);
                    setActiveDropdown(false);
                  }}
                >
                  <div className={cx('dropdown-option', 'inner')}>
                    <div className={cx('option-text', 'list')}>{option}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {activeDropdown && <div className={cx('dropdown-overlay')} onClick={() => setActiveDropdown(false)}></div>}
    </Fragment>
  );
};

export default Dropdown;
