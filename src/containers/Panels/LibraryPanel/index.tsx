import 'babylonjs-loaders';
import * as BABYLON from 'babylonjs';
import { FunctionComponent, useEffect, useState, useCallback, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<BABYLON.Engine>();
  const [scene, setScene] = useState<BABYLON.Scene>();

  const setCamera = useCallback((scene: BABYLON.Scene, name: string | number) => {
    const camera = new BABYLON.ArcRotateCamera(
      `camera_${name}`,
      Math.PI / 3,
      Math.PI / 3,
      15,
      BABYLON.Vector3.Zero(),
      scene,
    );

    camera.attachControl(canvasRef, true);

    // camera jitter 제거 (기본값 0.9)
    camera.inertia = 0.5;
    // zoom sensitivity
    camera.wheelPrecision = 50;
    // 최대 zoom
    camera.lowerRadiusLimit = 2;
    // 최소 zoom
    camera.upperRadiusLimit = 20;
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const createdEngine = new BABYLON.Engine(canvasRef.current);
      const createdScene = new BABYLON.Scene(createdEngine);

      setCamera(createdScene, 1);

      setEngine(createdEngine);
      setScene(createdScene);
    }
  }, [setCamera]);

  useEffect(() => {
    if (engine) {
      engine.stopRenderLoop();

      engine.runRenderLoop(() => {
        if (scene) {
          scene.render();
        }
      });
    }
  }, [scene, engine]);

  const handleDrop = useCallback(
    async (files: File[]) => {
      files.map((file) => {
        console.log(file);
        // Babylon.js의 LoadAssetContainerAsync의 두 번째 파라미터 타입이 잘못되어 하기와 같이 타입을 단언
        const targetFile = (file as unknown) as string;

        BABYLON.SceneLoader.LoadAssetContainerAsync('file:', targetFile, scene).then(
          (container) => {
            console.log(container);
          },
        );
      });
    },
    [scene],
  );

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
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default LibraryPanel;
