import { MutableRefObject, InputHTMLAttributes, RefObject } from 'react';

export = Input;
export as namespace Input;

declare namespace Input {
  interface BaseProps {
    innerRef?: RefObject<HTMLInputElement>;
    invalid?: boolean;
  }

  type BaseInputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
}

export default Input;
