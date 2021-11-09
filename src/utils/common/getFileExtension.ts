const getFileExtension = (file: string): string => {
  const type = (/[^./\\]*$/.exec(file) || [''])[0];
  return type;
};

export default getFileExtension;
