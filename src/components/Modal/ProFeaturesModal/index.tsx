import { BaseModal, FilledButton, OutlineButton, IconButton, SvgPath, IconWrapper } from 'components';
import { useDispatch } from 'react-redux';
import * as globalUIActions from 'actions/Common/globalUI';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  hadFreeTrial: boolean;
}

const ProFeaturesModal = ({ onClose, hadFreeTrial }: Props) => {
  const dispatch = useDispatch();

  const onClickConfirm = () => {
    dispatch(globalUIActions.openModal('UpgradePlanModal', { hadFreeTrial }));
    onClose();
  };

  const confirmText = hadFreeTrial ? 'Upgrade' : 'Try Pro Free';
  return (
    <BaseModal className="dark">
      <div className={cx('container')}>
        <header>
          <div className={cx('title')}>Unlock exclusive features</div>
          <IconButton onClick={onClose} type="ghost" icon={SvgPath['ModalClose']} />
        </header>

        <section className={cx('content')}>
          <h6>With Mocap Pro</h6>
          <ul>
            <li>
              <IconWrapper icon={SvgPath['Check']} />
              <span className={cx('content-text')}>
                <strong>Multi-person motion capture</strong> - Simultaneous mocap up to 10 people
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
