import { cloneDeep } from 'lodash';
import { AnimationIngredient, PlaskLayer, PlaskTrack } from 'types/common';
import { getRandomStringKey } from 'utils/common';

/**
 * animationIngredient를 받아, keyframe 정보를 복제한 새로운 animationIngredient를 반환합니다.
 *
 *  @param animationIngredient - 복제 대상이 되는 animationIngredient
 *  @param afterName - 복제되는 animationIngredient name
 */
const duplicateAnimationIngredient = (animationIngredient: AnimationIngredient, afterName: string): AnimationIngredient => {
  const layerIdMap: { [id in string]: string } = {};

  const { name, assetId, tracks, layers } = animationIngredient;

  const newLayers: PlaskLayer[] = [];
  const newTracks: PlaskTrack[] = [];

  layers.forEach((layer) => {
    const newLayerId = layer.id.includes('baseLayer//') ? `baseLayer//${getRandomStringKey()}` : getRandomStringKey();
    layerIdMap[layer.id] = newLayerId;
    newLayers.push({ id: newLayerId, name: layer.name });
  });

  tracks.forEach((track) => {
    const newTrack: PlaskTrack = {
      ...track,
      id: `${layerIdMap[track.layerId]}//${track.targetId}//${track.property}`,
      layerId: layerIdMap[track.layerId],
      transformKeys: cloneDeep(track.transformKeys),
    };
    newTracks.push(newTrack);
  });

  const newAnimationIngredient = {
    id: getRandomStringKey(),
    name: afterName || name,
    assetId: assetId,
    current: false,
    tracks: newTracks,
    layers: newLayers,
  };

  return newAnimationIngredient;
};

export default duplicateAnimationIngredient;
