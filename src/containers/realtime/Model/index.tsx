import { FunctionComponent, memo, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRenderingModel } from 'hooks/RP/useRenderingModel';
import _ from 'lodash';
import { DEFAULT_MODEL_URL } from 'utils/const';
import useDropzone from '../utils/useDropzone';
import { FilledButton } from 'components/New_Buttons';
import { CONFIG_INFOS } from './const';
import { FORMAT_TYPES } from 'interfaces';
import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  isStart?: boolean;
  // 추후 타입 재정의
  data?: any[];
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

const Model: FunctionComponent<Props> = ({ isStart, data }) => {
  const [mixer, setMixer] = useState<THREE.AnimationMixer>();
  const [skeletonHelper, setSkeletonHelper] = useState<THREE.SkeletonHelper>();
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>();

  const currentAnimationClip = useMemo(() => animations?.[1], [animations]);
  const currentAction = useMemo(() => {
    let action;
    if (currentAnimationClip) {
      action = mixer?.clipAction(currentAnimationClip);
    }
    return action;
  }, [currentAnimationClip, mixer]);

  const [targetBlobUrl, setTargetBolbUrl] = useState('');

  const modelRef = useRef<HTMLDivElement>(null);

  const handleFileLoad = (file?: File[]) => {
    if (file && !_.isEmpty(file)) {
      const blobUrl = URL.createObjectURL(file[0]);
      setTargetBolbUrl(blobUrl);
    }
  };

  useDropzone({
    dropzoneRef: modelRef,
    onDrop: handleFileLoad,
  });

  useRenderingModel({
    id: 'container',
    fileUrl: targetBlobUrl || DEFAULT_MODEL_URL,
    format: FORMAT_TYPES.glb,
    setMixer,
    CONFIG_INFOS: CONFIG_INFOS,
    setSkeletonHelper,
    setAnimations,
  });

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

  return (
    <>
      <div id="container" ref={modelRef} className={cx('wrapper')} />
      <FilledButton className={cx('play')} onClick={handlePlay}>
        Play
      </FilledButton>
    </>
  );
};

export default memo(Model);
