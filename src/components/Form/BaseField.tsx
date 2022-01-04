import { useEffect } from 'react';
import { useCallback } from 'react';
import { Controller, useController, ControllerRenderProps } from 'react-hook-form';

const BaseField = <T extends {}>({ render, control, name, required, defaultValue, value, ...rest }: Field.BaseFieldProps<T>) => {
  const { fieldState, field } = useController({
    name,
    control,
    defaultValue,

    rules: {
      required: required && 'This field is required.',
    },
  });

  useEffect(() => {
    const { onChange } = field;
    onChange(value);
  }, [field, value]);

  const renderInner = useCallback(
    (field: ControllerRenderProps) => {
      const renderProps: Field.RenderProps<T> = {
        error: fieldState.error,
        ...field,
        ...rest,
        value,
      };

      return render(renderProps);
    },
    [fieldState.error, render, rest, value],
  );

  return <Controller control={control} name={name} render={({ field }) => renderInner(field)} />;
};

export default BaseField;
