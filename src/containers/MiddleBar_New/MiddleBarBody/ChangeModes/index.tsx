import React, { useCallback } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const ChangeModes = () => {
  // simple mode 버튼 클릭
  const handleClickSimpleMode = useCallback(() => {
    /**
     * 위 함수에서 작성하시면 됩니다!
     */
  }, []);

  return (
    <div>
      <IconWrapper
        className={cx('simple-mode')}
        icon={SvgPath.SimpleMode}
        onClick={handleClickSimpleMode}
      />
    </div>
  );
};

export default ChangeModes;
