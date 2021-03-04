import React from 'react';
import { PlayBar } from 'components/PlayBar';
import TrackList from './TrackList';
import TimeFrameView from './TimeFrameView';
import TimelineWrapper from './TimeLineWrapper';

interface Props {}

const TimelineContainer: React.FC<Props> = () => {
  console.log('asdasdasd');
  return (
    <>
      <PlayBar />
      <TimelineWrapper />
    </>
  );
};

export default TimelineContainer;
