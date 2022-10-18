import { FunctionComponent } from 'react';

export interface Props {
  content: string;
  className?: string;
}

const Html: FunctionComponent<React.PropsWithChildren<Props>> = ({ content, ...rest }) => {
  return <div {...rest} dangerouslySetInnerHTML={{ __html: content }} />;
};

export default Html;
