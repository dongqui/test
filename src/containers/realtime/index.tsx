import React, { useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import _ from 'lodash';
import WebcamPanel from './Webcam';
import { RenderingController } from './Model/RenderingController';
import { BaseModal } from 'components/New_Modal';
import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

const STANDARD_PANEL_WIDTH = 50;

const RealtimeContainer: React.FC = ({}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className={cx('wrapper')}>
      <div className={cx('model')}>
        <RenderingController />
      </div>
      <WebcamPanel />
      {/* <button onClick={handleOpen}>asdasds</button> */}
      {/* {isOpen && <BaseModal onClose={handleOpen}>asdas</BaseModal>} */}
      {/* <Rnd
        style={{
          border: '1px solid white',
          zIndex: 100,
        }}
        default={{
          x: 0,
          y: 0,
          width: `${STANDARD_PANEL_WIDTH}%`,
          height: `100%`,
        }}
        enableResizing={{ right: true }}
        disableDragging={true}
      >
        <WebcamPanel width="100%" height="100%" />
      </Rnd>
      <Rnd
        style={{
          border: '1px solid white',
          zIndex: 200,
        }}
        default={{
          x: window.innerWidth * STANDARD_PANEL_WIDTH * 0.01,
          y: 0,
          width: `${STANDARD_PANEL_WIDTH}%`,
          height: `100%`,
        }}
        enableResizing={{ left: true }}
        disableDragging={true}
      >
        <RenderingController />
      </Rnd> */}
    </div>
  );
};

export default React.memo(RealtimeContainer);
