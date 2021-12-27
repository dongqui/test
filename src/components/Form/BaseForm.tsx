import { FunctionComponent, ReactElement, useEffect, useState, useCallback } from 'react';
import { useForm, Control, FieldValues } from 'react-hook-form';

interface ChildrenProps {
  control: Control<FieldValues>;
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
    const props = { control };

    return children(props);
  }, [children, control]);

  return <form onSubmit={handleSubmit(handleFormSubmit)}>{renderFormInner()}</form>;
};

export default BaseForm;
