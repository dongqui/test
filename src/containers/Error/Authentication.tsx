import styles from './Authentication.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface Props {
  statusCode: number;
  message: string;
}

const Authentication = ({ statusCode, message }: Props) => {
  return (
    <div>
      <div>Oops!</div>
      <div>The page does not exist</div>
      <div>The lionk you followed may be broken or the page may have been removed.</div>
      <div>
        <div>
          <button>Go Back</button>
          <button>Go Home</button>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
