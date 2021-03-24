import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { TPTrackName } from 'types/TP';
import { TPDefaultTrackNameList, TPFilteredTrackNameList } from 'lib/store';
import Track from './Track';
import styles from './TrackList.module.scss';

interface Props {
  trackListRef: React.RefObject<HTMLDivElement>;
}

const DEBOUNCED_TIME = 300;
const cx = classNames.bind(styles);

const TrackList: React.FC<Props> = ({ trackListRef }) => {
  const lastTrackInput = useRef('');

  const testDefaultTrackList = useReactiveVar(TPDefaultTrackNameList);
  const testFilteredTrackList = useReactiveVar(TPFilteredTrackNameList);

  // debouned가 적용 된 track input 갱신
  const changeDebounedTrackInput = useMemo(
    () =>
      _.debounce((inputText: string) => {
        // 트랙 리스트가 없는 상태에서 검색하는 경우(아무 동작을 시키지 않음)
        if (!testDefaultTrackList.length) return;
        const trimInputText = _.toLower(_.trim(inputText));

        // 이전 검색 텍스트와 현재 검색 텍스트가 같은 경우(아무 동작을 시키지 않음)
        if (lastTrackInput.current === trimInputText) return;

        // 이전 검색 텍스트가 있으면서, 현재 검색 텍스트가 비어있는 경우(디폴트 트랙 리스트로 갱신)
        if (lastTrackInput.current !== trimInputText && !trimInputText) {
          return TPFilteredTrackNameList(testDefaultTrackList);
        }

        // 재귀를 걸어서 텍스트에 만족하는 트랙 필터링
        const recursiveTrackSearch = ({ trackList }: { trackList: TPTrackName[] }) => {
          const renewChildrenTrackList: TPTrackName[] = []; // 재귀가 끝날 때 리턴시킬 트랙 리스트
          _.forEach(trackList, ({ name, childrenTrackList, trackIndex }) => {
            const toLowerTrackName = _.toLower(name);
            // 트랙 이름에 텍스트가 포함되면, 본인 트랙 정보 추가
            // 이후 하위 트랙 재귀
            if (_.includes(toLowerTrackName, trimInputText)) {
              renewChildrenTrackList.push({
                defaultChildrenTrackOpened: true,
                name,
                trackIndex,
                childrenTrackList: recursiveTrackSearch({
                  trackList: childrenTrackList,
                }),
              });
            } else {
              // 하위 트랙 재귀
              const recursiveResult = recursiveTrackSearch({
                trackList: childrenTrackList,
              });
              // 재귀 결과가 있는 경우
              if (recursiveResult.length) {
                renewChildrenTrackList.push({
                  defaultChildrenTrackOpened: true,
                  name,
                  trackIndex,
                  childrenTrackList: recursiveResult,
                });
              }
            }
          });
          return renewChildrenTrackList;
        };

        // 필터링 리스트 갱신
        const filterResult = recursiveTrackSearch({
          trackList: testDefaultTrackList,
        });
        lastTrackInput.current = trimInputText;
        TPFilteredTrackNameList(filterResult);
      }, DEBOUNCED_TIME),
    [testDefaultTrackList],
  );

  // 트랙 인풋 텍스트 변경
  const changeTrackInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      changeDebounedTrackInput(event.target.value);
    },
    [changeDebounedTrackInput],
  );

  return (
    <>
      <div className={cx('track-list-container')} ref={trackListRef}>
        <div className={cx('track-input-wrapper')}>
          {/* To Do
              돋보기 아이콘 적용
          */}
          <input type="text" onChange={changeTrackInput} />
        </div>
        <div className={cx('track-list-wrapper')}>
          {testFilteredTrackList?.map((track) => {
            const { childrenTrackList, defaultChildrenTrackOpened, name, trackIndex } = track;
            return (
              <Track
                key={name}
                childrenTrackList={childrenTrackList}
                defaultChildrenTrackOpened={defaultChildrenTrackOpened}
                paddingLeft={10}
                title={name}
                trackIndex={trackIndex}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default TrackList;
