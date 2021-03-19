import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { TPBoneTrack } from 'types/TP';
import { TPDefaultTrackNameList, TPFilteredTrackNameList } from 'lib/store';
import Track from './Track';
import styles from './TrackList.module.scss';

interface Props {
  trackListRef: React.RefObject<HTMLDivElement>;
}

const DEBOUNCED_TIME = 300;
const cx = classNames.bind(styles);

const TrackList: React.FC<Props> = ({ trackListRef }) => {
  const defaultTrackList = useReactiveVar(TPDefaultTrackNameList);
  const filteredTrackList = useReactiveVar(TPFilteredTrackNameList);
  const [printSummaryTrack, setPrintSummaryTrack] = useState(false);
  const [printBaseTrack, setPrintBaseTrack] = useState(false);
  const [summaryTrackToggle, setSummaryTrackToggle] = useState(false);
  const [baseTrackToggle, setBaseTrackToggle] = useState(false);
  const lastTrackInput = useRef('');

  // debouned가 적용 된 track input 갱신
  const changeDebounedTrackInput = useMemo(
    () =>
      _.debounce((inputText: string) => {
        // 디폴트 트랙 리스트가 없는 경우(아무 동작을 시키지 않음)
        if (!defaultTrackList.length) return;
        const trimInputText = _.trim(inputText);

        // 이전 검색 텍스트와 현재 검색 텍스트가 같거나,
        // 현재 검색 텍스트가 이전 검색 텍스트에 포함 된 텍스트인 경우(아무 동작을 시키지 않음)
        if (lastTrackInput.current === trimInputText) return;
        if (
          _.isLength(lastTrackInput.current) &&
          _.isLength(trimInputText) &&
          _.includes(lastTrackInput.current, trimInputText)
        )
          return;

        // 이전 검색 텍스트가 있으면서, 현재 검색 텍스트가 비어있는 경우(디폴트 트랙 리스트로 갱신)
        if (lastTrackInput.current !== trimInputText && !trimInputText) {
          return TPFilteredTrackNameList(defaultTrackList);
        }

        // 인풋 텍스트가 포함 된 트랙 리스트 필터링
        const renewedTrackList = _.reduce<TPBoneTrack, TPBoneTrack[] | []>(
          defaultTrackList,
          (acc, track) => {
            const lowerCasedInputText = _.toLower(trimInputText);
            const { title, children } = track;
            if (_.includes(_.toLower(title), lowerCasedInputText)) return [...acc, track];
            const filteredChildren = _.filter(children, (child) =>
              _.includes(_.toLower(child), lowerCasedInputText),
            );
            if (filteredChildren.length) {
              return [...acc, { title, children: filteredChildren, isChildTrackOpen: true }];
            }
            return acc;
          },
          [],
        );

        // 필터링 트랙 리스트 갱신
        TPFilteredTrackNameList(renewedTrackList);
        lastTrackInput.current = trimInputText;
      }, DEBOUNCED_TIME),
    [defaultTrackList],
  );

  // 트랙 인풋 텍스트 변경
  const changeTrackInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      changeDebounedTrackInput(event.target.value);
    },
    [changeDebounedTrackInput],
  );

  // Summary, Base 트랙 출력여부
  useEffect(() => {
    const trimedLastTrackInput = _.trim(lastTrackInput.current);
    if (!filteredTrackList.length) {
      if (trimedLastTrackInput) {
        // 인풋 텍스트가 Base에 포함되는 경우
        if (_.includes(_.toLower('Base'), trimedLastTrackInput)) {
          setPrintSummaryTrack(true);
          setPrintBaseTrack(true);
          setSummaryTrackToggle(true);
          setBaseTrackToggle(true);
          return;
        }

        // 인풋 텍스트가 Summary에 포함되는 경우
        if (_.includes(_.toLower('Summary'), trimedLastTrackInput)) {
          setPrintSummaryTrack(true);
          setPrintBaseTrack(false);
          setSummaryTrackToggle(true);
          setBaseTrackToggle(false);
          return;
        }
      }
      // 인풋 텍스트가 Summary, Base에 모두 포함되지 않은 경우
      setPrintSummaryTrack(false);
      setPrintBaseTrack(false);
      setSummaryTrackToggle(false);
      setBaseTrackToggle(false);
      return;
    }
    // 필터링 트랙 리스트가 존재하는 경우
    setPrintSummaryTrack(true);
    setPrintBaseTrack(true);
    if (trimedLastTrackInput) {
      setSummaryTrackToggle(true);
      setBaseTrackToggle(true);
    }
  }, [filteredTrackList]);

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
          {printSummaryTrack && (
            <Track title="Summary" isChildTrackOpen={summaryTrackToggle} paddingLeft={10}>
              {printBaseTrack && (
                <Track title="Base" isChildTrackOpen={baseTrackToggle} paddingLeft={20}>
                  {filteredTrackList.length &&
                    _.map(filteredTrackList, ({ title, children, isChildTrackOpen }) => (
                      <Track
                        key={title}
                        isChildTrackOpen={isChildTrackOpen}
                        title={title}
                        paddingLeft={30}
                      >
                        {_.map(children, (propertyTrack) => (
                          <Track
                            key={propertyTrack}
                            isLeafTrack={true}
                            title={propertyTrack}
                            paddingLeft={40}
                          />
                        ))}
                      </Track>
                    ))}
                </Track>
              )}
            </Track>
          )}
        </div>
      </div>
    </>
  );
};

export default TrackList;
