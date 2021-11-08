import _ from 'lodash';
import checkMoveDuplicates from './checkMoveDuplicates';

interface Params {
  name: string;
  comparisonNames: string[];
}

const beforeMove = (params: Params): string => {
  const { name, comparisonNames } = params;

  console.log('comparisonNames');
  console.log(comparisonNames);

  let duplicatesNumber = '0';

  const tempName = name.replace(/ \(\d+\)$/g, '');

  duplicatesNumber = checkMoveDuplicates(name, comparisonNames);
  console.log('duplicatesNumber');
  console.log(duplicatesNumber);

  const resultName = duplicatesNumber === '-1' ? name : duplicatesNumber === '0' ? tempName : `${tempName} (${duplicatesNumber})`;

  return resultName;
};

export default beforeMove;
