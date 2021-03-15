import { FunctionComponent, memo, useEffect, useCallback, RefObject } from 'react';
import _ from 'lodash';
import { AnimationAction } from 'three/src/animation/AnimationAction';
import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  isStart?: boolean;
  // 추후 타입 재정의
  data?: any[];
  innerRef?: RefObject<HTMLDivElement>;
  skeletonHelper?: THREE.SkeletonHelper;
  currentAction?: AnimationAction;
}

const properties = [
  'positionX',
  'positionY',
  'positionZ',
  'quaternionX',
  'quaternionY',
  'quaternionZ',
  'quaternionW',
  'scaleX',
  'scaleY',
  'scaleZ',
];

const Model: FunctionComponent<Props> = ({
  isStart,
  data,
  innerRef,
  skeletonHelper,
  currentAction,
}) => {
  useEffect(() => {
    // console.log('skeletonHelper');
    // console.log(skeletonHelper);
    if (!isStart && data && !_.isEmpty(data)) {
      if (skeletonHelper) {
        // console.log('data');
        // console.log(data);
        _.map(data, (item) => {
          const targetBone = _.find(skeletonHelper.bones, { name: item.boneName });
          if (targetBone) {
            console.log('targetBone');
            // hip에만 position이 있음
            // console.log(item);
            // targetBone.position.x = item.positionX;
            // targetBone.position.y = item.positionY;
            // targetBone.position.z = item.positionZ;
            targetBone.quaternion.w = item.quaternionW;
            targetBone.quaternion.x = item.quaternionX;
            targetBone.quaternion.y = item.quaternionY;
            targetBone.quaternion.z = item.quaternionZ;
            // targetBone.scale.x = item.scaleX;
            // targetBone.scale.y = item.scaleY;
            // targetBone.scale.z = item.scaleZ;
          }
        });
      }
    }
  }, [data, isStart, skeletonHelper]);

  const handlePlay = useCallback(() => {
    currentAction?.play();
  }, [currentAction]);

  return <div id="container" ref={innerRef} className={cx('wrapper')} />;
};

export default memo(Model);
