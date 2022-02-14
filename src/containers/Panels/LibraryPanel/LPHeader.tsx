import { FunctionComponent, useCallback, useRef, ChangeEvent } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import OnboardingTooltip, { ImportFileOnboarding } from 'containers/Onboarding/OnboardingTooltip';
import classNames from 'classnames/bind';
import styles from './LPHeader.module.scss';

const cx = classNames.bind(styles);

interface Props {
  onLoad: (files: File[]) => void;
}

const LPHeader: FunctionComponent<Props> = ({ onLoad }) => {
  const importButtonRef = useRef<HTMLSpanElement>(null);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files !== null) {
        const files = Array.from(e.target.files);
        e.target.value = '';

        onLoad(files);
      }
    },
    [onLoad],
  );

  return (
    <div className={cx('wrapper')}>
      <div className={cx('title')}>library</div>
      <div className={cx('explorer')}>
        <OnboardingTooltip placement="right-start" targetRef={importButtonRef} content={<ImportFileOnboarding />}>
          <IconWrapper className={cx('icon')} icon={SvgPath.Plus} hasFrame={false} innerRef={importButtonRef} />
        </OnboardingTooltip>
        <label htmlFor="file-explorer" />
        <input type="file" multiple id="file-explorer" onChange={handleChange} />
      </div>
    </div>
  );
};

export default LPHeader;
