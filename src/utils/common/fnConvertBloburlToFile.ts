import _ from 'lodash';

interface fnConvertBloburlToFileProps {
  url: string;
  type: string;
  fileName: string;
}

export const fnConvertBloburlToFile = async ({
  url,
  type,
  fileName,
}: fnConvertBloburlToFileProps) => {
  const response = await fetch(url);
  const data = await response.blob();
  const metadata = {
    type,
  };
  const file = new File([data], `${fileName}.${type}`, metadata);
  return file;
};
