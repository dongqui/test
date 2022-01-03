import { isNull } from 'lodash';
import getNodeNumber from './getNodeNumber';

const checkPasteDuplicates = (name: string, nameArray: string[]) => {
  if (nameArray.length === 0) {
    return '0';
  }

  if (nameArray.length === 1) {
    const currentNode = nameArray[0];
    const parenthesisLength = name.match(/ \(\d+\)/g);

    const isCopied = currentNode.match(/copy/g);

    // 이름에 'copy'가 있는 경우
    if (isCopied !== null) {
      const matches = currentNode.match(/\)/g);

      // 번호가 없는 경우 또는 번호가 1개인 경우 - 복사한 경우 중복체크의 번호는 상시 마지막에 붙기 때문
      // if (matches === null || matches.length === 1) {
      //   return '2';
      // }
      if (matches === null) {
        return '2';
      }

      if (matches.length === 1) {
        if (currentNode.lastIndexOf(')') !== currentNode.length - 1) {
          return '2';
        }
        return '0';
      }

      // 번호가 있는 경우 - 반드시 번호가 2개 이상이어야한다. (복사한 경우 중복체크의 번호는 상시 마지막에 붙기 때문)
      if (matches !== null && matches.length > 1) {
        const startIndex = currentNode.lastIndexOf('(') + 1;
        const endIndex = currentNode.lastIndexOf(')');

        const number = Number(currentNode.substring(startIndex, endIndex));

        return number === 2 ? '0' : String(number + 1);
      }
    }

    // 이름에 'copy'가 없는 경우
    if (isCopied === null) {
      const matches = currentNode.match(/\(/g);

      // 번호가 없는 경우
      if (matches === null) {
        return '2';
      }

      // 번호가 있는 경우
      if (parenthesisLength !== null) {
        const extractedNumber = currentNode.match(/ \(\d+\)/g);
        if (extractedNumber !== null) {
          if (extractedNumber.length === parenthesisLength.length || extractedNumber.length === parenthesisLength.length + 1) {
            return '2';
          }
        }
      }

      // 번호가 있는 경우
      // if (matches !== null) {
      //   const startIndex = currentNode.lastIndexOf('(') + 1;
      //   const endIndex = currentNode.lastIndexOf(')');

      //   const number = currentNode.substring(startIndex, endIndex);

      //   return number;
      // }
    }
  }

  if (nameArray.length > 1) {
    const isCreate = !name.includes('copy');

    if (isCreate) {
      const parenthesisLength = name.match(/ \(\d+\)/g);

      const filter = nameArray
        .filter((currentNode) => {
          const isCopied = currentNode.match(/copy/g);

          if (isCopied !== null) {
            return false;
          }

          // 이미 번호가 있는 경우
          if (parenthesisLength !== null) {
            const extractedNumber = currentNode.match(/ \(\d+\)/g);

            if (extractedNumber !== null) {
              if (extractedNumber.length === parenthesisLength.length || extractedNumber.length === parenthesisLength.length + 1) {
                return true;
              }
            }
            return false;
          }

          if (parenthesisLength === null) {
            const extractedNumber = currentNode.match(/ \(\d+\)/g);

            if (extractedNumber !== null) {
              if (extractedNumber.length === 1) {
                return true;
              }

              return false;
            }

            if (extractedNumber === null) {
              return true;
            }

            return false;
          }

          return true;
        })
        .map((node) => {
          const extractedNumber = node.match(/ \(\d+\)/g);

          if (!isNull(extractedNumber)) {
            const number = (node.match(/(\((?:\d){1,}\))$/g) as string[])[0].replace(/[{()}]/g, '');

            if (parenthesisLength !== null) {
              if (extractedNumber.length > parenthesisLength.length) {
                return Number(number);
              } else {
                return 0;
              }
            } else {
              if (extractedNumber.length === 1) {
                return Number(number);
              } else {
                return 0;
              }
            }
          } else {
            return 0;
          }
        });

      if (filter.length > 0) {
        const target = getNodeNumber(filter);
        return String(target);
      }
    }

    const copiedFilter = nameArray
      .filter((currentNode) => {
        const isCopied = currentNode.match(/copy/g);

        if (isCopied !== null) {
          return true;
        }

        return false;
      })
      .map((node) => {
        const splitName = node.split('.');
        const fileName = splitName.length > 1 ? splitName.slice(0, splitName.length - 1).join('.') : splitName[0];

        const extractedNumber = fileName.match(/ \(\d+\)$/g);

        if (!isNull(extractedNumber)) {
          // const number = extractedNumber[0].match(/[^0-9]/g);
          const number = extractedNumber[0].replace(/[^0-9]/g, '');

          return Number(number);
        } else {
          return 0;
        }
      });

    if (copiedFilter.length > 0) {
      const target = getNodeNumber(copiedFilter);
      return String(target);
    }
  }

  return '0';
};

export default checkPasteDuplicates;
