import { FunctionComponent, memo, useEffect, useState, useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { useDropzone } from 'react-dropzone';
import '@babylonjs/loaders/glTF';
import { partition } from 'lodash';

import * as TEXT from 'constants/Text';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as modeSelectActions from 'actions/modeSelection';
import * as globalUIActions from 'actions/Common/globalUI';
import Box from 'components/Layout/Box';
import LPHeader from './LPHeader';
import LPControlbar from './LPControlbar';
import LPBody from './LPBody';
import plaskEngine from '3d/PlaskEngine';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const LibraryPanel: FunctionComponent = () => {
  const dispatch = useDispatch();
  const _lpNode = useSelector((state) => state.lpNode.nodes);
  const _screenList = useSelector((state) => state.plaskProject.screenList);

  const [searchText, setSearchText] = useState('');
  const [searchResultNode, setSearchResultNode] = useState(_lpNode);

  const handleDrop = useCallback(
    async (files: File[]) => {
      const [videos, filesExceptVideo] = partition(files, (v) => v.type.includes('video'));
      // const videos = files.filter((file) => file.type.includes('video'));
      // const filesExceptVideo = files.filter((file) => !file.type.includes('video'));

      const isError = videos.length > 1;

      if (isError) {
        dispatch(
          globalUIActions.openModal('AlertModal', {
            title: 'Warning',
            message: TEXT.WARNING_02,
            confirmText: 'Close',
          }),
        );

        return;
      }

      for (const file of filesExceptVideo) {
        dispatch(lpNodeActions.addModelAsync.request(file));
      }

      if (videos.length > 0) {
        const videoBlobURL = URL.createObjectURL(videos[0]);

        dispatch(
          globalUIActions.openModal('ConfirmModal', {
            title: 'Extract',
            message: TEXT.CONFIRM_01,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            onConfirm: () => {
              dispatch(
                modeSelectActions.changeMode({
                  mode: 'videoMode',
                  videoURL: videoBlobURL,
                }),
              );
            },
          }),
        );
      }
    },
    [dispatch],
  );

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    const isSceneExist = _screenList.length > 0 && _screenList[0].scene;
    if (isSceneExist) {
      const scene = _screenList[0].scene;

      scene.executeWhenReady(() => {
        setIsSceneReady(true);
      });
    }
  }, [_screenList, isSceneReady]);

  const [isDefaultModelLoaded, setIsDefaultModelLoaded] = useState(false);

  // useEffect(() => {
  //   if (isSceneReady) {
  //     const defaultModels = ['Mannequin.glb', 'Knight.glb', 'Zombie.glb', 'Vanguard.glb'];

  //     const isAlreadyExist = _lpNode.some((node) => defaultModels.includes(node.name));

  //     if (!isAlreadyExist && !isDefaultModelLoaded) {
  //       for (const model of defaultModels) {
  //         dispatch(
  //           lpNodeActions.fileUpload({
  //             file: model,
  //             showLoading: false,
  //           }),
  //         );
  //       }
  //       setIsDefaultModelLoaded(true);
  //     }
  //   }
  // }, [_lpNode, isDefaultModelLoaded, isSceneReady, dispatch]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchText(text);

      if (text.length > 0) {
        const searchResult = _lpNode.filter((node) => node.name.toLowerCase().includes(text));

        setSearchResultNode(searchResult);
      }
    },
    [_lpNode],
  );

  const nodes = searchText.length > 0 ? searchResultNode : _lpNode;
  const isPreventContextmenu = !!searchText;

  return (
    <div className={cx('wrapper')} {...getRootProps()}>
      <div className={cx('inner')}>
        <Box id="LP-Header" noResize>
          <LPHeader onLoad={handleDrop} />
        </Box>
        <Box id="LP-Controlbar" noResize>
          <LPControlbar onSearch={handleSearch} />
        </Box>
        <Box id="LP-Body" className={cx('lp-body')} noResize>
          <LPBody lpNode={nodes} isPreventContextmenu={isPreventContextmenu} />
        </Box>
      </div>
    </div>
  );
};

export default memo(LibraryPanel);
