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
  const remainingCredet = (user.credits?.remaining || 0) - usedCredit;

  return (
    <BaseModal className="dark" hasPadding={false}>
      <div className={cx('container')}>
        <section className={cx('body')}>
          <div>
            {user.planType === 'freemium' ? 'Extract motion 30 sec (900 credits) daily' : 'Unlimited credits with faster extraction up to 60 min (108,000 credits) monthly'}
          </div>
          <div className={cx('info')}>
            <strong>{usedCredit.toLocaleString()} credits used</strong>
          </div>
          <div className={cx('info')}>
            <strong>
              {remainingCredet.toLocaleString()} credits left
              <div className={cx('info-icon-wrapper')} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                <IconWrapper icon={SvgPath['Info']} />
                {showTooltip && (
                  <div className={cx('tooltip')}>
                    <div className={cx('arrow')} />
                    {user.planType === 'freemium' ? 'Charging is based on the sign-up time' : 'Unlimited extract motion after credits are used up'}
                  </div>
                )}
              </div>
            </strong>
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
