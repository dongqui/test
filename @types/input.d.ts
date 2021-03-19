import { MutableRefObject } from 'react';

export = Input;
export as namespace Input;

declare namespace Input {
  interface BaseProps {
    innerRef?: MutableRefObject<HTMLInputElement>;
    invalid?: boolean;
  }

  type BaseInputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
}

export default Input;
