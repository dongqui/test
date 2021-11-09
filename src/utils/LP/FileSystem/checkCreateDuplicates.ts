import getNodeNumber from './getNodeNumber';

const checkCreateDuplicates = (name: string, nameArray: string[]) => {
  if (nameArray.length === 0) {
    return '0';
  }

  if (nameArray.length === 1) {
    const currentNode = nameArray[0];

    const isCopied = currentNode.match(/copy/g);

    // 이름에 'copy'가 있는 경우
    if (isCopied !== null) {
      if (isCopied.length === 1) {
        const matches = currentNode.match(/\(/g);

        // 번호가 없는 경우 또는 번호가 1개인 경우 - 복사한 경우 중복체크의 번호는 상시 마지막에 붙기 때문
        if (matches === null || matches.length === 1) {
          return '2';
        }

        // 번호가 있는 경우 - 반드시 번호가 2개 이상이어야한다. (복사한 경우 중복체크의 번호는 상시 마지막에 붙기 때문)
        if (matches !== null && matches.length > 1) {
          const startIndex = currentNode.lastIndexOf('(') + 1;
          const endIndex = currentNode.lastIndexOf(')');

          const number = currentNode.substring(startIndex, endIndex);

          return number;
        }
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
      if (matches !== null) {
        const startIndex = currentNode.lastIndexOf('(') + 1;
        const endIndex = currentNode.lastIndexOf(')');

        const number = Number(currentNode.substring(startIndex, endIndex));

        // return number;
        return number === 2 ? '0' : String(number + 1);
      }
    }
  }

  if (nameArray.length > 1) {
    const isCreate = !name.includes('copy');

    if (isCreate) {
      const filter = nameArray
        .filter((currentNode) => {
          const isCopied = currentNode.match(/copy/g);

          if (isCopied !== null) {
            return false;
          }

          return true;
        })
        .map((node) => {
          const matches = node.match(/\(/g);

          let value = 0;

          // 번호가 없는 경우
          if (matches === null) {
            value = 0;
          }

          if (matches !== null) {
            const startIndex = node.lastIndexOf('(') + 1;
            const endIndex = node.lastIndexOf(')');

            value = Number(node.substring(startIndex, endIndex));
          }

          return value;
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
        const matches = node.match(/\(/g);

        let value = 0;

        // 번호가 없는 경우
        if (matches === null) {
          value = 0;
        }

        if (matches !== null && matches.length > 1) {
          const startIndex = node.lastIndexOf('(') + 1;
          const endIndex = node.lastIndexOf(')');

          value = Number(node.substring(startIndex, endIndex));
        }

        if (matches !== null && matches.length === 1) {
          const isLastIndex = node.lastIndexOf(')') + 1 === node.length;

          if (isLastIndex) {
            const startIndex = node.lastIndexOf('(') + 1;
            const endIndex = node.lastIndexOf(')');

            value = Number(node.substring(startIndex, endIndex));
          }
        }

        return value;
      });

    if (copiedFilter.length > 0) {
      const target = getNodeNumber(copiedFilter);
      return String(target);
    }
  }

  return '0';
};

export default checkCreateDuplicates;
