import { useSelector } from 'reducers';

import TrackItem from './TrackItem';

const DopeSheet = () => {
  const trackScrollTop = useSelector((state) => state.trackList.trackScrollTop);

  return (
    <g transform={`translate(0 -${trackScrollTop})`}>
      {Array(5)
        .fill(1)
        .map((_, index) => (
          <TrackItem key={index} lineIndex={index} />
        ))}
    </g>
  );
};

export default DopeSheet;
