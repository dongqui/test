import _ from 'lodash';
import checkPasteDuplicates from './checkPasteDuplicates';

interface Params {
  name: string;
  comparisonNames: string[];
}

const beforePaste = (params: Params): string => {
  const { name, comparisonNames } = params;
  const isNameHasCopy = !_.isNull(name.match(/copy/g));

  let duplicatesNumber = '0';

  // if (isNameHasCopy) {
  //   const matchingNumber = name.match(/\(/g);

  //   if (matchingNumber === null || matchingNumber.length === 1) {
  //     duplicatesNumber = checkPasteDuplicates(`${name} copy`, comparisonNames);

  //     const resultName = duplicatesNumber === '0' ? `${name} (2)` : `${name} copy (${duplicatesNumber})`;

  //     return resultName;
  //   } else {
  //     const tempResult = name.substr(0, name.lastIndexOf('(')).trim();

  //     duplicatesNumber = checkPasteDuplicates(tempResult, comparisonNames);

  //     const resultName = duplicatesNumber === '0' ? tempResult : `${tempResult} (${duplicatesNumber})`;

  //     return resultName;
  //   }
  // } else {
  //   duplicatesNumber = checkPasteDuplicates(`${name} copy`, comparisonNames);

  //   const resultName = duplicatesNumber === '0' ? `${name} copy` : `${name} copy (${duplicatesNumber})`;

  //   return resultName;
  // }
};

export default beforePaste;
