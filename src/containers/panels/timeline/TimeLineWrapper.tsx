import React from 'react';
import { PlayBar } from 'components/PlayBar';
import TrackList from './TrackList';
import TimeFrameView from './TimeFrameView';

interface Props {}

const TimelineWrapper: React.FC<Props> = () => {
  console.log('asdasdasd');
  return (
    <>
      <TrackList />
      <TimeFrameView />
    </>
  );
};

export default TimelineWrapper;
