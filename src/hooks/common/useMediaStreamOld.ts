import { RefObject, useCallback, useEffect, useState, useMemo } from 'react';

interface Props {
  ref: RefObject<HTMLVideoElement>;
  browserType: string;
}

const useMediaStream = (props: Props) => {
  const { ref, browserType } = props;
  const [mediaStream, setMediaStream] = useState<MediaStream & HTMLMediaElement>();
  // let mediaStreamChunk: BlobPart[] = useMemo(() => [], []);
  const [mediaStreamChunk, setMediaStreamChunk] = useState<any>([]);
  let mediaBlobUrl: any = null;
  const [currentMediaBlobUrl, setMediaBlobUrl] = useState<string>();
  const [isDoneRecord, setIsDoneRecord] = useState<boolean>(false);

  /**
   * @Description mediaStream 활성화
   */
  const mediaStreamInitialize = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      ref.current!.srcObject = stream;
      setMediaStream(stream as MediaStream & HTMLMediaElement);
    });
  }, [ref]);

  /**
   * @Description 사용 가능한 기기를 리턴합니다.
   * @returns MediaDeviceInfo[]
   */
  const availableDevices = useCallback(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const result = devices.filter((device) => device.kind === 'videoinput');
      console.log(result);
      return result;
    });
  }, []);

  /**
   * @Description MimeType 선언 및 medaiStream 데이터 대입
   * !@see TypeError
   */
  const recorder = useMemo(() => {
    return (
      mediaStream &&
      new MediaRecorder(mediaStream, {
        mimeType: browserType === 'safari' ? 'video/mp4' : 'video/webm',
      })
    );
  }, [mediaStream, browserType]);

  const wait = (delayInMS: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInMS));
  };

  /**
   * @Description Stream 닫기
   */
  const stopStream = useCallback(() => {
    if (mediaStream) {
      const tracks = mediaStream.getTracks();

      tracks.forEach((track) => track.stop());

      ref.current!.srcObject = null;
    }
  }, [mediaStream, ref]);

  /**
   * @Description MediaRecorder 시작
   */
  const startRecording = useCallback(() => {
    if (recorder && recorder.state === 'recording') {
      return;
    }

    if (recorder) {
      recorder.ondataavailable = (event: any) => {
        if (event.data && event.data.size > 0) {
          console.log('event data: ', event.data);
          setMediaStreamChunk([...mediaStreamChunk, event.data]);
        }
      };
      recorder.start(1000);
    }
  }, [recorder, mediaStreamChunk]);

  /**
   * @Description MediaRecorder 중단
   */
  const stopRecording = useCallback(() => {
    if (recorder && recorder.state === 'recording' && mediaStreamChunk) {
      console.log('media stream chunk: ', mediaStreamChunk);
      recorder.stop();
      setMediaStreamChunk(mediaStreamChunk.splice(0, mediaStreamChunk.length));

      stopStream();
      setIsDoneRecord(true);
    }
  }, [recorder, mediaStreamChunk, stopStream]);

  /**
   * @Description MediaRecorder 중지
   */
  const pauseRecording = useCallback(() => {
    if (recorder) {
      recorder.pause();
    }
  }, [recorder]);

  // /**
  //  * @Description 녹화 중에 BlobEvent가 전달되었을 때 이벤트
  //  */
  // recorder &&
  //   (recorder.ondataavailable = (event: any) => {
  //     if (event.data && event.data.size > 0) {
  //       mediaStreamChunk.push(event.data);
  //     }
  //   });

  /**
   * @Description 녹화가 종료되었을 때 이벤트
   */
  recorder &&
    (recorder.onstop = () => {
      const blob = new Blob(mediaStreamChunk, { type: 'video/webm' });
      mediaBlobUrl = URL.createObjectURL(blob);
      console.log('mediaBlobUrl in onstop: ', mediaBlobUrl);
      setMediaBlobUrl(mediaBlobUrl);
    });

  useEffect(() => {
    console.log('mediaBlob: ', currentMediaBlobUrl);
    console.log('isDoneRecord: ', isDoneRecord);
    if (isDoneRecord) {
      ref.current!.src = currentMediaBlobUrl as string;
      console.log(ref.current);
    }
  }, [isDoneRecord, ref, currentMediaBlobUrl]);

  return {
    mediaStreamInitialize,
    availableDevices,
    startRecording,
    stopRecording,
    pauseRecording,
    mediaBlobUrl,
  };
};

export default useMediaStream;
