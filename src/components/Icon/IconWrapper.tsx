import { FunctionComponent, KeyboardEventHandler, memo, useCallback, RefObject } from 'react';
import _ from 'lodash';
import classnames from 'classnames/bind';
import styles from './IconWrapper.module.scss';

const cx = classnames.bind(styles);

interface Props {
  icon: FunctionComponent<React.PropsWithChildren<unknown>>;
  hasFrame?: boolean;
  className?: string;
  onClick?: (e?: any) => void;
  tabState?: boolean;
  innerRef?: RefObject<HTMLSpanElement>;
  id?: string;
}

const defaultProps: Partial<Props> = {
  hasFrame: false,
};

const IconWrapper: FunctionComponent<React.PropsWithChildren<Props>> = ({ icon, hasFrame, innerRef, className, tabState, onClick, id }) => {
  const Component = icon;

  const isClickable = !!onClick;

  // focus시에, Enter key로 onClick event를 발생
  const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = useCallback(
    (e) => {
      if (_.isEqual(e.key, 'Enter')) {
        onClick && onClick();
      }
    },
    [onClick],
  );

  const classes = cx('wrapper', className, {
    button: isClickable,
    frame: hasFrame,
  });

  if (isClickable) {
    return (
      <span className={classes} id={id} ref={innerRef} onClick={onClick} onKeyDown={handleKeyDown} role="button" tabIndex={tabState ? -1 : 0}>
        <Component />
      </span>
    );
  }

  return (
    <span className={classes} id={id} ref={innerRef}>
      <Component />
    </span>
  );
};

IconWrapper.defaultProps = defaultProps;

export default memo(IconWrapper);
