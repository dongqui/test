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
}

const CreditInfoModal = ({ onClose, usedCredit, onContinue }: Props) => {
  const user = useSelector((state) => state.user);
  const [showTooltip, setShowTooltip] = useState(false);
  const onClickConfirm = () => {
    onContinue();
  };

  const remainingCredet = ((user.credits?.remaining || 0) - usedCredit).toLocaleString();
  return (
    <BaseModal className="dark" hasPadding={false}>
      <div className={cx('container')}>
        <section className={cx('body')}>
          <div>Unlimited credits with faster extraction up to 60 min (108,000 credits) monthly</div>
          <div className={cx('info')}>
            <strong>{usedCredit} credits used</strong>
            <span>for 10 minutes of video</span>
          </div>
          <div className={cx('info')}>
            <strong>
              {remainingCredet} credits left
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
            <span>for 1 hour of video</span>
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
