import { FunctionComponent, Fragment, memo, useCallback, useMemo, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useLPRowControl } from 'hooks/LP/useLPRowControl';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'types';
import { storeMainData, storePages } from 'lib/store';
import { BaseInput } from 'components/New_Input';
import _ from 'lodash';
import * as S from './IconStyles';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface IconProps {
  rowKey: string;
}

const IconComponent: FunctionComponent<IconProps> = ({ rowKey }) => {
  const mainData = useReactiveVar(storeMainData);
  const pages = useReactiveVar(storePages);
  const fileType = useMemo(
    () => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.type ?? FILE_TYPES.file,
    [rowKey, mainData],
  );
  const isDragging =
    useMemo(() => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isDragging, [
      rowKey,
      mainData,
    ]) ?? false;
  const isClicked =
    useMemo(() => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isClicked, [
      rowKey,
      mainData,
    ]) ?? false;
  const isVisualized =
    useMemo(() => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isVisualized, [
      rowKey,
      mainData,
    ]) ?? false;
  const iconRef: React.MutableRefObject<HTMLDivElement> | any = useRef(null);
  const onClick = useCallback(
    (e) => {
      storeMainData(
        _.map(mainData, (item) => ({
          ...item,
          isClicked: _.isEqual(item.key, rowKey) ? true : e.ctrlKey ? item.isClicked : false,
        })),
      );
    },
    [rowKey, mainData],
  );
  const onDoubleClick = useCallback(() => {
    if (
      _.isEqual(_.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.type, FILE_TYPES.motion)
    ) {
      storeMainData(
        _.map(mainData, (item) => ({ ...item, isVisualized: _.isEqual(item.key, rowKey) })),
      );
    } else {
      storePages(
        _.concat(pages, {
          key: rowKey,
          name: _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.name ?? 'Folder',
        }),
      );
    }
  }, [rowKey, mainData, pages]);
  const { fileName, filteredFileName, isModifying, onBlur, onChangeInput } = useLPRowControl({
    mainData,
    rowKey,
  });

  const classes = cx('wrapper', {
    visualized: isVisualized,
    editing: isModifying,
    dragging: isDragging,
  });

  return (
    <Fragment>
      <div
        className={classes}
        ref={iconRef}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        role="button"
        onKeyDown={() => {}}
        tabIndex={0}
      >
        {_.isEqual(fileType, FILE_TYPES.file) && (
          <IconWrapper className={cx('icon-model')} icon={SvgPath.Model} hasFrame={false} />
        )}
        {_.isEqual(fileType, FILE_TYPES.folder) && (
          <IconWrapper className={cx('icon-model')} icon={SvgPath.Folder} hasFrame={false} />
        )}
        {_.isEqual(fileType, FILE_TYPES.motion) && (
          <IconWrapper className={cx('icon-model')} icon={SvgPath.Motion} hasFrame={false} />
        )}
      </div>
      {isModifying ? (
        <BaseInput
          className={cx('input-name')}
          value={fileName}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={onChangeInput}
          onBlur={onBlur}
        />
      ) : (
        <div className={cx('name')}>{filteredFileName}</div>
      )}
    </Fragment>

    // <S.IconWrapper
    //   ref={iconRef}
    //   onClick={onClick}
    //   isClicked={isClicked}
    //   isVisualized={isVisualized}
    //   isModifying={isModifying}
    //   opacity={isDragging ? 0.5 : 1}
    //   onDoubleClick={onDoubleClick}
    // >
    //   {_.isEqual(fileType, FILE_TYPES.file) && (
    //     <S.TopWrapper isClicked={isClicked}>
    //       <ModelFileIcon />
    //     </S.TopWrapper>
    //   )}
    //   {_.isEqual(fileType, FILE_TYPES.folder) && <S.FolderIcon></S.FolderIcon>}
    //   {_.isEqual(fileType, FILE_TYPES.motion) && (
    //     <S.TopWrapper isClicked={isClicked}>
    //       <CircleMotionIcon></CircleMotionIcon>
    //     </S.TopWrapper>
    //   )}
    //   {isModifying ? (
    //     <S.BottomInput
    //       value={fileName}
    //       autoFocus
    //       onFocus={(e) => e.target.select()}
    //       onChange={onChangeInput}
    //       onBlur={onBlur}
    //     ></S.BottomInput>
    //   ) : (
    //     <S.BottomWrapper>{filteredFileName}</S.BottomWrapper>
    //   )}
    // </S.IconWrapper>
  );
};
export const Icon = memo(IconComponent);
