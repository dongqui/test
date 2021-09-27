import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { v4 as uuidv4 } from 'uuid';
import * as shootProjectActions from 'actions/shootProjectAction';
import { ShootAsset } from 'types/common';
import { createEmptyRetargetMap } from 'utils/RP';

const SAMPLE_NEW_FILE_URL =
  'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1612095825/DyingToGlb_fqke1a.glb';

const DEFAULT_HIP_SPACE = 1;

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

          // id 교체 작업 (assetId + bone 이름/Id + 요소 종류)
          // joint 부착 작업
          // animationIngredient 전처리 작업
          // animationGroup 없는 경우에 대한 처리도 논의 필요

          const newAsset: ShootAsset = {
            id: assetId,
            meshes,
            geometries,
            skeleton: skeletons[0],
            bones: skeletons[0].bones,
            transformNodes,
            joints: [],
            controllers: [],
            animationIngredients: [],
            currentAnimationIngredientId: '',
            retargetMap: createEmptyRetargetMap(),
            boneVisibleSceneIds: sceneList.map((scene) => scene.id),
            meshVisibleSceneIds: sceneList.map((scene) => scene.id),
            hasControllersSceneIds: sceneList.map((scene) => scene.id),
          };
        };

        if (fileToLoad) {
          loadGlbFileAsync(fileToLoad, scene);
        }
      }
    }
  }, [fileToLoad, sceneList]);
};

export default useLoadAssets;
