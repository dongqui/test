interface Params {
  name: string;
  comparison: string[];
}

const beforeRename = async (params: Params) => {
  const { name, comparison } = params;

  const getResultName = async () => {
    const tempName = name.trim();
    const isAlreadyExist = comparison.some((nodeName) => nodeName.toLocaleLowerCase() === tempName.toLocaleLowerCase());

    if (isAlreadyExist) {
      throw new Error(`${name} 이름이 이미 사용 중입니다. 다른 이름을 선택하십시오.`);
    }

    return tempName;
  };

  try {
    const resultName = getResultName();

    return resultName;
  } catch (error) {
    throw error;
  }
};

export default beforeRename;
