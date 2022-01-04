import _ from 'lodash';
import checkMoveDuplicates from './checkMoveDuplicates';

interface Params {
  name: string;
  comparisonNames: string[];
}

const beforeMove = (params: Params): string => {
  const { name, comparisonNames } = params;

  let duplicatesNumber = '0';

  const tempName = name.replace(/ \(\d+\)$/g, '');

  duplicatesNumber = checkMoveDuplicates(name, comparisonNames);

  const resultName = duplicatesNumber === '-1' ? name : duplicatesNumber === '0' ? tempName : `${tempName} (${duplicatesNumber})`;

  return resultName;
};

export default beforeMove;
