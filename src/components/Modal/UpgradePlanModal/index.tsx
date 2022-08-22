import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { BaseModal, FilledButton, IconButton, SvgPath, IconWrapper, Switch } from 'components';
import * as userActions from 'actions/User';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  hadFreeTrial: boolean;
}

const UpgradePlanModal = ({ onClose, hadFreeTrial }: Props) => {
  const dispatch = useDispatch();
  const [billingCycle, setbillingCycle] = useState('Yearly');

  const billingCycleOption = [
    {
      key: 'Monthly',
      label: 'Monthly',
      value: 'Monthly',
    },
    {
      key: 'Yearly',
      label: `Yearly <strong class=${cx('discount')}>-64%</strong>`,
      value: 'Yearly',
    },
  ];

  const confirmText = hadFreeTrial ? 'Upgrade' : 'Start free';
  const monthlyCost = billingCycle === 'Monthly' ? 140 : 50;

  const upgrade = () => {
    dispatch(userActions.upgradePlanAsync.request(billingCycle === 'Monthly'));
    onClose();
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
              <span>Billed yearly</span>
            </div>
            <ul>
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                108,00 credits per month
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                Multi-person motion capture
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />5 GB storage
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                Advanced foot locking feature
              </li>
              <li>
                <IconWrapper icon={SvgPath['Check']} />
                Faster motion capture service
              </li>
            </ul>
            <footer>
              <FilledButton onClick={upgrade} fullSize buttonType="temp-purple-2">
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
