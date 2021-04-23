import { memo } from 'react';
import _ from 'lodash';
import MemoizedTrack from './MemoizedTrack';

const Track = memo(MemoizedTrack);

export default Track;
