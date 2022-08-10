import { BaseModal, FilledButton, OutlineButton, IconButton, SvgPath, IconWrapper } from 'components';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  hadFreeTrial: boolean;
}

const UpgradePlanModal = ({ onClose, hadFreeTrial }: Props) => {
  const onClickConfirm = () => {};

  const confirmText = hadFreeTrial ? 'Upgrade' : 'Start free';
  return (
    <BaseModal className="dark">
      <div className={cx('container')}>
        <header>
          <div className={cx('title')}>Unlock all features on Plask</div>
          <IconButton onClick={onClose} type="ghost" icon={SvgPath['ModalClose']} />
        </header>

        <div className={cx('card')}>
          <section className={cx('card-common', 'card-freemium')}>
            <header>Freemium</header>
            <div className={cx('sub-header')}>
              <h6>Free</h6>
              <span>For trying things out</span>
            </div>
            <ul>
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                900 limited credits per day
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                Single-person motion capture only
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />1 GB storage
              </li>
            </ul>
            <footer>
              <FilledButton fullSize disabled>
                Current plan
              </FilledButton>
            </footer>
          </section>

          <section className={cx('card-common', 'card-pro')}>
            <header>
              Mocap Pro
              <span className={cx('recommend-chip')}>Recommend</span>
            </header>
            <footer>
              <FilledButton fullSize>Current plan</FilledButton>
            </footer>
          </section>
        </div>
      </div>
    </BaseModal>
  );
};

export default UpgradePlanModal;
