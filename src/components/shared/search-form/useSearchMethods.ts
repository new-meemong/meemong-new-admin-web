import { ChangeEventHandler, useState } from "react";

interface IUseSearchMethodsProps<
  T extends Record<string, string | number | string[]>,
> {
  defaultParams: T;
}

export interface IUseSearchMethods<
  T extends Record<string, string | number | string[]>,
> {
  params: T;
  setParams: (value: T) => void;
  searchParams: T;
  setSearchParams: (value: T) => void;
  handleSubmit: () => void;
  handleReset: () => void;
  handleChangeText: ChangeEventHandler<HTMLInputElement>;
  handleSelect: (params: { key: keyof T; value: T[keyof T] }) => void;
  handleChangePage: (page: number) => void;
  handleChangeSize: (size: number) => void;
}

export default function useSearchMethods<
  T extends Record<string, string | number | string[]>,
>(props: IUseSearchMethodsProps<T>): IUseSearchMethods<T> {
  const [params, setParams] = useState<T>(props.defaultParams);
  const [searchParams, setSearchParams] = useState<T>(props.defaultParams);

  const handleSubmit = () => {
    setParams({ ...params, page: 1 });
    setSearchParams({
      ...params,
      page: 1,
    });
  };

  const handleReset = () => {
    setParams({
      ...props.defaultParams,
      size: params.size,
    });
    setSearchParams({
      ...props.defaultParams,
      size: params.size,
    });
  };

  const handleChangeText: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }) as T);
  };

  const handleSelect = ({
    key,
    value,
  }: {
    key: keyof T;
    value: T[keyof T];
  }) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangePage = (page: number) => {
    if (page === params.page) {
      return;
    }
    setParams({
      ...params,
      page,
    });
    setSearchParams({
      ...params,
      page,
    });
  };

  const handleChangeSize = (size: number) => {
    setParams({
      ...params,
      page: 1,
      size,
    });
    setSearchParams({
      ...params,
      page: 1,
      size,
    });
  };

  return {
    params,
    setParams,
    searchParams,
    setSearchParams,
    handleSubmit,
    handleReset,
    handleChangeText,
    handleSelect,
    handleChangePage,
    handleChangeSize,
  };
}
