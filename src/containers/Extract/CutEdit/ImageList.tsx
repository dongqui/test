import { FunctionComponent, memo } from 'react';
import { useReactiveVar } from '@apollo/client';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ImageList.module.scss';
import { useSelector } from 'reducers';

const cx = classNames.bind(styles);

const ImageList: FunctionComponent = () => {
  const images = useSelector((state) => state.cutImages.urls);
  const defaultList = Array.from(Array(20).keys());

  return (
    <div className={cx('wrapper')}>
      {_.map(defaultList, (_cell, i) => (
        <div className={cx('image-wrapper')} key={i}>
          <div className={cx('image-inner')}>
            {images[i] && (
              <img
                className={cx('image')}
                draggable={false}
                key={i}
                src={images[i]}
                alt="cut_image"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(ImageList);
