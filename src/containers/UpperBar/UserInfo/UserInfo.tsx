import React, { useRef, useState } from 'react';

import { Avata, TooltipArrow, IconWrapper, SvgPath, FilledButton } from 'components';

import classNames from 'classnames/bind';
import styles from './UserInfo.module.scss';

const cx = classNames.bind(styles);

function UserInfo() {
  const [openUserInfo, setOpenUserInfo] = useState(false);
  const avataRef = useRef<HTMLDivElement>(null);

  function handleClickAvata(e: React.MouseEvent) {
    setOpenUserInfo(!openUserInfo);
  }

  return (
    <div className={cx('container')}>
      <Avata userNameInitial="K" onClick={handleClickAvata} ref={avataRef} />

      {openUserInfo && (
        <div className={cx('modal')}>
          <header>Bumi</header>
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
