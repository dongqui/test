import { FunctionComponent, useCallback, Dispatch, SetStateAction, RefObject } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import Switch from 'react-switch';
import classnames from 'classnames/bind';
import styles from './AnimationTitleToggle.module.scss';

const cx = classnames.bind(styles);

interface Props {
  text: string;
  isSpread: boolean;
  isPowerOn?: boolean;
  className?: string;
  withSwitch?: boolean;
  checked?: boolean;
  activeStatus: boolean;
  setIsSpread: Dispatch<SetStateAction<boolean>>;
  setIsPowerOn?: Dispatch<SetStateAction<boolean>>;
}

const AnimationTitleToggle: FunctionComponent<Props> = ({ text, className, withSwitch, isPowerOn, setIsPowerOn, isSpread, setIsSpread, activeStatus }) => {
  // 해당 section의 단순 펼침/접음 적용 (비활성화 X)
  const handleSpread = useCallback(() => {
    if (isSpread) {
      setIsSpread(false);
    } else {
      setIsSpread(true);
    }
  }, [isSpread, setIsSpread]);

  // 해당 section의 비활성화
  const handleTogglePower = useCallback(() => {
    if (isPowerOn) {
      setIsPowerOn && setIsPowerOn(false);
    } else {
      setIsPowerOn && setIsPowerOn(true);
    }
  }, [isPowerOn, setIsPowerOn]);

  const classes = cx('wrapper', className, { able: activeStatus });

  return (
    <div className={cx(classes)}>
      <button className={cx('toggle')} onClick={handleSpread}>
        <IconWrapper className={cx('arrowdown-icon', { active: isSpread })} icon={SvgPath.EmptyDownArrow} /> {text}
      </button>
      {withSwitch && isPowerOn !== undefined && (
        <Switch
          className={cx('toggle-switch')}
          onChange={handleTogglePower}
          checked={activeStatus && isPowerOn}
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
