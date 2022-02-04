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

  const { name, assetId, layers } = animationIngredient;

  const newLayers: PlaskLayer[] = [];

  layers.forEach((layer) => {
    const isBaseLayer = layer.id.includes('baseLayer//');

    const newLayerId = isBaseLayer ? `baseLayer//${getRandomStringKey()}` : getRandomStringKey();
    layerIdMap[layer.id] = newLayerId;

    const { tracks } = layer;
    const newTracks: PlaskTrack[] = [];

    tracks.forEach((track) => {
      const newTrack: PlaskTrack = {
        ...track,
        id: `${layerIdMap[track.layerId]}//${track.targetId}//${track.property}`,
        layerId: layerIdMap[track.layerId],
        transformKeys: cloneDeep(track.transformKeys),
      };
      newTracks.push(newTrack);
    });

    newLayers.push({ id: newLayerId, name: layer.name, tracks: newTracks });
  });

  const newAnimationIngredient = {
    id: getRandomStringKey(),
    name: afterName || name,
    assetId: assetId,
    current: false,
    layers: newLayers,
  };

  return newAnimationIngredient;
};

export default duplicateAnimationIngredient;
