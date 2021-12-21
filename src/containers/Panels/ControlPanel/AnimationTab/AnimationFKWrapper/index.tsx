import { Dispatch, SetStateAction, FunctionComponent, useState, Fragment, useEffect } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import AnimationInputWrapper from '../AnimationInputWrapper';
import { InputInfo } from '../AnimationInputWrapper';
import { PlaskPaletteColor } from 'types/common';
import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

const PALETTE_COLORS: { [color in PlaskPaletteColor]: string } = {
  red: '#FF6969',
  orange: '#FC9B51',
  yellow: '#FFDB56',
  green: '#4FD675',
  blue: '#61E4ED',
  purple: '#D687F4',
  pink: '#FF8CC9',
};

interface Props {
  fkInfo: InputInfo[];
  className?: string;
  activeStatus?: boolean;
  inactiveMessage?: string;
  currentColor: PlaskPaletteColor;
  setCurrentColor: Dispatch<SetStateAction<PlaskPaletteColor>>;
}

const AnimationFKWrapper: FunctionComponent<Props> = ({ className, fkInfo, activeStatus, inactiveMessage, currentColor, setCurrentColor }) => {
  // 색상 선택 dropdown을 펼치거나 접을 수 있는 상태값
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);

  const classes = cx('wrapper', className);

  // 색상 선택 팔레트를 해당 section의 활성화 상태에 맞추어 전환
  useEffect(() => {
    if (!activeStatus) {
      setIsPaletteOpen(false);
    }
  }, [activeStatus]);

  return (
    <Fragment>
      <div className={cx(classes)}>
        <AnimationInputWrapper inputTitle="View" inputInfo={fkInfo} activeStatus={activeStatus} inactiveMessage={inactiveMessage}>
          <div className={cx('color-pick-dropdown')} onClick={() => setIsPaletteOpen(!isPaletteOpen)}>
            <div className={cx('color-palette')} style={{ backgroundColor: !activeStatus ? '#4F4F4F' : PALETTE_COLORS[currentColor] }}></div>
            <IconWrapper className={cx('arrow-down-icon', { disable: !activeStatus })} icon={SvgPath.EmptyDownArrow} />
          </div>
          {isPaletteOpen && (
            <div className={cx('color-list-container')}>
              <ul className={cx('color-list')}>
                {Object.entries(PALETTE_COLORS).map(([name], idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setCurrentColor(name as PlaskPaletteColor);
                      setIsPaletteOpen(false);
                    }}
                  >
                    <div className={cx('color-pick-dropdown', 'inner')}>
                      {currentColor === name ? <IconWrapper className={cx('check-icon')} icon={SvgPath.Check} /> : <span className={cx('empty-space')}></span>}
                      <div className={cx('color-palette', 'color-item', name)}></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AnimationInputWrapper>
      </div>
      {isPaletteOpen && <div className={cx('close-modal-overlay')} onClick={() => setIsPaletteOpen(false)}></div>}
    </Fragment>
  );
};

export default AnimationFKWrapper;
