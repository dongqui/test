import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { v4 as uuidv4 } from 'uuid';
import * as shootProjectActions from 'actions/shootProjectAction';
import { AnimationIngredient, ShootAsset } from 'types/common';
import { createAnimationIngredient, createEmptyRetargetMap } from 'utils/RP';

const SAMPLE_NEW_FILE_URL =
  'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1612095825/DyingToGlb_fqke1a.glb';

const useLoadAssets = () => {
  const { sceneList, fileToLoad } = useSelector((state) => state.shootProject);

  const dispatch = useDispatch();

  useEffect(() => {
    if (sceneList[0]) {
      const scene = sceneList[0].scene;

      if (scene && scene.isReady()) {
        const loadGlbFileAsync = async (fileUrl: string | File, scene: BABYLON.Scene) => {
          let loadedAssetContainer: BABYLON.AssetContainer;

          if (typeof fileUrl === 'string') {
            loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(
              fileUrl,
              '',
              scene,
            );
          } else {
            loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(
              'file:',
              (fileUrl as unknown) as string,
              scene,
            );
          }

          const {
            meshes,
            geometries,
            skeletons,
            transformNodes,
            animationGroups,
          } = loadedAssetContainer;

          const assetId = uuidv4();

          meshes.forEach((mesh) => {
            // joint 클릭을 위해 mesh의 클릭을 막습니다.
            mesh.isPickable = false;
          });

          skeletons[0].bones.forEach((bone) => {
            // bone id를 자체적인 규칙에 따라 유일한 식별자로 만듭니다.
            bone.id = `${assetId}/${bone.name}/bone`;
          });

          transformNodes.forEach((transformNode) => {
            // transformNode id를 자체적인 규칙에 따라 유일한 식별자로 만듭니다.
            transformNode.id = `${assetId}/${transformNode.name}/transformNode`;
          });

          // animationGroup 없는 경우에 대한 처리도 논의 필요
          const animationIngredients: AnimationIngredient[] = [];
          animationGroups.forEach((animationGroup) => {
            animationGroup.pause();
            animationIngredients.push(createAnimationIngredient(animationGroup, false));
          });

          const newAsset: ShootAsset = {
            id: assetId,
            meshes,
            geometries,
            skeleton: skeletons[0] ?? null,
            bones: skeletons[0] ? skeletons[0].bones : [],
            transformNodes,
            // joint와 controller들은 생성 시 scene에 render되기 때문에, visualize 시에 생성합니다.
            joints: [],
            controllers: [],
            animationIngredients,
            currentAnimationIngredientId:
              animationIngredients.length !== 0 ? animationIngredients[0].id : null,
            retargetMap: createEmptyRetargetMap(),
            boneVisibleSceneIds: sceneList.map((scene) => scene.id),
            meshVisibleSceneIds: sceneList.map((scene) => scene.id),
            hasControllersSceneIds: sceneList.map((scene) => scene.id),
          };

          console.log('newAsset: ', newAsset);
        };

        if (fileToLoad) {
          loadGlbFileAsync(fileToLoad, scene);
        }
      }
    }
  }, [fileToLoad, sceneList]);
};

export default useLoadAssets;
