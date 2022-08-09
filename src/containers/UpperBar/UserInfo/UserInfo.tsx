import React, { useRef, useState } from 'react';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Avata, TooltipArrow, IconWrapper, SvgPath, FilledButton } from 'components';
import * as userActions from 'actions/User';
import { useSelector } from 'reducers';

import classNames from 'classnames/bind';
import styles from './UserInfo.module.scss';

const cx = classNames.bind(styles);

function getUserNameInitial(name: string) {
  // handle name issue
  return name[0];
}

function UserInfo() {
  const [openUserInfo, setOpenUserInfo] = useState(false);
  const avataRef = useRef<HTMLDivElement>(null);
  const { name } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(userActions.getUserAsync.request());
    dispatch(userActions.getUserUsagaInfoAsync.request());
  }, [dispatch]);

  function handleClickAvata(e: React.MouseEvent) {
    setOpenUserInfo(!openUserInfo);
  }

  return (
    <div className={cx('container')}>
      <Avata userNameInitial={getUserNameInitial(name)} onClick={handleClickAvata} ref={avataRef} />

      {openUserInfo && (
        <div className={cx('modal')}>
          <header>{name}</header>
          <section className={cx('content')}>
            <h6>Freemium overview</h6>
            <section className={cx('usage-overview')}>
              <IconWrapper icon={SvgPath.Credit} />
              <span className={cx('usage-overview-content')}>312 credits left</span>
            </section>
            <section className={cx('usage-overview')}>
              <IconWrapper icon={SvgPath.Storage} />
              <span className={cx('usage-overview-content')}>1 GB of 10GB used</span>
            </section>
          </section>
          <footer>
            <FilledButton buttonType="temp-purple" fullSize>
              upgrade
            </FilledButton>
          </footer>
          <TooltipArrow placement="top-end" backgroundColor="dark" />
        </div>
      )}
    </div>
  );
}

export default UserInfo;
