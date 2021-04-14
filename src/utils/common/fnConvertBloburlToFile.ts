import _ from 'lodash';

interface FnConvertBloburlToFileProps {
  url: string;
  type: string;
  fileName: string;
}
/**
 * blob url 을 파일로 변환.
 *
 * @param url - blob url
 * @param type - 파일타입
 * @param fileName - 파일이름
 *
 * @returns 변환된 파일
 */
const fnConvertBloburlToFile = async ({ url, type, fileName }: FnConvertBloburlToFileProps) => {
  const response = await fetch(url);
  const data = await response.blob();
  const metadata = {
    type,
  };
  const file = new File([data], `${fileName}.${type}`, metadata);
  return file;
};

export default fnConvertBloburlToFile;
