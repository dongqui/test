import { FunctionComponent, Fragment, useEffect, useState, useCallback } from 'react';
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

  const [rate, setRate] = useState(Number((sectionHeight.lowerSection / windowHeight).toFixed(2)))

  const [panelWidth, setPanelWidth] = useState({
    library: 240,
    control: 260,
  });

  const handleResize = useCallback(
    (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
      setSectionHeight({
        upperSection: windowHeight - data.size.height - 36,
        lowerSection: data.size.height,
      });
      setRate(Number((data.size.height / windowHeight).toFixed(2)));
    },
    [windowHeight],
  );

  const handleLPResizeStop = useCallback(
    (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
      setPanelWidth({
        library: data.size.width,
        control: panelWidth.control,
      });
    },
    [panelWidth.control],
  );

  useEffect(() => {
    const r = windowHeight * rate;
    if (sectionHeight.upperSection + sectionHeight.lowerSection + 36 !== windowHeight) {
      setSectionHeight({
        upperSection: windowHeight - r - 36,
        lowerSection: windowHeight * rate,
      });
    }
  }, [rate, sectionHeight.lowerSection, sectionHeight.upperSection, windowHeight]);

  return (
    <Fragment>
      <div className={cx('upperbar')}>UpperBar</div>
      <ResizableBox
        width={windowWidth}
        height={sectionHeight.upperSection}
        minConstraints={[windowWidth, (windowHeight - 36) * 0.5]}
        maxConstraints={[windowWidth, windowHeight - 168 - 36]}
        className={cx('upper-section')}
      >
        <Fragment>
          <ResizableBox
            width={panelWidth.library}
            height={sectionHeight.upperSection}
            minConstraints={[240, (windowHeight - 36) * 0.5]}
            maxConstraints={[450, windowHeight - 168 - 36]}
            onResizeStop={handleLPResizeStop}
            resizeHandles={['e']}
            axis="x"
            className={cx('library-panel')}
          >
            <div className={cx('lp-outer')}>
              <div className={cx('library-panel-inner')}>
                LP
              </div>
            </div>
          </ResizableBox>
          <ResizableBox
            width={windowWidth}
            height={sectionHeight.upperSection}
            minConstraints={[150, (windowHeight - 36) * 0.5]}
            maxConstraints={[windowWidth, windowHeight - 168 - 36]}
            className={cx('rendering-panel')}
          >
            <div className={cx('rp-outer')}>
              <div className={cx('rendering-panel-inner')}>
                RP
              </div>
            </div>
          </ResizableBox>
          <ResizableBox
            width={panelWidth.control}
            height={sectionHeight.upperSection}
            minConstraints={[260, (windowHeight - 36) * 0.5]}
            maxConstraints={[450, windowHeight - 168 - 36]}
            resizeHandles={['w']}
            axis="x"
            className={cx('control-panel')}
          >
            <div className={cx('cp-outer')}>
              <div className={cx('control-panel-inner')}>
                CP
              </div>
            </div>
          </ResizableBox>
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
    </Fragment>
  );
};

export default Shoot;
