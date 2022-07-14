import { FunctionComponent, ReactElement, useEffect, useCallback } from 'react';
import { useForm, Control, FieldValues, UseFormSetValue } from 'react-hook-form';

interface ChildrenProps {
  control: Control<FieldValues>;
  setFormValue: UseFormSetValue<Record<string, any>>;
}

interface Props {
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => void;
  children: (props: ChildrenProps) => ReactElement;
}

const BaseForm: FunctionComponent<Props> = ({ defaultValues, onSubmit, children }) => {
  const { handleSubmit, reset, register, control, formState, getValues, setValue } = useForm({
    defaultValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (defaultValues) {
      const keys = Object.keys(defaultValues);
      const values = Object.values(defaultValues);

      keys.map((key, i) => setValue(key, values[i]));
    }
  }, [defaultValues, setValue]);

  const handleFormSubmit = useCallback(
    (data: unknown) => {
      onSubmit(data);
    },
    [onSubmit],
  );

  const renderFormInner = useCallback(() => {
    const baseProps: Field.FormProps = { control };

    const props = {
      ...baseProps,
      setFormValue: setValue,
    };

    return children(props);
  }, [children, control, setValue]);

  return <form onSubmit={handleSubmit(handleFormSubmit)}>{renderFormInner()}</form>;
};

export default BaseForm;
