import { ChangeEventHandler, useState } from "react";

interface IUseSearchFormParams {
  defaultValues: { [key: string]: string | number | string[] };
}

export interface IUseSearchForm {
  values: { [key: string]: string | number | string[] };
  handleSubmit: () => { [key: string]: string | number | string[] };
  handleReset: () => void;
  handleChangeText: ChangeEventHandler<HTMLInputElement>;
  handleSelect: ({ key, value }: { key: string; value: string }) => void;
}

export default function useSearchForm(
  params: IUseSearchFormParams,
): IUseSearchForm {
  const [values, setValues] = useState(params.defaultValues);

  const handleSubmit = () => {
    const newValues = { ...values };
    setValues(newValues);

    return newValues;
  };

  const handleReset = () => {
    setValues(params.defaultValues);
  };

  const handleChangeText: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSelect = ({ key, value }: { key: string; value: string }) => {
    setValues({ ...values, [key]: value });
  };

  return {
    values,
    handleSubmit,
    handleReset,
    handleChangeText,
    handleSelect,
  };
}
