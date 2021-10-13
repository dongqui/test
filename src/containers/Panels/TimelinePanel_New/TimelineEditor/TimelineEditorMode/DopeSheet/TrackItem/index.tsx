import Keyframe from './Keyframe';

interface Props {
  lineIndex: number;
}

const TrackItem = (props: Props) => {
  const { lineIndex } = props;

  return (
    <g transform={`translate(0, ${lineIndex * 32})`} key={lineIndex}>
      {Array(2000)
        .fill(1)
        .map((_, index) => (
          <Keyframe key={index + 1} timeIndex={index + 1} isSelected={false} />
        ))}
    </g>
  );
};

export default TrackItem;
