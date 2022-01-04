import { ReactElement, InputHTMLAttributes } from 'react';
import { Control, FieldError, ControllerRenderProps } from 'react-hook-form';

export = Field;
export as namespace Field;

declare namespace Field {
  type InputProps = InputHTMLAttributes<HTMLInputElement>;

  type CheckboxProps = {
    text?: string;
    linkText?: string;
    href?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  };

  type SelectProps = {
    initialValue: string;
    options: {
      value: string;
      label: string;
    }[];
  };

  type DropdownProps = {
    list: {
      value: string;
      label: string;
      disaled?: boolean;
    }[];
    initialValue: {
      value: string;
      label: string;
    };
  };

  type BaseComponentProps = ControllerRenderProps;

  type RenderProps<T extends {}> = ControllerRenderProps & {
    value: string;
    error?: FieldError;
  } & Omit<BaseFieldProps, keyof FormProps & keyof BaseProps>;

  interface FormProps {
    control: Control;
  }

  type BaseProps = {
    render: (renderProps: RenderProps) => ReactElement;
    name: string;
    required?: boolean;
    defaultValue?: string;
    value: string;
  };

  type BaseFieldProps<T> = FormProps & BaseProps & T;
}

export default Field;
