import { FunctionComponent, useState, Fragment, useEffect } from 'react';
import { InputInfo } from '../AnimationInputWrapper';
import { IconWrapper, SvgPath } from 'components/Icon';
import AnimationInputWrapper from '../AnimationInputWrapper/AnimationInputWrapper';
import classnames from 'classnames/bind';
import styles from './AnimationFKWrapper.module.scss';

const cx = classnames.bind(styles);

type PaletteColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

const PALETTE_COLORS: { [color in PaletteColor]: string } = {
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
}

const AnimationFKWrapper: FunctionComponent<Props> = ({ className, fkInfo, activeStatus }) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<PaletteColor>('yellow');

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
        <AnimationInputWrapper inputTitle="View" inputInfo={fkInfo} activeStatus={activeStatus}>
          <div className={cx('color-pick-dropdown')} onClick={() => setIsPaletteOpen(!isPaletteOpen)}>
            <div className={cx('color-palette')} style={{ backgroundColor: !activeStatus ? '#4F4F4F' : PALETTE_COLORS[currentColor] }}></div>
            <IconWrapper className={cx('arrow-down-icon', { disable: !activeStatus })} icon={SvgPath.EmptyDownArrow} />
          </div>
          {isPaletteOpen && (
            <div className={cx('color-list-container')}>
              <ul className={cx('color-list')}>
                {Object.entries(PALETTE_COLORS).map(([name, value], idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setCurrentColor(name as PaletteColor);
                      setIsPaletteOpen(false);
                    }}
                  >
                    <div className={cx('color-pick-dropdown', 'inner')}>
                      {currentColor === name ? <IconWrapper className={cx('check-icon')} icon={SvgPath.Check} /> : <span className={cx('empty-space')}></span>}
                      <div className={cx('color-palette', 'color-item')} style={{ backgroundColor: value }}></div> {/* inline style에서 className으로 대체 가능할지? */}
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
