import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { v4 as uuidv4 } from 'uuid';
import * as shootProjectActions from 'actions/shootProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import { AnimationIngredient, ShootAsset } from 'types/common';
import { createAnimationIngredient, createEmptyRetargetMap } from 'utils/RP';
import { getFileExtension } from 'utils/common';

const useLoadAssets = () => {
  const sceneList = useSelector((state) => state.shootProject.sceneList);
  const fileToLoad = useSelector((state) => state.shootProject.fileToLoad);
  const fileNameToLoad = useSelector((state) => state.shootProject.fileNameToLoad);

  const dispatch = useDispatch();

  useEffect(() => {
    if (sceneList[0]) {
      const scene = sceneList[0].scene;

      if (scene && scene.isReady()) {
        const loadGlbFileAsync = async (fileUrl: string | File, fileName: string, scene: BABYLON.Scene) => {
          let loadedAssetContainer: BABYLON.AssetContainer;

          if (typeof fileUrl === 'string') {
            loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(fileUrl, '', scene);
          } else {
            loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync('file:', (fileUrl as unknown) as string, scene);
          }

          const { meshes, geometries, skeletons, transformNodes, animationGroups } = loadedAssetContainer;

          const assetId = uuidv4();

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

          // animationGroup 없는 경우에 대한 처리도 논의 필요
          const animationIngredientIds: string[] = [];
          const animationIngredients: AnimationIngredient[] = [];
          animationGroups.forEach((animationGroup, idx) => {
            animationGroup.pause();
            const animationIngredient = createAnimationIngredient(
              assetId,
              animationGroup,
              false,
              idx === 0, // load 시에는 첫번째 animationGroup을 current로 사용
            );
            animationIngredientIds.push(animationIngredient.id);
            animationIngredients.push(animationIngredient);
          });

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
        };

        if (fileToLoad && fileNameToLoad) {
          loadGlbFileAsync(fileToLoad, fileNameToLoad, scene);
        }
      }
    }
  }, [dispatch, fileNameToLoad, fileToLoad, sceneList]);
};

export default useLoadAssets;
