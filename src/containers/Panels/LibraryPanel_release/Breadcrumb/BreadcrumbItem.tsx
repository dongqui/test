import { FunctionComponent, memo } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import { Tooltip } from 'components/Tooltip';
import { useHover } from 'hooks/common';
import _ from 'lodash';
import { FileType } from 'actions/lpData';
import classNames from 'classnames/bind';
import styles from './BreadcrumbItem.module.scss';

const cx = classNames.bind(styles);

export interface Props {
  level: '0' | '1' | '2';
  isLast: boolean;
  item: { key: string; name: string; type: FileType };
}

const BreadcrumbItem: FunctionComponent<Props> = ({ item, level, isLast }) => {
  const [hoverRef, isHovered] = useHover<HTMLDivElement>();

  const iconClasses = cx('icon', { last: isLast });
  const nameClasses = cx('name', { last: isLast });

  const showsTooltip = !isLast && isHovered;

  const isLevel0 = _.isEqual(level, '0');

  const icon = _.isEqual(item.type, 'Folder') ? SvgPath.Folder : SvgPath.Model;

  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')} ref={hoverRef}>
        <div className={cx('icon-wrapper')}>
          <IconWrapper innerRef={hoverRef} className={iconClasses} icon={icon} hasFrame={false} />
          {showsTooltip && <Tooltip value={item.name} />}
        </div>
        {isLevel0 && <div className={nameClasses}>{item.name}</div>}
        {!isLevel0 && isLast && <div className={nameClasses}>{item.name}</div>}
      </div>
      <IconWrapper className={cx('arrow-right')} icon={SvgPath.ChevronLeft} hasFrame={false} />
    </div>
  );
};

export default memo(BreadcrumbItem);
