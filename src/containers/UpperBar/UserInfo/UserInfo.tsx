import React, { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Avata, TooltipArrow, IconWrapper, SvgPath, FilledButton } from 'components';
import * as userActions from 'actions/User';
import { useSelector } from 'reducers';
import * as globalUIActions from 'actions/Common/globalUI';

import classNames from 'classnames/bind';
import styles from './UserInfo.module.scss';

const cx = classNames.bind(styles);

function getUserNameInitial(name: string) {
  // handle name issue
  return name[0];
}

function storageFormat(bytes: number) {
  const GB = 1073741824;
  return (bytes / GB).toFixed(2).replace('.00', '') + 'GB';
}

function userPlanFormat(planName: string) {
  if (planName === 'Motion Capture Pro') {
    return 'MoCap Pro';
  }
  return planName;
}

function UserInfo() {
  const [openUserInfo, setOpenUserInfo] = useState(false);
  const avataRef = useRef<HTMLDivElement>(null);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  function handleClickAvata() {
    setOpenUserInfo(!openUserInfo);
  }

  useEffect(() => {
    const closeUserInfo = (e: MouseEvent) => {
      if (e.target !== avataRef.current) {
        setOpenUserInfo(false);
      }
    };

    window.addEventListener('click', closeUserInfo);
    return () => {
      window.removeEventListener('click', closeUserInfo);
    };
  }, []);

  function hanldeClickUpgrade() {
    dispatch(globalUIActions.openModal('UpgradePlanModal', { hadFreeTrial: user.hadFreeTrial }));
  }

  const usedStorageSize = storageFormat(user.storage?.usageSize || 0);
  const limitStorageSize = storageFormat(user.storage?.limitSize || 0);
  const isStorageFullyUsed = (user.storage?.limitSize || 0) * 0.95 < (user.storage?.usageSize || 0);
  const isFreemium = user.planType === 'freemium';
  return (
    <div className={cx('container')}>
      <Avata userNameInitial={getUserNameInitial(user.name)} onClick={handleClickAvata} ref={avataRef} />

      {openUserInfo && (
        <div className={cx('modal')} onClick={(e) => e.stopPropagation()}>
          <header>{user.name}</header>
          <section className={cx('content')}>
            <h6>{userPlanFormat(user.planName)} overview</h6>
            <section className={cx('usage-overview')}>
              <IconWrapper icon={SvgPath.Credit} />
              <span className={cx('usage-overview-content')}>{user.credits?.remaining.toLocaleString()} credits left</span>
            </section>
            <section className={cx('usage-overview')}>
              <IconWrapper icon={SvgPath.Storage} />
              <span className={cx('usage-overview-content', { exceed: isStorageFullyUsed })}>
                {usedStorageSize} of {limitStorageSize} used
              </span>
            </section>
          </section>

          {isFreemium && (
            <footer>
              <FilledButton onClick={hanldeClickUpgrade} buttonType="temp-purple" fullSize>
                Upgrade
              </FilledButton>
            </footer>
          )}
          <TooltipArrow placement="top-end" backgroundColor="dark" />
        </div>
      )}

      <button hidden onClick={() => dispatch(userActions.getUserUsagaInfoAsync.request())} id="handle-payment-success"></button>
    </div>
  );
}

export default UserInfo;
