import { MutableRefObject, InputHTMLAttributes, RefObject } from 'react';

export = Input;
export as namespace Input;

declare namespace Input {
  interface BaseProps {
    invalid?: boolean;
  }

  type BaseInputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
}

export default Input;
