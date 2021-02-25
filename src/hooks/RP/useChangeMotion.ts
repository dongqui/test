import { bonesTypes, skeletonHelpersTypes } from 'interfaces';
import _ from 'lodash';
import { useCallback, useEffect } from 'react';

interface useChangeMotionProps {
  skeletonHelper?: THREE.SkeletonHelper;
  motionData: bonesTypes[];
}
export const useChangeMotion = ({ skeletonHelper, motionData }: useChangeMotionProps) => {
  useEffect(() => {
    if (!_.isUndefined(skeletonHelper)) {
      _.forEach(motionData, (item, index) => {
        try {
          skeletonHelper.bones[index].position.x = item.positionX;
          skeletonHelper.bones[index].position.y = item.positionY;
          skeletonHelper.bones[index].position.z = item.positionZ;
          skeletonHelper.bones[index].quaternion.w = item.quaternionW;
          skeletonHelper.bones[index].quaternion.x = item.quaternionX;
          skeletonHelper.bones[index].quaternion.y = item.quaternionY;
          skeletonHelper.bones[index].quaternion.z = item.quaternionZ;
          skeletonHelper.bones[index].scale.x = item.scaleX;
          skeletonHelper.bones[index].scale.y = item.scaleY;
          skeletonHelper.bones[index].scale.z = item.scaleZ;
        } catch (error) {
          console.log('error', error);
        }
      });
    }
  }, [motionData, skeletonHelper]);
};
