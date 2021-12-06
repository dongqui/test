import { FunctionComponent, memo, useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { useDropzone } from 'react-dropzone';
import produce from 'immer';
import '@babylonjs/loaders/glTF';
import { convertModel } from 'api';
import { filterAnimatableTransformNodes, getFileExtension, getRandomStringKey } from 'utils/common';
import { createAnimationIngredient } from 'utils/RP';
import { checkCreateDuplicates } from 'utils/LP/FileSystem';
import { createAutoRetargetMap, createEmptyRetargetMap } from 'utils/LP/Retarget';
import { v4 as uuid } from 'uuid';
import * as TEXT from 'constants/Text';
import * as BABYLON from '@babylonjs/core';
import * as animationDataActions from 'actions/animationDataAction';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as modeSelectActions from 'actions/modeSelection';
import { AnimationIngredient, PlaskAsset, PlaskRetargetMap } from 'types/common';
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
  const _lpNode = useSelector((state) => state.lpNode.node);
  const _lpCurrentPath = useSelector((state) => state.lpNode.currentPath);
  const _screenList = useSelector((state) => state.plaskProject.screenList);

  const [view, setView] = useState<LP.View>('List');
  const [searchText, setSearchText] = useState('');
  const [searchResultNode, setSearchResultNode] = useState(_lpNode);

  const { onModalOpen, onModalClose } = useBaseModal();

  const handleFileLoad = useCallback(
    async (file: File | string) => {
      const baseScene = _screenList[0].scene;
      let loadedAssetContainer: BABYLON.AssetContainer | undefined = undefined;

      const targetName = file instanceof File ? file.name : file;

      const extension = getFileExtension(targetName).toLowerCase();
      const fileName = targetName.split('.').slice(0, -1).join('.');

      if (extension === 'fbx') {
        onModalOpen({ title: 'Importing the file', message: 'This can take up to 3 minutes' });

        if (file instanceof File) {
          const fileUrl = await convertModel(file, 'glb')
            .then((response) => {
              onModalClose();
              return response;
            })
            .catch(async () => {
              onModalOpen({
                title: 'Warning',
                message: TEXT.WARNING_07,
                confirmText: 'Contact',
                onConfirm: () => {
                  // location.href = 'mailto:contact@plask.ai';
                  onModalClose();
                },
              });
            });

          if (fileUrl) {
            loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(fileUrl, '', baseScene);
          }
        }
      }

      if (extension === 'glb') {
        if (file instanceof File) {
          loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync('file:', (file as unknown) as string, baseScene);
        }

        if (typeof file === 'string') {
          loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(`/models/${file}`, '', baseScene);
        }
      }

      if (!loadedAssetContainer) {
        return;
      }

      const { meshes, geometries, skeletons, transformNodes, animationGroups } = loadedAssetContainer;

      const assetId = getRandomStringKey();

      meshes.forEach((mesh) => {
        // joint 클릭을 위해 mesh 클릭을 불가능하게 처리
        mesh.isPickable = false;
      });

      if (skeletons && skeletons.length > 0) {
        skeletons[0].bones.forEach((bone) => {
          // bone id를 unique한 id로 생성
          bone.id = `${assetId}//${bone.name}//bone`;
        });
      }

      transformNodes.forEach((transformNode) => {
        // transformNode id를 unique한 id로 생성
        transformNode.id = `${assetId}//${transformNode.name}//transformNode`;
      });

      const animationIngredientIds: string[] = [];
      const animationIngredients: AnimationIngredient[] = [];

      animationGroups.forEach((animationGroup, idx) => {
        // 모델 로드 시 animation 재생을 방지
        animationGroup.pause();

        //
        /**
         * 모델이 가진 animationGroups를 통해 자체적인 애니메이션 데이터인 animationIngredients를 생성
         * 첫 번째 animationGroup을 current로 사용 (idx === 0)
         */
        const animationIngredient = createAnimationIngredient(
          assetId,
          animationGroup.name,
          animationGroup.targetedAnimations,
          filterAnimatableTransformNodes(transformNodes),
          false,
          idx === 0,
        );

        animationIngredientIds.push(animationIngredient.id);
        animationIngredients.push(animationIngredient);
      });

      // 모델에 대한 retargetMap을 생성
      let retargetMap: PlaskRetargetMap;
      try {
        // autoRetargetMap 생성 및 적용
        retargetMap = await createAutoRetargetMap(assetId, skeletons[0].bones, 3000);
      } catch (error) {
        // 실패 시 빈 retargetMap을 생성 및 적용
        retargetMap = createEmptyRetargetMap(assetId);
        console.error(error);
      }

      const currentPathNodeNames = _lpNode.filter((node) => node.parentId === '__root__' && node.name.includes(`${fileName}`)).map((filteredNode) => filteredNode.name);

      const check = checkCreateDuplicates(`${fileName}`, currentPathNodeNames);

      const nodeName = check === '0' ? `${fileName}.${extension}` : `${fileName} (${check}).${extension}`;

      const newAsset: PlaskAsset = {
        id: assetId,
        name: nodeName,
        extension,
        meshes,
        geometries,
        skeleton: skeletons[0] ?? null,
        bones: skeletons[0] ? skeletons[0].bones.filter((bone) => !bone.name.toLowerCase().includes('scene')) : [],
        transformNodes,
        animationIngredientIds,
        retargetMapId: retargetMap.id,
      };

      const nodes: LP.Node[] = [];

      const nextNodes = produce(nodes, (draft) => {
        // 로드한 모델을 통해 LP 모델 노드 생성
        const newModelNode: LP.Node = {
          id: uuid(),
          parentId: '__root__',
          filePath: '\\root',
          name: nodeName,
          extension,
          type: 'Model',
          assetId: newAsset.id,
          children: animationIngredientIds,
        };

        draft.push(newModelNode);

        // 로드한 모델의 모션을 통해 LP 모션 노드 생성
        const newMotionNodes = animationIngredients.map((ingredient) => {
          const motion: LP.Node = {
            id: ingredient.id,
            parentId: ingredient.assetId,
            filePath: '\\root' + `\\${nodeName}`,
            name: ingredient.name,
            extension: '',
            type: 'Motion',
            children: [],
          };

          return motion;
        });

        draft.push(...newMotionNodes);
      });

      dispatch(plaskProjectActions.addAsset({ asset: newAsset }));
      dispatch(
        animationDataActions.addAsset({
          transformNodes: filterAnimatableTransformNodes(transformNodes),
          animationIngredients,
          retargetMap,
        }),
      );

      return nextNodes;
    },
    [_lpNode, _screenList, dispatch, onModalClose, onModalOpen],
  );

  const onNodeChange = useCallback(
    async (files: File[] | string[]) => {
      const nextLoadedNodes: LP.Node[] = [];

      for (const current of files) {
        await handleFileLoad(current).then((res) => {
          if (res) {
            nextLoadedNodes.push(...res);
          }
        });
      }

      const nextNodes = produce(_lpNode, (draft) => {
        draft.push(...nextLoadedNodes);
      });

      dispatch(
        lpNodeActions.changeNode({
          nodes: nextNodes,
        }),
      );
    },
    [_lpNode, dispatch, handleFileLoad],
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
          onConfirm: () => onModalClose(),
        });

        return;
      }

      if (isInvalidFormat) {
        onModalOpen({ title: 'Warning', message: TEXT.WARNING_03, confirmText: 'Close' });

        return;
      }

      onNodeChange(removedVideoFiles);

      if (videos.length > 0) {
        /**
         * @TODO 이후 사용하지 않는 경우 remove url 필요
         */
        const videoBlobURL = URL.createObjectURL(videos[0]);

        onModalOpen({
          title: 'Extract',
          message: TEXT.CONFIRM_01,
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
    [dispatch, onModalClose, onModalOpen, onNodeChange],
  );

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const [isDefaultModelLoaded, setIsDefaultModelLoaded] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    const isSceneExist = _screenList.length > 0 && _screenList[0].scene;
    if (isSceneExist) {
      const scene = _screenList[0].scene;

      scene.executeWhenReady(() => {
        setIsSceneReady(true);
      });
    }
  }, [_screenList, isDefaultModelLoaded, isSceneReady, onNodeChange]);

  useEffect(() => {
    if (isSceneReady) {
      if (!isDefaultModelLoaded) {
        const defaultModels = ['Knight.glb', 'Zombie.glb', 'Vanguard.glb'];

        onNodeChange(defaultModels);
        setIsDefaultModelLoaded(true);
      }
    }
  }, [isDefaultModelLoaded, isSceneReady, onNodeChange]);

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
