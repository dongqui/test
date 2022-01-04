import _ from 'lodash';
import checkPasteDuplicates from './checkPasteDuplicates';

interface Params {
  name: string;
  comparisonNames: string[];
}

const beforePaste = (params: Params): string => {
  const { name, comparisonNames } = params;

  let duplicatesNumber = '0';

  const tempName = `${name} copy`;

  duplicatesNumber = checkPasteDuplicates(tempName, comparisonNames);

  const resultName = duplicatesNumber === '0' ? tempName : `${tempName} (${duplicatesNumber})`;

  return resultName;
};

export default beforePaste;
