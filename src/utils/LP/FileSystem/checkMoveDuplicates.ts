import _ from 'lodash';
import getNodeNumber from './getNodeNumber';

const checkMoveDuplicates = (name: string, nameArray: string[]) => {
  if (nameArray.length === 0) {
    return '-1';
  }

  if (nameArray.length === 1) {
    const currentNode = nameArray[0];

    // 번호 앞에는 반드시 하나의 공백 - ex) 'Folder (2)'
    const extractedNumber = currentNode.match(/ \(\d+\)$/g);

    if (!_.isNull(extractedNumber)) {
      const number = (currentNode.match(/\d/g) as unknown) as string;
      console.log('number > ' + number);
      const resultNumber = number === '0' ? '2' : '0';
      return resultNumber;
    } else {
      return '2';
    }
  }

  const filteredArray = nameArray.map((current) => {
    const extractedNumber = current.match(/ \(\d+\)$/g);

    if (!_.isNull(extractedNumber)) {
      const number = (current.match(/\d/g) as unknown) as string;
      return Number(number);
    } else {
      return 0;
    }
  });
  console.log('filteredArray');
  console.log(filteredArray);

  const result = String(getNodeNumber(filteredArray));
  return result;
};

export default checkMoveDuplicates;
