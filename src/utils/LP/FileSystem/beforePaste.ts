import _ from 'lodash';
import duplicateCheck from './duplicateCheck';

interface Params {
  name: string;
  nameArray: string[];
}

const beforePaste = (params: Params) => {
  const { name, nameArray } = params;

  const isAlreadyCopy = !_.isNull(name.match(/copy/g));

  let check = '0';
  let result = '';

  if (isAlreadyCopy) {
    const matchNumber = name.match(/\(/g);
    const hasNumber = !_.isNull(matchNumber);

    if (matchNumber !== null) {
      if (matchNumber.length === 1) {
        check = duplicateCheck(name, nameArray);

        result = check === '0' ? `${name} (2)` : `${name} (${check})`;
      }

      if (matchNumber.length > 1) {
        const tempResult = name.substr(0, name.lastIndexOf('(')).trim();

        check = duplicateCheck(tempResult, nameArray);

        result = check === '0' ? tempResult : `${tempResult} (${check})`;
      }
    }
  }

  if (!isAlreadyCopy) {
    check = duplicateCheck(`${name} copy`, nameArray);

    result = check === '0' ? `${name} copy` : `${name} copy (${check})`;
  }

  return result;
};

export default beforePaste;
