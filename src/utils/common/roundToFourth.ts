import _ from 'lodash';

const roundToFourth = (targetNumber: number) => {
  return _.round(targetNumber, 4);
};

export default roundToFourth;
