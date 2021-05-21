import * as THREE from 'three';
import _ from 'lodash';

interface FnMakeSkinnedMeshesVisible {
  scene: THREE.Scene;
}

/**
 * scene 안의 모든 Skinned Mesh 를 보이게 변경합니다.
 * 모델의 Skin 을 보이게 변경하는데 사용합니다.
 *
 * @param scene - The target scene where we can iterate for getting skinned meshes
 *
 */
const fnMakeSkinnedMeshesVisible = (props: FnMakeSkinnedMeshesVisible) => {
  const { scene } = props;
  const skinnedMeshes = _.filter(scene.children, (child) => child.type === 'SkinnedMesh');
  if (_.isEmpty(skinnedMeshes)) {
    _.forEach(scene.children, (child) => {
      skinnedMeshes.push(...child.children);
      skinnedMeshes.push(..._.filter(child.children, (item) => item.type === 'Object3D'));
    });
  }
  _.forEach(skinnedMeshes, (skinnedMesh) => {
    skinnedMeshes.push(..._.filter(skinnedMesh.children, (item) => item.type === 'Object3D'));
  });
  _.forEach(skinnedMeshes, (mesh) => {
    if (_.isEqual(mesh.type, 'SkinnedMesh')) {
      // eslint-disable-next-line no-param-reassign
      mesh.visible = true;
    } else {
      _.forEach(mesh.children, (meshChild) => {
        if (_.isEqual(meshChild.type, 'SkinnedMesh')) {
          // eslint-disable-next-line no-param-reassign
          meshChild.visible = true;
        }
      });
    }
  });
};

export default fnMakeSkinnedMeshesVisible;
