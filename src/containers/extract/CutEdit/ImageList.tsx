import { FunctionComponent, Fragment, memo } from 'react';
import { useReactiveVar } from '@apollo/client';
import { storeCutImages } from 'lib/store';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ImageList.module.scss';

const cx = classNames.bind(styles);

export interface Props {}

const ImageList: FunctionComponent<Props> = ({}) => {
  const images = useReactiveVar(storeCutImages);
  return (
    <div className={cx('wrapper')}>
      {_.map(images, (image, i) => (
        <img className={cx('image')} draggable={false} key={i} src={image} alt="cut_image" />
      ))}
    </div>
  );
};

export default memo(ImageList);
