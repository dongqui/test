import { useCallback, useEffect, useState } from 'react';
import { Controller, useController, ControllerRenderProps } from 'react-hook-form';

const BaseField = <T extends {}, Q>({ render, control, name, required, defaultValue, controlledValue, onChange, ...rest }: Field.BaseFieldProps<T, Q>) => {
  const [value, setValue] = useState<Q>(defaultValue);
  const { fieldState, field } = useController({
    name,
    control,
    defaultValue,

    rules: {
      required: required && 'This field is required.',
    },
  });

  const onChangeInner = useCallback(
    (val: Q) => {
      if (onChange) {
        onChange(val);
      }
      if (!controlledValue) {
        setValue(val);
      }
      field.onChange(val);
    },
    [field, onChange, controlledValue],
  );
  const renderInner = useCallback(
    (field: ControllerRenderProps) => {
      const renderProps: Field.RenderProps<T> = {
        error: fieldState.error,
        ...field,
        ...rest,
        defaultValue,
        value: controlledValue || value,
        onChange: onChangeInner,
        ref: undefined,
      };

      return render(renderProps);
    },
    [defaultValue, fieldState.error, onChangeInner, render, rest, value, controlledValue],
  );

  return <Controller control={control} name={name} render={({ field }) => renderInner(field)} />;
};

export default BaseField;
