import TrackList from './TrackList';
import TimelineEditor from './TimelineEditor';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TimelinePanel = () => {
  return (
    <div className={cx('timeline-panel')}>
      <TrackList />
      <TimelineEditor />
    </div>
  );
};

export default TimelinePanel;
