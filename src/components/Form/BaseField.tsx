import { useCallback, useState } from 'react';
import { Controller, useController, ControllerRenderProps } from 'react-hook-form';

const BaseField = <T extends {}, Q>({ render, control, name, required, defaultValue, onChange, ...rest }: Field.BaseFieldProps<T, Q>) => {
  const [value, setValue] = useState<Q>(defaultValue);
  const { fieldState, field } = useController({
    name,
    control,
    defaultValue,

    rules: {
      required: required && 'This field is required.',
    },
  });

  const renderInner = useCallback(
    (field: ControllerRenderProps) => {
      const renderProps: Field.RenderProps<T> = {
        error: fieldState.error,
        ...field,
        ...rest,
        defaultValue,
        value,
        onChange: (val: Q) => {
          if (onChange) {
            onChange(val);
          }
          setValue(val);
          field.onChange(val);
        },
      };

      return render(renderProps);
    },
    [defaultValue, fieldState.error, onChange, render, rest, value],
  );

  return <Controller control={control} name={name} render={({ field }) => renderInner(field)} />;
};

export default BaseField;
