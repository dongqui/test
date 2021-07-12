import last from 'lodash/last';

/**
 * 파일의 확장자를 반환합니다.
 *
 * @param fileName - 파일이름
 *
 * @returns 파일의 확장자
 *
 */
const fnGetFileExtension = (fileName: string): string => {
  if (!fileName.includes('.')) {
    return '';
  } else {
    let extension = last(fileName.split('.')) || '';
    extension = extension.toLowerCase();
    return extension;
  }
};

export default fnGetFileExtension;
