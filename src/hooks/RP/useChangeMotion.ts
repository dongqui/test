import _ from 'lodash';
import * as THREE from 'three';
import { useCallback, useEffect, useState } from 'react';
import { motionDataTypes } from '../../interfaces/RP';

export const useChangeMotion = ({
  skeletonHelper,
  motionData,
}: {
  skeletonHelper: THREE.SkeletonHelper | undefined;
  motionData: motionDataTypes[];
}) => {
  const changeMotion = useCallback(() => {
    if (!_.isEmpty(motionData)) {
      _.map(skeletonHelper?.bones, (bone, index) => {
        bone.quaternion.w = bone.quaternion.w + motionData[index].quaternionW;
        bone.quaternion.x = bone.quaternion.x + motionData[index].quaternionX;
        bone.quaternion.y = bone.quaternion.y + motionData[index].quaternionY;
        bone.quaternion.z = bone.quaternion.z + motionData[index].quaternionZ;
      });
    }
  }, [motionData, skeletonHelper?.bones]);
  useEffect(() => {
    if (skeletonHelper) {
      changeMotion();
    }
  }, [changeMotion, skeletonHelper]);
};
