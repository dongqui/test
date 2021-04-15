import { FunctionComponent, Fragment, memo, useEffect, useState, useCallback } from 'react';
import { IconWrapper, SvgPath } from 'components/New_Icon';
// import { Dropdown } from 'components/New_Dropdown';
import { useReactiveVar } from '@apollo/client';
import { storePages } from 'lib/store';
import BreadcrumbItem from './BreadcrumbItem';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Breadcrumb: FunctionComponent = () => {
  const pages = useReactiveVar(storePages);
  const [isOpen, setIsOpen] = useState(false);

  const handleBack = useCallback(() => {
    if (pages.length > 1) {
      const currentPath = _.last(pages);
      const removedCurrentPath = _.filter(pages, (page) => !_.isEqual(page.key, currentPath?.key));
      storePages(removedCurrentPath);
    }
  }, [pages]);

  const handlePathOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // const handleSelect = useCallback(() => {
  //   alert('handleSelect');
  // }, []);

  useEffect(() => {
    // @TODO
    // 더보기 버튼으로 인한 Dropdown이 open인 상태에서, depth가 5미만으로 변경되면 보이지 않게 처리
  }, []);

  // Root 경로는 Breadcrumb에서 보이지 않게 처리
  const filteredPathList = _.filter(pages, (page) => !_.isEqual('root', page.key));

  // 현재 경로는 반드시 이름 표시
  // 현재 경로 포함 depth가 3이상이면 아이콘으로만 처리 (Breadcrumb 축약 레벨 1)
  const isAbbreviationLevel1 = filteredPathList.length >= 3;

  // 현재 경로 포함 depth가 5이상이면 더보기 아이콘 및 현재 경로 포함 3개 표시 (Breadcrumb 축약 레벨 2)
  const isAbbreviationLevel2 = filteredPathList.length >= 5;

  // 마지막 3개를 제외한 경로에 대해서는 Dropdown 처리
  const prevPathList = _.slice(filteredPathList, 0, filteredPathList.length - 3);

  // const dropdownItemList = _.map(prevPathList, (path) => {
  //   return {
  //     key: path.key,
  //     value: path.name,
  //     isSelected: false,
  //   };
  // });

  // 마지막 3개의 경로에 대해서는 별도의 처리 없음
  const splitPathList = _.slice(filteredPathList, filteredPathList.length - 3);

  // @TODO
  // 현재는 path의 타입을 알수없어, 오직 폴더 아이콘으로만 보이게 처리함
  // 경로 타입(폴더, 모델, 모션)에 따른 아이콘 변경 처리

  return (
    <div className={cx('wrapper')}>
      <IconWrapper
        className={cx('arrow-left')}
        icon={SvgPath.ChevronLeft}
        onClick={handleBack}
        hasFrame={false}
      />
      <div className={cx('path')}>
        {isAbbreviationLevel2 && (
          // @TODO
          // 더보기 버튼 클릭 시 Dropdown으로 모든 경로 표시
          <Fragment>
            <div className={cx('icon-more')}>
              <IconWrapper
                className={cx('icon-more')}
                icon={SvgPath.BreadcrumbMore}
                onClick={handlePathOpen}
                hasFrame={false}
              />
              {/* <Fragment>
                {isOpen && (
                  <div className={cx('dropdown')}>
                    <Dropdown list={dropdownItemList} onSelect={handleSelect} />
                  </div>
                )}
              </Fragment> */}
            </div>
            <IconWrapper
              className={cx('arrow-right')}
              icon={SvgPath.ChevronLeft}
              hasFrame={false}
            />
            {_.map(splitPathList, (item) => {
              const isLast = _.isEqual(_.last(splitPathList)?.key, item.key);

              return <BreadcrumbItem key={item.key} item={item} isLast={isLast} level="2" />;
            })}
          </Fragment>
        )}
        {!isAbbreviationLevel2 &&
          _.map(filteredPathList, (item) => {
            const isLast = _.isEqual(_.last(filteredPathList)?.key, item.key);
            const level = isAbbreviationLevel1 ? '1' : '0';

            return <BreadcrumbItem key={item.key} item={item} isLast={isLast} level={level} />;
          })}
      </div>
    </div>
  );
};

export default memo(Breadcrumb);
