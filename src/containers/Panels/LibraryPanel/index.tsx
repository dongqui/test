import { FunctionComponent, memo, useEffect, useState, useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { useDropzone } from 'react-dropzone';
import '@babylonjs/loaders/glTF';

import { partition } from 'lodash';

import { WARNING_02, IMPORT_ERROR_INVALID_FORMAT } from 'constants/Text';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import Box from 'components/Layout/Box';
import LPHeader from './LPHeader';
import LPControlbar from './LPControlbar';
import LPBody from './LPBody';
import TagManager from 'react-gtm-module';
import PlanManager from 'utils/PlanManager';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const LibraryPanel: FunctionComponent = () => {
  const dispatch = useDispatch();
  const _lpNode = useSelector((state) => state.lpNode.nodes);
  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _user = useSelector((state) => state.user);

  const [searchText, setSearchText] = useState('');
  const [searchResultNode, setSearchResultNode] = useState(_lpNode);

  const handleDrop = async (files: File[]) => {
    const [videos, filesExceptVideo] = partition(files, (v) => v.type.includes('video'));

    const hasMoreThanOneVideo = videos.length > 1;
    const isInvalidFileFormat = !filesExceptVideo.every(
      (file) => file.name.toLocaleLowerCase().includes('glb') || file.name.toLocaleLowerCase().includes('fbx') || file.type.includes('json'),
    );

    const totalFileSize = files?.reduce((sum, file) => sum + file.size, 0);
    if (PlanManager.isStorageExceeded(_user, totalFileSize)) {
      PlanManager.openStorageExceededModal(_user);
    } else if (hasMoreThanOneVideo) {
      TagManager.dataLayer({
        dataLayer: {
          event: 'lp-file-drop',
          type: 'etc',
        },
      });
      dispatch(
        globalUIActions.openModal('AlertModal', {
          title: 'Warning',
          message: WARNING_02,
          confirmText: 'Close',
        }),
      );
    } else if (isInvalidFileFormat) {
      TagManager.dataLayer({
        dataLayer: {
          event: 'lp-file-drop',
          type: 'etc',
        },
      });
      dispatch(
        globalUIActions.openModal('_AlertModal', {
          message: IMPORT_ERROR_INVALID_FORMAT,
          title: 'Import failed',
        }),
      );
    } else {
      dispatch(lpNodeActions.fileUpload(files));
    }
  };

  const { getRootProps } = useDropzone({ onDrop: handleDrop, noClick: true });

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
          <LPBody lpNodes={nodes} isPreventContextmenu={isPreventContextmenu} />
        </Box>
      </div>
    </div>
  );
};

export default memo(LibraryPanel);
