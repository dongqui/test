import { FunctionComponent, Fragment, useEffect, useState, useCallback } from 'react';
import { ResizeCallbackData } from 'react-resizable';
import { Box } from 'components/Layout';
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
    control: 280,
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
      <Box width={windowWidth} height={36}>
        {/* UP */}
      </Box>
      <Box
        width={windowWidth}
        height={sectionHeight.upperSection}
        min={[windowWidth, (windowHeight - 36) * 0.5]}
        max={[windowWidth, windowHeight - 168 - 36]}
        className={cx('upper-section')}
      >
        <Box
          width={panelWidth.library}
          height={sectionHeight.upperSection}
          min={[240, (windowHeight - 36) * 0.5]}
          max={[450, windowHeight - 168 - 36]}
          onResizeStop={handleLPResizeStop}
          resizeHandles={['e']}
          axis="x"
          className={cx('library-panel')}
        >
          {/* LP */}
        </Box>
        <Box
          width={windowWidth}
          height={sectionHeight.upperSection}
          min={[150, (windowHeight - 36) * 0.5]}
          max={[windowWidth, windowHeight - 168 - 36]}
          className={cx('rendering-panel')}
        >
          {/* RP */}
        </Box>
        <Box
          width={panelWidth.control}
          height={sectionHeight.upperSection}
          min={[280, (windowHeight - 36) * 0.5]}
          max={[450, windowHeight - 168 - 36]}
          resizeHandles={['w']}
          axis="x"
          className={cx('control-panel')}
        >
          {/* CP */}
        </Box>
      </Box>
      <Box
        width={windowWidth}
        height={sectionHeight.lowerSection}
        min={[windowWidth, 168]}
        max={[windowWidth, (windowHeight) * 0.5]}
        onResize={handleResize}
        axis="y"
        resizeHandles={['n']}
      >
        <Box width={windowWidth} height={32}>
          {/* MB */}
        </Box>
        <Box width={windowWidth} height={sectionHeight.lowerSection - 32}>
          {/* TP */}
        </Box>
      </Box>
    </Fragment>
  );
};

export default Shoot;
