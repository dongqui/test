import 'babylonjs-loaders';
import * as BABYLON from 'babylonjs';
import { FunctionComponent, useEffect, useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { connect } from 'react-redux';
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

type StateProps = ReturnType<typeof mapStateToProps>;

interface BaseProps {}

type Props = StateProps & BaseProps;

const LibraryPanel: FunctionComponent<Props> = ({ lpNode }) => {
  const getFileExtension = useCallback((file: string): string => {
    const type = (/[^./\\]*$/.exec(file) || [''])[0];

    return type;
  }, []);

  const handleCreateNode = useCallback(() => {}, []);

  /**
   * LP에 drop하는 파일에 대한 확장자에 의한 '1차' 처리
   *
   * @param {File[]} files - LP에 drop하는 파일 (다중 또는 단일)
   */
  const handleDrop = useCallback(
    async (files: File[]) => {
      /**
       * 다중 파일 drop에 대한 처리 - 하나라도 실패 시 로직 실패, 순서 보장 x
       *
       * @todo 하나라도 실패한 것이 아닌, 성공한 파일들만 처리를 해야한다면 수정 필요
       */
      const list = await Promise.all(
        files.map(async (file) => {
          /**
           * @todo 추후 이름변경을 위해 fileName에서 확장자를 제거하여 별도 보관이 필요
           */
          const fileName = file.name;
          const extension = getFileExtension(file.name);
          console.log(fileName, extension);

          // return { name: fileName, extension: extension };
        }),
      );

      // files.map((file) => {
      //   console.log(file);
      //   // /**
      //   //  * Babylon.js의 LoadAssetContainerAsync의 두 번째 파라미터 타입이 잘못되어
      //   //  * 하기와 같이 타입을 단언
      //   //  */
      //   // BABYLON.SceneLoader.LoadAssetContainerAsync('file:', targetFile, scene).then(
      //   //   (container) => {
      //   //     console.log(container);
      //   //   },
      //   // );
      // });
    },
    [getFileExtension],
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
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    lpNode: state.lpNode.node,
  };
};

export default connect(mapStateToProps)(LibraryPanel);
