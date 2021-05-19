import { forwardRef, FunctionComponent, memo } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import BaseInput from './BaseInput';
import classNames from 'classnames/bind';
import styles from './SearchInput.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  mask?: string | Array<string | RegExp>;
  maskChar?: string | null;
  autoComplete?: boolean;
  spellCheck?: boolean;
}

type Props = BaseProps & Omit<Input.BaseInputProps, 'autoComplete' | 'spellCheck'>;

const SearchInput = forwardRef<HTMLInputElement, Props>(({ className, ...rest }, ref) => {
  const classes = cx('input-wrapper', className);

  return (
    <div className={classes}>
      <BaseInput className={cx('input')} ref={ref} isChild {...rest} />
      <IconWrapper className={cx('search')} icon={SvgPath.Search} hasFrame={false} />
    </div>
  );
});

export default memo(SearchInput);
