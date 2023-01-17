import Lottie from 'react-lottie-player';
import data from './json';

export default function FireLottie() {
  return <Lottie animationData={data} speed={1} style={{ height: 140 }} loop play />;
}
