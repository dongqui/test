import { ReactElement, InputHTMLAttributes, ChangeEvent } from 'react';
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
      disabled?: boolean;
    }[];
    initialValue: {
      value: string;
      label: string;
    };
  };

  type SwitchProps = {
    options: {
      key: string;
      label: string;
      value: string | boolean;
    }[];
  };

  type ToggleProps = {};

  type BaseComponentProps = ControllerRenderProps;

  type RenderProps<T extends {}> = ControllerRenderProps & {
    error?: FieldError;
  } & Omit<BaseFieldProps, keyof FormProps & keyof BaseProps>;

  interface FormProps {
    control: Control;
  }

  type BaseProps<Q> = {
    render: (renderProps: RenderProps) => ReactElement;
    name: string;
    required?: boolean;
    defaultValue: Q;
    onChange?: (value: Q) => void;
    // value: string | boolean;
    className?: string;
  };

  type BaseFieldProps<T, Q> = FormProps & BaseProps<Q> & T;
}

export default Field;
