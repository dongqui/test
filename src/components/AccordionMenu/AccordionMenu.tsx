import _ from 'lodash';
import React, { Fragment, FunctionComponent, ReactNode, useState } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './AccordionMenu.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  children: ReactNode;
  title: string;
}

export type P = BaseProps;

const AccordionMenu: FunctionComponent<P> = ({ children, title }) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(!clicked);
  };

  const classes = cx('accordion-contents', {
    hide: clicked,
  });
  const iconClasses = cx('arrow', {
    rotate: clicked,
  });
  return (
    <Fragment>
      <div className={cx('accordion-wrap')}>
        <IconWrapper className={iconClasses} icon={SvgPath.FilledArrow} onClick={handleClick} hasFrame={false} />
        <span>{title}</span>
      </div>
      <div className={cx(classes)}>{children}</div>
    </Fragment>
  );
};

export default AccordionMenu;
