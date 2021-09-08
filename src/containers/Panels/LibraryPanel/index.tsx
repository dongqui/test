import 'babylonjs-loaders';
import * as BABYLON from 'babylonjs';
import { FunctionComponent, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Box, { BoxProps } from 'components/Layout/Box';
import LPHeader from './LPHeader';
import LPControlbar from './LPControlbar';
import LPBody from './LPBody';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

// url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619493576/zombie_bkqv8g.glb',
// url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619493584/knight_zizg5n.glb',
// url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619494583/vanguard_t_cslcnl.glb',
interface Props {}

const LibraryPanel: FunctionComponent<Props> = () => {
  const handleDrop = useCallback(async (files: File[]) => {
    console.log(files);
    files.map((file) => {
      // BABYLON.SceneLoader.LoadAssetContainerAsync(
      //   'https://playground.babylonjs.com/scenes/',
      //   'skull.babylon',
      //   scene,
      // ).then(function (container) {
      //   container.addAllToScene();
      // });
    });
  }, []);

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  return (
    <div className={cx('wrapper')} {...getRootProps()}>
      <Box id="LP-Header" noResize>
        <LPHeader />
      </Box>
      <Box id="LP-Controlbar" noResize>
        <LPControlbar />
      </Box>
      <Box id="LP-Body" className={cx('lp-body')} noResize>
        <LPBody />
      </Box>
    </div>
  );
};

export default LibraryPanel;
