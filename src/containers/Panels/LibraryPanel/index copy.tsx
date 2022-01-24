import { FunctionComponent, memo, useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { useDropzone } from 'react-dropzone';
import produce from 'immer';
import '@babylonjs/loaders/glTF';
import { getFileExtension } from 'utils/common';
import * as TEXT from 'constants/Text';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as modeSelectActions from 'actions/modeSelection';
import Box from 'components/Layout/Box';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import LPHeader from './LPHeader';
import LPControlbar from './LPControlbar';
import LPBody from './LPBody copy';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const LibraryPanel: FunctionComponent = () => {
  const dispatch = useDispatch();
  const _lpNode = useSelector((state) => state.lpNode.nodes);
  const _screenList = useSelector((state) => state.plaskProject.screenList);

  const [view, setView] = useState<LP.View>('List');
  const [searchText, setSearchText] = useState('');
  const [searchResultNode, setSearchResultNode] = useState(_lpNode);

  const { onModalOpen, onModalClose } = useBaseModal();

  const onNodeChange = useCallback(
    (files: File[] | string[]) => {
      for (const file of files) {
        dispatch(
          lpNodeActions.fileUpload({
            file,
          }),
        );
      }
    },
    [dispatch],
  );

  const handleDrop = useCallback(
    async (files: File[]) => {
      const videos = files.filter((file) => file.type.includes('video'));
      const removedVideoFiles = files.filter((file) => !file.type.includes('video'));

      const isInvalidFormat = removedVideoFiles.some((file) => {
        const extension = getFileExtension(file.name).toLowerCase();
        const isModelFormat = extension === 'glb' || extension === 'fbx';

        return !isModelFormat;
      });

      const isError = videos.length > 1;

      if (isError) {
        onModalOpen({
          title: 'Warning',
          message: TEXT.WARNING_02,
          confirmText: 'Close',
          onConfirm: onModalClose,
        });

        return;
      }

      if (isInvalidFormat) {
        onModalOpen({ title: 'Warning', message: TEXT.WARNING_03, confirmText: 'Close' });

        return;
      }

      onNodeChange(removedVideoFiles);

      if (videos.length > 0) {
        const videoBlobURL = URL.createObjectURL(videos[0]);

        onModalOpen({
          title: 'Extract',
          message: TEXT.CONFIRM_01,
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          confirmColor: 'positive',
          onConfirm: () => {
            dispatch(
              modeSelectActions.changeMode({
                mode: 'videoMode',
                videoURL: videoBlobURL,
              }),
            );
          },
          onCancel: () => onModalClose(),
        });
      }
    },
    [dispatch, onModalClose, onModalOpen, onNodeChange],
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

  useEffect(() => {
    if (isSceneReady) {
      const defaultModels = ['Mannequin.glb', 'Knight.glb', 'Zombie.glb', 'Vanguard.glb'];

      const isAlreadyExist = _lpNode.some((node) => defaultModels.includes(node.name));

      if (!isAlreadyExist && !isDefaultModelLoaded) {
        onNodeChange(defaultModels);
        setIsDefaultModelLoaded(true);
      }
    }
  }, [_lpNode, isDefaultModelLoaded, isSceneReady, onNodeChange]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchText(text);

      if (text.length > 0) {
        const searchResult = _lpNode.filter((node) => node.name.toLowerCase().includes(text) || node.filePath.toLowerCase().includes(text));

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
          <LPBody view={view} lpNode={nodes} isPreventContextmenu={isPreventContextmenu} />
        </Box>
      </div>
    </div>
  );
};

export default memo(LibraryPanel);
