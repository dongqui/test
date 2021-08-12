import { FunctionComponent, Fragment, useState, useCallback } from 'react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { useWindowSize } from 'hooks/common';
import classNames from 'classnames/bind';
import styles from './Shoot.module.scss';

const cx = classNames.bind(styles);

const Shoot: FunctionComponent = () => {

  const [windowWidth, windowHeight] = useWindowSize();

  const [sectionHeight, setSectionHeight] = useState({
    upperSection: windowHeight - 168 - 36,
    lowerSection: 168,
  });

  const handleResize = useCallback(
    (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
      setSectionHeight({
        upperSection: windowHeight - data.size.height - 36,
        lowerSection: data.size.height,
      });
    },
    [windowHeight],
  );

  return (
    <div className={cx('wrapper')}>
      <div className={cx('upperbar')}>UpperBar</div>
      <ResizableBox
        width={windowWidth}
        height={sectionHeight.upperSection}
        minConstraints={[windowWidth, (windowHeight - 36) * 0.5]}
        maxConstraints={[windowWidth, windowHeight - 168 - 36]}
        className={cx('upper-section')}
      >
        <Fragment>
          <div className={cx('library-panel')}>LP</div>
          <div className={cx('rendering-panel')}>RP</div>
          <div className={cx('control-panel')}>CP</div>
        </Fragment>
      </ResizableBox>
      <ResizableBox
        width={windowWidth}
        height={sectionHeight.lowerSection}
        minConstraints={[windowWidth, 168]}
        maxConstraints={[windowWidth, (windowHeight) * 0.5]}
        className={cx('lower-section')}
        onResize={handleResize}
        axis="y"
        resizeHandles={['n']}

      >
        <div className={cx('timeline-panel')}>TP</div>
      </ResizableBox>
    </div>
  );
};

export default Shoot;
