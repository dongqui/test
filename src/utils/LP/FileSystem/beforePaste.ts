import _ from 'lodash';
import checkPasteDuplicates from './checkPasteDuplicates';

interface Params {
  name: string;
  comparisonNames: string[];
  hasExtension?: boolean;
}

const beforePaste = (params: Params): string => {
  const { name, comparisonNames, hasExtension } = params;

  let duplicatesNumber = '0';

  const tempName = `${name} copy`;

  duplicatesNumber = checkPasteDuplicates(tempName, comparisonNames, hasExtension);

  const resultName = duplicatesNumber === '0' ? tempName : `${tempName} (${duplicatesNumber})`;

  return resultName;
};

export default beforePaste;
