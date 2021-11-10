import { FunctionComponent, memo, useEffect, useState, useCallback, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { useDropzone } from 'react-dropzone';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { clone, isUndefined } from 'lodash';
import produce from 'immer';
import { v4 as uuid } from 'uuid';
import { convertFBXtoGLB } from 'api';
import { getFileExtension } from 'utils/common';
import { createAnimationIngredient, createEmptyRetargetMap } from 'utils/RP';
import * as animationDataActions from 'actions/animationDataAction';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as shootProjectActions from 'actions/shootProjectAction';
import * as modeSelectActions from 'actions/modeSelection';
import { AnimationIngredient, ShootAsset } from 'types/common';
import Box from 'components/Layout/Box';
import { useBaseModal } from 'new_components/Modal/BaseModal';
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
  const sceneList = useSelector((state) => state.shootProject.sceneList);
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
      let nextLPNodes = clone(lpNode);

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

      // reducer에 최소 하나의 scene도 없는 경우 return
      if (!sceneList[0]) {
        return;
      }

      // assetLoad에 사용할 baseScene이 없거나 준비되지 않은 상태라면 return
      const baseScene = sceneList[0].scene;
      if (!(baseScene && baseScene.isReady())) {
        return;
      }

      let loadedAssetContainer: BABYLON.AssetContainer | undefined = undefined;

      if (extension === 'glb') {
        setFileName(fileName);
        setFileExtension(extension);

        /**
         * @TODO 파일 확장자 저장 필요 및 이후 rename시에 확장자는 제외하고 수정하고 확정시에 확장자를 붙여주어야 한다.
         */

        // dispatch(shootProjectActions.changeFileToLoad({ file, fileName }));

        loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync('file:', (file as unknown) as string, baseScene);
      }

      if (extension === 'fbx') {
        onModalOpen({ title: 'Importing the file', message: 'This can take up to 3 minutes' });

        const fileUrl = await convertFBXtoGLB(file)
          .then((response) => {
            onModalClose();

            setFileName(fileName);

            return response;
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

        if (fileUrl) {
          /**
           * @TODO 파일 확장자 저장 필요 및 이후 rename시에 확장자는 제외하고 수정하고 확정시에 확장자를 붙여주어야 한다.
           */
          // dispatch(shootProjectActions.changeFileToLoad({ file: response, fileName }));
          loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(fileUrl, '', baseScene);
        }
      }

      if (isUndefined(loadedAssetContainer)) {
        return;
      }

      const { meshes, geometries, skeletons, transformNodes, animationGroups } = loadedAssetContainer;

      const assetId = uuid();

      meshes.forEach((mesh) => {
        // joint 클릭을 위해 mesh의 클릭을 막습니다.
        mesh.isPickable = false;
      });

      skeletons[0].bones.forEach((bone) => {
        // bone id를 자체적인 규칙에 따라 유일한 식별자로 만듭니다.
        bone.id = `${assetId}//${bone.name}//bone`;
      });

      transformNodes.forEach((transformNode) => {
        // transformNode id를 자체적인 규칙에 따라 유일한 식별자로 만듭니다.
        transformNode.id = `${assetId}//${transformNode.name}//transformNode`;
      });

      const animationIngredientIds: string[] = [];
      const animationIngredients: AnimationIngredient[] = [];
      animationGroups.forEach((animationGroup, idx) => {
        // load 시에 애니메이션이 재생되는 경우를 방지
        animationGroup.pause();
        // 모델 파일이 가진 animationGroups를 통해 자체적인 애니메이션 데이터인 animationIngredients를 생성
        const animationIngredient = createAnimationIngredient(
          assetId,
          animationGroup,
          false,
          idx === 0, // load 시에는 첫번째 animationGroup을 current로 사용
        );
        animationIngredientIds.push(animationIngredient.id);
        animationIngredients.push(animationIngredient);
      });

      // 모델에 대한 빈 retargetMap을 생성
      // 자동 retargetMap 구현 후에는 createEmptyRetargetMap 대신 api를 연결한 createAutoRetargetMap을 호출
      const retargetMap = createEmptyRetargetMap(assetId);

      const newAsset: ShootAsset = {
        id: assetId,
        name: fileName,
        extension: getFileExtension(fileName).toLowerCase(),
        meshes,
        geometries,
        skeleton: skeletons[0] ?? null,
        bones: skeletons[0] ? skeletons[0].bones.filter((bone) => !bone.name.toLowerCase().includes('scene')) : [],
        transformNodes,
        animationIngredientIds,
        retargetMapId: retargetMap.id,
      };

      dispatch(shootProjectActions.addAsset({ asset: newAsset }));
      dispatch(
        animationDataActions.addAsset({
          transformNodes: transformNodes.filter(
            (t) => !t.name.toLowerCase().includes('camera') && !t.name.toLowerCase().includes('scene') && !t.name.toLowerCase().includes('armature'),
          ),
          animationIngredients,
          retargetMap,
        }),
      );
    },
    [dispatch, onModalClose, onModalOpen, sceneList],
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

      if (videos.length > 0) {
        /**
         * @TODO 이후 사용하지 않는 경우 remove url 필요
         */
        const videoBlobURL = URL.createObjectURL(videos[0]);

        onModalOpen({
          title: 'Extract',
          message: '모션을 추출하시겠습니까?',
          confirmText: '확인',
          cancelText: '취소',
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
    [dispatch, onFileLoad, onModalClose, onModalOpen],
  );

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const [view, setView] = useState<LP.View>('List');

  const [searchText, setSearchText] = useState('');
  const [searchResultNode, setSearchResultNode] = useState<LP.Node[]>(lpNode);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchText(text);

      if (text.length > 0) {
        const searchResult = lpNode.filter((node) => node.name.toLowerCase().includes(text) || node.filePath.toLowerCase().includes(text));

        setSearchResultNode(searchResult);
      }
    },
    [lpNode],
  );

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
          <LPBody view={view} lpNode={searchText.length > 0 ? searchResultNode : lpNode} disableContextMenu={!!searchText} />
        </Box>
      </div>
    </div>
  );
};

export default memo(LibraryPanel);
