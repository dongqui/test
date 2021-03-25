import _ from 'lodash';
import React, { memo, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RenderingPresenter } from './RenderingPresenter';
import { useRendering } from '../../../hooks/RP/useRendering';
import { FILE_TYPES, ShootLayerType, ShootTrackType } from 'types';
import { storeAnimatingData, storeMainData, storeRenderingData } from 'lib/store';
import { useReactiveVar } from '@apollo/client';
import { fnGetAnimationClip } from 'utils/TP/editingUtils';
import { fnSetPlayState, fnSetPlayDirection } from 'utils/RP/animatingUtils';

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
    if (visualizedItem.type === FILE_TYPES.file) {
      return _.find(mainData, (item) => item.parentKey === visualizedItem.key);
    } else if (visualizedItem.type === FILE_TYPES.motion) {
      return visualizedItem;
    }
  }, [mainData]);

  const { startTimeIndex, endTimeIndex } = animatingData;

  useEffect(() => {
    if (visualizedMotion) {
      const { name, baseLayer, layers } = visualizedMotion;
      if (mixer && name && baseLayer && layers) {
        const visualizedClip = fnGetAnimationClip({
          name,
          baseLayer,
          layers,
          startTimeIndex,
          endTimeIndex,
        });
        mixer.stopAllAction();
        const action = mixer.clipAction(visualizedClip);
        setCurrentAction(action);
      }
    }
  }, [mixer, startTimeIndex, endTimeIndex, visualizedMotion]);

  const { playState, playDirection, playSpeed, currentTimeIndex } = animatingData;

  useEffect(() => {
    if (mixer && currentAction) {
      fnSetPlayState({ mixer, currentAction, playState, playSpeed });
    }
  }, [currentAction, mixer, playSpeed, playState]);

  useEffect(() => {
    if (mixer) {
      fnSetPlayDirection({ mixer, playDirection });
    }
  }, [mixer, playDirection]);

  return <RenderingPresenter id={id} />;
};

export default memo(RenderingController);
