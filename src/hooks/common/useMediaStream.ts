import { RefObject, useCallback, useState, Dispatch, SetStateAction } from 'react';

interface Props {
  ref: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  setThumbnailList: Dispatch<SetStateAction<never[]>>;
  setDuration: Dispatch<SetStateAction<number>>;
  setPlayState: Dispatch<SetStateAction<boolean>>;
  browserType: string;
}

const useMediaStream = (props: Props) => {
  const { ref, canvasRef, setThumbnailList, setPlayState, setDuration, browserType } = props;
  const [currentStream, setCurrentStream] = useState<MediaStream>();
  const [recorderData, setRecorderData] = useState<MediaRecorder>();

  const mediaStreamInitialize = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      ref.current!.srcObject = stream;
      setCurrentStream(stream);
    });
  }, [ref]);

  const stopStream = useCallback(() => {
    if (currentStream && ref.current!.srcObject) {
      const tracks = currentStream.getTracks();
      // const stream = ref.current!.srcObject as MediaStream;
      // const tracks2 = stream.getTracks();

      tracks.forEach((track) => track.stop());
      // tracks2.forEach((track: any) => track.stop());
      ref.current!.srcObject = null;
    }
  }, [currentStream, ref]);

  const availableDevices = useCallback(() => {}, []);

  const handleScreenshot = useCallback(() => {
    if (canvasRef && ref) {
      canvasRef.current!.width = ref.current!.videoWidth;
      canvasRef.current!.height = ref.current!.videoHeight;

      const canvasContext = canvasRef.current!.getContext('2d');
      canvasContext!.drawImage(ref.current as CanvasImageSource, 0, 0);

      return canvasRef.current?.toDataURL('image/webp');
    }
  }, [canvasRef, ref]);

  const handleMetaData = useCallback(() => {
    let count = 0;
    let thumbnailList: any = [];
    let dividedDuration: number = 0;

    const checkDuration = setInterval(() => {
      if (ref.current!.duration !== Infinity) {
        console.log('here to check if this setINterval is activated more than once');
        ref.current!.pause();
        ref.current!.currentTime = 0;
        clearInterval(checkDuration);
        dividedDuration = ref.current!.duration / 20;
        setDuration(ref.current!.duration);

        const setScreenshot = setInterval(() => {
          if (count < 20) {
            console.log('duration: ', dividedDuration);
            count++;
            thumbnailList = [...thumbnailList, handleScreenshot()];
            ref.current!.currentTime += dividedDuration;
          } else {
            ref.current!.currentTime = 0;
            setThumbnailList(thumbnailList);
            clearInterval(setScreenshot);
          }
        }, 150);
      }
    }, 500);
  }, [ref, handleScreenshot, setThumbnailList, setDuration]);

  const startRecording = useCallback(() => {
    if (recorderData && recorderData.state === 'recording') {
      console.log('already recording');
      return;
    }
    if (currentStream) {
      setThumbnailList([]);
      let recorder = new MediaRecorder(currentStream, {
        mimeType: browserType === 'safari' ? 'video/mp4' : 'video/webm',
      });
      let blobs: Blob[] = [];

      if (recorder.state === 'inactive') {
        mediaStreamInitialize();
      }

      recorder.ondataavailable = (e) => {
        console.log('data pushed', e);
        blobs.push(e.data);
      };

      recorder.onstop = () => {
        let video_local = URL.createObjectURL(
          new Blob(blobs, { type: browserType === 'safari' ? 'video/mp4' : 'video/webm' }),
        );
        stopStream();
        ref.current!.src = video_local;
      };

      recorder.start(1000);

      setRecorderData(recorder);
    }
  }, [
    recorderData,
    currentStream,
    mediaStreamInitialize,
    browserType,
    ref,
    stopStream,
    setThumbnailList,
  ]);

  const stopRecording = useCallback(
    async (e) => {
      if (recorderData && recorderData.onstop) {
        if (recorderData.state === 'recording') {
          recorderData.onstop(e);
          handleMetaData();
          recorderData.stop();
        }
      }
    },
    [recorderData, handleMetaData],
  );

  const playRecording = useCallback(() => {
    if (ref) {
      setPlayState(true);
      ref.current!.play();
    }
  }, [ref, setPlayState]);

  const pauseRecording = useCallback(() => {
    if (ref) {
      setPlayState(false);
      ref.current!.pause();
    }
  }, [ref, setPlayState]);

  return {
    mediaStreamInitialize,
    availableDevices,
    startRecording,
    stopRecording,
    playRecording,
    pauseRecording,
    // mediaBlobUrl,
  };
};

export default useMediaStream;
