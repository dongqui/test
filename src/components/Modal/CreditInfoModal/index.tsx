import { useState } from 'react';

import { BaseModal, FilledButton, OutlineButton, SvgPath, IconWrapper } from 'components';
import { useSelector } from 'reducers';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  usedCredit: number;
  onContinue: () => void;
  duration: number;
}

const CreditInfoModal = ({ onClose, usedCredit, onContinue, duration }: Props) => {
  const user = useSelector((state) => state.user);
  const [showTooltip, setShowTooltip] = useState(false);
  const onClickConfirm = () => {
    onContinue();
  };
  const videoDurationMinute = Math.floor(duration / 60);
  const remainingCredet = (user.credits?.remaining || 0) - usedCredit;
  const CREDIT_PER_ONE_MINUTE = 1800;

  const availabeTimeWithCredit = () => {
    const time = Math.floor(remainingCredet / CREDIT_PER_ONE_MINUTE);
    if (time >= 60) return '1 hour';

    if (time === 0) {
      return `${time} seconds`;
    } else {
      return `${time} minutes`;
    }
  };

  return (
    <BaseModal className="dark" hasPadding={false}>
      <div className={cx('container')}>
        <section className={cx('body')}>
          <div>Unlimited credits with faster extraction up to 60 min (108,000 credits) monthly</div>
          <div className={cx('info')}>
            <strong>{usedCredit.toLocaleString()} credits used</strong>
            <span>for {videoDurationMinute ? `${videoDurationMinute} minutes` : `${Math.floor(duration)} seconds`} of video</span>
          </div>
          <div className={cx('info')}>
            <strong>
              {remainingCredet.toLocaleString()} credits left
              <div className={cx('info-icon-wrapper')} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                <IconWrapper icon={SvgPath['Info']} />
                {showTooltip && (
                  <div className={cx('tooltip')}>
                    <div className={cx('arrow')} />
                    Unlimited extract motion after credits are used up
                  </div>
                )}
              </div>
            </strong>
            <span>for {availabeTimeWithCredit()} of video</span>
          </div>
        </section>
        <footer>
          <OutlineButton onClick={onClose}>Cancel</OutlineButton>
          <FilledButton onClick={onClickConfirm} buttonType="primary" dataCy="modal-confirm">
            Continue
          </FilledButton>
        </footer>
      </div>
    </BaseModal>
  );
};

export default CreditInfoModal;
