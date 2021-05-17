import {
  FunctionComponent,
  Fragment,
  memo,
  useCallback,
  useMemo,
  useRef,
  MutableRefObject,
} from 'react';
import { useReactiveVar } from '@apollo/client';
import useLPRowControl from 'hooks/LP/useLPRowControl';
import { FILE_TYPES, LPDATA_PROPERTY_TYPES } from 'types';
import { storeLpData, storePages } from 'lib/store';
import { BaseInput } from 'components/Input';
import _ from 'lodash';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface IconProps {
  rowKey: string;
}

const IconComponent: FunctionComponent<IconProps> = ({ rowKey }) => {
  const lpData = useReactiveVar(storeLpData);
  const pages = useReactiveVar(storePages);
  const inputRef = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
  const fileType = useMemo(
    () => _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.type ?? FILE_TYPES.file,
    [rowKey, lpData],
  );
  const isDragging =
    useMemo(() => _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.isDragging, [
      rowKey,
      lpData,
    ]) ?? false;
  const isVisualized =
    useMemo(() => _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.isVisualized, [
      rowKey,
      lpData,
    ]) ?? false;
  const iconRef: React.MutableRefObject<HTMLDivElement> | any = useRef(null);
  const onClick = useCallback(
    (e) => {
      storeLpData(
        _.map(lpData, (item) => ({
          ...item,
          isClicked: _.isEqual(item.key, rowKey) ? true : false,
        })),
      );
    },
    [rowKey, lpData],
  );
  const handleBlur = useCallback(() => {
    storeLpData(
      _.map(lpData, (item) => ({
        ...item,
        isClicked: false,
      })),
    );
  }, [lpData]);
  const { setCurrentData } = useLPRowControl({ lpData });
  const onDoubleClick = useCallback(() => {
    if (_.isEqual(_.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.type, FILE_TYPES.motion)) {
      storeLpData(
        _.map(lpData, (item) => ({ ...item, isVisualized: _.isEqual(item.key, rowKey) })),
      );
      setCurrentData({ key: rowKey });
    } else {
      storePages(
        _.concat(pages, {
          key: rowKey,
          name: _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.name ?? 'Folder',
          type: _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.type ?? FILE_TYPES.folder,
        }),
      );
    }
  }, [lpData, rowKey, setCurrentData, pages]);
  const {
    filteredFileName,
    isModifying,
    onBlur,
    onChangeInput,
    name,
    handleKeyDown,
    handleFocus,
  } = useLPRowControl({
    lpData,
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
        onBlur={handleBlur}
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
          value={name}
          innerRef={inputRef}
          autoFocus
          onFocus={handleFocus}
          onChange={onChangeInput}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className={cx('name')}>{filteredFileName}</div>
      )}
    </Fragment>
  );
};
export const Icon = memo(IconComponent);
