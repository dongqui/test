import { FunctionComponent, useCallback, useState, Fragment, ReactNode } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import { upperFirst } from 'lodash';
import Switch from 'react-switch';
import classnames from 'classnames/bind';
import styles from './index.module.scss';
import { Typography } from 'components/Typography';

const cx = classnames.bind(styles);
type CardTitleType = 'normal' | 'toggle' | 'dropdown';
interface Props {
  isSpread: boolean;
  isPowerOn?: boolean;

  prepend?: ReactNode;
  title?: ReactNode;

  className?: string;
  type?: string;

  toggleOptions?: {
    checked?: boolean;
    handleToggle?: any;
    canToggle?: boolean;
  };
  dropdownOptions?: {
    active: boolean;
    items: Array<{ text: string; handleSelect: () => void }>;
  };
  activeStatus: boolean;
  handleSpread: () => void;
}

const PlaskCardTitle: FunctionComponent<Props> = ({
  type = 'normal',
  title,
  className,
  isPowerOn,
  isSpread,
  toggleOptions = {
    canToggle: true,
    handleToggle: () => {},
    checked: false,
  },
  dropdownOptions,
  activeStatus,
  handleSpread,
}) => {
  // 해당 section의 비활성화
  const handleTogglePower = useCallback(() => {
    toggleOptions.canToggle && toggleOptions.handleToggle && toggleOptions.handleToggle();
  }, [toggleOptions]);

  const [isActiveDropdown, setIsActiveDropdown] = useState<boolean>(false);

  const classes = cx('wrapper', className, { able: activeStatus });

  return (
    <div className={classes}>
      <button className={cx('toggle')} onClick={handleSpread}>
        <IconWrapper className={cx('arrowdown-icon', { active: isSpread })} icon={SvgPath.EmptyDownArrow} />
        {title}
      </button>
      {
        {
          normal: null,

          dropdown: dropdownOptions?.active && (
            <Fragment>
              <div className={cx('dropdown-button', { active: activeStatus && dropdownOptions.active })} onClick={() => setIsActiveDropdown(!isActiveDropdown)}>
                <IconWrapper className={cx('')} icon={SvgPath.More} />
              </div>
              {isActiveDropdown && (
                <ul className={cx('dropdown-menu')}>
                  {dropdownOptions.items.map((item, idx) => (
                    <li
                      key={idx}
                      className={cx('dropdown-item')}
                      onClick={() => {
                        item.handleSelect();
                        setIsActiveDropdown(false);
                      }}
                    >
                      <p>{upperFirst(item.text)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Fragment>
          ),

          toggle: isPowerOn !== undefined && (
            <Switch
              className={cx('toggle-switch', { inactive: !toggleOptions.canToggle })}
              onChange={handleTogglePower}
              checked={activeStatus && isPowerOn}
              onColor="#258CF4"
              checkedIcon={false}
              uncheckedIcon={false}
              width={24}
              height={12}
              handleDiameter={8}
            />
          ),
        }[type]
      }
    </div>
  );
};

export default PlaskCardTitle;
