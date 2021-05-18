import { FunctionComponent, Fragment, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Video } from 'components/Video';
import { Overlay } from 'components/Overlay';
import { Headline } from 'components/Typography';
import { TextButton } from 'components/New_Button';
import { Procedure } from 'containers/Shoot';
import classNames from 'classnames/bind';
import styles from './Process.module.scss';

const cx = classNames.bind(styles);

interface Props {
  procedure: Procedure;
}

/**
 *
 * @todo 애니메이션 넣어야 함
 * @see https://codepen.io/yemon/pen/pWoROm
 */
const Process: FunctionComponent<Props> = ({ procedure }) => {
  const router = useRouter();
  const classes = cx('text', 'uppercase', procedure);
  const deniedClasses = cx('text', procedure);

  const isDenied = procedure === 'denied';

  const handleClick = useCallback(() => {
    router.push('https://plask.ai');
  }, [router]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')}>
        {isDenied ? (
          <Fragment>
            <Headline className={cx('text')} level="3" align="center" margin bold>
              Oops! Discovered
            </Headline>
            <Headline className={deniedClasses} level="3" align="center" margin bold>
              Unusual approach
            </Headline>
            <div className={cx('bottom')}>
              <p className={cx('paragraph')}>Do you want a normal approach?</p>
              <TextButton className={cx('button')} onClick={handleClick}>
                Let’s Go
              </TextButton>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <Headline className={cx('text')} level="3" align="center" margin bold>
              NOW
            </Headline>
            <Headline className={classes} level="3" align="center" margin bold>
              {procedure}
            </Headline>
            <Headline className={cx('text')} level="3" align="center" margin bold>
              LOADING
            </Headline>
          </Fragment>
        )}
      </div>
      <Video src="/video/loadingVideo.mp4" autoPlay loop fullSize />
      <Overlay theme="dark" />
    </div>
  );
};

export default Process;
