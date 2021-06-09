import {
  FunctionComponent,
  Fragment,
  memo,
  useCallback,
  useMemo,
  useRef,
  MutableRefObject,
} from 'react';
import useLPRowControl from 'hooks/LP/useLPRowControl';
import { LPDATA_PROPERTY_TYPES } from 'types';
import { BaseInput } from 'components/Input';
import _ from 'lodash';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import * as lpPageActions from 'actions/lpPage';
import { useSelector } from 'reducers';
import * as lpDataActions from 'actions/lpData';
import { useDispatch } from 'react-redux';

const cx = classNames.bind(styles);

export interface IconProps {
  rowKey: string;
}

const IconComponent: FunctionComponent<IconProps> = ({ rowKey }) => {
  const lpData = useSelector((state) => state.lpDataOld);
  const pages = useSelector((state) => state.lpPageOld);

  const dispatch = useDispatch();

  const inputRef = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
  const fileType = useMemo(
    () => _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.type ?? 'File',
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
  const iconRef: MutableRefObject<HTMLDivElement> | any = useRef(null);
  const onClick = useCallback(
    (e) => {
      dispatch(
        lpDataActions.setItemListOld({
          itemList: _.map(lpData, (item) => ({
            ...item,
            isClicked: _.isEqual(item.key, rowKey) ? true : false,
          })),
        }),
      );
    },
    [dispatch, lpData, rowKey],
  );
  const handleBlur = useCallback(() => {
    dispatch(
      lpDataActions.setItemListOld({
        itemList: _.map(lpData, (item) => ({
          ...item,
          isClicked: false,
        })),
      }),
    );
  }, [dispatch, lpData]);
  const { setCurrentData } = useLPRowControl({ lpData });
  const onDoubleClick = useCallback(() => {
    if (_.isEqual(_.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.type, 'Motion')) {
      dispatch(
        lpDataActions.setItemListOld({
          itemList: _.map(lpData, (item) => ({
            ...item,
            isVisualized: _.isEqual(item.key, rowKey),
          })),
        }),
      );
      setCurrentData({ key: rowKey });
    } else {
      dispatch(
        lpPageActions.setLPPageOld(
          _.concat(pages, {
            key: rowKey,
            name: _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.name ?? 'Folder',
            type: _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.type ?? 'Folder',
          }),
        ),
      );
    }
  }, [lpData, rowKey, dispatch, setCurrentData, pages]);
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
        {_.isEqual(fileType, 'File') && (
          <IconWrapper className={cx('icon-model')} icon={SvgPath.Model} hasFrame={false} />
        )}
        {_.isEqual(fileType, 'Folder') && (
          <IconWrapper className={cx('icon-model')} icon={SvgPath.Folder} hasFrame={false} />
        )}
        {_.isEqual(fileType, 'Motion') && (
          <IconWrapper className={cx('icon-model')} icon={SvgPath.Motion} hasFrame={false} />
        )}
      </div>
      {isModifying ? (
        <BaseInput
          className={cx('input-name')}
          value={name}
          ref={inputRef}
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
