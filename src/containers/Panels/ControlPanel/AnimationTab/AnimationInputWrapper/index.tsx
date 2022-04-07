import { FunctionComponent, Fragment, useState, FocusEvent } from 'react';
import { upperFirst } from 'lodash';
import { IconWrapper, SvgPath } from 'components/Icon';
import { AnimationInput } from 'components/ControlPanel';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export type InputInfo = {
  text: string;
  currentValue?: string;
  defaultValue?: number;
  decimalDigit?: number;
  handleBlur: (event: FocusEvent<HTMLInputElement>) => void;
};

type DropdownList = {
  text: string;
  handleSelect: any;
};

interface Props {
  className?: string;
  inputTitle?: string;
  inputInfo?: InputInfo[];
  activeStatus?: boolean;
  inactiveMessage?: string;
  dropdownList?: DropdownList[];
}

/**
 * @param className - PropertyInputWrapper를 감싸는 div 요소에 className 부여
 * @param inputTitle - input 목록들을 대표하는 title 지정
 * @param inputInfo - input 요소들을 만들기 위한 데이터를 Object로 이루어진 Array로 전달받음
 * @param children - input 요소들 이후에 추가할 element
 * @returns input 요소로 이루어진 목록과 해당 목록을 대표하는 title이 포함된 JSX 요소
 */
const AnimationInputWrapper: FunctionComponent<Props> = ({ className, inputTitle, inputInfo, activeStatus, inactiveMessage, dropdownList, children }) => {
  // dropdown을 펼치거나 접을 수 있는 상태값
  const [isActiveDropdown, setIsActiveDropdown] = useState<boolean>(false);

  const classes = cx('wrapper', className, { able: activeStatus ?? true });

  return (
    <div className={cx(classes)}>
      <p>{inputTitle}</p>
      <div>
        {inputInfo &&
          inputInfo.map((info, idx) => (
            <AnimationInput
              key={`${inputTitle}${idx}`}
              activeStatus={activeStatus}
              currentValue={info.currentValue ? +info.currentValue : 0}
              inactiveMessage={inactiveMessage}
              text={info.text}
              defaultValue={info.defaultValue}
              decimalDigit={info.decimalDigit}
              handleBlur={info.handleBlur}
            ></AnimationInput>
          ))}
        {children}
      </div>
      {dropdownList && (
        <Fragment>
          <div className={cx('dropdown-button', { active: activeStatus })} onClick={() => setIsActiveDropdown(!isActiveDropdown)}>
            <IconWrapper className={cx('arrowdown-icon')} icon={SvgPath.EmptyDownArrow} />
          </div>
          {isActiveDropdown && (
            <ul className={cx('dropdown-menu')}>
              {dropdownList.map((dropdownItem, idx) => (
                <li
                  key={idx}
                  className={cx('dropdown-item')}
                  onClick={() => {
                    dropdownItem.handleSelect(dropdownItem.text);
                    setIsActiveDropdown(false);
                  }}
                >
                  <p>{upperFirst(dropdownItem.text)}</p>
                </li>
              ))}
            </ul>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default AnimationInputWrapper;
