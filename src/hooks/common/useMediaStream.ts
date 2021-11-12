import { RefObject, useCallback, useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers';

interface Props {
  ref: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  recording: boolean;
  currentDeviceId: string;
  recordOverTwice: boolean;
  setThumbnailList: Dispatch<SetStateAction<never[]>>;
  setDuration: Dispatch<SetStateAction<number>>;
  setPlayState: Dispatch<SetStateAction<boolean>>;
  setRecordState: Dispatch<SetStateAction<boolean>>;
  setRecording: Dispatch<SetStateAction<boolean>>;
  setStandbyState: Dispatch<SetStateAction<boolean>>;
  setRecordOverTwice: Dispatch<SetStateAction<boolean>>;
  setTimer: Dispatch<SetStateAction<number>>;
  setDeviceList: Dispatch<SetStateAction<MediaDeviceInfo[]>>;
  setCurrentDevice: Dispatch<SetStateAction<string>>;
  setCurrentDeviceId: Dispatch<SetStateAction<string>>;
  setCameraDropdownState: Dispatch<SetStateAction<boolean>>;
  browserType: string;
}

const useMediaStream = (props: Props) => {
  const {
    ref,
    canvasRef,
    recording,
    currentDeviceId,
    recordOverTwice,
    setThumbnailList,
    setPlayState,
    setDuration,
    setRecordState,
    setRecording,
    setRecordOverTwice,
    setStandbyState,
    setTimer,
    setDeviceList,
    setCurrentDevice,
    setCurrentDeviceId,
    setCameraDropdownState,
    browserType,
  } = props;
  const timerRef = useRef<any>(null);
  const [currentStream, setCurrentStream] = useState<MediaStream>();
  const [recorderData, setRecorderData] = useState<MediaRecorder>();
  const [constraintList, setConstraint] = useState<Object>();
  const { videoURL } = useSelector((state: RootState) => state.modeSelection);

  const handleCameraList = useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices().then((totalDevice) => totalDevice.filter((device) => device.kind === 'videoinput'));
    // const videoDevice = devices.filter((device) => device.kind === 'videoinput');

    setDeviceList(devices);
  }, [setDeviceList]);

  const mediaStreamInitialize = useCallback(
    async (constraint = { video: true }) => {
      await navigator.mediaDevices.getUserMedia(constraint).then((stream) => {
        ref.current!.srcObject = stream;
        setCurrentStream(stream);
      });

      await handleCameraList();
    },
    [ref, handleCameraList],
  );

  const stopStream = useCallback(() => {
    if (currentStream && ref.current!.srcObject) {
      const tracks = currentStream.getTracks();
      const stream = ref.current!.srcObject as MediaStream;
      const tracks2 = stream.getTracks();

      tracks.forEach((track) => track.stop());
      tracks2.forEach((track: any) => {
        track.stop();
      });
      ref.current!.srcObject = null;
    }
  }, [currentStream, ref]);

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
        ref.current!.pause();
        ref.current!.currentTime = 0;
        clearInterval(checkDuration);
        dividedDuration = ref.current!.duration / 20;
        setDuration(ref.current!.duration);

        const setScreenshot = setInterval(() => {
          if (count < 20) {
            count++;
            thumbnailList = [...thumbnailList, handleScreenshot()];
            ref.current!.currentTime += dividedDuration;
          } else {
            ref.current!.currentTime = 0;
            setThumbnailList(thumbnailList);
            setRecordState(true);
            clearInterval(setScreenshot);
          }
        }, 150);
      } else {
        ref.current!.currentTime += 1e101;
      }
    }, 500);
  }, [ref, handleScreenshot, setThumbnailList, setDuration, setRecordState]);

  const startRecording = useCallback(() => {
    if (recorderData && recorderData.state === 'recording') {
      return;
    }

    if (currentStream) {
      setThumbnailList([]);
      setRecordState(false);
      let recorder = new MediaRecorder(currentStream, {
        mimeType: browserType === 'safari' ? 'video/mp4' : 'video/webm',
      });
      let blobs: Blob[] = [];

      if (recorder.state === 'inactive') {
        mediaStreamInitialize(constraintList);
      }

      recorder.ondataavailable = (e) => {
        blobs.push(e.data);
      };

      recorder.onstop = () => {
        let video_local = URL.createObjectURL(new Blob(blobs, { type: browserType === 'safari' ? 'video/mp4' : 'video/webm' }));
        stopStream();
        ref.current!.src = video_local;
      };

      recorder.start(1000);

      setRecorderData(recorder);
    }
  }, [recorderData, currentStream, mediaStreamInitialize, constraintList, browserType, ref, stopStream, setThumbnailList, setRecordState]);

  const handleChangeCamera = useCallback(
    (e) => {
      stopStream();
      mediaStreamInitialize({ video: { deviceId: { exact: e.target.id } } });
      setConstraint({ video: { deviceId: { exact: e.target.id } } });
      setCurrentDevice(e.target.previousSibling.textContent);
      setCurrentDeviceId(e.target.id);
      setCameraDropdownState(false);
    },
    [mediaStreamInitialize, stopStream, setConstraint, setCurrentDevice, setCurrentDeviceId, setCameraDropdownState],
  );

  const stopRecording = useCallback(
    async (e) => {
      if (recorderData && recorderData.onstop) {
        if (recorderData.state === 'recording') {
          await recorderData.onstop(e);
          handleMetaData();
          setRecording(false);
          recorderData.stop();
        }
      }
    },
    [recorderData, handleMetaData, setRecording],
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

  /**
   * 녹화 영상 및 import 한 영상을 정지(재생을 멈추고 currentTime을 0으로 변경)
   */
  const stopVideo = useCallback(() => {
    if (ref) {
      setPlayState(false);
      ref.current!.pause();
      ref.current!.currentTime = 0;
    }
  }, [setPlayState, ref]);

  const startRecordingDelay = useCallback(() => {
    let sec = 4;

    // 한 번 녹화 이후 두번째 녹화부터 다시 stream을 화면에 표시하기 위함
    if (recordOverTwice) {
      setThumbnailList([]);
      if (videoURL) {
        mediaStreamInitialize({ video: true });
      } else {
        mediaStreamInitialize({ video: { deviceId: { exact: currentDeviceId } } });
      }
      setConstraint({ video: { deviceId: { exact: currentDeviceId } } });
      ref.current!.srcObject = currentStream as MediaStream;
      ref.current!.src = '';
      setRecordState(false);
      setRecordOverTwice(false);
    } else {
      setRecording(true);
      setStandbyState(true);

      const timerTest = () => {
        timerRef.current = setInterval(() => {
          if (sec > 0) {
            setTimer(sec--);
          } else {
            clearInterval(timerRef.current);
            startRecording();
            // setRecording(false);
            setRecordOverTwice(true);
            setStandbyState(false);
          }
        }, 1000);
      };

      timerTest();
      setTimer(5);
    }
  }, [
    ref,
    videoURL,
    currentStream,
    recordOverTwice,
    currentDeviceId,
    setThumbnailList,
    setRecording,
    setStandbyState,
    setTimer,
    startRecording,
    setRecordOverTwice,
    setRecordState,
    mediaStreamInitialize,
  ]);

  const backToStandby = useCallback(() => {
    clearInterval(timerRef.current);
    setRecording(false);
    setStandbyState(false);
  }, [setRecording, setStandbyState]);

  return {
    mediaStreamInitialize,
    startRecording,
    stopRecording,
    playRecording,
    pauseRecording,
    handleMetaData,
    backToStandby,
    stopVideo,
    startRecordingDelay,
    handleCameraList,
    handleChangeCamera,
    stopStream,
    // mediaBlobUrl,
  };
};

export default useMediaStream;
