import _ from 'lodash';
import { FunctionComponent, memo, useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { useDropzone } from 'react-dropzone';
import { convertFBXtoGLB } from 'api';
import { getFileExtension } from 'utils/common';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import { v4 as uuid } from 'uuid';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as shootProjectActions from 'actions/shootProjectAction';
import Box from 'components/Layout/Box';
import produce from 'immer';
import LPHeader from './LPHeader';
import LPControlbar from './LPControlbar';
import LPBody from './LPBody';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const LibraryPanel: FunctionComponent = () => {
  const dispatch = useDispatch();

  const lpNode = useSelector((state) => state.lpNode.node);
  const lpCurrentPath = useSelector((state) => state.lpNode.currentPath);
  const assetList = useSelector((state) => state.shootProject.assetList);
  const animationTransformNodes = useSelector((state) => state.animationData.animationTransformNodes);
  const animationIngredients = useSelector((state) => state.animationData.animationIngredients);

  const { onModalOpen, onModalClose } = useBaseModal();

  const [fileExtension, setFileExtension] = useState('');
  const [fileName, setFileName] = useState('');
  const [assetListLength, setAssetListLength] = useState(0);
  const [animationIngredientsLength, setAnimationIngredientsLength] = useState(0);

  useEffect(() => {
    if (assetListLength !== assetList.length && animationIngredientsLength !== animationIngredients.length) {
      let nextLPNodes = _.clone(lpNode);

      const nextNodes = produce(nextLPNodes, (draft) => {
        const ingredients = animationIngredients.filter((ingredient) => ingredient.assetId === assetList[assetList.length - 1].id);

        const newModelNode: LP.Node = {
          id: uuid(),
          // fileURL: file,
          filePath: lpCurrentPath,
          parentId: '__root__',
          name: fileName,
          extension: fileExtension,
          type: 'Model',
          assetId: assetList[assetList.length - 1].id,
          children: ingredients.map((ingredient) => ingredient.id),
        };

        draft.push(newModelNode);

        const newMotionNodes = animationIngredients.map((ingredient) => {
          const motion: LP.Node = {
            id: ingredient.id,
            parentId: ingredient.assetId,
            name: ingredient.name,
            filePath: lpCurrentPath + `\\${ingredient.name}`,
            children: [],
            extension: '',
            type: 'Motion',
          };

          return motion;
        });

        draft.push(...newMotionNodes);
      });

      nextLPNodes = nextNodes;

      dispatch(
        lpNodeActions.changeNode({
          nodes: nextNodes,
        }),
      );

      setFileName('');
      setAssetListLength(assetList.length);
      setAnimationIngredientsLength(animationIngredients.length);
    }
  }, [animationIngredients, animationIngredientsLength, assetList, assetListLength, dispatch, fileExtension, fileName, lpCurrentPath, lpNode]);

  const onFileLoad = useCallback(
    async (file: File) => {
      const extension = getFileExtension(file.name).toLowerCase();
      const fileName = file.name;

      if (extension === 'glb') {
        setFileName(fileName);
        setFileExtension(extension);

        /**
         * @TODO 파일 확장자 저장 필요 및 이후 rename시에 확장자는 제외하고 수정하고 확정시에 확장자를 붙여주어야 한다.
         */

        dispatch(shootProjectActions.changeFileToLoad({ file, fileName }));
        return;
      }

      if (extension === 'fbx') {
        onModalOpen({ title: 'Importing the file', message: 'This can take up to 3 minutes' });

        await convertFBXtoGLB(file)
          .then((response) => {
            onModalClose();

            setFileName(fileName);

            /**
             * @TODO 파일 확장자 저장 필요 및 이후 rename시에 확장자는 제외하고 수정하고 확정시에 확장자를 붙여주어야 한다.
             */
            dispatch(shootProjectActions.changeFileToLoad({ file: response, fileName }));
          })
          .catch(() => {
            onModalOpen({
              title: 'Warning',
              message: '파일 변환 중 예기치 못한 에러가 발생했습니다.<br />계속하여 발생하는 경우 contact@plask.ai로 문의주세요.',
              confirmText: 'Contact',
              onConfirm: () => {
                // location.href = 'mailto:contact@plask.ai';
                onModalClose();
              },
            });
          });

        return;
      }
    },
    [dispatch, onModalClose, onModalOpen],
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
          message: '영상 파일을 동시에 2개 이상 가져올 수 없습니다.',
          confirmText: 'Close',
          onConfirm: () => onModalClose(),
        });

        return;
      }

      if (isInvalidFormat) {
        onModalOpen({ title: 'Warning', message: 'Unsupported file format', confirmText: 'Close' });

        return;
      }

      /**
       * @TODO 하나라도 실패 시 전부 취소하거나 성공하는 포맷들만 로드하거나 필요
       */
      removedVideoFiles.map(async (file) => await onFileLoad(file));

      // Video 파일은 반드시 1개만 로드가 가능하기 때문에 첫 요소만 처리
      onModalOpen({
        title: 'Extract',
        message: '모션을 추출하시겠습니까?',
        confirmText: '확인',
        cancelText: '취소',
        onConfirm: () => {
          alert('Video !');
          // 비디오 모드 전환
        },
        onCancel: () => onModalClose(),
      });
    },
    [onFileLoad, onModalClose, onModalOpen],
  );

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const [view, setView] = useState<LP.View>('List');

  return (
    <div className={cx('wrapper')} {...getRootProps()}>
      <div className={cx('inner')}>
        <Box id="LP-Header" noResize>
          <LPHeader />
        </Box>
        <Box id="LP-Controlbar" noResize>
          <LPControlbar />
        </Box>
        <Box id="LP-Body" className={cx('lp-body')} noResize>
          <LPBody view={view} />
        </Box>
      </div>
    </div>
  );
};

export default memo(LibraryPanel);
