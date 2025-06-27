import { ChangeEventHandler, useState } from "react";

interface IUseSearchMethodsParams<
  T extends Record<string, string | number | string[]>,
> {
  defaultValues: T;
}

export interface IUseSearchMethods<
  T extends Record<string, string | number | string[]>,
> {
  values: T;
  handleSubmit: () => T;
  handleReset: () => void;
  handleChangeText: ChangeEventHandler<HTMLInputElement>;
  handleSelect: (params: { key: keyof T; value: T[keyof T] }) => void;
}

export default function useSearchMethods<
  T extends Record<string, string | number | string[]>,
>(params: IUseSearchMethodsParams<T>): IUseSearchMethods<T> {
  const [values, setValues] = useState<T>(params.defaultValues);

  const handleSubmit = () => {
    const newValues = { ...values };
    setValues(newValues);
    return newValues;
  };

  const handleReset = () => {
    setValues(params.defaultValues);
  };

  const handleChangeText: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }) as T);
  };

  const handleSelect = ({
    key,
    value,
  }: {
    key: keyof T;
    value: T[keyof T];
  }) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return {
    values,
    handleSubmit,
    handleReset,
    handleChangeText,
    handleSelect,
  };
}
