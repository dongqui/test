import classnames from 'classnames/bind';
import styles from './IconWrapper.module.scss';

const cx = classnames.bind(styles);

interface Props {
  icon: React.FunctionComponent;
  hasPadding?: boolean;
  className?: string;
  onClick?: () => void;
}

const defaultProps: Partial<Props> = {
  hasPadding: true,
};

const IconWrapper: React.FC<Props> = ({ icon, hasPadding, className, onClick }) => {
  const classes = cx('wrapper', className, {
    padding: hasPadding,
  });

  const Component = icon;

  const isClickable = !!onClick;

  if (isClickable) {
    return (
      <span className={classes} onClick={onClick} onKeyPress={onClick} role="button" tabIndex={0}>
        <Component />
      </span>
    );
  }

  return (
    <span className={classes}>
      <Component />
    </span>
  );
};

IconWrapper.defaultProps = defaultProps;

export default IconWrapper;
