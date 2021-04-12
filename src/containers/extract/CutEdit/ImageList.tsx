import { FunctionComponent, memo } from 'react';
import { useReactiveVar } from '@apollo/client';
import { storeCutImages } from 'lib/store';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ImageList.module.scss';

const cx = classNames.bind(styles);

const ImageList: FunctionComponent = () => {
  const images = useReactiveVar(storeCutImages);
  return (
    <div className={cx('wrapper')}>
      {_.map(images, (image, i) => (
        <div className={cx('image-wrapper')}>
          {/* <div className={cx('image-inner')}>
            <img className={cx('image')} draggable={false} key={i} src={image} alt="cut_image" />
          </div> */}
        </div>
      ))}
    </div>
  );
};

export default memo(ImageList);
