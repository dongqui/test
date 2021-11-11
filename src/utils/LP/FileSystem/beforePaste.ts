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

  // ex) ' (2)'
  const matchingNumber = tempName.trim().match(/ \([0-9]\)/g);

  duplicatesNumber = checkPasteDuplicates(tempName, comparisonNames);

  // const tempResult = tempName.substr(0, tempName.lastIndexOf('(')).trim();

  //

  const resultName = duplicatesNumber === '0' ? tempName : `${tempName} (${duplicatesNumber})`;

  // lastIndexOf tempName.lastIndexOf(' (')); -> Untitled (2) -> 6 // ('(') -> 7
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

  return resultName;
};

export default beforePaste;
