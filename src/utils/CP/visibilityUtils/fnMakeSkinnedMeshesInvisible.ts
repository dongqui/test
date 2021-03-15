import * as THREE from 'three';
import _ from 'lodash';

interface FnMakeSkinnedMeshesInvisible {
  scene: THREE.Scene;
}

/**
 * Makes skinned meshes within the scene invislble.
 * Reusable for making model's skin invisible.
 *
 * @param scene - The target scene where we can iterate for getting skinned meshes
 *
 */
const fnMakeSkinnedMeshesInvisible = (props: FnMakeSkinnedMeshesInvisible) => {
  const { scene } = props;
  const skinnedMeshes = _.filter(scene.children, (child) => child.type === 'SkinnedMesh');
  if (_.isEmpty(skinnedMeshes)) {
    _.forEach(scene.children, (innerChild) => {
      skinnedMeshes.push(...innerChild.children);
    });
  }
  _.forEach(skinnedMeshes, (mesh) => {
    if (_.isEqual(mesh.type, 'SkinnedMesh')) {
      // eslint-disable-next-line no-param-reassign
      mesh.visible = false;
    }
  });
};

export default fnMakeSkinnedMeshesInvisible;
