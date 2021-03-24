import _ from 'lodash';
import React, { memo, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RenderingPresenter } from './RenderingPresenter';
import { useRendering } from '../../../hooks/RP/useRendering';
import { ShootLayerType, ShootTrackType } from 'types';
import { storeAnimatingData, storeMainData, storeRenderingData } from 'lib/store';
import { useReactiveVar } from '@apollo/client';
import { fnGetAnimationClip } from 'utils/TP/editingUtils';

export interface RenderingControllerProps {
  id: string;
  fileUrl?: string;
}
const RenderingController: React.FC<RenderingControllerProps> = ({ id, fileUrl }) => {
  // store data
  const mainData = useReactiveVar(storeMainData);
  const renderingData = useReactiveVar(storeRenderingData);
  const animatingData = useReactiveVar(storeAnimatingData);
  // component state
  const [mixer, setMixer] = useState<THREE.AnimationMixer | undefined>(undefined);
  const [skeletonHelper, setSkeletonHelper] = useState<THREE.SkeletonHelper | undefined>(undefined);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | undefined>(undefined);

  useRendering({
    id,
    fileUrl,
    setMixer,
    setSkeletonHelper,
    setAnimations,
  });

  useEffect(() => {
    console.log('mainData: ', mainData);
  }, [mainData]);

  const visualizedMotion = useMemo(() => {
    const visualizedItem = _.find(mainData, (item) => item.isVisualized === true);
    if (_.isUndefined(visualizedItem)) {
      return;
    }
    if (visualizedItem.type === 'file') {
      return _.find(mainData, (item) => item.parentKey === visualizedItem.key);
    } else if (visualizedItem.type === 'motion') {
      return visualizedItem;
    }
  }, [mainData]);

  useEffect(() => {
    if (visualizedMotion) {
      console.log('baseLayer: ', visualizedMotion.baseLayer);
      console.log('layers: ', visualizedMotion.layers);
      const { name, baseLayer, layers } = visualizedMotion;
      const { startTimeIndex, endTimeIndex } = animatingData;
      if (mixer && name && baseLayer && layers) {
        const visualizedClip = fnGetAnimationClip({
          name,
          baseLayer,
          layers,
          startTimeIndex,
          endTimeIndex,
        });
        const action = mixer.clipAction(visualizedClip);
        console.log(action);
        setCurrentAction(action);
        console.log('visualizedClip: ', visualizedClip);
      }
    }
  }, [animatingData, mixer, visualizedMotion]);

  // 바꿔야 함
  useEffect(() => {
    if (animatingData.isPlaying) {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 0.5 * animatingData.playSpeed * animatingData.playDirection;
      }
      currentAction?.play();
    } else {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 0;
      }
    }
  }, [
    currentAction,
    mixer,
    animatingData.isPlaying,
    animatingData.playDirection,
    animatingData.playSpeed,
  ]);
  //

  return <RenderingPresenter id={id} />;
};

export default memo(RenderingController);
