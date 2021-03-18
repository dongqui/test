import { FunctionComponent, memo, useCallback, useState, useMemo, useRef, useEffect } from 'react';
import _ from 'lodash';
import WebcamPanel from './Webcam';
import Model from './Model';
import { getDummyData } from 'utils/RT/getDummyData';
import { useRenderingModel } from 'hooks/RP/useRenderingModel';
import { DEFAULT_MODEL_URL } from 'utils/const';
import useDropzone from './utils/useDropzone';
import { FilledButton } from 'components/New_Buttons';
import { renderingOptions } from './const';
import { FORMAT_TYPES } from 'interfaces';
import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

type RecordStatus = 'START' | 'END';

const RealtimeContainer: FunctionComponent = () => {
  // const handleRetarget = useCallback(() => {
  //   console.log('handleRetarget');
  // }, []);

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
    renderingOptions: renderingOptions,
    setSkeletonHelper,
    setAnimations,
  });

  const [isStart, setIsStart] = useState(false);
  const [retargetedData, setRetargetedData] = useState<any[]>([]);

  const handleStart = useCallback((status: RecordStatus) => {
    const isRecording = _.isEqual(status, 'START');

    setIsStart(isRecording);
  }, []);

  useEffect(() => {
    if (isStart) {
      const interval = setInterval(() => {
        setRetargetedData(getDummyData);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isStart]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('model')}>
        <Model
          isStart={isStart}
          data={retargetedData}
          currentAction={currentAction}
          innerRef={modelRef}
          skeletonHelper={skeletonHelper}
        />
      </div>
      <WebcamPanel isStart={isStart} onStart={handleStart} />
    </div>
  );
};

export default memo(RealtimeContainer);
