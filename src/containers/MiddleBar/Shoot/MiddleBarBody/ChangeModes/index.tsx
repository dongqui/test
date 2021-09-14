import { TextButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import InterpolationMode from './InterpolationMode';
import SimpleMode from './SimpleMode';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const ChangeModes = () => {
  return (
    <div className={cx('change-modes')}>
      <InterpolationMode />
      <SimpleMode />
      <IconWrapper icon={SvgPath.InsertKeyframe} hasFrame={false} />
      <TextButton text="Autokey" />
      <TextButton text="Curve Editor" />
    </div>
  );
};

export default ChangeModes;
