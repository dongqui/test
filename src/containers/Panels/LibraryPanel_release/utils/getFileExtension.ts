import last from 'lodash/last';

/**
 * 파일의 확장자를 반환합니다.
 *
 * @param file - 파일이름
 *
 * @returns 파일의 확장자
 *
 */
const getFileExtension = (fileName: string): string => {
  let extension = '';
  if (!fileName.includes('.')) {
    return extension;
  }
  extension = last(fileName.split('.')) || '';
  return extension;
};

export default getFileExtension;
