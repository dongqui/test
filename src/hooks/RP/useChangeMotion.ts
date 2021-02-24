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
    if (!_.isEmpty(motionData) && !_.isUndefined(skeletonHelper)) {
      _.map(skeletonHelper?.bones, (bone, index) => {
        skeletonHelper.bones[index].position.x = motionData[index].positionX;
        skeletonHelper.bones[index].position.y = motionData[index].positionY;
        skeletonHelper.bones[index].position.z = motionData[index].positionZ;
        // bone.rotation.x = motionData[index].eulerX;
        // bone.rotation.y = motionData[index].eulerY;
        // bone.rotation.z = motionData[index].eulerZ;
        skeletonHelper.bones[index].quaternion.x = motionData[index].quaternionX;
        skeletonHelper.bones[index].quaternion.y = motionData[index].quaternionY;
        skeletonHelper.bones[index].quaternion.z = motionData[index].quaternionZ;
        skeletonHelper.bones[index].quaternion.w = motionData[index].quaternionW;
        skeletonHelper.bones[index].scale.x = motionData[index].scaleX;
        skeletonHelper.bones[index].scale.y = motionData[index].scaleY;
        skeletonHelper.bones[index].scale.z = motionData[index].scaleZ;
      });
    }
  }, [motionData, skeletonHelper]);
  useEffect(() => {
    if (skeletonHelper) {
      changeMotion();
    }
  }, [changeMotion, skeletonHelper]);
};
