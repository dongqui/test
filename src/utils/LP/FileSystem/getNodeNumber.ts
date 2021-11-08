const getNodeNumber = (array: number[]) => {
  let targetValue = 0;

  const nextArray = array.sort((a, b) => a - b);

  if (nextArray.indexOf(0) === -1) {
    return targetValue;
  }

  for (let i = 1; i < nextArray.length; i++) {
    const currentValue = nextArray[i];
    const isLast = nextArray.length - 1 === i;

    if (isLast) {
      targetValue = currentValue + 1;
    }

    if (nextArray[1] !== 2) {
      targetValue = 2;
    }

    const nextValue = nextArray[i + 1];

    if (!isLast) {
      if (nextValue - currentValue > 1) {
        targetValue = currentValue + 1;
        return targetValue;
      }

      if (nextValue - currentValue === 1) {
        targetValue = nextValue + 1;
      }
    }
  }

  return targetValue;
};

export default getNodeNumber;
