import { FunctionComponent, Fragment, memo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Video } from 'components/Video';
import { Overlay } from 'components/Overlay';
import { Headline } from 'components/Typography';
import { TextButton } from 'components/New_Button';
import { Procedure } from 'containers/Shoot';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './Process.module.scss';

const cx = classNames.bind(styles);

interface Props {
  procedure: Procedure;
}

/**
 *
 * 애니메이션 참고 자료
 * @see https://codepen.io/yemon/pen/pWoROm
 */
const Process: FunctionComponent<Props> = ({ procedure }) => {
  const router = useRouter();

  const classes = cx('text', 'uppercase', procedure);
  const deniedClasses = cx('text', procedure);
  const isDenied = procedure === 'denied';

  // const classes = isDenied ? cx('text', procedure) : cx('text', 'uppercase', procedure);

  const handleClick = useCallback(() => {
    router.push('https://plask.ai');
  }, [router]);

  // const procedureTextList = ['service', 'Unusual approach', 'token'];

  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')}>
        {/* <Headline className={cx('text')} level="3" align="center" margin bold>
          {isDenied ? 'Oops! Discovered' : 'NOW'}
        </Headline>
        <div className={cx('status')}>
          {_.map(procedureTextList, (item, i) => {
            const classes = cx('text', {
              uppercase: item === 'service' || item === 'token',
            });

            return (
              <div className={cx('animation')} key={`${item}_${i}`}>
                <Headline className={classes} level="3" align="center" bold>
                  {item}
                </Headline>
              </div>
            );
          })}
        </div>
        {isDenied ? (
          <div className={cx('bottom')}>
            <p className={cx('paragraph')}>Do you want a normal approach?</p>
            <TextButton className={cx('button')} onClick={handleClick}>
              Let’s Go
            </TextButton>
          </div>
        ) : (
          <Headline className={cx('text')} level="3" align="center" margin bold>
            LOADING
          </Headline>
        )} */}
        {isDenied ? (
          <div className={cx('status')}>
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
          </div>
        ) : (
          <div className={cx('status')}>
            <Headline className={cx('text')} level="3" align="center" margin bold>
              NOW
            </Headline>
            <Headline className={classes} level="3" align="center" margin bold>
              {procedure}
            </Headline>
            <Headline className={cx('text')} level="3" align="center" margin bold>
              LOADING
            </Headline>
          </div>
        )}
      </div>
      <Video src="/video/loadingVideo.mp4" autoPlay loop fullSize />
      <Overlay theme="dark" />
    </div>
  );
};

export default memo(Process);
