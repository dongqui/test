import { Component, FunctionComponent, useCallback, useState, ReactNode } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import Switch from 'react-switch';
import classnames from 'classnames/bind';
import styles from './PlaskCard.module.scss';
import PlaskCardTitle from './Title';
import PlaskCardBody from './Body';

const cx = classnames.bind(styles);

type Title = 'normal' | 'toggle' | 'dropdown';

interface Props {
  id?: string;
  children?: ReactNode;
  isPowerOn?: boolean;
  type?: Title;
  activeStatus: boolean;
  className?: string;
  title: ReactNode;
  prepend?: ReactNode;

  toggleOptions?: {
    withSwitch?: boolean;
    checked?: boolean;
    handleToggle?: any;
    canToggle?: boolean;
  };

  dropdownOptions?: {
    active: boolean;
    items: Array<{ text: string; handleSelect: () => void }>;
  };
}

const PlaskCard: FunctionComponent<React.PropsWithChildren<Props>> = ({
  id,
  children,
  className,
  type = 'normal',
  title,
  isPowerOn = true,
  activeStatus,
  toggleOptions,
  dropdownOptions,
}) => {
  const [isSectionSpread, setIsSectionSpread] = useState<boolean>(isPowerOn);

  // callback to spread/fold transform section
  const handleSectionSpread = useCallback(() => {
    if (isSectionSpread) {
      setIsSectionSpread(false);
    } else {
      setIsSectionSpread(true);
    }
  }, [isSectionSpread]);
  const classes = cx('section', className, { able: activeStatus });

  return (
    <section className={classes} id={id}>
      {title && (
        <PlaskCardTitle
          type={type}
          title={title}
          isSpread={isSectionSpread}
          handleSpread={handleSectionSpread}
          activeStatus={activeStatus}
          isPowerOn={isPowerOn}
          toggleOptions={toggleOptions}
          dropdownOptions={dropdownOptions}
        />
      )}
      <PlaskCardBody isSpread={isSectionSpread}>{children}</PlaskCardBody>
    </section>
  );
};

export default PlaskCard;
