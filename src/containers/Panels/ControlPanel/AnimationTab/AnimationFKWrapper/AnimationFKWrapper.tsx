import { FunctionComponent, useState, Fragment, useEffect } from 'react';
import { InputInfo } from '../AnimationInputWrapper';
import { IconWrapper, SvgPath } from 'components/Icon';
import AnimationInputWrapper from '../AnimationInputWrapper/AnimationInputWrapper';
import classnames from 'classnames/bind';
import styles from './AnimationFKWrapper.module.scss';

const cx = classnames.bind(styles);

interface Props {
  fkInfo: InputInfo[];
  className?: string;
  activeStatus?: boolean;
}

const AnimationFKWrapper: FunctionComponent<Props> = ({ className, fkInfo, activeStatus }) => {
  const [activePaletteModal, setActivePaletteModal] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>('#FFDB56');

  const classes = cx('wrapper', className);

  const colorPalette = [{ color: '#FF6969' }, { color: '#FC9B51' }, { color: '#FFDB56' }, { color: '#4FD675' }, { color: '#61E4ED' }, { color: '#D687F4' }, { color: '#FF8CC9' }];

  // 색상 선택 팔레트를 해당 section의 활성화 상태에 맞추어 전환
  useEffect(() => {
    if (!activeStatus) {
      setActivePaletteModal(false);
    }
  }, [activeStatus]);

  return (
    <Fragment>
      <div className={cx(classes)}>
        <AnimationInputWrapper inputTitle="View" inputInfo={fkInfo} activeStatus={activeStatus}>
          <div className={cx('color-pick-dropdown')} onClick={() => setActivePaletteModal(!activePaletteModal)}>
            <div className={cx('color-palette')} style={{ backgroundColor: !activeStatus ? '#4F4F4F' : currentColor }}></div>
            <IconWrapper className={cx('arrow-down-icon', { disable: !activeStatus })} icon={SvgPath.EmptyDownArrow} />
          </div>
          {activePaletteModal && (
            <div className={cx('color-list-container')}>
              <ul className={cx('color-list')}>
                {colorPalette.map((indivColor, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setCurrentColor(indivColor.color);
                      setActivePaletteModal(false);
                    }}
                  >
                    <div className={cx('color-pick-dropdown', 'inner')}>
                      {currentColor === indivColor.color ? <IconWrapper className={cx('check-icon')} icon={SvgPath.Check} /> : <span className={cx('empty-space')}></span>}
                      <div className={cx('color-palette', 'list')} style={{ backgroundColor: indivColor.color }}></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AnimationInputWrapper>
      </div>
      {activePaletteModal && <div className={cx('close-modal-overlay')} onClick={() => setActivePaletteModal(false)}></div>}
    </Fragment>
  );
};

export default AnimationFKWrapper;
