function hasKey(obj: any, key: any) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function stateDiff(a: any, b: any) {
  if (a === b) {
    return [];
  }

  const result = [];
  const [aKeys, bKeys] = [Object.keys(a), Object.keys(b)];
  for (let i = 0; i < bKeys.length; i++) {
    let key = bKeys[i];
    if (!hasKey(a, key) || a[key] !== b[key]) {
      result.push(key);
    }
  }

  return result;
}

export default stateDiff;
