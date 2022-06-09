import { IAnimationKey } from '@babylonjs/core';
import { PlaskProperty, ServerAnimationTrackRequest } from 'types/common';
import { DEFAULT_BETA, DEFAULT_MIN_CUTOFF, MOCAP_QUATERNION_BETA, MOCAP_QUATERNION_MIN_CUTOFF, MOCAP_POSITION_BETA, MOCAP_POSITION_MIN_CUTOFF } from 'utils/const';

/**
 * Create PlaskTrack which constitutes PlaskLayer.
 * cf. AnimationIngredient > PlaskLayer > PlaskTrack
 *
 * @param name - track's name
 * @param layerId - id of the layer where the track is included in
 * @param target - track's target
 * @param property - target's propery that the track will handle
 * @param isMocapAnimation - whether this track is from mocap data or not
 */
const createPlaskServerTrack = (name: string, target: any, property: PlaskProperty, isMocapAnimation: boolean): ServerAnimationTrackRequest => {
  let filterBeta = DEFAULT_BETA;
  let filterMinCutoff = DEFAULT_MIN_CUTOFF;

  if (isMocapAnimation) {
    if (property === 'rotationQuaternion') {
      filterBeta = MOCAP_QUATERNION_BETA;
      filterMinCutoff = MOCAP_QUATERNION_MIN_CUTOFF;
    } else if (property === 'position') {
      filterBeta = MOCAP_POSITION_BETA;
      filterMinCutoff = MOCAP_POSITION_MIN_CUTOFF;
    }
  }

  return {
    id: `layerId//${target.id}//${property}`,
    targetId: target.id,
    name,
    property: property,
    filterBeta,
    filterMinCutoff,
    transformKeysMap: [],
  };
};

export default createPlaskServerTrack;
