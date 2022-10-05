import { useDispatch } from 'react-redux';
import TagManager from 'react-gtm-module';

import * as globalUIActions from 'actions/Common/globalUI';
import { BaseModal, FilledButton, OutlineButton, IconButton, SvgPath, IconWrapper } from 'components';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  hadFreeTrial: boolean;
  referrer?: 'foot lock' | 'multi';
}

const ProFeaturesModal = ({ onClose, hadFreeTrial, referrer }: Props) => {
  const dispatch = useDispatch();

  const onClickConfirm = () => {
    TagManager.dataLayer({
      dataLayer: {
        event: hadFreeTrial ? 'click_upgrade_01' : 'click_free_trial_01',
        type: referrer === 'multi' ? 'btn_04' : 'btn_05',
      },
    });
    dispatch(globalUIActions.openModal('UpgradePlanModal', { hadFreeTrial }));
    onClose();
  };

  const confirmText = hadFreeTrial ? 'Upgrade' : 'Try Pro Free';
  return (
    <BaseModal className="dark">
      <div className={cx('container')}>
        <header>
          <div className={cx('title')}>Unlock MoCap Pro</div>
          <IconButton onClick={onClose} type="ghost" icon={SvgPath['ModalClose']} />
        </header>

        <section className={cx('content')}>
          <h6>Exclusive Features</h6>
          <ul>
            <li>
              <IconWrapper icon={SvgPath['Check']} />
              <span className={cx('content-text')}>
                <strong>Multi-person motion capture</strong> - Simultaneous MoCap up to 10 people
              </span>
            </li>
            <li>
              <IconWrapper icon={SvgPath['Check']} />
              <span className={cx('content-text')}>
                Prevent the model from sliding with the <strong>Foot Lock</strong> feature
              </span>
            </li>
          </ul>
        </section>

        <footer className={cx('buttons')}>
          <OutlineButton onClick={onClose}>Cancel</OutlineButton>
          <FilledButton onClick={onClickConfirm} buttonType="temp-purple" dataCy="modal-confirm">
            {confirmText}
          </FilledButton>
        </footer>
      </div>
    </BaseModal>
  );
};

export default ProFeaturesModal;
