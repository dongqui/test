import { forwardRef, memo } from 'react';
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
  theme?: 'dark' | 'light';
}

type Props = BaseProps & Omit<Input.BaseInputProps, 'autoComplete' | 'spellCheck'>;

const defaultProps: Partial<Props> = {
  theme: 'dark',
};

const SearchInput = forwardRef<HTMLInputElement, Props>(
  ({ className, theme, disabled, ...rest }, ref) => {
    const classes = cx('input-wrapper', className, theme, disabled);

    return (
      <div className={classes}>
        <BaseInput
          className={cx('input')}
          ref={ref}
          theme={theme}
          disabled={disabled}
          isChild
          {...rest}
        />
        <IconWrapper className={cx('search')} icon={SvgPath.Search} hasFrame={false} />
      </div>
    );
  },
);

SearchInput.defaultProps = defaultProps;

export default memo(SearchInput);
