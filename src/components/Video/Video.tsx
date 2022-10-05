import { FunctionComponent, useEffect, useCallback, useMemo, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './Video.module.scss';

const cx = classNames.bind(styles);

interface VideoProps {
  controls?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  loop?: boolean;
  fullSize?: boolean;
}

type NativeVideoProps = {
  src: string | string[];
  background?: boolean;
  options?: {
    [key: string]: boolean;
  };
} & VideoProps;

const defaultProps: Partial<NativeVideoProps> = {
  autoPlay: false,
  muted: false,
  playsInline: true,
  loop: false,
  background: false,
};

const NativeVideo: FunctionComponent<React.PropsWithChildren<NativeVideoProps>> = ({ autoPlay, src, background, fullSize, ...rest }) => {
  const getFileExtension = useCallback((file: string): string => {
    const type = (/[^./\\]*$/.exec(file) || [''])[0];

    return type;
  }, []);

  const ref = useRef<HTMLVideoElement>(null);

  const params = useMemo(() => {
    const params: Partial<VideoProps> = rest;

    if (autoPlay) {
      _.merge(params, {
        autoPlay,
        muted: true,
      });
    }

    if (background) {
      _.merge(params, {
        muted: true,
        autoPlay: true,
        loop: true,
      });
    }

    return params;
  }, [autoPlay, background, rest]);

  const sources = useMemo(() => {
    const sources = (typeof src === 'string' ? [src] : src).map((src) => {
      return {
        src,
        type: `video/${getFileExtension(src)}`,
      };
    });

    return sources;
  }, [getFileExtension, src]);

  /**
   * react가 video태그의 muted attribute를 제대로 렌더링 해주지 않아서 음소거가 되지 않음
   * 그래서 ref가 바뀌거나 params의 muted 값이 바뀔때 마다 video에다가 muted 값을 강제로 설정
   */
  useEffect(() => {
    if (ref.current) {
      ref.current.muted = params.muted ? true : false;
    }
  }, [ref, params.muted]);

  const classes = cx('video', { fullSize });

  return (
    <video className={classes} ref={ref} {...params}>
      {sources.map((src, i) => (
        <source key={i} src={src.src} type={src.type} />
      ))}
    </video>
  );
};

NativeVideo.defaultProps = defaultProps;

export default NativeVideo;
