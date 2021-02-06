import _ from 'lodash';
import * as THREE from 'three';
import { useCallback, useEffect, useState } from 'react';
import { motionDataTypes } from '../../interfaces/RP';

export const useTensorflowMotion = ({
  skeletonHelper,
  motionData,
}: {
  skeletonHelper: THREE.SkeletonHelper | undefined;
  motionData: motionDataTypes[];
}) => {
  const changeMotion = () => {
    if (!_.isEmpty(motionData)) {
      _.map(skeletonHelper?.bones, (bone, index) => {
        bone.quaternion.w = bone.quaternion.w + motionData[index].quaternionW;
        bone.quaternion.x = bone.quaternion.x + motionData[index].quaternionX;
        bone.quaternion.y = bone.quaternion.y + motionData[index].quaternionY;
        bone.quaternion.z = bone.quaternion.z + motionData[index].quaternionZ;
      });
    }
  };
  return {
    changeMotion,
  };
};
