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
  handleToggle?: any;
  canToggle?: boolean;
  handleSpread: () => void;
}

const AnimationTitleToggle: FunctionComponent<Props> = ({ text, className, withSwitch, isPowerOn, isSpread, handleToggle, canToggle, activeStatus, handleSpread }) => {
  // 해당 section의 비활성화
  const handleTogglePower = useCallback(() => {
    canToggle && handleToggle && handleToggle();
  }, [canToggle, handleToggle]);

  const classes = cx('wrapper', className, { able: activeStatus });

  return (
    <div className={cx(classes)}>
      <button className={cx('toggle')} onClick={handleSpread}>
        <IconWrapper className={cx('arrowdown-icon', { active: isSpread })} icon={SvgPath.EmptyDownArrow} /> {text}
      </button>
      {withSwitch && isPowerOn !== undefined && (
        <Switch
          className={cx('toggle-switch', { inactive: !canToggle })}
          onChange={handleTogglePower}
          checked={activeStatus && isPowerOn}
          onColor="#258CF4"
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
