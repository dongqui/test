import { FunctionComponent, Dispatch, Fragment, useState } from 'react';
import { SetStateAction } from 'hoist-non-react-statics/node_modules/@types/react';
import { IconWrapper, SvgPath } from 'components/Icon';
import { AnimationInput } from 'components/ControlPanel';
import classNames from 'classnames/bind';
import styles from './AnimationInputWrapper.module.scss';

const cx = classNames.bind(styles);

export type InputInfo = {
  text: string;
  defaultValue: number;
  decimalDigit?: number;
  func: () => void;
};

type DropdownList = {
  text: string;
};

interface Props {
  className?: string;
  inputTitle?: string;
  inputInfo?: InputInfo[];
  activeStatus?: boolean;
  dropdownList?: DropdownList[];
  setIsEuler?: Dispatch<SetStateAction<boolean>>;
}

/**
 * @param className - PropertyInputWrapper를 감싸는 div 요소에 className 부여
 * @param inputTitle - input 목록들을 대표하는 title 지정
 * @param inputInfo - input 요소들을 만들기 위한 데이터를 Object로 이루어진 Array로 전달받음
 * @param children - input 요소들 이후에 추가할 element
 * @returns input 요소로 이루어진 목록과 해당 목록을 대표하는 title이 포함된 JSX 요소
 */
const AnimationInputWrapper: FunctionComponent<Props> = ({ className, inputTitle, inputInfo, activeStatus, dropdownList, setIsEuler, children }) => {
  const [activeDropdown, setActiveDropdown] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string>('');
  const classes = cx('wrapper', className, { able: activeStatus === undefined ? true : activeStatus });

  return (
    <div className={cx(classes)}>
      <p>{inputTitle}</p>
      <div>
        {inputInfo &&
          inputInfo.map((info, idx) => (
            <AnimationInput key={idx} text={info.text} defaultValue={info.defaultValue} activeStatus={activeStatus} decimalDigit={info.decimalDigit}></AnimationInput>
          ))}
        {children}
      </div>
      {dropdownList && (
        <Fragment>
          <div className={cx('dropdown-button', { active: activeStatus })} onClick={() => setActiveDropdown(!activeDropdown)}>
            <IconWrapper className={cx('arrowdown-icon')} icon={SvgPath.EmptyDownArrow} />
          </div>
          {activeDropdown && (
            <div className={cx('dropdown-menu')}>
              <ul>
                {dropdownList.map((item, idx) => (
                  <li
                    key={idx}
                    className={cx('dropdown-item')}
                    onClick={() => {
                      setIsEuler && setIsEuler(item.text === 'Euler' ? true : false);
                      setActiveMenu(item.text);
                    }}
                  >
                    <p>{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default AnimationInputWrapper;
