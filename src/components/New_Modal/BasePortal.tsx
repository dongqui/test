import React, { MutableRefObject } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  container: MutableRefObject<HTMLElement>;
}

const BasePortal: React.FC<Props> = ({ container, children }) => {
  const element = container.current;
  return ReactDOM.createPortal(children, element);
};

export default BasePortal;
