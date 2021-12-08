import { FunctionComponent, Fragment, useState, FocusEvent } from 'react';
import { upperFirst } from 'lodash';
import { IconWrapper, SvgPath } from 'components/Icon';
import { AnimationInput } from 'components/ControlPanel';
import * as BABYLON from '@babylonjs/core';
import classNames from 'classnames/bind';
import styles from './AnimationInputWrapper.module.scss';

const cx = classNames.bind(styles);

export type InputInfo = {
  text: string;
  currentValue?: number;
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
  const [activeDropdown, setActiveDropdown] = useState<boolean>(false);

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
              currentValue={info.currentValue}
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
          <div className={cx('dropdown-button', { active: activeStatus })} onClick={() => setActiveDropdown(!activeDropdown)}>
            <IconWrapper className={cx('arrowdown-icon')} icon={SvgPath.EmptyDownArrow} />
          </div>
          {activeDropdown && (
            <ul className={cx('dropdown-menu')}>
              {dropdownList.map((dropdownItem, idx) => (
                <li
                  key={idx}
                  className={cx('dropdown-item')}
                  onClick={() => {
                    dropdownItem.handleSelect(dropdownItem.text);
                    setActiveDropdown(false);
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
