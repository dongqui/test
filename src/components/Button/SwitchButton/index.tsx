import { memo, MouseEvent, useRef, useState } from 'react';

import classNames from 'classnames/bind';
import styles from './SwitchButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  options: { content: string; onClick: (e?: MouseEvent, index?: number, content?: string) => void }[];
  type?: 'default' | 'primary';
  disabled?: boolean;
  fullSize?: boolean;
  defaultIndex?: number;
}

type Props = BaseProps;

const defaultProps: Partial<Props> = {
  type: 'default',
  disabled: false,
  fullSize: false,
  defaultIndex: 0,
};

const SwitchButton = (props: Props) => {
  const { defaultIndex, disabled, fullSize, options, type } = props;
  // set to default index only if that index exist
  const [selected, setSelected] = useState((options.length > defaultIndex! ? defaultIndex : 0) ?? 0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const classes = cx('buttons-wrapper', { fullSize, disabled });
  const buttonClickHandler = (e: MouseEvent<HTMLDivElement>, index: number) => {
    if (selected !== index && !disabled) {
      setSelected(index);
      if (options[index]) {
        options[index].onClick(e, index, options[index].content);
      }
    }
  };

  return (
    <div className={classes} ref={wrapperRef}>
      <div className={cx('button-select-effect', type)} style={{ width: `${100 / options.length}%`, left: `${(100 / options.length) * selected}%` }} />
      {options.map((value, index) => (
        <div className={cx('button', type, { fullSize, disabled, selected: index === selected })} key={`${value}.${index}`} onClick={(e) => buttonClickHandler(e, index)}>
          <span className={cx('button-text')}>{value.content}</span>
          <span className={cx('padding')}>{value.content}</span>
        </div>
      ))}
    </div>
  );
};

SwitchButton.defaultProps = defaultProps;

export default memo(SwitchButton);
