import { useState, useRef } from 'react';
import TagManager from 'react-gtm-module';

import { BaseModal, FilledButton, IconButton, SvgPath, IconWrapper, Switch } from 'components';
import * as api from 'api';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  hadFreeTrial: boolean;
}

const UpgradePlanModal = ({ onClose, hadFreeTrial }: Props) => {
  const childWindow = useRef<Window | null>(null);
  const [billingCycle, setbillingCycle] = useState('Annual');
  const [loading, setLoading] = useState(false);

  const billingCycleOption = [
    {
      key: 'Monthly',
      label: 'Monthly',
      value: 'Monthly',
    },
    {
      key: 'Annual',
      label: `Annual <strong class=${cx('discount')}>-64%</strong>`,
      value: 'Annual',
    },
  ];

  const confirmText = hadFreeTrial ? 'Upgrade' : 'Try it free for 7 days';
  const monthlyCost = billingCycle === 'Monthly' ? 140 : 50;

  const upgrade = async () => {
    TagManager.dataLayer({
      dataLayer: {
        event: hadFreeTrial ? 'click_upgrade_02' : 'click_free_trial_02',
        type: 'mocap_pro',
      },
    });

    setLoading(true);
    const stripeURL: string = await api.createStripeSession(billingCycle === 'Monthly');
    setLoading(false);
    if (childWindow.current && !childWindow.current.closed) {
      childWindow.current.location.href = stripeURL;
      childWindow.current.focus();
    } else {
      const w = window.open(`/payment?stripeURL=${stripeURL}`, '_blank');
      if (w) {
        w.focus();
        childWindow.current = w;
      }
    }
  };

  const handleChangeSwitch = (value: string) => {
    setbillingCycle(value);
  };
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
                Extract motion 30 sec daily
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                Single-person motion capture
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                Foot lock feature
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
              MoCap Pro
              <span className={cx('recommend-chip')}>Recommended</span>
            </header>
            <Switch
              fullSize
              options={billingCycleOption}
              type="default"
              defaultValue={billingCycle}
              onChange={handleChangeSwitch}
              className={cx('billing-cycle-switch')}
              value={billingCycle}
            />
            <div className={cx('sub-header')}>
              <h6>${monthlyCost}/month</h6>
              <span>Billed {billingCycle === 'Annual' ? 'annually' : 'monthly'}</span>
            </div>

            <ul>
              Everything in the Free plan, plus:
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                Unlimited extract motion
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                Faster extract motion up to 60 min monthly
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                Multi-person motion capture
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />5 GB storage
              </li>
            </ul>
            <footer>
              <FilledButton onClick={upgrade} disabled={loading} fullSize buttonType="temp-purple">
                {confirmText}
              </FilledButton>
            </footer>
          </section>
        </div>
      </div>
    </BaseModal>
  );
};

export default UpgradePlanModal;
