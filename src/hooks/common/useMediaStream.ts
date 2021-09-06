import { RefObject } from 'react';

interface Props {
  ref: RefObject<HTMLVideoElement>;
}

const useMediaStream = (props: Props) => {
  let mediaStreamChunk: BlobPart[] = [];
  let mediaBlobUrl = null;

  const mediaStream = props.ref.current?.srcObject as MediaStream & HTMLMediaElement;

  /**
   * @Description mediaStream 활성화
   */
  const mediaStreamInitialize = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      props.ref.current!.srcObject = stream;
    });
  };

  /**
   * @Description 사용 가능한 기기를 리턴합니다.
   * @returns MediaDeviceInfo[]
   */
  const availableDevices = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const result = devices.filter((device) => device.kind === 'videoinput');
      return result;
    });
  };

  /**
   * @Description MediaRecorder 시작
   */
  const startRecording = () => {
    recorder.start();
  };

  /**
   * @Description MediaRecorder 중단
   */
  const stopRecording = () => {
    recorder.stop();
    mediaStream.srcObject = null;
  };

  /**
   * @Description MediaRecorder 중지
   */
  const pauseRecording = () => {
    recorder.pause();
  };

  /**
   * @Description MimeType 선언 및 medaiStream 데이터 대입
   * !@see TypeError
   */
  const recorder = new MediaRecorder(mediaStream, {
    mimeType: 'video/mp4',
  });

  /**
   * @Description 녹화 중에 BlobEvent가 전달되었을 때 이벤트
   */
  recorder.ondataavailable = (event: any) => {
    if (event.data && event.data.size > 0) {
      mediaStreamChunk.push(event.data);
    }
  };

  /**
   * @Description 녹화가 종료되었을 때 이벤트
   */
  recorder.onstop = () => {
    const blob = new Blob(mediaStreamChunk, { type: 'video/webm' });
    mediaBlobUrl = URL.createObjectURL(blob);
  };

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
