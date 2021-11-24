import { FunctionComponent, useCallback, Dispatch, SetStateAction, RefObject } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import Switch from 'react-switch';
import classnames from 'classnames/bind';
import styles from './AnimationTitleToggle.module.scss';

const cx = classnames.bind(styles);

interface Props {
  text: string;
  spreadRef: boolean;
  toggleRef?: boolean;
  className?: string;
  addSwitch?: boolean;
  checked?: boolean;
  activeStatus: boolean;
  setSpreadRef: Dispatch<SetStateAction<boolean>>;
  setToggleRef?: Dispatch<SetStateAction<boolean>>;
}

const AnimationTitleToggle: FunctionComponent<Props> = ({ text, className, addSwitch, toggleRef, setToggleRef, spreadRef, setSpreadRef, activeStatus }) => {
  // 해당 section의 단순 펼침/접음 적용 (비활성화 X)
  const handleSpread = useCallback(() => {
    if (spreadRef) {
      setSpreadRef(false);
    } else {
      setSpreadRef(true);
    }
  }, [spreadRef, setSpreadRef]);

  // 해당 section의 비활성화
  const handleToggle = useCallback(() => {
    if (toggleRef) {
      setToggleRef && setToggleRef(false);
    } else {
      setToggleRef && setToggleRef(true);
    }
  }, [toggleRef, setToggleRef]);

  const classes = cx('wrapper', className, { able: activeStatus === undefined ? true : activeStatus });

  return (
    <div className={cx(classes)}>
      <button className={cx('toggle')} onClick={handleSpread}>
        <IconWrapper className={cx('arrowdown-icon', { active: spreadRef })} icon={SvgPath.EmptyDownArrow} /> {text}
      </button>
      {addSwitch && toggleRef !== undefined && (
        <Switch
          className={cx('toggle-switch')}
          onChange={handleToggle}
          checked={activeStatus && toggleRef}
          onColor="#0F88FF"
          checkedIcon={false}
          uncheckedIcon={false}
          width={24}
          height={12}
          handleDiameter={8}
        />
      )}
    </div>
  );
};

export default AnimationTitleToggle;
